
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import AddBaby from "./pages/AddBaby";
import Feeding from "./pages/Feeding";
import Diaper from "./pages/Diaper";
import Sleep from "./pages/Sleep";
import Health from "./pages/Health";
import Milestones from "./pages/Milestones";
import Insights from "./pages/Insights";
import Settings from "./pages/Settings";
import Profile from "./pages/Profile";
import Welcome from "./pages/Welcome";
import ResetPassword from "./pages/ResetPassword";
import AdminManagement from "./pages/AdminManagement";
import DoctorSearch from "./pages/DoctorSearch";
import DoctorDashboard from "./pages/DoctorDashboard";
import PatientsList from "./pages/PatientsList";
import ProfileManagement from "./pages/ProfileManagement";
import Feedback from "./pages/Feedback";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <LanguageProvider>
          <AuthProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <BrowserRouter>
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/auth" element={<Auth />} />
                  <Route path="/welcome" element={<Welcome />} />
                  <Route path="/reset-password" element={<ResetPassword />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/add-baby" element={<AddBaby />} />
                  <Route path="/feeding" element={<Feeding />} />
                  <Route path="/diaper" element={<Diaper />} />
                  <Route path="/sleep" element={<Sleep />} />
                  <Route path="/health" element={<Health />} />
                  <Route path="/milestones" element={<Milestones />} />
                  <Route path="/insights" element={<Insights />} />
                  <Route path="/settings" element={<Settings />} />
                  <Route path="/profile" element={<ProfileManagement />} />
                  <Route path="/doctors" element={<DoctorSearch />} />
                  <Route path="/patients" element={<PatientsList />} />
                  <Route path="/doctor-dashboard" element={<DoctorDashboard />} />
                  <Route path="/feedback" element={<Feedback />} />
                  <Route path="/admin" element={<AdminManagement />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </BrowserRouter>
            </TooltipProvider>
          </AuthProvider>
        </LanguageProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
