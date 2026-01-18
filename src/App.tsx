import "@fontsource/poppins/400.css";
import "@fontsource/poppins/500.css";
import "@fontsource/poppins/600.css";
import "@fontsource/poppins/700.css";
import "@fontsource/nunito/400.css";
import "@fontsource/nunito/600.css";
import "@fontsource/nunito/700.css";
import "@fontsource/playfair-display/700.css";

import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";

// Pages
import Landing from "./pages/Landing";
import NotFound from "./pages/NotFound";

// Auth Pages
import GuardianAuth from "./pages/auth/GuardianAuth";
import SeniorAuth from "./pages/auth/SeniorAuth";

// Guardian Pages
import GuardianLayout from "./pages/guardian/GuardianLayout";
import GuardianHome from "./pages/guardian/GuardianHome";
import GuardianMedicines from "./pages/guardian/GuardianMedicines";
import GuardianJoy from "./pages/guardian/GuardianJoy";
import GuardianSettings from "./pages/guardian/GuardianSettings";
import GuardianOnboarding from "./pages/guardian/GuardianOnboarding";

// Senior Pages
import SeniorHome from "./pages/senior/SeniorHome";
import SeniorDawa from "./pages/senior/SeniorDawa";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Landing />} />
            
            {/* Auth Routes */}
            <Route path="/auth" element={<GuardianAuth />} />
            <Route path="/senior/auth" element={<SeniorAuth />} />
            
            {/* Guardian Routes */}
            <Route path="/guardian" element={<GuardianLayout />}>
              <Route index element={<GuardianHome />} />
              <Route path="medicines" element={<GuardianMedicines />} />
              <Route path="joy" element={<GuardianJoy />} />
              <Route path="vitals" element={<GuardianHome />} />
              <Route path="settings" element={<GuardianSettings />} />
            </Route>
            <Route path="/guardian/onboarding" element={<GuardianOnboarding />} />
            
            {/* Senior Routes */}
            <Route path="/app" element={<SeniorHome />} />
            <Route path="/senior/dawa" element={<SeniorDawa />} />
            <Route path="/senior/santosh" element={<SeniorHome />} />
            <Route path="/senior/madad" element={<SeniorHome />} />
            <Route path="/senior/parivaar" element={<SeniorHome />} />
            
            {/* Legacy redirects */}
            <Route path="/dawa" element={<Navigate to="/senior/dawa" replace />} />
            <Route path="/santosh" element={<Navigate to="/senior/santosh" replace />} />
            
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
