import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index"; //home page
import NotFound from "./pages/NotFound";
import Interview from "./pages/Interview"; //chat page
import SystemDesignPage from "./pages/SystemDesignPage";
import ScenarioChallenge from "./pages/ScenarioChallenge";
import ResumeRoaster from "./pages/ResumeRoaster";
import SQLDetective from "./pages/SQLDetective";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/resume" element={<ResumeRoaster />} />
          <Route path="/" element={<Index />} />
          <Route path="/interview" element={<Interview />} />
          <Route path="/system-design" element={<SystemDesignPage />} />
          <Route path="/scenarios" element={<ScenarioChallenge />} />
          <Route path="/sql-detective" element={<SQLDetective />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
