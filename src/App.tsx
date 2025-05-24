
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";

import Welcome from "./pages/Welcome";
import Index from "./pages/Index";
import Feeding from "./pages/Feeding";
import Diaper from "./pages/Diaper";
import Sleep from "./pages/Sleep";
import Health from "./pages/Health";
import Milestones from "./pages/Milestones";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
import Auth from "./pages/Auth";
import AddBaby from "./pages/AddBaby";
import Profile from "./pages/Profile";
import Insights from "./pages/Insights";
import ResetPassword from "./pages/ResetPassword";
import AdminManagement from "./pages/AdminManagement";
import { Loader } from "./components/ui/loader";
import { useEffect } from "react";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 30000,
    },
  },
});

// Protected route component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isLoading } = useAuth();
  
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader />
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/welcome" replace />;
  }
  
  return <>{children}</>;
};

// Admin route component
const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isLoading, isAdmin } = useAuth();
  
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader />
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/welcome" replace />;
  }
  
  if (!isAdmin()) {
    return <Navigate to="/" replace />;
  }
  
  return <>{children}</>;
};

// Set document title component
const AppTitleManager = () => {
  useEffect(() => {
    document.title = "BabyCare Daily";
  }, []);
  
  return null;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <ThemeProvider>
        <LanguageProvider defaultLanguage="sw">
          <AuthProvider>
            <AppTitleManager />
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route path="/welcome" element={<Welcome />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="/" element={<ProtectedRoute><Index /></ProtectedRoute>} />
                <Route path="/add-baby" element={<ProtectedRoute><AddBaby /></ProtectedRoute>} />
                <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                <Route path="/feeding" element={<ProtectedRoute><Feeding /></ProtectedRoute>} />
                <Route path="/diaper" element={<ProtectedRoute><Diaper /></ProtectedRoute>} />
                <Route path="/sleep" element={<ProtectedRoute><Sleep /></ProtectedRoute>} />
                <Route path="/health" element={<ProtectedRoute><Health /></ProtectedRoute>} />
                <Route path="/milestones" element={<ProtectedRoute><Milestones /></ProtectedRoute>} />
                <Route path="/insights" element={<ProtectedRoute><Insights /></ProtectedRoute>} />
                <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
                <Route path="/admin" element={<AdminRoute><AdminManagement /></AdminRoute>} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </AuthProvider>
        </LanguageProvider>
      </ThemeProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
