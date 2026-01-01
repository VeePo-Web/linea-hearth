import Header from "@/components/header/Header";
import Footer from "@/components/footer/Footer";

interface LayoutProps {
  children: React.ReactNode;
  showFooter?: boolean;
  className?: string;
}

/**
 * Main layout wrapper that handles header offset and consistent page structure.
 * Use this component for all pages to ensure content isn't hidden behind the fixed header.
 */
const Layout = ({ children, showFooter = true, className = "" }: LayoutProps) => {
  return (
    <div className={`min-h-screen bg-background ${className}`}>
      <Header />
      
      {/* Main content with header offset */}
      <main className="pt-[var(--header-height)]">
        {children}
      </main>
      
      {showFooter && <Footer />}
    </div>
  );
};

export default Layout;
