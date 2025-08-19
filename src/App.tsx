import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { DataProvider } from "./contexts/DataContext";
import { LoginForm } from "./components/auth/LoginForm";
import { Navbar } from "./components/layout/Navbar";
import { CustomerDashboard } from "./pages/CustomerDashboard";
import { DriverDashboard } from "./pages/DriverDashboard";
import { HotelDashboard } from "./pages/HotelDashboard";
import { AdminDashboard } from "./pages/AdminDashboard";
import Index from "./pages/Index";
import Destinations from "./pages/Destinations";
import NotFound from "./pages/NotFound";
import TripPage from "./pages/TripPage";

const queryClient = new QueryClient();

const AppContent = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
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
        <Route path="/login" element={<LoginForm onToggleMode={() => {}} />} />
        <Route path="/signup" element={<LoginForm onToggleMode={() => {}} />} />
        <Route path="/trip" element={<TripPage />} />
        
        {/* Protected routes */}
        {user && (
          <>
            <Route path="/dashboard" element={getDashboard()} />
            <Route path="/customer" element={<CustomerDashboard />} />
            <Route path="/driver" element={<DriverDashboard />} />
            <Route path="/hotel" element={<HotelDashboard />} />
            <Route path="/admin" element={<AdminDashboard />} />
          </>
        )}
        
        {/* Fallback */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  );

  function getDashboard() {
    if (!user) return <Index />;
    
    switch (user.role) {
      case 'customer':
        return <CustomerDashboard />;
      case 'driver':
        return <DriverDashboard />;
      case 'hotel':
        return <HotelDashboard />;
      case 'admin':
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
