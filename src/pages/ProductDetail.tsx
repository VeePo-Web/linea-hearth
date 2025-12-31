import { useParams } from "react-router-dom";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Header from "../components/header/Header";
import Footer from "../components/footer/Footer";
import ProductImageGallery from "../components/product/ProductImageGallery";
import ProductInfo from "../components/product/ProductInfo";
import HowItMinisters from "../components/product/HowItMinisters";
import FitFabricSection from "../components/product/FitFabricSection";
import ProductReviews from "../components/product/ProductReviews";
import StyledByTribe from "../components/product/StyledByTribe";
import WearWithSection from "../components/product/WearWithSection";
import GuaranteeBadge from "../components/product/GuaranteeBadge";
import MobileStickyATC from "../components/product/MobileStickyATC";
import ProductCarousel from "../components/content/ProductCarousel";
import { 
  Breadcrumb, 
  BreadcrumbItem, 
  BreadcrumbLink, 
  BreadcrumbList, 
  BreadcrumbPage, 
  BreadcrumbSeparator 
} from "@/components/ui/breadcrumb";
import { useState } from "react";

const ProductDetail = () => {
  const { productId } = useParams();
  const [selectedColor, setSelectedColor] = useState<string | null>(null);

  const { data: product, isLoading } = useQuery({
    queryKey: ["product", productId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select(`
          *,
          categories:category_id(name, slug),
          product_images(id, image_url, alt_text, is_primary, display_order),
          product_variants(id, size, color, stock_quantity, price_adjustment)
        `)
        .eq("slug", productId!)
        .eq("status", "active")
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!productId,
  });

  // Calculate price for mobile sticky
  const displayPrice = product?.is_on_sale && product?.sale_price 
    ? product.sale_price 
    : product?.price || 0;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-6 px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="aspect-[3/4] bg-muted animate-pulse" />
            <div className="space-y-6">
              <div className="h-4 bg-muted rounded w-24 animate-pulse" />
              <div className="h-8 bg-muted rounded w-64 animate-pulse" />
              <div className="h-6 bg-muted rounded w-32 animate-pulse" />
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Fallback for no product found
  if (!product) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-24 px-6 text-center">
          <h1 className="text-2xl font-light text-foreground mb-4">Product Not Found</h1>
          <p className="text-sm font-light text-muted-foreground mb-8">
            The product you're looking for doesn't exist or has been removed.
          </p>
          <Link 
            to="/category/all" 
            className="text-sm font-light text-foreground underline underline-offset-4"
          >
            Browse All Products
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-6">
        <section className="w-full px-6">
          {/* Breadcrumb - Show above image on smaller screens */}
          <div className="lg:hidden mb-6">
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link to="/" className="text-xs font-light">Home</Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link 
                      to={`/category/${product.categories?.slug || 'all'}`}
                      className="text-xs font-light"
                    >
                      {product.categories?.name || 'Shop'}
                    </Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage className="text-xs font-light">{product.name}</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 lg:gap-12">
            <ProductImageGallery 
              images={product.product_images}
              selectedColor={selectedColor}
            />
            
            <div className="lg:pl-0 mt-8 lg:mt-0 lg:sticky lg:top-6 lg:h-fit">
              <ProductInfo 
                product={{
                  ...product,
                  categories: product.categories as { name: string; slug: string } | undefined,
                  common_questions: product.common_questions as { question: string; answer: string }[] | null,
                }}
                variants={product.product_variants}
                onColorChange={setSelectedColor}
              />
            </div>
          </div>
        </section>

        {/* How It Ministers - Faith-based storytelling */}
        <HowItMinisters 
          ministryStatement={product.ministry_statement}
          productName={product.name}
        />

        {/* Fit & Fabric Breakdown */}
        <FitFabricSection
          fitType={product.fit_type}
          fabricComposition={product.fabric_composition}
          weightGsm={product.weight_gsm}
          careInstructions={product.care_instructions}
          modelInfo={product.model_info}
        />

        {/* Customer Reviews */}
        <ProductReviews productId={product.id} />

        {/* Styled By The Tribe - UGC */}
        <StyledByTribe productId={product.id} />

        {/* Complete The Look - Cross-sells */}
        <WearWithSection 
          currentProductId={product.id}
          categoryId={product.category_id}
        />

        {/* Guarantee Badge */}
        <GuaranteeBadge />
        
        {/* You might also like */}
        <section className="w-full mt-8 lg:mt-16">
          <div className="mb-4 px-6">
            <h2 className="text-xs font-light text-muted-foreground uppercase tracking-[0.2em]">
              You Might Also Like
            </h2>
          </div>
          <ProductCarousel />
        </section>
      </main>

      {/* Mobile Sticky Add-to-Cart */}
      <MobileStickyATC
        price={product.price}
        salePrice={product.sale_price}
        quantity={1}
        onAddToBag={() => {
          // Add to bag logic
        }}
        disabled={false}
      />
      
      <Footer />
    </div>
  );
};

export default ProductDetail;
