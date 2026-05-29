// Admin action: approve a worn-in-the-wild submission. Moves photo from
// private bucket to public product-images bucket so it can be served from
// the public gallery without signed URLs.
// deno-lint-ignore-file no-explicit-any
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUser = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } },
    );
    const { data: { user } } = await supabaseUser.auth.getUser();
    if (!user) {
      return new Response(JSON.stringify({ error: "unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const { data: roles } = await supabaseAdmin
      .from("user_roles").select("role").eq("user_id", user.id);
    const isAdmin = (roles || []).some((r) => r.role === "admin");
    if (!isAdmin) {
      return new Response(JSON.stringify({ error: "forbidden" }), {
        status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { submissionId, action } = await req.json();
    if (!submissionId || !["approve", "feature", "reject"].includes(action)) {
      return new Response(JSON.stringify({ error: "invalid_request" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: sub, error: subErr } = await supabaseAdmin
      .from("worn_in_the_wild_submissions")
      .select("id, photo_path, status")
      .eq("id", submissionId)
      .maybeSingle();

    if (subErr || !sub) {
      return new Response(JSON.stringify({ error: "not_found" }), {
        status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "reject") {
      await supabaseAdmin
        .from("worn_in_the_wild_submissions")
        .update({
          status: "rejected",
          reviewed_at: new Date().toISOString(),
          reviewed_by: user.id,
          soft_deleted_at: new Date().toISOString(),
        })
        .eq("id", submissionId);

      return new Response(JSON.stringify({ ok: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // approve or feature: copy file to public product-images bucket if not already
    let publicPath = sub.photo_path;
    if (!publicPath.startsWith("worn-in-the-wild/")) {
      publicPath = `worn-in-the-wild/${sub.photo_path}`;
    }

    if (sub.status === "pending") {
      // Download from private bucket
      const { data: fileData, error: dlErr } = await supabaseAdmin.storage
        .from("worn-in-the-wild")
        .download(sub.photo_path);

      if (dlErr || !fileData) {
        console.error("download error", dlErr);
        return new Response(JSON.stringify({ error: "download_failed" }), {
          status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const buf = new Uint8Array(await fileData.arrayBuffer());
      const { error: upErr } = await supabaseAdmin.storage
        .from("product-images")
        .upload(publicPath, buf, {
          contentType: fileData.type || "image/jpeg",
          upsert: true,
        });

      if (upErr) {
        console.error("upload to public bucket failed", upErr);
        return new Response(JSON.stringify({ error: "publish_failed" }), {
          status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    const newStatus = action === "feature" ? "featured" : "approved";
    await supabaseAdmin
      .from("worn_in_the_wild_submissions")
      .update({
        status: newStatus,
        reviewed_at: new Date().toISOString(),
        reviewed_by: user.id,
        featured_at: action === "feature" ? new Date().toISOString() : null,
        photo_path: publicPath,
      })
      .eq("id", submissionId);

    // Return public URL for confirmation
    const { data: pub } = supabaseAdmin.storage.from("product-images").getPublicUrl(publicPath);

    return new Response(JSON.stringify({ ok: true, status: newStatus, publicUrl: pub.publicUrl }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("review-worn-submission error", e);
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
