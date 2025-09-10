import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { AppRole } from '@/integrations/supabase/types';

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