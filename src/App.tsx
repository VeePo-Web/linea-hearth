import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation, Navigate } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { AuthProvider } from "@/hooks/useAuth";
import { CartProvider } from "@/hooks/useCart";
import ScrollToTop from "./components/ScrollToTop";
import PageTransition from "./components/motion/PageTransition";
import Index from "./pages/Index";
import Category from "./pages/Category";
import ProductDetail from "./pages/ProductDetail";
import Checkout from "./pages/Checkout";
import CheckoutSuccess from "./pages/CheckoutSuccess";
import NotFound from "./pages/NotFound";
import OurStory from "./pages/about/OurStory";
import OurMission from "./pages/about/OurMission";
import SizeGuide from "./pages/about/SizeGuide";
import Contact from "./pages/Contact";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";
import Community from "./pages/Community";
import FAQ from "./pages/FAQ";
import ReturnsExchanges from "./pages/ReturnsExchanges";
import ShippingInfo from "./pages/ShippingInfo";
import Accessibility from "./pages/Accessibility";
import Lookbook from "./pages/Lookbook";
import TryOnRoom from "./pages/TryOnRoom";
import Ambassador from "./pages/Ambassador";
import RecoverCart from "./pages/RecoverCart";
import ResetPassword from "./pages/ResetPassword";
import AdminLogin from "./pages/admin/AdminLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminProducts from "./pages/admin/AdminProducts";
import AdminCategories from "./pages/admin/AdminCategories";
import ProtectedRoute from "./components/admin/ProtectedRoute";
import AccountLayout from "./pages/account/AccountLayout";
import AccountDashboard from "./pages/account/AccountDashboard";
import AccountOrders from "./pages/account/AccountOrders";
import AccountOrderDetail from "./pages/account/AccountOrderDetail";
import AccountProfile from "./pages/account/AccountProfile";
import AccountAddresses from "./pages/account/AccountAddresses";
import AccountFavorites from "./pages/account/AccountFavorites";
import ProtectedAccountRoute from "./components/account/ProtectedAccountRoute";

const queryClient = new QueryClient();

// Animated Routes component that uses location for AnimatePresence
const AnimatedRoutes = () => {
  const location = useLocation();
  
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<PageTransition><Index /></PageTransition>} />
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
        <Route path="/community" element={<PageTransition><Community /></PageTransition>} />
        <Route path="/lookbook" element={<PageTransition><Lookbook /></PageTransition>} />
        <Route path="/try-on" element={<PageTransition><TryOnRoom /></PageTransition>} />
        <Route path="/try-on/saved/:outfitId" element={<PageTransition><TryOnRoom /></PageTransition>} />
        <Route path="/ambassador" element={<PageTransition><Ambassador /></PageTransition>} />
        <Route path="/recover-cart" element={<PageTransition><RecoverCart /></PageTransition>} />
        <Route path="/reset-password" element={<PageTransition><ResetPassword /></PageTransition>} />
        {/* Account Routes */}
        <Route path="/account" element={<ProtectedAccountRoute><PageTransition><AccountLayout /></PageTransition></ProtectedAccountRoute>}>
          <Route index element={<AccountDashboard />} />
          <Route path="orders" element={<AccountOrders />} />
          <Route path="orders/:orderId" element={<AccountOrderDetail />} />
          <Route path="favorites" element={<AccountFavorites />} />
          <Route path="profile" element={<AccountProfile />} />
          <Route path="addresses" element={<AccountAddresses />} />
        </Route>
        {/* Admin Routes */}
        <Route path="/admin/login" element={<PageTransition><AdminLogin /></PageTransition>} />
        <Route path="/admin" element={<ProtectedRoute requireAdmin><PageTransition><AdminDashboard /></PageTransition></ProtectedRoute>} />
        <Route path="/admin/products" element={<ProtectedRoute requireAdmin><PageTransition><AdminProducts /></PageTransition></ProtectedRoute>} />
        <Route path="/admin/categories" element={<ProtectedRoute requireAdmin><PageTransition><AdminCategories /></PageTransition></ProtectedRoute>} />
        {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
        <Route path="*" element={<PageTransition><NotFound /></PageTransition>} />
      </Routes>
    </AnimatePresence>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <CartProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <ScrollToTop />
            <AnimatedRoutes />
          </BrowserRouter>
        </TooltipProvider>
      </CartProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
