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
    <MainLayout>
        <div className="space-y-6">
          {/* Welcome Header */}
          <div className="space-y-2">
            <h1 className="text-3xl font-bold">
              Bem-vindo ao DataScope, <span className="text-orange-700">{user?.user_metadata?.display_name || user?.email?.split('@')[0]}</span>!
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


        </div>
      </MainLayout>
  );
};

export default Index;