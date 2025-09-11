import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/core/ProtectedRoute";
import Dashboard from "@/features/dashboard/pages/Dashboard";
import Auth from "@/features/auth/pages/Auth";
import Companies from "@/features/companies/pages/Companies";
import NotFound from "@/features/misc/pages/NotFound";
import Unauthorized from "@/features/misc/pages/Unauthorized";
import AdminDashboard from "@/features/admin/pages/AdminDashboard";
import UsersManagement from "@/features/admin/pages/UsersManagement";
import { QuestionTypesPage } from "@/pages/admin/QuestionTypesPage";
import InterviewsPage from '@/pages/InterviewsPage';

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/auth" element={<Auth />} />
            <Route path="/unauthorized" element={<Unauthorized />} />

            <Route element={<ProtectedRoute allowedRoles={['developer', 'organizer', 'admin', 'interviewer']} />}>
              <Route path="/" element={<Dashboard />} />
            </Route>

            <Route element={<ProtectedRoute allowedRoles={['developer', 'organizer']} />}>
              <Route path="/companies" element={<Companies />} />
            </Route>

            <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/users" element={<UsersManagement />} />
              <Route path="/admin/question-types" element={<QuestionTypesPage />} />
              <Route path="/admin/interviews" element={<InterviewsPage />} />
            </Route>

            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
