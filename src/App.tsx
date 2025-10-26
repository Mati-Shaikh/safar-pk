import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { DataProvider } from "./contexts/DataContext";
import { Navbar } from "./components/layout/Navbar";
import Index from "./pages/Index";
import Destinations from "./pages/Destinations";
import NotFound from "./pages/NotFound";
import TripPage from "./pages/TripPage";
import Map from "./pages/MapManager";
import { DriverDashboard } from "./pages/DriverDashboard";
import { HotelDashboard } from "./pages/HotelDashboard";
import { AdminDashboard } from "./pages/AdminDashboard";
import { ComingSoon } from "./pages/ComingSoon";
import { UserRole } from "./lib/supabase";

const queryClient = new QueryClient();

const AppContent = () => {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-800 mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Index />} />
        <Route path="/destinations" element={<Destinations />} />
        <Route path="/trip" element={<TripPage />} />
        <Route path="/map" element={<Map />} />

        {/* Protected routes - Add these later when you create dashboard components */}
        {user && profile && (
          <>
            <Route path="/dashboard" element={getDashboard()} />
          </>
        )}

        {/* Fallback */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  );

  function getDashboard() {
    if (!user || !profile) return <Index />;

    switch (profile.role) {
      case UserRole.CUSTOMER:
        return <ComingSoon />;
      case UserRole.DRIVER:
        return <DriverDashboard />;
      case UserRole.HOTEL_OWNER:
        return <HotelDashboard />;
      case UserRole.ADMIN:
        return <AdminDashboard />;
      default:
        return <NotFound />;
    }
  }
};

const App = () => (
  <BrowserRouter>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <AuthProvider>
          <DataProvider>
            <AppContent />
          </DataProvider>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  </BrowserRouter>
);

export default App;
