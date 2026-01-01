import { ReactNode } from "react";
import Header from "@/components/header/Header";
import Footer from "@/components/footer/Footer";
import LegalSidebar from "./LegalSidebar";

interface LegalPageLayoutProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
  lastUpdated?: string;
  showSidebar?: boolean;
}

const LegalPageLayout = ({ 
  children, 
  title, 
  subtitle,
  lastUpdated,
  showSidebar = true 
}: LegalPageLayoutProps) => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <section className="bg-stone-900 text-white pt-32 pb-16 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="max-w-3xl">
            {lastUpdated && (
              <span className="inline-block text-xs font-medium tracking-widest text-amber-500 mb-4">
                LAST UPDATED: {lastUpdated.toUpperCase()}
              </span>
            )}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-light tracking-tight mb-4">
              {title}
            </h1>
            {subtitle && (
              <p className="text-lg text-white/70 font-light leading-relaxed">
                {subtitle}
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-6 py-16">
        {showSidebar ? (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
            <aside className="lg:col-span-1">
              <LegalSidebar />
            </aside>
            <div className="lg:col-span-3">
              {children}
            </div>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto">
            {children}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default LegalPageLayout;
