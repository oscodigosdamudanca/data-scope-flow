import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Building, Users, Edit, Trash2, Mail, Phone, MapPin } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';

interface CompanyListProps {
  onEditCompany?: (company: any) => void;
  onCreateNew?: () => void;
}

const CompanyList: React.FC<CompanyListProps> = ({ onEditCompany, onCreateNew }) => {
  const { user } = useAuth();
  const { toast } = useToast();

  const { data: companies, isLoading, refetch } = useQuery({
    queryKey: ['companies', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('companies')
        .select(`
          *,
          company_memberships!inner(
            role,
            user_id
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const deleteCompany = async (companyId: string) => {
    try {
      const { error } = await supabase
        .from('companies')
        .delete()
        .eq('id', companyId);

      if (error) throw error;

      toast({
        title: 'Empresa excluída',
        description: 'A empresa foi excluída com sucesso.',
      });
      
      refetch();
    } catch (error) {
      console.error('Error deleting company:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao excluir empresa. Tente novamente.',
        variant: 'destructive',
      });
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="animate-pulse space-y-3">
                <div className="h-4 bg-muted rounded w-1/3"></div>
                <div className="h-3 bg-muted rounded w-1/2"></div>
                <div className="h-3 bg-muted rounded w-1/4"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Minhas Empresas</h2>
          <p className="text-muted-foreground">
            Gerencie as empresas que você tem acesso
          </p>
        </div>
        {onCreateNew && (
          <Button onClick={onCreateNew}>
            <Building className="mr-2 h-4 w-4" />
            Nova Empresa
          </Button>
        )}
      </div>

      {!companies || companies.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Building className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhuma empresa encontrada</h3>
            <p className="text-muted-foreground text-center mb-4">
              Você ainda não tem acesso a nenhuma empresa. Crie uma nova empresa ou peça para ser adicionado.
            </p>
            {onCreateNew && (
              <Button onClick={onCreateNew}>
                <Building className="mr-2 h-4 w-4" />
                Criar Primeira Empresa
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {companies.map((company) => {
            const membership = company.company_memberships[0];
            const isAdmin = membership?.role === 'admin';
            
            return (
              <Card key={company.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <CardTitle className="flex items-center gap-2">
                        <Building className="h-5 w-5" />
                        {company.name}
                      </CardTitle>
                      {company.legal_name && (
                        <p className="text-sm text-muted-foreground">
                          {company.legal_name}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={isAdmin ? 'default' : 'secondary'}>
                        <Users className="mr-1 h-3 w-3" />
                        {isAdmin ? 'Admin' : 'Membro'}
                      </Badge>
                      {isAdmin && (
                        <div className="flex gap-1">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onEditCompany?.(company)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="outline" size="sm">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Excluir empresa</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Tem certeza que deseja excluir "{company.name}"? Esta ação não pode ser desfeita.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => deleteCompany(company.id)}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  Excluir
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    {company.cnpj && (
                      <div className="flex items-center gap-2">
                        <Building className="h-4 w-4 text-muted-foreground" />
                        <span>CNPJ: {company.cnpj}</span>
                      </div>
                    )}
                    {company.email && (
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <span>{company.email}</span>
                      </div>
                    )}
                    {company.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span>{company.phone}</span>
                      </div>
                    )}
                    {company.address && typeof company.address === 'object' && 'street' in company.address && (
                      <div className="flex items-center gap-2 md:col-span-3">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span>{(company.address as any).street}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="mt-4 pt-4 border-t text-xs text-muted-foreground">
                    Criada em: {new Date(company.created_at).toLocaleDateString('pt-BR')}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default CompanyList;