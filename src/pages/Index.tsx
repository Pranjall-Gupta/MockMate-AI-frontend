import Navigation from "@/components/Navigation";
import HeroSection from "@/components/HeroSection";
import FeatureGrid from "@/components/FeatureGrid";
import SocialProof from "@/components/SocialProof";
import DemoPreview from "@/components/DemoPreview";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <main className="min-h-screen bg-background">
      <Navigation />
      <HeroSection />
      <SocialProof />
      <FeatureGrid />
      <DemoPreview />
      <Footer />
    </main>
  );
};

export default Index;
