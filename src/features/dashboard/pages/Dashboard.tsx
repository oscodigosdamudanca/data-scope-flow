import MainLayout from '@/components/layout/MainLayout';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Users, Building, BarChart3, Gift, Plus, Target, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

const Index = () => {
  const { user, userRole } = useAuth();

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
    <MainLayout>
      <div className="flex-1 space-y-4 p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        </div>
        <div className="space-y-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Bem-vindo ao DataScope, <span className="text-orange-600">{user?.user_metadata?.full_name || 'Nome não disponível'}!</span>
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
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant="default" className="bg-orange-600 hover:bg-orange-700">Ativo</Badge>
                  <div className="flex gap-1">
                    <Link to={userRole === 'interviewer' ? '/leads/capture' : '/leads'}>
                      <Button variant="outline" size="sm">
                        <Target className="h-3 w-3 mr-1" />
                        Ver Leads
                      </Button>
                    </Link>
                    <Link to="/leads/turbo">
                      <Button variant="outline" size="sm">
                        <Zap className="h-3 w-3 mr-1" />
                        Formulário Turbo
                      </Button>
                    </Link>
                  </div>
                </div>
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

          {/* Formulário Turbo Card - Conforme Imagem 1 */}
          <div className="mt-6">
            <Card className="border-2 border-orange-200 bg-gradient-to-br from-orange-50 to-orange-100">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-orange-600 rounded-lg">
                      <Zap className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-lg font-semibold text-orange-900">Formulário Turbo</CardTitle>
                      <p className="text-sm text-orange-700">Acesso Rápido</p>
                    </div>
                  </div>
                  <Badge variant="default" className="bg-orange-600 hover:bg-orange-700 text-white">
                    Disponível
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-sm text-orange-800 mb-4">
                  Formulário otimizado para captação rápida e eficiente de leads durante eventos corporativos.
                </p>
                <Link to="/leads/turbo-form">
                  <Button className="bg-orange-600 hover:bg-orange-700 text-white font-medium">
                    <Zap className="h-4 w-4 mr-2" />
                    Acessar Agora
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Index;