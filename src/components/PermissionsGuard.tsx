import React from 'react';
import { useUserPermissions } from '@/hooks/usePermissions';
import { useAuth } from '@/contexts/AuthContext';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2 } from 'lucide-react';

interface PermissionsGuardProps {
  children: React.ReactNode;
  module: string;
  permission: string;
  fallback?: React.ReactNode;
  showError?: boolean;
}

export const PermissionsGuard: React.FC<PermissionsGuardProps> = ({
  children,
  module,
  permission,
  fallback,
  showError = true
}) => {
  const { user } = useAuth();
  const { checkPermission, loading } = useUserPermissions(user?.id);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-4">
        <Loader2 className="h-6 w-6 animate-spin" />
        <span className="ml-2">Verificando permissões...</span>
      </div>
    );
  }

  const hasPermission = checkPermission(module, permission);

  if (!hasPermission) {
    if (fallback) {
      return <>{fallback}</>;
    }

    if (showError) {
      return (
        <Alert variant="destructive">
          <AlertDescription>
            Você não tem permissão para acessar este recurso.
          </AlertDescription>
        </Alert>
      );
    }

    return null;
  }

  return <>{children}</>;
};

// Hook para verificar permissões de forma programática
export const usePermissionCheck = () => {
  const { user } = useAuth();
  const { checkPermission, loading } = useUserPermissions(user?.id);

  const hasPermission = (module: string, permission: string) => {
    return checkPermission(module, permission);
  };

  const canAccess = (module: string, permission: string) => {
    if (loading) return false;
    return hasPermission(module, permission);
  };

  return {
    hasPermission,
    canAccess,
    loading
  };
};