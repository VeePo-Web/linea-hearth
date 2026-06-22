import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import AdminLayout from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  DollarSign, TrendingUp, TrendingDown, RefreshCw, Download,
  ArrowUpRight, Copy, ExternalLink, Search, CreditCard, Users,
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip,
  CartesianGrid, BarChart, Bar, Legend,
} from 'recharts';
import { format, subDays, startOfDay, eachDayOfInterval } from 'date-fns';
import { toast } from 'sonner';
import { formatAdminMoney, formatAdminMoneyShort } from '@/lib/adminCurrency';

type RangeKey = '7D' | '30D' | '90D' | '12M' | 'ALL';

interface OrderRow {
  id: string;
  created_at: string;
  customer_email: string;
  customer_first_name: string | null;
  customer_last_name: string | null;
  total_cents: number;
  subtotal_cents: number;
  shipping_cents: number;
  tax_cents: number;
  discount_cents: number;
  payment_status: string;
  currency: string;
  stripe_payment_intent_id: string | null;
  stripe_customer_id: string | null;
}

const RANGE_DAYS: Record<RangeKey, number | null> = {
  '7D': 7, '30D': 30, '90D': 90, '12M': 365, 'ALL': null,
};

const fmt = (cents: number) => formatAdminMoney(cents);

const AdminFinancials = () => {
  const [range, setRange] = useState<RangeKey>('30D');
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [prevOrders, setPrevOrders] = useState<OrderRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'paid' | 'refunded' | 'unpaid' | 'failed'>('all');
  const [page, setPage] = useState(1);
  const pageSize = 25;

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const days = RANGE_DAYS[range];
      const now = new Date();
      const start = days ? startOfDay(subDays(now, days - 1)).toISOString() : null;
      const prevStart = days ? startOfDay(subDays(now, days * 2 - 1)).toISOString() : null;
      const prevEnd = days ? startOfDay(subDays(now, days)).toISOString() : null;

      const cols = 'id, created_at, customer_email, customer_first_name, customer_last_name, total_cents, subtotal_cents, shipping_cents, tax_cents, discount_cents, payment_status, currency, stripe_payment_intent_id, stripe_customer_id';

      const curQ = supabase.from('orders').select(cols).order('created_at', { ascending: false }).limit(2000);
      if (start) curQ.gte('created_at', start);
      const cur = await curQ;

      let prev: { data: OrderRow[] | null } = { data: [] };
      if (prevStart && prevEnd) {
        const r = await supabase.from('orders').select(cols).gte('created_at', prevStart).lt('created_at', prevEnd).limit(2000);
        prev = { data: (r.data as OrderRow[]) ?? [] };
      }

      setOrders((cur.data as OrderRow[]) ?? []);
      setPrevOrders(prev.data ?? []);
    } catch (e) {
      console.error(e);
      toast.error('Failed to load financials');
    } finally {
      setLoading(false);
    }
  }, [range]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const paid = useMemo(() => orders.filter(o => o.payment_status === 'paid'), [orders]);
  const prevPaid = useMemo(() => prevOrders.filter(o => o.payment_status === 'paid'), [prevOrders]);

  const gross = paid.reduce((s, o) => s + o.total_cents, 0);
  const prevGross = prevPaid.reduce((s, o) => s + o.total_cents, 0);
  const count = paid.length;
  const prevCount = prevPaid.length;
  const aov = count > 0 ? gross / count : 0;
  const prevAov = prevCount > 0 ? prevGross / prevCount : 0;

  const pctDelta = (cur: number, prev: number) => {
    if (prev === 0) return cur === 0 ? 0 : 100;
    return ((cur - prev) / prev) * 100;
  };

  const kpis = [
    { title: 'Gross Volume', value: fmt(gross), delta: pctDelta(gross, prevGross), icon: DollarSign, sub: `${count} payments` },
    { title: 'Net Volume', value: fmt(gross), delta: pctDelta(gross, prevGross), icon: TrendingUp, sub: 'Refunds: $0.00 CAD' },
    { title: 'Successful Payments', value: count.toString(), delta: pctDelta(count, prevCount), icon: CreditCard, sub: 'Stripe-settled' },
    { title: 'Average Order Value', value: fmt(aov), delta: pctDelta(aov, prevAov), icon: Users, sub: 'Per payment' },
  ];

  // Daily series
  const trend = useMemo(() => {
    const days = RANGE_DAYS[range];
    const now = new Date();
    if (!days) {
      // group by month for ALL
      const map = new Map<string, { date: string; gross: number; count: number }>();
      paid.forEach(o => {
        const k = format(new Date(o.created_at), 'yyyy-MM');
        const e = map.get(k) ?? { date: k, gross: 0, count: 0 };
        e.gross += o.total_cents / 100; e.count += 1;
        map.set(k, e);
      });
      return [...map.values()].sort((a, b) => a.date.localeCompare(b.date));
    }
    const start = startOfDay(subDays(now, days - 1));
    const series = eachDayOfInterval({ start, end: now }).map(d => ({
      date: format(d, 'MMM d'),
      key: format(d, 'yyyy-MM-dd'),
      gross: 0, count: 0,
    }));
    const byKey = new Map(series.map(s => [s.key, s]));
    paid.forEach(o => {
      const k = format(new Date(o.created_at), 'yyyy-MM-dd');
      const e = byKey.get(k); if (!e) return;
      e.gross += o.total_cents / 100; e.count += 1;
    });
    return series;
  }, [paid, range]);

  // Composition
  const composition = useMemo(() => [{
    name: 'Revenue',
    Subtotal: paid.reduce((s, o) => s + o.subtotal_cents, 0) / 100,
    Shipping: paid.reduce((s, o) => s + o.shipping_cents, 0) / 100,
    Tax: paid.reduce((s, o) => s + o.tax_cents, 0) / 100,
    Discounts: -paid.reduce((s, o) => s + o.discount_cents, 0) / 100,
  }], [paid]);

  // Top customers
  const topCustomers = useMemo(() => {
    const map = new Map<string, { email: string; name: string; total: number; count: number }>();
    paid.forEach(o => {
      const e = map.get(o.customer_email) ?? {
        email: o.customer_email,
        name: [o.customer_first_name, o.customer_last_name].filter(Boolean).join(' ') || '—',
        total: 0, count: 0,
      };
      e.total += o.total_cents; e.count += 1;
      map.set(o.customer_email, e);
    });
    return [...map.values()].sort((a, b) => b.total - a.total).slice(0, 5);
  }, [paid]);

  // Filtered txns
  const filtered = useMemo(() => {
    let rows = orders;
    if (statusFilter !== 'all') rows = rows.filter(o => o.payment_status === statusFilter);
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      rows = rows.filter(o =>
        o.customer_email?.toLowerCase().includes(q) ||
        o.stripe_payment_intent_id?.toLowerCase().includes(q) ||
        o.stripe_customer_id?.toLowerCase().includes(q),
      );
    }
    return rows;
  }, [orders, statusFilter, search]);

  const pageRows = filtered.slice((page - 1) * pageSize, page * pageSize);
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));

  useEffect(() => { setPage(1); }, [search, statusFilter, range]);

  const copy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied');
  };

  const exportCsv = () => {
    const header = ['Date', 'Customer', 'Email', 'Amount', 'Status', 'Stripe Payment Intent', 'Stripe Customer'];
    const rows = filtered.map(o => [
      new Date(o.created_at).toISOString(),
      [o.customer_first_name, o.customer_last_name].filter(Boolean).join(' '),
      o.customer_email,
      (o.total_cents / 100).toFixed(2),
      o.payment_status,
      o.stripe_payment_intent_id ?? '',
      o.stripe_customer_id ?? '',
    ]);
    const csv = [header, ...rows].map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `financials-${range}-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click(); URL.revokeObjectURL(url);
  };

  const statusBadge = (status: string) => {
    const variant: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      paid: 'default', refunded: 'secondary', failed: 'destructive', unpaid: 'outline',
    };
    return <Badge variant={variant[status] ?? 'outline'} className="text-[10px] uppercase rounded-none">{status}</Badge>;
  };

  const DeltaPill = ({ value }: { value: number }) => {
    const positive = value >= 0;
    const Icon = positive ? TrendingUp : TrendingDown;
    return (
      <span className={`inline-flex items-center gap-1 text-[11px] ${positive ? 'text-emerald-500' : 'text-red-500'}`}>
        <Icon className="h-3 w-3" />
        {positive ? '+' : ''}{value.toFixed(1)}%
      </span>
    );
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <h1 className="text-xl font-light tracking-wider text-foreground">Financials</h1>
            <p className="text-sm text-muted-foreground mt-1">Revenue from Stripe-settled orders</p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <div className="inline-flex border border-border rounded-none overflow-hidden">
              {(Object.keys(RANGE_DAYS) as RangeKey[]).map(k => (
                <button
                  key={k}
                  onClick={() => setRange(k)}
                  className={`px-3 py-1.5 text-xs tracking-wider transition-colors ${
                    range === k ? 'bg-primary text-primary-foreground' : 'bg-background hover:bg-secondary'
                  }`}
                >
                  {k}
                </button>
              ))}
            </div>
            <Button variant="outline" size="sm" onClick={fetchAll} disabled={loading} className="rounded-none">
              <RefreshCw className={`h-3.5 w-3.5 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button variant="outline" size="sm" onClick={exportCsv} className="rounded-none">
              <Download className="h-3.5 w-3.5 mr-2" />
              CSV
            </Button>
          </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {kpis.map(k => {
            const Icon = k.icon;
            return (
              <Card key={k.title} className="rounded-none">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{k.title}</CardTitle>
                  <Icon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-light">{loading ? '—' : k.value}</div>
                  <div className="flex items-center gap-2 mt-1">
                    {!loading && range !== 'ALL' && <DeltaPill value={k.delta} />}
                    <span className="text-[11px] text-muted-foreground">{k.sub}</span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Trend */}
        <Card className="rounded-none">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Gross Volume</CardTitle>
              <p className="text-sm mt-1">{loading ? '—' : fmt(gross)} <span className="text-xs text-muted-foreground">over {range}</span></p>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[260px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trend} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="grossFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.4} />
                      <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                  <XAxis dataKey="date" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} tickFormatter={(v) => formatAdminMoneyShort(Number(v) * 100)} />
                  <Tooltip
                    contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 0, fontSize: 12 }}
                    formatter={(v: number) => [formatAdminMoney(v * 100), 'Gross']}
                  />
                  <Area type="monotone" dataKey="gross" stroke="hsl(var(--primary))" fill="url(#grossFill)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Composition + Top Customers */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card className="rounded-none">
            <CardHeader>
              <CardTitle className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Revenue Composition</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[220px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={composition} layout="vertical" margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
                    <XAxis type="number" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} tickFormatter={(v) => formatAdminMoneyShort(Number(v) * 100)} />
                    <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                    <Tooltip
                      contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 0, fontSize: 12 }}
                      formatter={(v: number) => formatAdminMoney(v * 100)}
                    />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                    <Bar dataKey="Subtotal" stackId="a" fill="hsl(var(--primary))" />
                    <Bar dataKey="Shipping" stackId="a" fill="hsl(var(--muted-foreground))" />
                    <Bar dataKey="Tax" stackId="a" fill="#94a3b8" />
                    <Bar dataKey="Discounts" stackId="a" fill="#ef4444" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-none">
            <CardHeader>
              <CardTitle className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Top Customers</CardTitle>
            </CardHeader>
            <CardContent>
              {topCustomers.length === 0 ? (
                <p className="text-sm text-muted-foreground py-6 text-center">No paid orders in this range</p>
              ) : (
                <div className="space-y-2">
                  {topCustomers.map((c, i) => (
                    <div key={c.email} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="text-xs text-muted-foreground tabular-nums w-4">{i + 1}</span>
                        <div className="min-w-0">
                          <p className="text-sm truncate">{c.name}</p>
                          <p className="text-xs text-muted-foreground truncate">{c.email}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">{fmt(c.total)}</p>
                        <p className="text-[11px] text-muted-foreground">{c.count} {c.count === 1 ? 'order' : 'orders'}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Transactions */}
        <Card className="rounded-none">
          <CardHeader className="space-y-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Transactions</CardTitle>
              <span className="text-xs text-muted-foreground">{filtered.length} {filtered.length === 1 ? 'payment' : 'payments'}</span>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
                <Search className="h-3.5 w-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search by email or Stripe ID"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 rounded-none h-9 text-sm"
                />
              </div>
              <div className="inline-flex border border-border rounded-none overflow-hidden">
                {(['all', 'paid', 'refunded', 'unpaid', 'failed'] as const).map(s => (
                  <button
                    key={s}
                    onClick={() => setStatusFilter(s)}
                    className={`px-3 py-1.5 text-xs uppercase tracking-wider transition-colors ${
                      statusFilter === s ? 'bg-primary text-primary-foreground' : 'bg-background hover:bg-secondary'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs">Date</TableHead>
                    <TableHead className="text-xs">Customer</TableHead>
                    <TableHead className="text-xs">Amount</TableHead>
                    <TableHead className="text-xs">Status</TableHead>
                    <TableHead className="text-xs">Stripe PI</TableHead>
                    <TableHead className="text-xs w-10"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow><TableCell colSpan={6} className="text-center text-sm text-muted-foreground py-8">Loading…</TableCell></TableRow>
                  ) : pageRows.length === 0 ? (
                    <TableRow><TableCell colSpan={6} className="text-center text-sm text-muted-foreground py-8">No transactions</TableCell></TableRow>
                  ) : pageRows.map(o => {
                    const name = [o.customer_first_name, o.customer_last_name].filter(Boolean).join(' ');
                    const pi = o.stripe_payment_intent_id;
                    return (
                      <TableRow key={o.id}>
                        <TableCell className="text-xs whitespace-nowrap">{format(new Date(o.created_at), 'MMM d, yyyy HH:mm')}</TableCell>
                        <TableCell>
                          <div className="text-sm">{name || '—'}</div>
                          <div className="text-xs text-muted-foreground">{o.customer_email}</div>
                        </TableCell>
                        <TableCell className="text-sm font-medium tabular-nums">{fmt(o.total_cents)}</TableCell>
                        <TableCell>{statusBadge(o.payment_status)}</TableCell>
                        <TableCell>
                          {pi ? (
                            <button
                              onClick={() => copy(pi)}
                              className="inline-flex items-center gap-1.5 text-xs font-mono text-muted-foreground hover:text-foreground"
                              title={pi}
                            >
                              {pi.slice(0, 14)}…
                              <Copy className="h-3 w-3" />
                            </button>
                          ) : <span className="text-xs text-muted-foreground">—</span>}
                        </TableCell>
                        <TableCell>
                          <Link to={`/ops-portal/orders/${o.id}`} className="inline-flex items-center text-xs text-primary hover:underline">
                            <ExternalLink className="h-3.5 w-3.5" />
                          </Link>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-4">
                <span className="text-xs text-muted-foreground">Page {page} of {totalPages}</span>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="rounded-none">Prev</Button>
                  <Button variant="outline" size="sm" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="rounded-none">Next</Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminFinancials;
