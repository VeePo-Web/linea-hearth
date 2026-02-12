import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import AdminLayout from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Package, Tags, TrendingUp, Eye, ShoppingBag, AlertTriangle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';

interface Stats {
  totalProducts: number;
  activeProducts: number;
  totalCategories: number;
  featuredProducts: number;
}

interface RecentOrder {
  id: string;
  customer_email: string;
  total_cents: number;
  payment_status: string;
  fulfillment_status: string | null;
  created_at: string;
}

interface LowStockVariant {
  id: string;
  size: string | null;
  color: string | null;
  stock_quantity: number;
  product: { name: string } | null;
}

const AdminDashboard = () => {
  const [stats, setStats] = useState<Stats>({ totalProducts: 0, activeProducts: 0, totalCategories: 0, featuredProducts: 0 });
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [lowStock, setLowStock] = useState<LowStockVariant[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const [productsRes, activeRes, categoriesRes, featuredRes, ordersRes, lowStockRes] = await Promise.all([
          supabase.from('products').select('id', { count: 'exact', head: true }),
          supabase.from('products').select('id', { count: 'exact', head: true }).eq('status', 'active'),
          supabase.from('categories').select('id', { count: 'exact', head: true }),
          supabase.from('products').select('id', { count: 'exact', head: true }).eq('is_featured', true),
          supabase.from('orders').select('id, customer_email, total_cents, payment_status, fulfillment_status, created_at').order('created_at', { ascending: false }).limit(5),
          supabase.from('product_variants').select('id, size, color, stock_quantity, product:products(name)').lt('stock_quantity', 5).order('stock_quantity', { ascending: true }).limit(10),
        ]);

        setStats({
          totalProducts: productsRes.count || 0,
          activeProducts: activeRes.count || 0,
          totalCategories: categoriesRes.count || 0,
          featuredProducts: featuredRes.count || 0,
        });
        setRecentOrders(ordersRes.data || []);
        setLowStock(lowStockRes.data || []);
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const statCards = [
    { title: 'Total Products', value: stats.totalProducts, icon: Package, description: 'All products' },
    { title: 'Active', value: stats.activeProducts, icon: Eye, description: 'Visible in store' },
    { title: 'Categories', value: stats.totalCategories, icon: Tags, description: 'Product categories' },
    { title: 'Featured', value: stats.featuredProducts, icon: TrendingUp, description: 'Featured items' },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-xl font-light tracking-wider text-foreground">Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">Operations overview</p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map((card) => {
            const Icon = card.icon;
            return (
              <Card key={card.title}>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{card.title}</CardTitle>
                  <Icon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-light">{loading ? '—' : card.value}</div>
                  <p className="text-xs text-muted-foreground mt-1">{card.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Orders */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Recent Orders</CardTitle>
              <Link to="/ops-portal/orders" className="text-xs text-primary hover:underline">View all</Link>
            </CardHeader>
            <CardContent>
              {recentOrders.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">No orders yet</p>
              ) : (
                <div className="space-y-3">
                  {recentOrders.map((order) => (
                    <Link
                      key={order.id}
                      to={`/ops-portal/orders/${order.id}`}
                      className="flex items-center justify-between py-2 hover:bg-secondary/30 rounded px-2 -mx-2 transition-colors"
                    >
                      <div>
                        <p className="text-sm">{order.customer_email}</p>
                        <p className="text-xs text-muted-foreground">{format(new Date(order.created_at), 'MMM d')}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">${(order.total_cents / 100).toFixed(2)}</p>
                        <Badge variant={order.payment_status === 'paid' ? 'default' : 'secondary'} className="text-[10px]">
                          {order.payment_status}
                        </Badge>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Low Stock Alerts */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                <AlertTriangle className="h-3.5 w-3.5 inline mr-2 text-amber-500" />
                Low Stock
              </CardTitle>
            </CardHeader>
            <CardContent>
              {lowStock.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">All stock levels healthy</p>
              ) : (
                <div className="space-y-2">
                  {lowStock.map((v) => (
                    <div key={v.id} className="flex items-center justify-between py-1.5 text-sm">
                      <div>
                        <span className="font-medium">{v.product?.name || 'Unknown'}</span>
                        <span className="text-muted-foreground ml-2">
                          {[v.size, v.color].filter(Boolean).join(' / ') || 'Default'}
                        </span>
                      </div>
                      <Badge variant={v.stock_quantity === 0 ? 'destructive' : 'secondary'} className="text-xs">
                        {v.stock_quantity} left
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link to="/ops-portal/products/new" className="block p-3 rounded-md bg-secondary hover:bg-secondary/80 transition-colors">
                <div className="text-sm font-medium">Add New Product</div>
                <div className="text-xs text-muted-foreground mt-1">Create product with variants and images</div>
              </Link>
              <Link to="/ops-portal/categories" className="block p-3 rounded-md bg-secondary hover:bg-secondary/80 transition-colors">
                <div className="text-sm font-medium">Manage Categories</div>
                <div className="text-xs text-muted-foreground mt-1">Organize your product catalog</div>
              </Link>
              <Link to="/ops-portal/orders" className="block p-3 rounded-md bg-secondary hover:bg-secondary/80 transition-colors">
                <div className="text-sm font-medium flex items-center gap-2">
                  <ShoppingBag className="h-4 w-4" />
                  View Orders
                </div>
                <div className="text-xs text-muted-foreground mt-1">Track and fulfill customer orders</div>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
