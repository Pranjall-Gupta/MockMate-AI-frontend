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
import CodeArena from "./pages/CodeArena";
import Settings from "./pages/Settings";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            
            {/* Protected Technical Arenas */}
            <Route path="/resume" element={<ProtectedRoute><ResumeRoaster /></ProtectedRoute>} />
            <Route path="/interview" element={<ProtectedRoute><Interview /></ProtectedRoute>} />
            <Route path="/system-design" element={<ProtectedRoute><SystemDesignPage /></ProtectedRoute>} />
            <Route path="/scenarios" element={<ProtectedRoute><ScenarioChallenge /></ProtectedRoute>} />
            <Route path="/sql-detective" element={<ProtectedRoute><SQLDetective /></ProtectedRoute>} />
            <Route path="/code-arena" element={<ProtectedRoute><CodeArena /></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
            
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
