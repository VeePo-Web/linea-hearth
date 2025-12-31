import { useState } from "react";
import Header from "@/components/header/Header";
import Footer from "@/components/footer/Footer";
import CommunityHero from "@/components/community/CommunityHero";
import StoryFilters from "@/components/community/StoryFilters";
import StoryGrid from "@/components/community/StoryGrid";
import SocialFeed from "@/components/community/SocialFeed";
import SubmitStoryCTA from "@/components/community/SubmitStoryCTA";

export default function Community() {
  const [selectedProduct, setSelectedProduct] = useState("all");
  const [selectedType, setSelectedType] = useState("all");
  const [selectedGender, setSelectedGender] = useState("all");
  const [sortBy, setSortBy] = useState("recent");

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main>
        <CommunityHero />
        
        <StoryFilters
          selectedProduct={selectedProduct}
          setSelectedProduct={setSelectedProduct}
          selectedType={selectedType}
          setSelectedType={setSelectedType}
          selectedGender={selectedGender}
          setSelectedGender={setSelectedGender}
          sortBy={sortBy}
          setSortBy={setSortBy}
        />
        
        <StoryGrid
          selectedProduct={selectedProduct}
          selectedType={selectedType}
          selectedGender={selectedGender}
          sortBy={sortBy}
        />
        
        <SocialFeed />
        
        <SubmitStoryCTA />
      </main>
      
      <Footer />
    </div>
  );
}
