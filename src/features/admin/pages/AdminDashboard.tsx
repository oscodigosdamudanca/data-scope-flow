import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, HelpCircle, Settings, BarChart3 } from 'lucide-react';

const AdminDashboard = () => {
  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Painel de Administração</h1>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Gerenciamento de Usuários */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-lg font-medium">Usuários</CardTitle>
            <Users className="h-6 w-6 text-blue-600" />
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">
              Gerencie usuários do sistema, papéis e permissões.
            </p>
            <Link to="/admin/users">
              <Button className="w-full">
                Gerenciar Usuários
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Gerenciamento de Tipos de Perguntas */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-lg font-medium">Tipos de Perguntas</CardTitle>
            <HelpCircle className="h-6 w-6 text-green-600" />
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">
              Configure tipos de perguntas para entrevistas.
            </p>
            <Link to="/admin/question-types">
              <Button className="w-full">
                Gerenciar Tipos
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Configurações do Sistema */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-lg font-medium">Configurações</CardTitle>
            <Settings className="h-6 w-6 text-purple-600" />
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">
              Configurações gerais do sistema e integrações.
            </p>
            <Button className="w-full" variant="outline" disabled>
              Em Breve
            </Button>
          </CardContent>
        </Card>

        {/* Relatórios */}
        <Card className="hover:shadow-lg transition-shadow md:col-span-2 lg:col-span-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-lg font-medium">Relatórios</CardTitle>
            <BarChart3 className="h-6 w-6 text-orange-600" />
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">
              Visualize métricas e relatórios do sistema.
            </p>
            <Button className="w-full" variant="outline" disabled>
              Em Breve
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Estatísticas Rápidas */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg text-center">
          <div className="text-2xl font-bold text-blue-600">-</div>
          <div className="text-sm text-gray-600">Usuários Ativos</div>
        </div>
        <div className="bg-green-50 p-4 rounded-lg text-center">
          <div className="text-2xl font-bold text-green-600">-</div>
          <div className="text-sm text-gray-600">Empresas</div>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg text-center">
          <div className="text-2xl font-bold text-purple-600">-</div>
          <div className="text-sm text-gray-600">Entrevistas</div>
        </div>
        <div className="bg-orange-50 p-4 rounded-lg text-center">
          <div className="text-2xl font-bold text-orange-600">-</div>
          <div className="text-sm text-gray-600">Processos</div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;