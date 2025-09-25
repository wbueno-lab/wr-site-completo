import { HeaderWrapper } from "@/components/HeaderWrapper";
import HeroSection from "@/components/HeroSection";
import { RealtimeComponents } from "@/components/RealtimeComponents";
import LoadingScreen from "@/components/LoadingScreen";
import { useFirstLogin } from "@/hooks/useFirstVisit";

const Index = () => {
  const { isFirstLogin, isLoading, markAsLoggedIn } = useFirstLogin();

  const handleLoadComplete = () => {
    markAsLoggedIn();
  };

  if (isLoading && isFirstLogin) {
    return <LoadingScreen onLoadComplete={handleLoadComplete} />;
  }

  return (
    <div className="min-h-screen animate-fade-in">
      <HeaderWrapper />
      <HeroSection />
      <RealtimeComponents />
    </div>
  );
};

export default Index;