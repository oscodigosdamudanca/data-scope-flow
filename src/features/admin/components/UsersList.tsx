import React, { useState, useMemo } from 'react';
import { useUsers } from '../hooks/useUsers';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { 
  Users, 
  Plus, 
  Search, 
  MoreHorizontal, 
  Edit, 
  Trash2,
  UserCheck,
  UserX
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { UserWithRoles } from '../hooks/useUsers';
import type { Enums } from '@/integrations/supabase/types';

type AppRole = Enums<'app_role'>;

interface UsersListProps {
  onCreateUser: () => void;
  onEditUser: (user: UserWithRoles) => void;
  onDeleteUser: (userId: string) => void;
}

const ROLE_LABELS: Record<AppRole, string> = {
  developer: 'Dev',
  organizer: 'Org',
  admin: 'Admin',
  interviewer: 'Entrev'
};

const ROLE_COLORS: Record<AppRole, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  developer: 'destructive',
  organizer: 'default',
  admin: 'secondary',
  interviewer: 'outline'
};

export const UsersList: React.FC<UsersListProps> = ({ 
  onCreateUser, 
  onEditUser,
  onDeleteUser 
}) => {
  const { users = [], loading, error, refetch, deleteUser, isDeleting } = useUsers();
  const [searchTerm, setSearchTerm] = useState('');

  // Estatísticas dos usuários
  const stats = useMemo(() => {
    const total = users.length;
    const active = users.filter(user => user.created_at).length; // Usando created_at como proxy para usuários confirmados
    const admins = users.filter(user => 
      user.roles?.some(role => role === 'admin')
    ).length;
    const developers = users.filter(user => 
      user.roles?.some(role => role === 'developer')
    ).length;

    return { total, active, admins, developers };
  }, [users]);

  // Filtrar usuários baseado na busca
  const filteredUsers = useMemo(() => {
    if (!searchTerm.trim()) return users;
    
    const term = searchTerm.toLowerCase();
    return users.filter(user => 
      user.email?.toLowerCase().includes(term) ||
      user.display_name?.toLowerCase().includes(term) ||
      user.phone?.toLowerCase().includes(term) ||
      user.roles?.some(role => role.toLowerCase().includes(term))
    );
  }, [users, searchTerm]);

  const getRoleBadgeVariant = (role: AppRole) => {
    switch (role) {
      case 'admin':
        return 'destructive' as const;
      case 'interviewer':
        return 'default' as const;
      case 'organizer':
        return 'secondary' as const;
      case 'developer':
        return 'outline' as const;
      default:
        return 'outline' as const;
    }
  };

  const getRoleDisplayName = (role: AppRole): string => {
    const roleLabels: Record<AppRole, string> = {
      admin: 'Administrador',
      developer: 'Desenvolvedor',
      organizer: 'Organizador',
      interviewer: 'Entrevistador'
    };
    return roleLabels[role] || role;
  };

  const handleDeleteUser = async (userId: string, userName: string) => {
    if (window.confirm(`Tem certeza que deseja excluir o usuário "${userName}"?`)) {
      onDeleteUser(userId);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatPhone = (phone: string | null) => {
    if (!phone) return '-';
    // Formatar telefone brasileiro
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 11) {
      return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7)}`;
    }
    return phone;
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-red-500">
            <p>Erro ao carregar usuários: {error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Gerenciamento de Usuários
            </CardTitle>
            <Button onClick={onCreateUser} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Novo Usuário
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Barra de Busca */}
          <div className="flex items-center gap-2 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Buscar por nome, email, telefone ou papel..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Estatísticas */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
              <div className="text-sm text-gray-600">Total de Usuários</div>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{stats.active}</div>
              <div className="text-sm text-gray-600">Usuários Ativos</div>
            </div>
            <div className="text-center p-3 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">{stats.admins}</div>
              <div className="text-sm text-gray-600">Admins</div>
            </div>
            <div className="text-center p-3 bg-orange-50 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">{stats.developers}</div>
              <div className="text-sm text-gray-600">Desenvolvedores</div>
            </div>
          </div>

          {/* Tabela de Usuários */}
          {filteredUsers.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {searchTerm ? 'Nenhum usuário encontrado com os critérios de busca.' : 'Nenhum usuário cadastrado.'}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Telefone</TableHead>
                    <TableHead>Papéis</TableHead>
                    <TableHead>Criado em</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">
                        {user.display_name || 'Sem nome'}
                      </TableCell>
                      <TableCell>
                        {user.email || 'Sem email'}
                      </TableCell>
                      <TableCell>
                        {formatPhone(user.phone)}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {!user.roles || user.roles.length === 0 ? (
                            <Badge variant="outline">Sem papéis</Badge>
                          ) : (
                            user.roles.map((userRole, index) => (
                              <Badge 
                                key={index}
                                variant={getRoleBadgeVariant(userRole)}
                                className="text-xs"
                              >
                                {getRoleDisplayName(userRole)}
                              </Badge>
                            ))
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {user.created_at ? format(new Date(user.created_at), 'dd/MM/yyyy', { locale: ptBR }) : '-'}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onEditUser(user)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteUser(user.id, user.display_name || user.email || 'Usuário')}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>


    </>
  );
};