import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import AdminLayout from "@/components/admin/AdminLayout";
import { Helmet } from "react-helmet-async";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { toast } from "sonner";
import { Search, ExternalLink, Mail, MapPin } from "lucide-react";

type Application = {
  id: string;
  created_at: string;
  full_name: string;
  email: string;
  location: string | null;
  instagram_handle: string | null;
  tiktok_handle: string | null;
  youtube_handle: string | null;
  twitter_handle: string | null;
  follower_count_range: string;
  content_types: string[];
  why_represent: string;
  faith_in_content: string;
  content_frequency: string;
  agreed_to_terms: boolean;
  status: "pending" | "approved" | "rejected" | string;
  admin_notes: string | null;
  reviewed_at: string | null;
  reviewed_by: string | null;
};

type StatusFilter = "pending" | "approved" | "rejected" | "all";

const statusStyles: Record<string, string> = {
  pending: "bg-amber-100 text-amber-900",
  approved: "bg-emerald-100 text-emerald-900",
  rejected: "bg-red-100 text-red-900",
};

export default function AdminAmbassadors() {
  const [apps, setApps] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("pending");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Application | null>(null);
  const [notes, setNotes] = useState("");
  const [busy, setBusy] = useState(false);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("ambassador_applications")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) toast.error(error.message);
    setApps((data as Application[]) || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const counts = useMemo(() => ({
    pending: apps.filter((a) => a.status === "pending").length,
    approved: apps.filter((a) => a.status === "approved").length,
    rejected: apps.filter((a) => a.status === "rejected").length,
    all: apps.length,
  }), [apps]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return apps.filter((a) => {
      if (statusFilter !== "all" && a.status !== statusFilter) return false;
      if (q && !(`${a.full_name} ${a.email}`.toLowerCase().includes(q))) return false;
      return true;
    });
  }, [apps, statusFilter, search]);

  const openApp = (a: Application) => {
    setSelected(a);
    setNotes(a.admin_notes || "");
  };

  const review = async (decision: "approved" | "rejected") => {
    if (!selected) return;
    setBusy(true);
    const { data: { user } } = await supabase.auth.getUser();
    const { error } = await supabase
      .from("ambassador_applications")
      .update({
        status: decision,
        admin_notes: notes || null,
        reviewed_at: new Date().toISOString(),
        reviewed_by: user?.id ?? null,
      })
      .eq("id", selected.id);
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success(`Application ${decision}`);
    setSelected(null);
    load();
  };

  const saveNotes = async () => {
    if (!selected) return;
    setBusy(true);
    const { error } = await supabase
      .from("ambassador_applications")
      .update({ admin_notes: notes || null })
      .eq("id", selected.id);
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success("Notes saved");
    load();
  };

  const socialLinks = (a: Application) => [
    a.instagram_handle && { label: "Instagram", url: `https://instagram.com/${a.instagram_handle.replace(/^@/, "")}`, handle: a.instagram_handle },
    a.tiktok_handle && { label: "TikTok", url: `https://tiktok.com/@${a.tiktok_handle.replace(/^@/, "")}`, handle: a.tiktok_handle },
    a.youtube_handle && { label: "YouTube", url: `https://youtube.com/${a.youtube_handle.replace(/^@/, "@")}`, handle: a.youtube_handle },
    a.twitter_handle && { label: "X/Twitter", url: `https://x.com/${a.twitter_handle.replace(/^@/, "")}`, handle: a.twitter_handle },
  ].filter(Boolean) as { label: string; url: string; handle: string }[];

  return (
    <AdminLayout>
      <Helmet><title>Ambassador Applications — Ops Portal</title></Helmet>
      <div className="p-6 max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-serif mb-1">Ambassador Applications</h1>
          <p className="text-sm text-muted-foreground">Review and decide on ambassador requests.</p>
        </div>

        <div className="flex gap-2 mb-6 border-b border-border">
          {(["pending", "approved", "rejected", "all"] as StatusFilter[]).map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-4 py-2 text-xs uppercase tracking-wider border-b-2 -mb-px transition-colors ${
                statusFilter === s ? "border-foreground text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {s} <span className="ml-1 opacity-60">({counts[s]})</span>
            </button>
          ))}
        </div>

        <div className="mb-4 relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search name or email…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 rounded-none"
          />
        </div>

        <div className="border border-border bg-card">
          <div className="grid grid-cols-[1.5fr_1.5fr_1fr_120px_120px_100px] gap-4 px-4 py-3 border-b border-border bg-muted/30 text-[10px] uppercase tracking-wider text-muted-foreground">
            <div>Name</div>
            <div>Email</div>
            <div>Location</div>
            <div>Followers</div>
            <div>Submitted</div>
            <div className="text-right">Status</div>
          </div>
          {loading ? (
            <div className="p-8 text-sm text-muted-foreground text-center">Loading…</div>
          ) : filtered.length === 0 ? (
            <div className="p-8 text-sm text-muted-foreground text-center">No applications in this view.</div>
          ) : (
            filtered.map((a) => (
              <button
                key={a.id}
                onClick={() => openApp(a)}
                className="w-full text-left grid grid-cols-[1.5fr_1.5fr_1fr_120px_120px_100px] gap-4 px-4 py-3 border-b border-border last:border-0 items-center text-sm hover:bg-muted/30 transition-colors"
              >
                <div className="font-light truncate">{a.full_name}</div>
                <div className="text-xs text-muted-foreground truncate">{a.email}</div>
                <div className="text-xs text-muted-foreground truncate">{a.location || "—"}</div>
                <div className="text-xs text-muted-foreground">{a.follower_count_range}</div>
                <div className="text-xs text-muted-foreground">
                  {new Date(a.created_at).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                </div>
                <div className="flex justify-end">
                  <span className={`text-[10px] uppercase px-2 py-0.5 ${statusStyles[a.status] || "bg-muted text-muted-foreground"}`}>
                    {a.status}
                  </span>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      <Sheet open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
          {selected && (
            <>
              <SheetHeader className="mb-6">
                <SheetTitle className="font-serif text-xl">{selected.full_name}</SheetTitle>
                <div className="flex flex-wrap gap-3 text-xs text-muted-foreground pt-2">
                  <span className="inline-flex items-center gap-1"><Mail className="h-3 w-3" /> {selected.email}</span>
                  {selected.location && (
                    <span className="inline-flex items-center gap-1"><MapPin className="h-3 w-3" /> {selected.location}</span>
                  )}
                </div>
              </SheetHeader>

              <div className="space-y-5 text-sm">
                <div className="flex items-center justify-between">
                  <span className={`text-[10px] uppercase px-2 py-0.5 ${statusStyles[selected.status] || "bg-muted"}`}>
                    {selected.status}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    Applied {new Date(selected.created_at).toLocaleDateString()}
                  </span>
                </div>

                <Section title="Reach">
                  <div className="space-y-1 text-xs">
                    <div><span className="text-muted-foreground">Followers:</span> {selected.follower_count_range}</div>
                    <div><span className="text-muted-foreground">Posts:</span> {selected.content_frequency}</div>
                    <div><span className="text-muted-foreground">Content types:</span> {selected.content_types.join(", ") || "—"}</div>
                  </div>
                </Section>

                {socialLinks(selected).length > 0 && (
                  <Section title="Socials">
                    <div className="flex flex-col gap-1">
                      {socialLinks(selected).map((s) => (
                        <a
                          key={s.label}
                          href={s.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 text-xs hover:underline"
                        >
                          <ExternalLink className="h-3 w-3" />
                          <span className="text-muted-foreground">{s.label}:</span>
                          <span>{s.handle}</span>
                        </a>
                      ))}
                    </div>
                  </Section>
                )}

                <Section title="Why represent">
                  <p className="text-xs leading-relaxed whitespace-pre-wrap">{selected.why_represent}</p>
                </Section>

                <Section title="Faith in content">
                  <p className="text-xs leading-relaxed whitespace-pre-wrap">{selected.faith_in_content}</p>
                </Section>

                <Section title="Admin notes">
                  <Textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Internal notes…"
                    className="rounded-none text-xs min-h-[80px]"
                  />
                  <div className="flex justify-end mt-2">
                    <Button size="sm" variant="outline" onClick={saveNotes} disabled={busy} className="rounded-none">
                      Save notes
                    </Button>
                  </div>
                </Section>

                <div className="flex gap-2 pt-4 border-t border-border">
                  <Button
                    onClick={() => review("approved")}
                    disabled={busy || selected.status === "approved"}
                    className="flex-1 rounded-none bg-foreground text-background hover:bg-foreground/90"
                  >
                    Approve
                  </Button>
                  <Button
                    onClick={() => review("rejected")}
                    disabled={busy || selected.status === "rejected"}
                    variant="outline"
                    className="flex-1 rounded-none"
                  >
                    Reject
                  </Button>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </AdminLayout>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">{title}</h3>
      {children}
    </div>
  );
}
