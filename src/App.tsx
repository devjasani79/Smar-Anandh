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
import { AuthProvider } from "@/hooks/useAuth";

// Pages
import Darshani from "./pages/Darshani";
import Dawa from "./pages/Dawa";
import Santosh from "./pages/Santosh";
import Madad from "./pages/Madad";
import Parivaar from "./pages/Parivaar";
import Auth from "./pages/Auth";
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
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Senior PWA Routes */}
            <Route path="/" element={<Darshani />} />
            <Route path="/dawa" element={<Dawa />} />
            <Route path="/santosh" element={<Santosh />} />
            <Route path="/madad" element={<Madad />} />
            <Route path="/parivaar" element={<Parivaar />} />
            <Route path="/auth" element={<Auth />} />
            
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
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
