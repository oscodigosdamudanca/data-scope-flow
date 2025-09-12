import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { CompanyProvider } from "@/contexts/CompanyContext";
import ProtectedRoute from "@/components/core/ProtectedRoute";
import Dashboard from "./features/dashboard/pages/Dashboard";
import Auth from "@/features/auth/pages/Auth";
import Companies from "./features/companies/pages/Companies";
import NotFound from "./features/misc/pages/NotFound";
import Unauthorized from "@/features/misc/pages/Unauthorized";
import AdminDashboard from "./features/admin/pages/AdminDashboard";
import UsersManagement from "./features/admin/pages/AdminUsers";
import LeadsPage from "./features/leads/pages/LeadsPage";
import SurveysPage from "./features/surveys/pages/SurveysPage";
import AdminReports from "./features/admin/pages/AdminReports";
import AdminSettings from "./features/admin/pages/AdminSettings";
import FairFeedback from "@/pages/FairFeedback";
import CustomSurveys from "@/pages/CustomSurveys";
import Raffles from "@/pages/Raffles";
import QuestionTypes from "@/pages/developer/QuestionTypes";
import Permissions from "@/pages/developer/Permissions";
import SystemLogs from "@/pages/developer/SystemLogs";
import TurboFormPage from "@/features/leads/pages/TurboFormPage";
import PrivacyPolicy from "@/features/misc/pages/PrivacyPolicy";


const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <CompanyProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
          <Routes>
            <Route path="/auth" element={<Auth />} />
            <Route path="/unauthorized" element={<Unauthorized />} />
            <Route path="/turbo-form" element={<TurboFormPage />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />

            <Route element={<ProtectedRoute allowedRoles={['developer', 'organizer', 'admin', 'interviewer', 'fair_organizer']} />}>
              <Route path="/" element={<Dashboard />} />
            </Route>

            <Route element={<ProtectedRoute allowedRoles={['developer', 'organizer']} />}>
              <Route path="/companies" element={<Companies />} />
            </Route>

            <Route element={<ProtectedRoute allowedRoles={['developer', 'organizer', 'admin']} />}>
              <Route path="/leads" element={<LeadsPage />} />
              <Route path="/surveys" element={<SurveysPage />} />
            </Route>

            {/* Rotas específicas do Organizador da Feira */}
            <Route element={<ProtectedRoute allowedRoles={['developer', 'fair_organizer']} />}>
              <Route path="/fair-feedback" element={<FairFeedback />} />
              <Route path="/custom-surveys" element={<CustomSurveys />} />
              <Route path="/raffles" element={<Raffles />} />
            </Route>

            {/* Rotas de Administração */}
            <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/users" element={<UsersManagement />} />
              <Route path="/admin/reports" element={<AdminReports />} />
              <Route path="/admin/settings" element={<AdminSettings />} />
            </Route>

            {/* Área do Desenvolvedor */}
            <Route element={<ProtectedRoute allowedRoles={['developer']} />}>
              <Route path="/developer" element={<div>Developer Dashboard</div>} />
              <Route path="/developer/question-types" element={<QuestionTypes />} />
              <Route path="/developer/permissions" element={<Permissions />} />
              <Route path="/developer/logs" element={<SystemLogs />} />
            </Route>

            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
          </BrowserRouter>
        </CompanyProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
