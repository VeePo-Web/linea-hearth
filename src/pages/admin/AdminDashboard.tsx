import { useEffect, useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Package, Tags, TrendingUp, Eye } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface Stats {
  totalProducts: number;
  activeProducts: number;
  totalCategories: number;
  featuredProducts: number;
}

const AdminDashboard = () => {
  const [stats, setStats] = useState<Stats>({
    totalProducts: 0,
    activeProducts: 0,
    totalCategories: 0,
    featuredProducts: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [productsResult, activeResult, categoriesResult, featuredResult] = await Promise.all([
          supabase.from('products').select('id', { count: 'exact', head: true }),
          supabase.from('products').select('id', { count: 'exact', head: true }).eq('status', 'active'),
          supabase.from('categories').select('id', { count: 'exact', head: true }),
          supabase.from('products').select('id', { count: 'exact', head: true }).eq('is_featured', true),
        ]);

        setStats({
          totalProducts: productsResult.count || 0,
          activeProducts: activeResult.count || 0,
          totalCategories: categoriesResult.count || 0,
          featuredProducts: featuredResult.count || 0,
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const statCards = [
    {
      title: 'Total Products',
      value: stats.totalProducts,
      icon: Package,
      description: 'All products in catalog',
    },
    {
      title: 'Active Products',
      value: stats.activeProducts,
      icon: Eye,
      description: 'Visible in store',
    },
    {
      title: 'Categories',
      value: stats.totalCategories,
      icon: Tags,
      description: 'Product categories',
    },
    {
      title: 'Featured',
      value: stats.featuredProducts,
      icon: TrendingUp,
      description: 'Featured products',
    },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-xl font-light tracking-wider text-foreground">Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Overview of your store
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map((card) => {
            const Icon = card.icon;
            return (
              <Card key={card.title}>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    {card.title}
                  </CardTitle>
                  <Icon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-light">
                    {loading ? '—' : card.value}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {card.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium uppercase tracking-wider">
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <a
                href="/admin/products/new"
                className="block p-3 rounded-md bg-secondary hover:bg-secondary/80 transition-colors"
              >
                <div className="text-sm font-medium">Add New Product</div>
                <div className="text-xs text-muted-foreground mt-1">
                  Create a new product with variants and images
                </div>
              </a>
              <a
                href="/admin/categories"
                className="block p-3 rounded-md bg-secondary hover:bg-secondary/80 transition-colors"
              >
                <div className="text-sm font-medium">Manage Categories</div>
                <div className="text-xs text-muted-foreground mt-1">
                  Organize your products into categories
                </div>
              </a>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium uppercase tracking-wider">
                Getting Started
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <p>
                Welcome to your admin dashboard! Here's how to get started:
              </p>
              <ol className="list-decimal list-inside space-y-2">
                <li>Create your product categories</li>
                <li>Add products with descriptions and pricing</li>
                <li>Upload product images (6+ per product)</li>
                <li>Set up variants (sizes, colors, styles)</li>
                <li>Mark products as featured or on sale</li>
              </ol>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
