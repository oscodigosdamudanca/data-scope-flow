import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import type { Enums } from '@/integrations/supabase/types';

type AppRole = Enums<'app_role'>;

interface ProtectedRouteProps {
  allowedRoles: AppRole[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles }) => {
  const { user, loading, userRole } = useAuth();

  if (loading) {
    return <div>Loading...</div>; // Ou um componente de spinner/loading
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (!userRole || !allowedRoles.includes(userRole)) {
    return <Navigate to="/unauthorized" replace />; // Crie uma página para acesso negado
  }

  return <Outlet />;
};

export default ProtectedRoute;