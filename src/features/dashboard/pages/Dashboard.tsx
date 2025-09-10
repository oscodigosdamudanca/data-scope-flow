import ProtectedRoute from '@/components/core/ProtectedRoute';
import MainLayout from '@/components/layout/MainLayout';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Users, Building, BarChart3, Gift, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

const Index = () => {
  const { user } = useAuth();

  const { data: companies } = useQuery({
    queryKey: ['companies-count', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('companies')
        .select('id', { count: 'exact' })
        .limit(1);
      
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  return (
    <ProtectedRoute allowedRoles={['developer', 'organizer', 'admin', 'interviewer']}>
      <MainLayout>
        <div className="space-y-6">
          {/* Welcome Header */}
          <div className="space-y-2">
            <h1 className="text-3xl font-bold">
              Bem-vindo ao DataScope, {user?.user_metadata?.display_name || user?.email?.split('@')[0]}!
            </h1>
            <p className="text-muted-foreground">
              Hub de inteligência de mercado para eventos corporativos - Sua central de leads e insights.
            </p>
          </div>

          {/* Status Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Captação de Leads</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">0</div>
                <p className="text-xs text-muted-foreground">
                  Leads capturados hoje
                </p>
                <Badge variant="secondary" className="mt-2">Em breve</Badge>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Sorteios</CardTitle>
                <Gift className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">0</div>
                <p className="text-xs text-muted-foreground">
                  Sorteios realizados
                </p>
                <Badge variant="secondary" className="mt-2">Em breve</Badge>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Empresas</CardTitle>
                <Building className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{companies?.length || 0}</div>
                <p className="text-xs text-muted-foreground">
                  Empresas cadastradas
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant="default">Ativo</Badge>
                  <Link to="/companies">
                    <Button variant="outline" size="sm">
                      <Plus className="h-3 w-3 mr-1" />
                      Gerenciar
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Analytics</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">0</div>
                <p className="text-xs text-muted-foreground">
                  Relatórios gerados
                </p>
                <Badge variant="secondary" className="mt-2">Em breve</Badge>
              </CardContent>
            </Card>
          </div>

          {/* Main Content Area */}
          <Card>
            <CardHeader>
              <CardTitle>Fase 1 - Fundação e Acesso</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm">Sistema de autenticação implementado</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm">Estrutura de perfis no Supabase criada</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm">Hierarquia de usuários configurada</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 bg-yellow-500 rounded-full"></div>
                  <span className="text-sm">Área de controle do desenvolvedor (em desenvolvimento)</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm">Sistema de empresas implementado</span>
                </div>
                
                <div className="mt-6 p-4 bg-muted rounded-lg">
                  <h4 className="font-semibold mb-2">Próximos passos - Fase 3:</h4>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>• Módulo de Captação de Leads</li>
                    <li>• Painel de B.I. básico do Expositor</li>
                    <li>• Configuração de perguntas do Desenvolvedor</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </MainLayout>
    </ProtectedRoute>
  );
};

export default Index;