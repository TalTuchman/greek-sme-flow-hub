
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useSession } from "@/hooks/useSession";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import LandingPage from "./pages/LandingPage";
import NotFound from "./pages/NotFound";
import Customers from "./pages/Customers";
import Services from "./pages/Services";
import Staff from "./pages/Staff";
import Bookings from "./pages/Bookings";
import Campaigns from "./pages/Campaigns";
import CampaignMessagesPage from "./pages/CampaignMessagesPage";

const queryClient = new QueryClient();

const App = () => {
  const { isAuthenticated, isLoading } = useSession();

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {isLoading ? (
              <Route path="*" element={<div>Loading...</div>} />
            ) : isAuthenticated ? (
              <>
                <Route path="/" element={<Index />} />
                <Route path="/customers" element={<Customers />} />
                <Route path="/services" element={<Services />} />
                <Route path="/staff" element={<Staff />} />
                <Route path="/bookings" element={<Bookings />} />
                <Route path="/campaigns" element={<Campaigns />} />
                <Route path="/campaign-messages" element={<CampaignMessagesPage />} />
                <Route path="*" element={<NotFound />} />
              </>
            ) : (
              <>
                <Route path="/" element={<LandingPage />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="*" element={<Auth />} />
              </>
            )}
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
