import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Auth from "./pages/Auth";
import { AuthProvider } from "./hooks/useAuth";
import { ThemeProvider } from "./hooks/useTheme";
import Test from "./pages/Test";
import Profile from "./pages/Profile";
import MyAppointments from "./pages/MyAppointments";
import AdminDashboard from "./pages/admin/AdminDashboard";
import DoctorDashboard from "./pages/DoctorDashboardSimplified";
import PatientDashboard from "./pages/PatientDashboard";
import AdminRoute from "./components/auth/AdminRoute";
import DoctorRoute from "./components/auth/DoctorRoute";
import PatientRoute from "./components/auth/PatientRoute";
import QuickNavigation from "./components/QuickNavigation";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";


const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/test" element={<Test />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/my-appointments" element={<MyAppointments />} />
              
              {/* Admin Routes */}
              <Route 
                path="/admin" 
                element={
                  <AdminRoute>
                    <AdminDashboard />
                  </AdminRoute>
                } 
              />
              
              {/* Doctor Routes */}
              <Route 
                path="/doctor" 
                element={
                  <DoctorRoute>
                    <DoctorDashboard />
                  </DoctorRoute>
                } 
              />
              
              {/* Patient Routes */}
              <Route 
                path="/patient" 
                element={
                  <PatientRoute>
                    <PatientDashboard />
                  </PatientRoute>
                } 
              />
              
              {/* Legal Pages */}
              <Route path="/privacy-policy" element={<PrivacyPolicy />} />
              <Route path="/terms-of-service" element={<TermsOfService />} />
              
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
            <QuickNavigation />
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
