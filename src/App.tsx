import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation, Navigate } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { lazy, Suspense } from "react";
import { AuthProvider } from "@/hooks/useAuth";
import { CartProvider } from "@/hooks/useCart";
import { SizeQuizProvider } from "@/contexts/SizeQuizContext";
import { RecentlyViewedProvider } from "@/contexts/RecentlyViewedContext";
import { StickyCtaProvider } from "@/contexts/StickyCtaContext";
import { PaymentTestModeBanner } from "@/components/PaymentTestModeBanner";

import { migrateLocalStorage } from "@/lib/storageMigration";

// Run localStorage migration on app load (before React renders)
migrateLocalStorage();
import ScrollToTop from "./components/ScrollToTop";
import PageTransition from "./components/motion/PageTransition";
import ProtectedRoute from "./components/admin/ProtectedRoute";
import OpsPortalGate from "./components/admin/OpsPortalGate";
import ProtectedAccountRoute from "./components/account/ProtectedAccountRoute";

// Lazy-loaded pages — each becomes its own chunk
// Wrap dynamic import() so that "Importing a module script failed" errors
// (caused by stale chunk filenames after a redeploy) trigger a one-time
// hard reload instead of a blank screen.
const RELOAD_KEY = "loj:chunk-reload";
function lazyWithRetry<T extends { default: React.ComponentType<any> }>(
  factory: () => Promise<T>
) {
  return lazy(() =>
    factory().catch((err) => {
      const msg = String(err?.message ?? err);
      const isChunkError =
        /Importing a module script failed|Failed to fetch dynamically imported module|Loading chunk|ChunkLoadError/i.test(
          msg
        );
      if (isChunkError && typeof window !== "undefined") {
        const already = sessionStorage.getItem(RELOAD_KEY);
        if (!already) {
          sessionStorage.setItem(RELOAD_KEY, "1");
          window.location.reload();
          // Return a never-resolving promise while the reload happens
          return new Promise<T>(() => {});
        }
      }
      throw err;
    })
  );
}

const LandingPage = lazyWithRetry(() => import("./pages/LandingPage"));
const Index = lazyWithRetry(() => import("./pages/Index"));
const Category = lazyWithRetry(() => import("./pages/Category"));
const ProductDetail = lazyWithRetry(() => import("./pages/ProductDetail"));
const Checkout = lazyWithRetry(() => import("./pages/Checkout"));
const CheckoutSuccess = lazyWithRetry(() => import("./pages/CheckoutSuccess"));
const NotFound = lazyWithRetry(() => import("./pages/NotFound"));
const OurStory = lazyWithRetry(() => import("./pages/about/OurStory"));
const OurMission = lazyWithRetry(() => import("./pages/about/OurMission"));
const SizeGuide = lazyWithRetry(() => import("./pages/about/SizeGuide"));
const Contact = lazyWithRetry(() => import("./pages/Contact"));
const PrivacyPolicy = lazyWithRetry(() => import("./pages/PrivacyPolicy"));
const TermsOfService = lazyWithRetry(() => import("./pages/TermsOfService"));
const Community = lazyWithRetry(() => import("./pages/Community"));
const FAQ = lazyWithRetry(() => import("./pages/FAQ"));
const ReturnsExchanges = lazyWithRetry(() => import("./pages/ReturnsExchanges"));
const ShippingInfo = lazyWithRetry(() => import("./pages/ShippingInfo"));
const Accessibility = lazyWithRetry(() => import("./pages/Accessibility"));
const Lookbook = lazyWithRetry(() => import("./pages/Lookbook"));
const TryOnRoom = lazyWithRetry(() => import("./pages/TryOnRoom"));
const Ambassador = lazyWithRetry(() => import("./pages/Ambassador"));
const RecoverCart = lazyWithRetry(() => import("./pages/RecoverCart"));
const ResetPassword = lazyWithRetry(() => import("./pages/ResetPassword"));
const AdminLogin = lazyWithRetry(() => import("./pages/admin/AdminLogin"));
const AdminDashboard = lazyWithRetry(() => import("./pages/admin/AdminDashboard"));
const AdminProducts = lazyWithRetry(() => import("./pages/admin/AdminProducts"));
const AdminProductForm = lazyWithRetry(() => import("./pages/admin/AdminProductForm"));
const AdminOrders = lazyWithRetry(() => import("./pages/admin/AdminOrders"));
const AdminOrderDetail = lazyWithRetry(() => import("./pages/admin/AdminOrderDetail"));
const AdminCategories = lazyWithRetry(() => import("./pages/admin/AdminCategories"));
const AdminDiscounts = lazyWithRetry(() => import("./pages/admin/AdminDiscounts"));
const Catalogue = lazyWithRetry(() => import("./pages/Catalogue"));
const AdminLookbook = lazyWithRetry(() => import("./pages/admin/AdminLookbook"));
const AdminLookbookForm = lazyWithRetry(() => import("./pages/admin/AdminLookbookForm"));
const AccountLayout = lazyWithRetry(() => import("./pages/account/AccountLayout"));
const AccountDashboard = lazyWithRetry(() => import("./pages/account/AccountDashboard"));
const AccountOrders = lazyWithRetry(() => import("./pages/account/AccountOrders"));
const AccountOrderDetail = lazyWithRetry(() => import("./pages/account/AccountOrderDetail"));
const AccountProfile = lazyWithRetry(() => import("./pages/account/AccountProfile"));
const AccountAddresses = lazyWithRetry(() => import("./pages/account/AccountAddresses"));
const AccountFavorites = lazyWithRetry(() => import("./pages/account/AccountFavorites"));
const WornInTheWildGallery = lazyWithRetry(() => import("./pages/WornInTheWildGallery"));
const WornInTheWildUpload = lazyWithRetry(() => import("./pages/WornInTheWildUpload"));
const AdminWornInTheWild = lazyWithRetry(() => import("./pages/admin/AdminWornInTheWild"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

// Animated Routes component that uses location for AnimatePresence
const AnimatedRoutes = () => {
  const location = useLocation();
  
  return (
    <AnimatePresence mode="popLayout">
      <Suspense fallback={<div className="min-h-screen bg-background" />}>
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<PageTransition><LandingPage /></PageTransition>} />
        <Route path="/home" element={<PageTransition><Index /></PageTransition>} />
        <Route path="/category/:category" element={<PageTransition><Category /></PageTransition>} />
        <Route path="/product/:productId" element={<PageTransition><ProductDetail /></PageTransition>} />
        <Route path="/checkout" element={<PageTransition><Checkout /></PageTransition>} />
        <Route path="/checkout/success" element={<PageTransition><CheckoutSuccess /></PageTransition>} />
        <Route path="/about/our-story" element={<PageTransition><OurStory /></PageTransition>} />
        <Route path="/about/our-mission" element={<PageTransition><OurMission /></PageTransition>} />
        <Route path="/about/size-guide" element={<PageTransition><SizeGuide /></PageTransition>} />
        <Route path="/about/customer-care" element={<Navigate to="/contact" replace />} />
        <Route path="/contact" element={<PageTransition><Contact /></PageTransition>} />
        <Route path="/privacy-policy" element={<PageTransition><PrivacyPolicy /></PageTransition>} />
        <Route path="/terms-of-service" element={<PageTransition><TermsOfService /></PageTransition>} />
        <Route path="/faq" element={<PageTransition><FAQ /></PageTransition>} />
        <Route path="/returns" element={<PageTransition><ReturnsExchanges /></PageTransition>} />
        <Route path="/shipping" element={<PageTransition><ShippingInfo /></PageTransition>} />
        <Route path="/accessibility" element={<PageTransition><Accessibility /></PageTransition>} />
        <Route path="/catalogue" element={<PageTransition><Catalogue /></PageTransition>} />
        <Route path="/community" element={<PageTransition><Community /></PageTransition>} />
        <Route path="/lookbook" element={<PageTransition><Lookbook /></PageTransition>} />
        <Route path="/try-on" element={<PageTransition><TryOnRoom /></PageTransition>} />
        <Route path="/try-on/saved/:outfitId" element={<PageTransition><TryOnRoom /></PageTransition>} />
        <Route path="/ambassador" element={<PageTransition><Ambassador /></PageTransition>} />
        <Route path="/recover-cart" element={<PageTransition><RecoverCart /></PageTransition>} />
        <Route path="/reset-password" element={<PageTransition><ResetPassword /></PageTransition>} />
        <Route path="/worn-in-the-wild" element={<PageTransition><WornInTheWildGallery /></PageTransition>} />
        <Route path="/worn-in-the-wild/upload" element={<PageTransition><WornInTheWildUpload /></PageTransition>} />
        {/* Account Routes */}
        <Route path="/account" element={<ProtectedAccountRoute><PageTransition><AccountLayout /></PageTransition></ProtectedAccountRoute>}>
          <Route index element={<AccountDashboard />} />
          <Route path="orders" element={<AccountOrders />} />
          <Route path="orders/:orderId" element={<AccountOrderDetail />} />
          <Route path="favorites" element={<AccountFavorites />} />
          <Route path="profile" element={<AccountProfile />} />
          <Route path="addresses" element={<AccountAddresses />} />
        </Route>
        {/* Admin Routes — obscured path, gated by shared passphrase */}
        <Route path="/ops-portal/login" element={<OpsPortalGate><PageTransition><AdminLogin /></PageTransition></OpsPortalGate>} />
        <Route path="/ops-portal" element={<OpsPortalGate><ProtectedRoute requireAdmin><PageTransition><AdminDashboard /></PageTransition></ProtectedRoute></OpsPortalGate>} />
        <Route path="/ops-portal/products" element={<OpsPortalGate><ProtectedRoute requireAdmin><PageTransition><AdminProducts /></PageTransition></ProtectedRoute></OpsPortalGate>} />
        <Route path="/ops-portal/products/new" element={<OpsPortalGate><ProtectedRoute requireAdmin><PageTransition><AdminProductForm /></PageTransition></ProtectedRoute></OpsPortalGate>} />
        <Route path="/ops-portal/products/:productId/edit" element={<OpsPortalGate><ProtectedRoute requireAdmin><PageTransition><AdminProductForm /></PageTransition></ProtectedRoute></OpsPortalGate>} />
        <Route path="/ops-portal/categories" element={<OpsPortalGate><ProtectedRoute requireAdmin><PageTransition><AdminCategories /></PageTransition></ProtectedRoute></OpsPortalGate>} />
        <Route path="/ops-portal/discounts" element={<OpsPortalGate><ProtectedRoute requireAdmin><PageTransition><AdminDiscounts /></PageTransition></ProtectedRoute></OpsPortalGate>} />
        <Route path="/ops-portal/lookbook" element={<OpsPortalGate><ProtectedRoute requireAdmin><PageTransition><AdminLookbook /></PageTransition></ProtectedRoute></OpsPortalGate>} />
        <Route path="/ops-portal/lookbook/new" element={<OpsPortalGate><ProtectedRoute requireAdmin><PageTransition><AdminLookbookForm /></PageTransition></ProtectedRoute></OpsPortalGate>} />
        <Route path="/ops-portal/lookbook/:lookId/edit" element={<OpsPortalGate><ProtectedRoute requireAdmin><PageTransition><AdminLookbookForm /></PageTransition></ProtectedRoute></OpsPortalGate>} />
        <Route path="/ops-portal/orders" element={<OpsPortalGate><ProtectedRoute requireAdmin><PageTransition><AdminOrders /></PageTransition></ProtectedRoute></OpsPortalGate>} />
        <Route path="/ops-portal/orders/:orderId" element={<OpsPortalGate><ProtectedRoute requireAdmin><PageTransition><AdminOrderDetail /></PageTransition></ProtectedRoute></OpsPortalGate>} />
        <Route path="/ops-portal/worn-in-the-wild" element={<OpsPortalGate><ProtectedRoute requireAdmin><PageTransition><AdminWornInTheWild /></PageTransition></ProtectedRoute></OpsPortalGate>} />
        {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
        <Route path="*" element={<PageTransition><NotFound /></PageTransition>} />
      </Routes>
      </Suspense>
    </AnimatePresence>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <CartProvider>

        <StickyCtaProvider>
          <RecentlyViewedProvider>
            <SizeQuizProvider>
              <TooltipProvider>
                <PaymentTestModeBanner />
                <Toaster />
                <Sonner />
                <BrowserRouter>
                  <ScrollToTop />
                  <AnimatedRoutes />
                </BrowserRouter>
              </TooltipProvider>
            </SizeQuizProvider>
          </RecentlyViewedProvider>
        </StickyCtaProvider>
      </CartProvider>

    </AuthProvider>
  </QueryClientProvider>
);

export default App;
