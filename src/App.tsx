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
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { PinAuthProvider } from "@/contexts/PinAuthContext";

// Pages
import Landing from "./pages/Landing";
import PinAuth from "./pages/PinAuth";
import SeniorApp from "./pages/SeniorApp";
import Dawa from "./pages/Dawa";
import Santosh from "./pages/Santosh";
import Madad from "./pages/Madad";
import Parivaar from "./pages/Parivaar";
import NotFound from "./pages/NotFound";

// Guardian Pages
import GuardianLayout from "./pages/guardian/GuardianLayout";
import GuardianHome from "./pages/guardian/GuardianHome";
import GuardianMedicines from "./pages/guardian/GuardianMedicines";
import GuardianJoy from "./pages/guardian/GuardianJoy";
import GuardianSettings from "./pages/guardian/GuardianSettings";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <PinAuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Landing />} />
            <Route path="/auth" element={<PinAuth />} />
            
            {/* Senior PWA Routes */}
            <Route path="/app" element={<SeniorApp />} />
            <Route path="/dawa" element={<Dawa />} />
            <Route path="/santosh" element={<Santosh />} />
            <Route path="/madad" element={<Madad />} />
            <Route path="/parivaar" element={<Parivaar />} />
            
            {/* Guardian Dashboard Routes */}
            <Route path="/guardian" element={<GuardianLayout />}>
              <Route index element={<GuardianHome />} />
              <Route path="medicines" element={<GuardianMedicines />} />
              <Route path="joy" element={<GuardianJoy />} />
              <Route path="vitals" element={<GuardianHome />} />
              <Route path="settings" element={<GuardianSettings />} />
            </Route>
            
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </PinAuthProvider>
  </QueryClientProvider>
);

export default App;
