import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import AdminLayout from "@/components/admin/AdminLayout";
import { Helmet } from "react-helmet-async";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Copy, Trash2, Download, Search } from "lucide-react";

type Subscriber = {
  id: string;
  email: string;
  source: string | null;
  subscribed_at: string;
};

const PAGE_SIZE = 50;

export default function AdminSubscribers() {
  const [rows, setRows] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sourceFilter, setSourceFilter] = useState<string>("all");
  const [page, setPage] = useState(0);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("newsletter_subscribers")
      .select("id, email, source, subscribed_at")
      .order("subscribed_at", { ascending: false })
      .limit(5000);
    if (error) toast.error(error.message);
    setRows((data as Subscriber[]) || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const sources = useMemo(() => {
    const s = new Set<string>();
    rows.forEach((r) => r.source && s.add(r.source));
    return ["all", ...Array.from(s).sort()];
  }, [rows]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return rows.filter((r) => {
      if (sourceFilter !== "all" && (r.source || "") !== sourceFilter) return false;
      if (q && !r.email.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [rows, search, sourceFilter]);

  const pageRows = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));

  useEffect(() => { setPage(0); }, [search, sourceFilter]);

  const copyEmail = async (email: string) => {
    await navigator.clipboard.writeText(email);
    toast.success("Email copied");
  };

  const remove = async (id: string, email: string) => {
    if (!confirm(`Remove ${email} from the list?`)) return;
    setBusyId(id);
    const { error } = await supabase.from("newsletter_subscribers").delete().eq("id", id);
    setBusyId(null);
    if (error) return toast.error(error.message);
    toast.success("Removed");
    setRows((prev) => prev.filter((r) => r.id !== id));
  };

  const exportCsv = () => {
    const header = "email,source,subscribed_at\n";
    const body = filtered
      .map((r) => `${r.email},${r.source ?? ""},${r.subscribed_at}`)
      .join("\n");
    const blob = new Blob([header + body], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `subscribers-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const copyAll = async () => {
    await navigator.clipboard.writeText(filtered.map((r) => r.email).join(", "));
    toast.success(`Copied ${filtered.length} emails`);
  };

  return (
    <AdminLayout>
      <Helmet><title>Newsletter Subscribers — Ops Portal</title></Helmet>
      <div className="p-6 max-w-7xl mx-auto">
        <div className="mb-6 flex items-end justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-serif mb-1">Newsletter Subscribers</h1>
            <p className="text-sm text-muted-foreground">
              {loading ? "Loading…" : `${filtered.length} of ${rows.length} subscribers`}
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={copyAll} disabled={!filtered.length} className="rounded-none">
              <Copy className="h-3.5 w-3.5 mr-2" /> Copy all
            </Button>
            <Button variant="outline" size="sm" onClick={exportCsv} disabled={!filtered.length} className="rounded-none">
              <Download className="h-3.5 w-3.5 mr-2" /> Export CSV
            </Button>
          </div>
        </div>

        <div className="flex gap-3 mb-4 flex-wrap">
          <div className="relative flex-1 min-w-[240px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by email…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 rounded-none"
            />
          </div>
          <div className="flex gap-1">
            {sources.map((s) => (
              <button
                key={s}
                onClick={() => setSourceFilter(s)}
                className={`px-3 py-2 text-[10px] uppercase tracking-wider border transition-colors ${
                  sourceFilter === s
                    ? "border-foreground bg-foreground text-background"
                    : "border-border text-muted-foreground hover:text-foreground"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        <div className="border border-border bg-card">
          <div className="grid grid-cols-[1fr_140px_160px_120px] gap-4 px-4 py-3 border-b border-border bg-muted/30 text-[10px] uppercase tracking-wider text-muted-foreground">
            <div>Email</div>
            <div>Source</div>
            <div>Subscribed</div>
            <div className="text-right">Actions</div>
          </div>
          {loading ? (
            <div className="p-8 text-sm text-muted-foreground text-center">Loading…</div>
          ) : pageRows.length === 0 ? (
            <div className="p-8 text-sm text-muted-foreground text-center">
              {rows.length === 0 ? "No subscribers yet." : "No matches for this filter."}
            </div>
          ) : (
            pageRows.map((r) => (
              <div
                key={r.id}
                className="grid grid-cols-[1fr_140px_160px_120px] gap-4 px-4 py-3 border-b border-border last:border-0 items-center text-sm hover:bg-muted/20"
              >
                <div className="font-mono text-xs truncate">{r.email}</div>
                <div className="text-xs text-muted-foreground">{r.source || "—"}</div>
                <div className="text-xs text-muted-foreground">
                  {new Date(r.subscribed_at).toLocaleDateString(undefined, {
                    year: "numeric", month: "short", day: "numeric",
                  })}
                </div>
                <div className="flex gap-1 justify-end">
                  <button
                    onClick={() => copyEmail(r.email)}
                    className="p-1.5 text-muted-foreground hover:text-foreground"
                    title="Copy email"
                  >
                    <Copy className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => remove(r.id, r.email)}
                    disabled={busyId === r.id}
                    className="p-1.5 text-muted-foreground hover:text-red-500 disabled:opacity-50"
                    title="Remove"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {pageCount > 1 && (
          <div className="flex items-center justify-between mt-4 text-xs text-muted-foreground">
            <span>Page {page + 1} of {pageCount}</span>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" disabled={page === 0} onClick={() => setPage((p) => p - 1)} className="rounded-none">
                Prev
              </Button>
              <Button variant="outline" size="sm" disabled={page >= pageCount - 1} onClick={() => setPage((p) => p + 1)} className="rounded-none">
                Next
              </Button>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
