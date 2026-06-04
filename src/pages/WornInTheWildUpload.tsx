import { useEffect, useRef, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { Helmet } from "react-helmet-async";
import { Check, Loader2, CircleAlert } from "lucide-react";

type SubmitStep = "prepare" | "upload" | "finalize";

type State =
  | { kind: "loading" }
  | { kind: "invalid" }
  | { kind: "expired" }
  | { kind: "already" }
  | { kind: "ready"; firstName: string | null; productName: string | null; productImage: string | null }
  | { kind: "submitting"; step: SubmitStep; uploadPct: number; uploadedBytes: number; totalBytes: number; firstName: string | null; productName: string | null; productImage: string | null }
  | { kind: "done"; rewardCode: string; rewardPercent: number };

const STEP_ORDER: SubmitStep[] = ["prepare", "upload", "finalize"];
const STEP_LABELS: Record<SubmitStep, string> = {
  prepare: "Preparing photo",
  upload: "Uploading",
  finalize: "Finishing up",
};

const EASE = [0.25, 0.46, 0.45, 0.94] as const;
const MAX_BYTES = 10 * 1024 * 1024;
const MIN_BYTES = 5 * 1024;
const ALLOWED_MIME = ["image/jpeg", "image/png", "image/webp"];
const ALLOWED_EXT = ["jpg", "jpeg", "png", "webp"];

type ValidationCode =
  | "empty_file"
  | "file_too_large"
  | "file_too_small"
  | "unsupported_type"
  | "heic_conversion_failed";

function fileExt(name: string): string {
  const i = name.lastIndexOf(".");
  return i >= 0 ? name.slice(i + 1).toLowerCase() : "";
}

function isHeic(f: File): boolean {
  const t = (f.type || "").toLowerCase();
  if (t.includes("heic") || t.includes("heif")) return true;
  const ext = fileExt(f.name);
  return ext === "heic" || ext === "heif";
}

type ValidationResult = { ok: true } | { ok: false; code: ValidationCode };

function validateFile(f: File): ValidationResult {
  if (f.size === 0) return { ok: false, code: "empty_file" };
  if (f.size > MAX_BYTES) return { ok: false, code: "file_too_large" };
  if (f.size < MIN_BYTES) return { ok: false, code: "file_too_small" };
  const mime = (f.type || "").toLowerCase();
  const ext = fileExt(f.name);
  const mimeOk = ALLOWED_MIME.includes(mime);
  const extOk = ALLOWED_EXT.includes(ext);
  if (!mimeOk && !extOk) return { ok: false, code: "unsupported_type" };
  return { ok: true };
}


async function convertHeicToJpeg(file: File): Promise<File> {
  const mod = await import("heic2any");
  const heic2any = (mod as any).default ?? (mod as any);
  const out = await heic2any({ blob: file, toType: "image/jpeg", quality: 0.9 });
  const blob: Blob = Array.isArray(out) ? out[0] : out;
  const base = file.name.replace(/\.(heic|heif)$/i, "") || "photo";
  return new File([blob], `${base}.jpg`, { type: "image/jpeg" });
}

function uploadWithProgress(
  url: string,
  form: FormData,
  headers: Record<string, string>,
  onProgress: (uploadedBytes: number, totalBytes: number) => void,
): Promise<{ status: number; body: any }> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", url);
    Object.entries(headers).forEach(([k, v]) => xhr.setRequestHeader(k, v));
    xhr.timeout = 60_000;
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) onProgress(e.loaded, e.total);
    };
    xhr.onload = () => {
      let body: any = null;
      try { body = JSON.parse(xhr.responseText); } catch { body = { error: "submission_failed" }; }
      resolve({ status: xhr.status, body });
    };
    xhr.onerror = () => reject(new Error("network_error"));
    xhr.ontimeout = () => reject(new Error("timeout"));
    xhr.send(form);
  });
}


function friendlyError(code?: string): string {
  switch (code) {
    case "heic_unsupported":
      return "iPhone HEIC photos can't be processed in-browser. In iOS Settings → Camera → Formats, switch to 'Most Compatible', then retake — or pick a JPG/PNG from your library.";
    case "heic_conversion_failed":
      return "We couldn't convert that iPhone HEIC photo. In iOS Settings → Camera → Formats, switch to 'Most Compatible', then retake — or pick a JPG/PNG.";
    case "file_too_large":
      return "That photo is over 10MB. Please choose a smaller one.";
    case "file_too_small":
    case "empty_file":
      return "That photo looks corrupted or empty. Try another.";
    case "unsupported_type":
      return "Only JPG, PNG, or WebP photos are accepted.";
    case "invalid_image":
      return "We couldn't read that image. Try a different file.";
    case "invalid_token":
    case "invite_not_found":
      return "This invite link is no longer valid.";
    case "already_submitted":
      return "A photo has already been submitted for this order.";
    case "rate_limited":
      return "Too many attempts. Please wait a moment and try again.";
    case "upload_failed":
    case "submission_failed":
      return "We couldn't save your photo. Please try again.";
    default:
      return code ? `Something went wrong (${code}). Try again.` : "Something went wrong. Try again.";
  }
}



// Client-side resize + EXIF strip via canvas re-encode (canvas does not
// preserve EXIF, so re-encoded output is automatically EXIF-free).
async function resizeAndStrip(file: File): Promise<Blob> {
  const dataUrl: string = await new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(r.result as string);
    r.onerror = rej;
    r.readAsDataURL(file);
  });
  const img: HTMLImageElement = await new Promise((res, rej) => {
    const i = new Image();
    i.onload = () => res(i);
    i.onerror = rej;
    i.src = dataUrl;
  });
  const MAX = 2400;
  let w = img.width;
  let h = img.height;
  if (w > MAX || h > MAX) {
    if (w >= h) {
      h = Math.round((h * MAX) / w);
      w = MAX;
    } else {
      w = Math.round((w * MAX) / h);
      h = MAX;
    }
  }
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(img, 0, 0, w, h);
  return new Promise((res) => {
    canvas.toBlob((b) => res(b!), "image/jpeg", 0.85);
  });
}

export default function WornInTheWildUpload() {
  const [params] = useSearchParams();
  const token = params.get("token");
  const [state, setState] = useState<State>({ kind: "loading" });
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [caption, setCaption] = useState("");
  const [city, setCity] = useState("");
  const [consent, setConsent] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isConverting, setIsConverting] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);


  useEffect(() => {
    if (!token) {
      setState({ kind: "invalid" });
      return;
    }
    (async () => {
      try {
        const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/validate-worn-token?token=${encodeURIComponent(
          token,
        )}`;
        const res = await fetch(url, {
          headers: { apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY },
        });
        const json = await res.json();
        if (!json.valid) {
          setState({ kind: json.reason === "invalid_or_expired" ? "expired" : "invalid" });
          return;
        }
        if (json.alreadySubmitted) {
          setState({ kind: "already" });
          return;
        }
        setState({
          kind: "ready",
          firstName: json.firstName,
          productName: json.productName,
          productImage: json.productImage,
        });
      } catch (e) {
        console.error(e);
        setState({ kind: "invalid" });
      }
    })();
  }, [token]);

  const onPickFile = async (raw: File | null) => {
    setError(null);
    if (!raw) return;

    let f = raw;
    if (isHeic(f)) {
      setIsConverting(true);
      try {
        f = await convertHeicToJpeg(f);
      } catch (e) {
        console.error("HEIC conversion failed", e);
        setIsConverting(false);
        setError(friendlyError("heic_conversion_failed"));
        return;
      }
      setIsConverting(false);
    }

    const res = validateFile(f);
    if (res.ok === false) {
      setError(friendlyError(res.code));
      return;
    }


    if (preview) URL.revokeObjectURL(preview);
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const onSubmit = async () => {
    if (!file || !token || !consent) return;
    const validation = validateFile(file);
    if (validation.ok === false) {
      setError(friendlyError(validation.code));
      return;
    }


    const ctx = {
      firstName: (state as any).firstName ?? null,
      productName: (state as any).productName ?? null,
      productImage: (state as any).productImage ?? null,
    };
    setError(null);
    setState({ kind: "submitting", step: "prepare", uploadPct: 0, uploadedBytes: 0, totalBytes: 0, ...ctx });
    try {
      const stripped = await resizeAndStrip(file);

      const form = new FormData();
      form.append("token", token);
      form.append("photo", stripped, "photo.jpg");
      form.append("caption", caption.slice(0, 140));
      form.append("city", city.slice(0, 80));
      form.append("consent", "true");

      setState({
        kind: "submitting",
        step: "upload",
        uploadPct: 0,
        uploadedBytes: 0,
        totalBytes: stripped.size,
        ...ctx,
      });

      const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/submit-worn-photo`;
      const { status, body: json } = await uploadWithProgress(
        url,
        form,
        { apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY },
        (loaded, total) => {
          const pct = total > 0 ? Math.min(100, Math.round((loaded / total) * 100)) : 0;
          setState({
            kind: "submitting",
            step: "upload",
            uploadPct: pct,
            uploadedBytes: loaded,
            totalBytes: total,
            ...ctx,
          });
        },
      );

      setState({
        kind: "submitting",
        step: "finalize",
        uploadPct: 100,
        uploadedBytes: stripped.size,
        totalBytes: stripped.size,
        ...ctx,
      });

      if (status < 200 || status >= 300 || !json?.ok) {
        setError(friendlyError(json?.error));
        setState({ kind: "ready", ...ctx });
        return;
      }
      setState({ kind: "done", rewardCode: json.rewardCode, rewardPercent: json.rewardPercent });
    } catch (e) {
      console.error(e);
      setError(friendlyError("upload_failed"));
      setState({ kind: "ready", ...ctx });
    }
  };


  return (
    <>
      <Helmet>
        <title>Worn in the Wild — Line of Judah</title>
        <meta name="robots" content="noindex,nofollow" />
      </Helmet>
      <main className="min-h-[100dvh] bg-white text-black">
        <div className="max-w-2xl mx-auto px-6 pt-24 pb-20 md:pt-32">
          {state.kind === "loading" && (
            <p className="font-serif text-sm text-neutral-500">Loading…</p>
          )}

          {state.kind === "invalid" && (
            <FallbackBlock title="This link isn't valid." />
          )}
          {state.kind === "expired" && (
            <FallbackBlock title="This invite has expired." sub="You can still share with us at @lineofjudah." />
          )}
          {state.kind === "already" && (
            <FallbackBlock
              title="Your submission is in review."
              sub="Thank you. We'll be in touch if we feature it."
              showGalleryLink
            />
          )}

          {(state.kind === "ready" || state.kind === "submitting") && (
            <UploadForm
              state={state}
              file={file}
              preview={preview}
              caption={caption}
              city={city}
              consent={consent}
              error={error}
              isConverting={isConverting}
              onPickFile={onPickFile}

              onPickClick={() => fileRef.current?.click()}
              fileRef={fileRef}
              setCaption={setCaption}
              setCity={setCity}
              setConsent={setConsent}
              onSubmit={onSubmit}
            />
          )}

          {state.kind === "done" && (
            <RewardReveal code={state.rewardCode} percent={state.rewardPercent} />
          )}
        </div>
      </main>
    </>
  );
}

function FallbackBlock({ title, sub, showGalleryLink }: { title: string; sub?: string; showGalleryLink?: boolean }) {
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: EASE }}>
      <h1 className="font-serif text-3xl md:text-4xl font-normal leading-tight tracking-tight mb-4">{title}</h1>
      <div className="w-[40%] h-px bg-neutral-400/60 mb-8" />
      {sub && <p className="text-sm text-neutral-600 mb-8">{sub}</p>}
      <Link to="/home" className="inline-block text-xs uppercase tracking-[0.18em] border-b border-neutral-400/60 pb-1">
        Back to site
      </Link>
      {showGalleryLink && (
        <Link
          to="/worn-in-the-wild"
          className="ml-6 inline-block text-xs uppercase tracking-[0.18em] border-b border-neutral-400/60 pb-1"
        >
          View the wall
        </Link>
      )}
    </motion.div>
  );
}

function UploadForm(props: {
  state: State;
  file: File | null;
  preview: string | null;
  caption: string;
  city: string;
  consent: boolean;
  error: string | null;
  isConverting: boolean;
  onPickFile: (f: File | null) => void;

  onPickClick: () => void;
  fileRef: React.RefObject<HTMLInputElement>;
  setCaption: (v: string) => void;
  setCity: (v: string) => void;
  setConsent: (v: boolean) => void;
  onSubmit: () => void;
}) {
  const s = props.state as any;
  const isSubmitting = props.state.kind === "submitting";
  const currentStep: SubmitStep | null = isSubmitting ? s.step : null;
  const uploadPct: number = isSubmitting ? (s.uploadPct ?? 0) : 0;
  const uploadedBytes: number = isSubmitting ? (s.uploadedBytes ?? 0) : 0;
  const totalBytes: number = isSubmitting ? (s.totalBytes ?? 0) : 0;
  const progressPct =
    currentStep === "prepare" ? 10
    : currentStep === "upload" ? Math.round(10 + uploadPct * 0.8)
    : currentStep === "finalize" ? 95
    : 0;
  const kb = (n: number) => Math.max(0, Math.round(n / 1024));
  const submitLabel =
    currentStep === "prepare" ? "Preparing…"
    : currentStep === "upload" ? `Uploading ${uploadPct}%`
    : currentStep === "finalize" ? "Finishing up…"
    : "Submit";
  const submitDisabled = !props.file || !props.consent || isSubmitting || props.isConverting;


  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: EASE }}>
      <p className="font-serif italic text-xs text-neutral-500 mb-2 tracking-wide">
        {s.firstName ? `${s.firstName},` : "Welcome."}
      </p>
      <h1 className="font-serif text-4xl md:text-5xl font-normal leading-[1.05] tracking-[-0.01em] mb-3">
        Worn in the wild.
      </h1>
      <div className="w-[40%] h-px bg-[#4CAF50]/80 mb-8" />

      <p className="text-sm leading-relaxed text-neutral-700 mb-10 max-w-lg">
        One photo of you in your {s.productName ? <strong className="font-normal text-black">{s.productName}</strong> : "piece"} —
        that's the only ask. Worn somewhere it became part of you.
      </p>

      {/* Upload zone */}
      <div className="mb-8">
        <input
          ref={props.fileRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/heic,image/heif"
          capture="environment"
          className="hidden"
          onChange={(e) => props.onPickFile(e.target.files?.[0] || null)}
        />
        {!props.preview ? (
          <button
            type="button"
            onClick={props.onPickClick}
            disabled={props.isConverting}
            className="w-full aspect-[4/5] md:aspect-video border border-[#4CAF50]/60 hover:border-[#4CAF50] transition-colors flex flex-col items-center justify-center gap-3 group disabled:opacity-60 disabled:cursor-wait"
          >
            {props.isConverting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin text-[#4CAF50]" />
                <span className="text-xs uppercase tracking-[0.2em] text-neutral-600">
                  Converting iPhone photo…
                </span>
              </>
            ) : (
              <>
                <span className="text-xs uppercase tracking-[0.2em] text-neutral-600 group-hover:text-black">
                  Tap to add photo
                </span>
                <span className="text-[10px] text-neutral-400 uppercase tracking-wider">JPG · PNG · HEIC · Max 10MB</span>
              </>
            )}
          </button>
        ) : (
          <div className="relative">
            <img src={props.preview} alt="Your submission" className="w-full max-h-[70vh] object-contain bg-neutral-50" />
            <button
              type="button"
              onClick={props.onPickClick}
              disabled={isSubmitting}
              className="absolute top-3 right-3 bg-white/90 backdrop-blur px-3 py-2 text-[10px] uppercase tracking-[0.18em] border border-neutral-300 disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none"
            >
              Change
            </button>

          </div>
        )}
      </div>


      {/* Caption + city */}
      <div className="space-y-4 mb-8">
        <div>
          <label className="block text-[10px] uppercase tracking-[0.2em] text-neutral-500 mb-2">
            Where were you? <span className="text-neutral-400 normal-case tracking-normal">(optional)</span>
          </label>
          <input
            type="text"
            value={props.caption}
            onChange={(e) => props.setCaption(e.target.value.slice(0, 140))}
            maxLength={140}
            placeholder="At the gym after Sunday service…"
            className="w-full bg-transparent border-b border-neutral-300 focus:border-[#4CAF50] outline-none py-2 text-sm placeholder:text-neutral-400"
          />
          <p className="text-[10px] text-neutral-400 mt-1">{props.caption.length}/140</p>
        </div>
        <div>
          <label className="block text-[10px] uppercase tracking-[0.2em] text-neutral-500 mb-2">
            City <span className="text-neutral-400 normal-case tracking-normal">(optional)</span>
          </label>
          <input
            type="text"
            value={props.city}
            onChange={(e) => props.setCity(e.target.value.slice(0, 80))}
            maxLength={80}
            placeholder="Toronto"
            className="w-full bg-transparent border-b border-neutral-300 focus:border-[#4CAF50] outline-none py-2 text-sm placeholder:text-neutral-400"
          />
        </div>
      </div>

      {/* Consent */}
      <label className="flex items-start gap-3 mb-8 cursor-pointer">
        <input
          type="checkbox"
          checked={props.consent}
          onChange={(e) => props.setConsent(e.target.checked)}
          className="mt-1 accent-[#4CAF50]"
        />
        <span className="text-xs leading-relaxed text-neutral-600">
          I grant Line of Judah permission to feature this photo on the site and in marketing. Revocable anytime by replying to the invite email.
        </span>
      </label>

      <AnimatePresence>
        {props.error && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.3, ease: EASE }}
            role="alert"
            aria-live="assertive"
            className="mb-6 border border-red-300 bg-red-50/70 p-4 flex items-start gap-3"
          >
            <CircleAlert className="h-4 w-4 text-red-700 mt-0.5 shrink-0" />
            <div>
              <p className="text-[10px] uppercase tracking-[0.2em] text-red-700 font-medium mb-1">
                Upload failed
              </p>
              <p className="text-xs text-red-800 leading-relaxed">{props.error}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Progress steps */}
      <AnimatePresence>
        {isSubmitting && currentStep && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: EASE }}
            className="mb-6 border border-[#4CAF50]/40 bg-[#4CAF50]/5 p-4"
            role="status"
            aria-live="polite"
          >
            <div className="flex items-center justify-between mb-3">
              <p className="text-[10px] uppercase tracking-[0.2em] text-neutral-700 font-medium">
                Sending your photo
              </p>
              <p className="text-[10px] tabular-nums text-neutral-500">{progressPct}%</p>
            </div>
            <div className="h-px bg-neutral-200 mb-4 overflow-hidden">
              <motion.div
                className="h-full bg-[#4CAF50]"
                initial={false}
                animate={{ width: `${progressPct}%` }}
                transition={{ duration: 0.4, ease: EASE }}
              />
            </div>
            <ul className="space-y-2">
              {STEP_ORDER.map((step) => {
                const idx = STEP_ORDER.indexOf(step);
                const currentIdx = STEP_ORDER.indexOf(currentStep);
                const status = idx < currentIdx ? "done" : idx === currentIdx ? "active" : "pending";
                return (
                  <li key={step} className="flex items-center gap-3 text-xs">
                    <span className="w-4 h-4 flex items-center justify-center shrink-0">
                      {status === "done" && <Check className="h-3.5 w-3.5 text-[#4CAF50]" />}
                      {status === "active" && <Loader2 className="h-3.5 w-3.5 text-[#4CAF50] animate-spin" />}
                      {status === "pending" && <span className="h-1.5 w-1.5 rounded-full bg-neutral-300" />}
                    </span>
                    <span className={status === "pending" ? "text-neutral-400" : "text-neutral-800"}>
                      {STEP_LABELS[step]}
                      {status === "active" && "…"}
                    </span>
                  </li>
                );
              })}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Submit */}
      <button
        type="button"
        disabled={!props.file || !props.consent || isSubmitting}
        onClick={props.onSubmit}
        className="w-full bg-[#4CAF50] text-white text-xs uppercase tracking-[0.2em] font-medium py-4 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#449e48] transition-colors relative overflow-hidden"
      >
        {isSubmitting ? (
          <span className="inline-flex items-center justify-center gap-2">
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            Sending…
          </span>
        ) : (
          "Submit"
        )}
      </button>

      <p className="text-[10px] text-neutral-400 text-center mt-6 uppercase tracking-[0.2em]">
        One photo · One submission
      </p>
    </motion.div>
  );
}

function RewardReveal({ code, percent }: { code: string; percent: number }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: EASE }}>
      <h1 className="font-serif text-5xl md:text-6xl font-normal leading-[1] tracking-[-0.02em] mb-4">Thank you.</h1>
      <div className="w-[40%] h-px bg-[#4CAF50]/80 mb-8" />
      <p className="text-sm leading-relaxed text-neutral-700 mb-10 max-w-lg">
        Your photo is in review. As promised — here's something for your trouble.
      </p>

      <div className="border border-neutral-300 p-6 md:p-8 mb-8 bg-neutral-50/50">
        <p className="text-[10px] uppercase tracking-[0.22em] text-neutral-500 mb-3">
          {percent}% off your next order
        </p>
        <div className="flex items-center justify-between gap-4">
          <code className="font-mono text-2xl md:text-3xl tracking-[0.1em] text-black">{code}</code>
          <button
            type="button"
            onClick={copy}
            className="text-[10px] uppercase tracking-[0.18em] border-b border-neutral-400/80 pb-1 hover:border-black transition-colors"
          >
            {copied ? "Copied" : "Copy"}
          </button>
        </div>
        <p className="text-[10px] text-neutral-400 mt-4 uppercase tracking-wider">
          Single use · Expires in 60 days
        </p>
      </div>

      <Link
        to={`/catalogue?promo=${code}`}
        className="block w-full bg-[#4CAF50] text-white text-xs uppercase tracking-[0.2em] font-medium py-4 text-center hover:bg-[#449e48] transition-colors"
      >
        Use it now
      </Link>
    </motion.div>
  );
}
