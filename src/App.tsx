import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { CompanyProvider } from "@/contexts/CompanyContext";
import { NotificationsProvider } from "@/contexts/NotificationsContext";
import ProtectedRoute from "@/components/core/ProtectedRoute";
import Dashboard from "./features/dashboard/pages/Dashboard";
import Auth from "@/features/auth/pages/Auth";
import Companies from "./features/companies/pages/Companies";
import NotFound from "./features/misc/pages/NotFound";
import Unauthorized from "@/features/misc/pages/Unauthorized";
import AdminDashboard from "./features/admin/pages/AdminDashboard";
import UsersManagement from "./features/admin/pages/AdminUsers";
import LeadsPage from "./features/leads/pages/LeadsPage";
import LeadsListPage from "./features/leads/pages/LeadsListPage";
import { CreateLeadPage } from "./features/leads/pages/CreateLeadPage";
import SurveysPage from "./features/surveys/pages/SurveysPage";
import AdminSettings from "./features/admin/pages/AdminSettings";
import FairFeedback from "@/pages/FairFeedback";
import CustomSurveys from "@/pages/CustomSurveys";
import Raffles from "@/pages/Raffles";
import DeveloperDashboard from "./features/developer/pages/DeveloperDashboard";
import QuestionTypesPage from "./features/developer/pages/QuestionTypesPage";
import PermissionsPage from "./features/developer/pages/PermissionsPage";
import SystemLogsPage from "./features/developer/pages/SystemLogsPage";
import TurboFormPage from "@/features/leads/pages/TurboFormPage";
import TurboFormDirectAccessPage from "@/features/leads/pages/TurboFormDirectAccessPage";
import TurboFormAdminPage from "@/features/leads/pages/TurboFormAdminPage";
import TurboFormConfigPage from "@/features/leads/pages/TurboFormConfigPage";
import TurboFormPublicPage from "@/features/leads/pages/TurboFormPublicPage";
import LeadCapturePage from "./features/leads/pages/LeadCapturePage";
import PublicLeadCapturePage from "./features/leads/pages/PublicLeadCapturePage";
import PublicSurveyPage from "./features/surveys/pages/PublicSurveyPage";
import PublicQRLeadCapturePage from "./features/leads/pages/PublicQRLeadCapturePage";
import TagsManagerPage from "./features/leads/pages/TagsManagerPage";
import LeadTaggingPage from "./features/leads/pages/LeadTaggingPage";
import QRCodeLeadsPage from "./features/leads/pages/QRCodeLeadsPage";
import PrivacyPolicy from "@/features/misc/pages/PrivacyPolicy";
import { AnalyticsRoutes } from "@/features/analytics";
import ReportsPage from "@/features/reports/pages/ReportsPage";


const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <CompanyProvider>
          <NotificationsProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
          <Routes>
            <Route path="/auth" element={<Auth />} />
            <Route path="/unauthorized" element={<Unauthorized />} />
            <Route path="/leads/turbo" element={<TurboFormPage />} />
            <Route path="/lead-capture" element={<PublicLeadCapturePage />} />
            <Route path="/lead-capture/qr/:qrId" element={<PublicQRLeadCapturePage />} />
            <Route path="/survey/:surveyId" element={<PublicSurveyPage />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />

            <Route element={<ProtectedRoute allowedRoles={['developer', 'organizer', 'admin', 'interviewer']} />}>
              <Route path="/" element={<Dashboard />} />
            </Route>

            <Route element={<ProtectedRoute allowedRoles={['developer', 'organizer']} />}>
              <Route path="/companies" element={<Companies />} />
            </Route>

            <Route element={<ProtectedRoute allowedRoles={['developer', 'organizer', 'admin']} />}>
              <Route path="/leads" element={<LeadsPage />} />
            <Route path="/leads/list" element={<LeadsListPage />} />
            <Route path="/leads/create" element={<CreateLeadPage />} />
              <Route path="/leads/capture" element={<LeadCapturePage />} />
              <Route path="/leads/turbo" element={<TurboFormPage />} />
          <Route path="/leads/turbo/direct" element={<TurboFormDirectAccessPage />} />
          <Route path="/leads/turbo/admin" element={<TurboFormAdminPage />} />
          <Route path="/leads/turbo/config" element={<TurboFormConfigPage />} />
          <Route path="/leads/turbo/public/:id" element={<TurboFormPublicPage />} />
              <Route path="/leads/qr-codes" element={<QRCodeLeadsPage />} />
              <Route path="/leads/tags" element={<TagsManagerPage />} />
              <Route path="/leads/tagging" element={<LeadTaggingPage />} />
              <Route path="/surveys" element={<SurveysPage />} />
              <Route path="/analytics/*" element={<AnalyticsRoutes />} />
            </Route>

            {/* Rotas específicas do Organizador da Feira */}
            <Route element={<ProtectedRoute allowedRoles={['developer', 'organizer']} />}>
              <Route path="/fair-feedback" element={<FairFeedback />} />
              <Route path="/custom-surveys" element={<CustomSurveys />} />
              <Route path="/raffles" element={<Raffles />} />
            </Route>

            {/* Rotas de Administração */}
            <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/users" element={<UsersManagement />} />
              <Route path="/admin/reports" element={<ReportsPage />} />
              <Route path="/admin/settings" element={<AdminSettings />} />
            </Route>

            {/* Área do Desenvolvedor */}
            <Route element={<ProtectedRoute allowedRoles={['developer']} />}>
              <Route path="/developer" element={<DeveloperDashboard />} />
              <Route path="/developer/question-types" element={<QuestionTypesPage />} />
              <Route path="/developer/permissions" element={<PermissionsPage />} />
              <Route path="/developer/logs" element={<SystemLogsPage />} />
            </Route>

            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
            </BrowserRouter>
          </NotificationsProvider>
        </CompanyProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
