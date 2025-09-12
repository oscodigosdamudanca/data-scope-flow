import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BackToDashboard } from '@/components/core';
import { Activity, Download, Filter, RefreshCw, AlertTriangle, Info, CheckCircle, XCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { useState } from 'react';

const SystemLogs = () => {
  const [levelFilter, setLevelFilter] = useState('all');
  const [moduleFilter, setModuleFilter] = useState('all');
  const [userNameFilter, setUserNameFilter] = useState('');
  const [companyFilter, setCompanyFilter] = useState('');
  const [emailFilter, setEmailFilter] = useState('');

  const allLogs = [
    {
      id: 1,
      timestamp: '2025-01-18 14:30:25',
      level: 'info',
      module: 'auth',
      message: 'Usuário admin@datascope.com realizou login com sucesso',
      details: 'IP: 192.168.1.100, User-Agent: Mozilla/5.0...',
      userName: 'João Silva',
      company: 'DataScope Corp',
      email: 'admin@datascope.com'
    },
    {
      id: 2,
      timestamp: '2025-01-18 14:28:15',
      level: 'warning',
      module: 'leads',
      message: 'Tentativa de criação de lead com dados incompletos',
      details: 'Campo obrigatório "email" não fornecido',
      userName: 'Maria Santos',
      company: 'Tech Solutions',
      email: 'maria@techsolutions.com'
    },
    {
      id: 3,
      timestamp: '2025-01-18 14:25:10',
      level: 'error',
      module: 'database',
      message: 'Falha na conexão com o banco de dados',
      details: 'Connection timeout after 30 seconds',
      userName: 'Sistema',
      company: 'DataScope Corp',
      email: 'system@datascope.com'
    },
    {
      id: 4,
      timestamp: '2025-01-18 14:20:05',
      level: 'success',
      module: 'surveys',
      message: 'Nova pesquisa criada com sucesso',
      details: 'ID: 123, Título: "Avaliação do Evento"',
      userName: 'Carlos Oliveira',
      company: 'Eventos Plus',
      email: 'carlos@eventosplus.com'
    },
    {
      id: 5,
      timestamp: '2025-01-18 14:15:30',
      level: 'info',
      module: 'system',
      message: 'Sistema iniciado com sucesso',
      details: 'Versão: 1.0.0, Ambiente: production',
      userName: 'Sistema',
      company: 'DataScope Corp',
      email: 'system@datascope.com'
    },
    {
      id: 6,
      timestamp: '2025-01-18 14:10:45',
      level: 'info',
      module: 'auth',
      message: 'Usuário realizou logout',
      details: 'Sessão encerrada normalmente',
      userName: 'Ana Costa',
      company: 'Inovação Digital',
      email: 'ana@inovacaodigital.com'
    }
  ];

  // Aplicar filtros
  const logs = allLogs.filter(log => {
    const matchesLevel = levelFilter === 'all' || log.level === levelFilter;
    const matchesModule = moduleFilter === 'all' || log.module === moduleFilter;
    const matchesUserName = userNameFilter === '' || log.userName.toLowerCase().includes(userNameFilter.toLowerCase());
    const matchesCompany = companyFilter === '' || log.company.toLowerCase().includes(companyFilter.toLowerCase());
    const matchesEmail = emailFilter === '' || log.email.toLowerCase().includes(emailFilter.toLowerCase());
    
    return matchesLevel && matchesModule && matchesUserName && matchesCompany && matchesEmail;
  });

  const logStats = {
    total: logs.length,
    info: logs.filter(log => log.level === 'info').length,
    warning: logs.filter(log => log.level === 'warning').length,
    error: logs.filter(log => log.level === 'error').length,
    success: logs.filter(log => log.level === 'success').length
  };

  const getLevelIcon = (level: string) => {
    switch (level) {
      case 'error': return <XCircle className="h-4 w-4 text-red-500" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'success': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'info': return <Info className="h-4 w-4 text-blue-500" />;
      default: return <Info className="h-4 w-4 text-gray-500" />;
    }
  };

  const getLevelBadge = (level: string) => {
    switch (level) {
      case 'error': return <Badge variant="destructive">Erro</Badge>;
      case 'warning': return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Aviso</Badge>;
      case 'success': return <Badge variant="default" className="bg-green-100 text-green-800">Sucesso</Badge>;
      case 'info': return <Badge variant="outline">Info</Badge>;
      default: return <Badge variant="outline">{level}</Badge>;
    }
  };

  const handleStatCardClick = (level: string) => {
    if (level === 'all') {
      setLevelFilter('all');
    } else {
      setLevelFilter(level);
    }
    // Limpar outros filtros para focar no nível selecionado
    setModuleFilter('all');
    setUserNameFilter('');
    setCompanyFilter('');
    setEmailFilter('');
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <BackToDashboard variant="outline" position="header" />
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Logs do Sistema</h1>
            <p className="text-muted-foreground">
              Monitore a atividade e eventos do sistema em tempo real
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Exportar
          </Button>
          <Button variant="outline">
            <RefreshCw className="mr-2 h-4 w-4" />
            Atualizar
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-5">
        <Card 
          className="cursor-pointer transition-all duration-200 hover:shadow-md hover:scale-105 active:scale-95"
          onClick={() => handleStatCardClick('all')}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{logStats.total}</div>
            <p className="text-xs text-muted-foreground">Eventos registrados</p>
          </CardContent>
        </Card>

        <Card 
          className="cursor-pointer transition-all duration-200 hover:shadow-md hover:scale-105 active:scale-95"
          onClick={() => handleStatCardClick('error')}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Erros</CardTitle>
            <XCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{logStats.error}</div>
            <p className="text-xs text-muted-foreground">Requer atenção</p>
          </CardContent>
        </Card>

        <Card 
          className="cursor-pointer transition-all duration-200 hover:shadow-md hover:scale-105 active:scale-95"
          onClick={() => handleStatCardClick('warning')}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avisos</CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{logStats.warning}</div>
            <p className="text-xs text-muted-foreground">Para monitorar</p>
          </CardContent>
        </Card>

        <Card 
          className="cursor-pointer transition-all duration-200 hover:shadow-md hover:scale-105 active:scale-95"
          onClick={() => handleStatCardClick('success')}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sucessos</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{logStats.success}</div>
            <p className="text-xs text-muted-foreground">Operações OK</p>
          </CardContent>
        </Card>

        <Card 
          className="cursor-pointer transition-all duration-200 hover:shadow-md hover:scale-105 active:scale-95"
          onClick={() => handleStatCardClick('info')}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Info</CardTitle>
            <Info className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{logStats.info}</div>
            <p className="text-xs text-muted-foreground">Informativos</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Logs Recentes</CardTitle>
              <CardDescription>Últimos eventos do sistema</CardDescription>
            </div>
            <div className="flex flex-wrap gap-2">
              <Select value={levelFilter} onValueChange={setLevelFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Nível" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="error">Erros</SelectItem>
                  <SelectItem value="warning">Avisos</SelectItem>
                  <SelectItem value="success">Sucessos</SelectItem>
                  <SelectItem value="info">Info</SelectItem>
                </SelectContent>
              </Select>
              <Select value={moduleFilter} onValueChange={setModuleFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Módulo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="auth">Auth</SelectItem>
                  <SelectItem value="leads">Leads</SelectItem>
                  <SelectItem value="surveys">Surveys</SelectItem>
                  <SelectItem value="database">Database</SelectItem>
                  <SelectItem value="system">System</SelectItem>
                </SelectContent>
              </Select>
              <Input
                placeholder="Filtrar por usuário..."
                value={userNameFilter}
                onChange={(e) => setUserNameFilter(e.target.value)}
                className="w-40"
              />
              <Input
                placeholder="Filtrar por empresa..."
                value={companyFilter}
                onChange={(e) => setCompanyFilter(e.target.value)}
                className="w-40"
              />
              <Input
                placeholder="Filtrar por e-mail..."
                value={emailFilter}
                onChange={(e) => setEmailFilter(e.target.value)}
                className="w-40"
              />
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => {
                  setLevelFilter('all');
                  setModuleFilter('all');
                  setUserNameFilter('');
                  setCompanyFilter('');
                  setEmailFilter('');
                }}
              >
                <Filter className="h-4 w-4 mr-1" />
                Limpar
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {logs.map((log) => (
              <div key={log.id} className="flex items-start gap-4 p-4 border rounded-lg hover:bg-muted/50">
                <div className="flex-shrink-0 mt-1">
                  {getLevelIcon(log.level)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-mono text-muted-foreground">{log.timestamp}</span>
                    {getLevelBadge(log.level)}
                    <Badge variant="outline" className="text-xs">{log.module}</Badge>
                  </div>
                  <p className="text-sm font-medium mb-1">{log.message}</p>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs text-muted-foreground">Usuário:</span>
                    <span className="text-xs font-medium">{log.userName}</span>
                    <span className="text-xs text-muted-foreground">•</span>
                    <span className="text-xs text-muted-foreground">Empresa:</span>
                    <span className="text-xs font-medium">{log.company}</span>
                    <span className="text-xs text-muted-foreground">•</span>
                    <span className="text-xs text-muted-foreground">E-mail:</span>
                    <span className="text-xs font-medium">{log.email}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">{log.details}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SystemLogs;