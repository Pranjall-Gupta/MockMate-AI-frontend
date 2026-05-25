import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import Navigation from "@/components/Navigation";
import HeroSection from "@/components/HeroSection";
import FeatureGrid from "@/components/FeatureGrid";
import SocialProof from "@/components/SocialProof";
import DemoPreview from "@/components/DemoPreview";
import Footer from "@/components/Footer";

const Index = () => {
  const { login } = useAuth();
  const location = useLocation();
  
  // Lifted States
  const [isRoadmapOpen, setIsRoadmapOpen] = useState(false);
  const [isFeaturesOpen, setIsFeaturesOpen] = useState(false);
  const [isSystemOpen, setIsSystemOpen] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get("action") === "login") {
      // Small timeout to allow everything to settle
      setTimeout(() => {
        login();
      }, 300);
    }
  }, [location, login]);

  return (
    <main className="min-h-screen bg-background">
      {/* Pass setters to Navigation */}
      <Navigation 
        onRoadmapClick={() => setIsRoadmapOpen(true)}
        onFeaturesClick={() => setIsFeaturesOpen(true)}
      />
      
      <HeroSection />
      <SocialProof />
      <FeatureGrid />
      <DemoPreview />
      
      {/* Pass states and setters to Footer */}
      <Footer 
        roadmapState={{ isOpen: isRoadmapOpen, setIsOpen: setIsRoadmapOpen }}
        featuresState={{ isOpen: isFeaturesOpen, setIsOpen: setIsFeaturesOpen }}
        systemState={{ isOpen: isSystemOpen, setIsOpen: setIsSystemOpen }}
      />
    </main>
  );
};

export default Index;