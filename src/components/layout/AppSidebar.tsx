import { useAuth } from '@/contexts/AuthContext';
import { Link, useLocation } from 'react-router-dom';
import { NotificationBadge } from '@/components/notifications/NotificationBadge';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from '@/components/ui/sidebar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  Home,
  Building,
  Calendar,
  User,
  LogOut,
  Settings,
  BarChart3,
  Users,
  FileText,
  UserCheck,
  ClipboardList,
  MessageSquare,
  Gift,
  Code,
  Shield,
  Activity,
} from 'lucide-react';

const AppSidebar = () => {
  const { user, userRole, signOut } = useAuth();
  const location = useLocation();

  const handleSignOut = async () => {
    await signOut();
  };

  const userInitials = user?.user_metadata?.display_name
    ? user.user_metadata.display_name.charAt(0).toUpperCase()
    : user?.user_metadata?.full_name?.charAt(0).toUpperCase() || 'U';

  // Itens de navegação principais
  const navigationItems = [
    {
      title: 'Dashboard',
      icon: Home,
      url: '/',
      isActive: location.pathname === '/',
      roles: ['developer', 'organizer', 'admin', 'interviewer']
    },
  ];

  // Módulos do DataScope
  const dataScopeModules = [
    {
      title: 'Empresas',
      icon: Building,
      url: '/companies',
      isActive: location.pathname === '/companies',
      roles: ['developer', 'organizer']
    },
    {
      title: 'Captação de Leads',
      icon: UserCheck,
      url: '/leads',
      isActive: location.pathname === '/leads',
      roles: ['developer', 'organizer', 'admin', 'interviewer']
    },
    {
      title: 'Analytics',
      icon: BarChart3,
      url: '/analytics',
      isActive: location.pathname.startsWith('/analytics'),
      roles: ['developer', 'organizer', 'admin']
    },
    {
      title: 'Sorteios',
      icon: Gift,
      url: '/raffles',
      isActive: location.pathname === '/raffles',
      roles: ['developer', 'organizer', 'admin']
    },
    {
      title: 'Pesquisas',
      icon: ClipboardList,
      url: '/surveys',
      isActive: location.pathname === '/surveys',
      roles: ['developer', 'organizer', 'admin']
    },
    {
      title: 'Feedback da Feira',
      icon: MessageSquare,
      url: '/fair-feedback',
      isActive: location.pathname === '/fair-feedback',
      roles: ['developer', 'organizer']
    },
    {
      title: 'Pesquisas Personalizadas',
      icon: FileText,
      url: '/custom-surveys',
      isActive: location.pathname === '/custom-surveys',
      roles: ['developer', 'organizer']
    },
  ];

  // Área administrativa
  const adminItems = [
    {
      title: 'Usuários',
      icon: Users,
      url: '/admin/users',
      isActive: location.pathname === '/admin/users',
      roles: ['admin']
    },
    {
      title: 'Relatórios',
      icon: BarChart3,
      url: '/admin/reports',
      isActive: location.pathname === '/admin/reports',
      roles: ['admin']
    },
    {
      title: 'Configurações',
      icon: Settings,
      url: '/admin/settings',
      isActive: location.pathname === '/admin/settings',
      roles: ['admin']
    },
  ];

  // Área do desenvolvedor
  const developerItems = [
    {
      title: 'Tipos de Pergunta',
      icon: Code,
      url: '/developer/question-types',
      isActive: location.pathname === '/developer/question-types',
      roles: ['developer']
    },
    {
      title: 'Permissões',
      icon: Shield,
      url: '/developer/permissions',
      isActive: location.pathname === '/developer/permissions',
      roles: ['developer']
    },
    {
      title: 'Logs do Sistema',
      icon: Activity,
      url: '/developer/logs',
      isActive: location.pathname === '/developer/logs',
      roles: ['developer']
    },
  ];

  // Função para filtrar itens baseado no role do usuário
  const filterItemsByRole = (items: any[]) => {
    if (!userRole) return [];
    return items.filter(item => item.roles.includes(userRole));
  };

  return (
    <Sidebar variant="inset" collapsible="icon">
      <SidebarHeader>
        <div className="flex items-center gap-2 px-2 py-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <FileText className="h-4 w-4" />
          </div>
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-semibold">DataScope</span>
            <span className="truncate text-xs text-muted-foreground">Analytics Platform</span>
          </div>
          <NotificationBadge className="group-data-[collapsible=icon]:hidden" />
        </div>
      </SidebarHeader>

      <SidebarContent>
        {/* Navegação Principal */}
        <SidebarGroup>
          <SidebarGroupLabel>Navegação</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {filterItemsByRole(navigationItems).map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={item.isActive}
                    tooltip={item.title}
                  >
                    <Link to={item.url} className="flex items-center gap-2">
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Módulos DataScope */}
        {filterItemsByRole(dataScopeModules).length > 0 && (
          <>
            <SidebarSeparator />
            <SidebarGroup>
              <SidebarGroupLabel>Módulos DataScope</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {filterItemsByRole(dataScopeModules).map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        asChild
                        isActive={item.isActive}
                        tooltip={item.title}
                      >
                        <Link to={item.url} className="flex items-center gap-2">
                          <item.icon className="h-4 w-4" />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </>
        )}

        {/* Área Administrativa */}
        {filterItemsByRole(adminItems).length > 0 && (
          <>
            <SidebarSeparator />
            <SidebarGroup>
              <SidebarGroupLabel>Administração</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {filterItemsByRole(adminItems).map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        asChild
                        isActive={item.isActive}
                        tooltip={item.title}
                      >
                        <Link to={item.url} className="flex items-center gap-2">
                          <item.icon className="h-4 w-4" />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </>
        )}

        {/* Área do Desenvolvedor */}
        {filterItemsByRole(developerItems).length > 0 && (
          <>
            <SidebarSeparator />
            <SidebarGroup>
              <SidebarGroupLabel>Desenvolvedor</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {filterItemsByRole(developerItems).map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        asChild
                        isActive={item.isActive}
                        tooltip={item.title}
                      >
                        <Link to={item.url} className="flex items-center gap-2">
                          <item.icon className="h-4 w-4" />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
          </SidebarGroupContent>
            </SidebarGroup>
          </>
        )}
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                >
                  <Avatar className="h-8 w-8 rounded-lg">
                    <AvatarFallback className="rounded-lg bg-primary text-primary-foreground">
                      {userInitials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold">
                      {user?.user_metadata?.display_name || user?.user_metadata?.full_name || user?.user_metadata?.full_name || 'Nome não disponível'}
                    </span>
                    <span className="truncate text-xs text-muted-foreground">
                      {user?.user_metadata?.full_name || 'Nome não disponível'}
                    </span>
                  </div>
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                side="bottom"
                align="end"
                sideOffset={4}
              >
                <DropdownMenuItem className="cursor-pointer" asChild>
                  <Link to="/profile">
                    <User className="mr-2 h-4 w-4" />
                    <span>Perfil</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="cursor-pointer" onClick={handleSignOut}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Sair</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
};

export default AppSidebar;