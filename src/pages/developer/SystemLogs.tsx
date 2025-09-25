import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BackToDashboard } from '@/components/core';
import { Activity, Download, Filter, RefreshCw, AlertTriangle, Info, CheckCircle, XCircle, Database, Shield, Server } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { useState } from 'react';

export const SystemLogs = () => {
  const [levelFilter, setLevelFilter] = useState('all');
  const [moduleFilter, setModuleFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [userFilter, setUserFilter] = useState('');
  const [companyFilter, setCompanyFilter] = useState('');
  const [emailFilter, setEmailFilter] = useState('');

  const allLogs = [
    // Logs de Acesso à Aplicação
    {
      id: 1,
      timestamp: '2025-01-18 14:30:25',
      level: 'info',
      module: 'auth',
      category: 'access',
      message: 'Usuário admin@datascope.com realizou login com sucesso',
      details: 'IP: 192.168.1.100, User-Agent: Mozilla/5.0, Tempo de resposta: 120ms',
      userName: 'João Silva',
      company: 'DataScope Corp',
      email: 'admin@datascope.com',
      responseTime: '120ms',
      ipAddress: '192.168.1.100'
    },
    {
      id: 2,
      timestamp: '2025-01-18 14:28:15',
      level: 'warning',
      module: 'leads',
      category: 'application',
      message: 'Tentativa de criação de lead com dados incompletos',
      details: 'Campo obrigatório "email" não fornecido, Tempo de processamento: 45ms',
      userName: 'Maria Santos',
      company: 'Tech Solutions',
      email: 'maria@techsolutions.com',
      responseTime: '45ms',
      ipAddress: '192.168.1.105'
    },
    // Logs de Banco de Dados
    {
      id: 3,
      timestamp: '2025-01-18 14:25:10',
      level: 'error',
      module: 'database',
      category: 'database',
      message: 'Falha na conexão com o banco de dados',
      details: 'Connection timeout after 30 seconds, Pool: 5/10 conexões ativas, Última tentativa de reconexão: 14:25:05',
      userName: 'Sistema',
      company: 'DataScope Corp',
      email: 'system@datascope.com',
      dbPool: '5/10',
      connectionStatus: 'failed',
      lastReconnect: '14:25:05'
    },
    {
      id: 4,
      timestamp: '2025-01-18 14:20:05',
      level: 'success',
      module: 'surveys',
      category: 'application',
      message: 'Nova pesquisa criada com sucesso',
      details: 'ID: 123, Título: "Avaliação do Evento", Tempo de processamento: 89ms',
      userName: 'Carlos Oliveira',
      company: 'Eventos Plus',
      email: 'carlos@eventosplus.com',
      responseTime: '89ms',
      ipAddress: '192.168.1.102'
    },
    {
      id: 5,
      timestamp: '2025-01-18 14:15:30',
      level: 'info',
      module: 'system',
      category: 'system',
      message: 'Sistema iniciado com sucesso',
      details: 'Versão: 1.0.0, Ambiente: production, Uptime: 99.98%, Memória: 2.1GB/8GB',
      userName: 'Sistema',
      company: 'DataScope Corp',
      email: 'system@datascope.com',
      uptime: '99.98%',
      memoryUsage: '2.1GB/8GB'
    },
    {
      id: 6,
      timestamp: '2025-01-18 14:10:45',
      level: 'info',
      module: 'auth',
      category: 'access',
      message: 'Usuário realizou logout',
      details: 'Sessão encerrada normalmente, Duração da sessão: 2h 15min, IP: 192.168.1.103',
      userName: 'Ana Costa',
      company: 'Inovação Digital',
      email: 'ana@inovacaodigital.com',
      sessionDuration: '2h 15min',
      ipAddress: '192.168.1.103'
    },
    // Logs de Conectividade de Banco de Dados
    {
      id: 7,
      timestamp: '2025-01-18 14:05:20',
      level: 'warning',
      module: 'database',
      category: 'database',
      message: 'Latência alta detectada na conexão com banco de dados',
      details: 'Tempo de resposta: 850ms (limite: 500ms), Pool: 8/10 conexões ativas',
      userName: 'Sistema',
      company: 'DataScope Corp',
      email: 'system@datascope.com',
      dbLatency: '850ms',
      dbPool: '8/10',
      connectionStatus: 'slow'
    },
    {
      id: 8,
      timestamp: '2025-01-18 14:00:15',
      level: 'error',
      module: 'database',
      category: 'database',
      message: 'Crash detectado no processo de backup automático',
      details: 'Processo interrompido inesperadamente, Último backup bem-sucedido: 13:00:00, Reiniciando processo...',
      userName: 'Sistema',
      company: 'DataScope Corp',
      email: 'system@datascope.com',
      lastBackup: '13:00:00',
      connectionStatus: 'crashed',
      autoRestart: 'true'
    },
    {
      id: 9,
      timestamp: '2025-01-18 13:55:30',
      level: 'success',
      module: 'database',
      category: 'database',
      message: 'Conexão com banco de dados restaurada',
      details: 'Reconexão bem-sucedida após interrupção, Pool: 10/10 conexões ativas, Latência: 45ms',
      userName: 'Sistema',
      company: 'DataScope Corp',
      email: 'system@datascope.com',
      dbLatency: '45ms',
      dbPool: '10/10',
      connectionStatus: 'healthy'
    },
    // Logs de Acesso e Estabilidade
    {
      id: 10,
      timestamp: '2025-01-18 13:50:10',
      level: 'warning',
      module: 'auth',
      category: 'access',
      message: 'Múltiplas tentativas de login falharam',
      details: '5 tentativas em 2 minutos do IP: 192.168.1.200, Conta temporariamente bloqueada',
      userName: 'Tentativa de acesso',
      company: 'Desconhecida',
      email: 'admin@fake.com',
      failedAttempts: '5',
      ipAddress: '192.168.1.200',
      accountStatus: 'blocked'
    },
    {
      id: 11,
      timestamp: '2025-01-18 13:45:25',
      level: 'info',
      module: 'system',
      category: 'system',
      message: 'Monitoramento de performance - Status OK',
      details: 'CPU: 35%, RAM: 2.8GB/8GB, Disco: 45GB/100GB, Conexões ativas: 127',
      userName: 'Sistema',
      company: 'DataScope Corp',
      email: 'system@datascope.com',
      cpuUsage: '35%',
      memoryUsage: '2.8GB/8GB',
      diskUsage: '45GB/100GB',
      activeConnections: '127'
    },
    {
      id: 12,
      timestamp: '2025-01-18 13:40:00',
      level: 'error',
      module: 'system',
      category: 'system',
      message: 'Interrupção temporária do serviço detectada',
      details: 'Downtime: 15 segundos, Causa: Sobrecarga de memória, Recuperação automática ativada',
      userName: 'Sistema',
      company: 'DataScope Corp',
      email: 'system@datascope.com',
      downtime: '15s',
      cause: 'memory_overload',
      autoRecovery: 'true'
    }
  ];

  // Aplicar filtros
  const filteredLogs = allLogs.filter(log => {
    const matchesLevel = levelFilter === 'all' || log.level === levelFilter;
    const matchesModule = moduleFilter === 'all' || log.module === moduleFilter;
    const matchesCategory = categoryFilter === 'all' || log.category === categoryFilter;
    const matchesUser = userFilter === '' || log.userName.toLowerCase().includes(userFilter.toLowerCase());
    const matchesCompany = companyFilter === '' || log.company.toLowerCase().includes(companyFilter.toLowerCase());
    const matchesEmail = emailFilter === '' || log.email.toLowerCase().includes(emailFilter.toLowerCase());
    
    return matchesLevel && matchesModule && matchesCategory && matchesUser && matchesCompany && matchesEmail;
  });

  const logStats = {
    total: allLogs.length,
    info: allLogs.filter(log => log.level === 'info').length,
    warning: allLogs.filter(log => log.level === 'warning').length,
    error: allLogs.filter(log => log.level === 'error').length,
    success: allLogs.filter(log => log.level === 'success').length,
    database: allLogs.filter(log => log.category === 'database').length,
    access: allLogs.filter(log => log.category === 'access').length,
    system: allLogs.filter(log => log.category === 'system').length,
    application: allLogs.filter(log => log.category === 'application').length
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
    setCategoryFilter('all');
    setUserFilter('');
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

      {/* Seção de Monitoramento em Tempo Real */}
      <Card className="border-l-4 border-l-green-500">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-green-500" />
            Status de Conectividade em Tempo Real
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <div>
                <p className="font-medium text-green-800">Banco de Dados</p>
                <p className="text-sm text-green-600">Conectado - 45ms</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
              <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
              <div>
                <p className="font-medium text-blue-800">API Externa</p>
                <p className="text-sm text-blue-600">Ativo - 120ms</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg">
              <div className="w-3 h-3 bg-orange-500 rounded-full animate-pulse"></div>
              <div>
                <p className="font-medium text-orange-800">Cache Redis</p>
                <p className="text-sm text-orange-600">Lento - 850ms</p>
              </div>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Última verificação:</span>
              <span className="font-medium">há 2 segundos</span>
            </div>
          </div>
        </CardContent>
      </Card>

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

      {/* Métricas de Performance e Uptime */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Server className="h-5 w-5 text-blue-500" />
              Métricas de Performance e Uptime
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">99.98%</div>
                <p className="text-sm text-blue-700 font-medium">Uptime</p>
                <p className="text-xs text-blue-600">Últimos 30 dias</p>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">127ms</div>
                <p className="text-sm text-green-700 font-medium">Tempo Resposta</p>
                <p className="text-xs text-green-600">Média atual</p>
              </div>
              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <div className="text-2xl font-bold text-orange-600">35%</div>
                <p className="text-sm text-orange-700 font-medium">CPU</p>
                <p className="text-xs text-orange-600">Uso atual</p>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">2.8GB</div>
                <p className="text-sm text-purple-700 font-medium">Memória</p>
                <p className="text-xs text-purple-600">de 8GB total</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Segunda linha de estatísticas - Categorias */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card className="cursor-pointer transition-all duration-200 hover:shadow-md hover:scale-105 active:scale-95">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Banco de Dados</CardTitle>
              <Database className="h-4 w-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">{logStats.database}</div>
              <p className="text-xs text-muted-foreground">Conectividade & Performance</p>
            </CardContent>
          </Card>

          <Card className="cursor-pointer transition-all duration-200 hover:shadow-md hover:scale-105 active:scale-95">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Acessos</CardTitle>
              <Shield className="h-4 w-4 text-indigo-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-indigo-600">{logStats.access}</div>
              <p className="text-xs text-muted-foreground">Login & Autenticação</p>
            </CardContent>
          </Card>

          <Card className="cursor-pointer transition-all duration-200 hover:shadow-md hover:scale-105 active:scale-95">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Sistema</CardTitle>
              <Server className="h-4 w-4 text-teal-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-teal-600">{logStats.system}</div>
              <p className="text-xs text-muted-foreground">Performance & Uptime</p>
            </CardContent>
          </Card>

          <Card className="cursor-pointer transition-all duration-200 hover:shadow-md hover:scale-105 active:scale-95">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Aplicação</CardTitle>
              <Activity className="h-4 w-4 text-cyan-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-cyan-600">{logStats.application}</div>
              <p className="text-xs text-muted-foreground">Funcionalidades</p>
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
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Categoria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  <SelectItem value="database">Banco de Dados</SelectItem>
                  <SelectItem value="access">Acessos</SelectItem>
                  <SelectItem value="system">Sistema</SelectItem>
                  <SelectItem value="application">Aplicação</SelectItem>
                </SelectContent>
              </Select>
              <Input
                 placeholder="Filtrar por usuário..."
                 value={userFilter}
                 onChange={(e) => setUserFilter(e.target.value)}
                 className="w-48"
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
                  setCategoryFilter('all');
                  setUserFilter('');
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
             {filteredLogs.map((log) => (
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