
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import AuthPage from "./pages/Auth";
import { useSession } from "./hooks/useSession";
import { Skeleton } from "@/components/ui/skeleton";
import CustomersPage from "./pages/Customers";
import ServicesPage from "./pages/Services";
import BookingsPage from "./pages/Bookings";
import CampaignsPage from "./pages/Campaigns";
import StaffPage from "./pages/Staff";

const queryClient = new QueryClient();

const App = () => {
  const { session, loading } = useSession();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="space-y-4">
            <Skeleton className="h-12 w-12 rounded-full" />
            <Skeleton className="h-4 w-[250px]" />
            <Skeleton className="h-4 w-[200px]" />
        </div>
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={session ? <Index /> : <Navigate to="/auth" />} />
            <Route path="/bookings" element={session ? <BookingsPage /> : <Navigate to="/auth" />} />
            <Route path="/campaigns" element={session ? <CampaignsPage /> : <Navigate to="/auth" />} />
            <Route path="/customers" element={session ? <CustomersPage /> : <Navigate to="/auth" />} />
            <Route path="/services" element={session ? <ServicesPage /> : <Navigate to="/auth" />} />
            <Route path="/staff" element={session ? <StaffPage /> : <Navigate to="/auth" />} />
            <Route path="/auth" element={!session ? <AuthPage /> : <Navigate to="/" />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
