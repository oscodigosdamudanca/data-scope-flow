import React from 'react';
import { Link } from 'react-router-dom';
import MainLayout from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Info, AlertTriangle, CheckCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

// Tipos de logs
type LogLevel = 'info' | 'warning' | 'success';
type LogEntry = {
  id: string;
  timestamp: string;
  level: LogLevel;
  message: string;
  user: string;
  action: string;
};

const SystemLogsPage = () => {
  // Dados mockados para demonstração - exatamente 3 logs
  const logs: LogEntry[] = [
    {
      id: '1',
      timestamp: '2025-09-16 14:32:45',
      level: 'info',
      message: 'Usuário fez login no sistema',
      user: 'admin@example.com',
      action: 'LOGIN'
    },
    {
      id: '2',
      timestamp: '2025-09-16 14:35:12',
      level: 'success',
      message: 'Lead cadastrado com sucesso',
      user: 'entrevistador@example.com',
      action: 'CREATE'
    },
    {
      id: '3',
      timestamp: '2025-09-16 14:40:23',
      level: 'warning',
      message: 'Tentativa de acesso a recurso não autorizado',
      user: 'entrevistador@example.com',
      action: 'ACCESS'
    }
  ];

  // Renderizar ícone baseado no nível do log
  const getLevelIcon = (level: LogLevel) => {
    switch (level) {
      case 'info':
        return <Info className="h-4 w-4 text-blue-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-amber-500" />;
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      default:
        return <Info className="h-4 w-4" />;
    }
  };

  // Renderizar badge baseado no nível do log
  const getLevelBadge = (level: LogLevel) => {
    switch (level) {
      case 'info':
        return <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-300">Info</Badge>;
      case 'warning':
        return <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-300">Aviso</Badge>;
      case 'success':
        return <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">Sucesso</Badge>;
      default:
        return <Badge variant="outline">Desconhecido</Badge>;
    }
  };

  return (
    <MainLayout>
      <div className="flex flex-col gap-6 p-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" asChild>
            <Link to="/developer">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-2xl font-bold">Logs do Sistema</h1>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Registros de Atividade</CardTitle>
            <CardDescription>
              Visualize os logs de atividade do sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[100px]">Nível</TableHead>
                    <TableHead className="w-[180px]">Timestamp</TableHead>
                    <TableHead>Mensagem</TableHead>
                    <TableHead className="w-[150px]">Usuário</TableHead>
                    <TableHead className="w-[120px]">Ação</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {logs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getLevelIcon(log.level)}
                          {getLevelBadge(log.level)}
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-xs">{log.timestamp}</TableCell>
                      <TableCell>{log.message}</TableCell>
                      <TableCell>{log.user}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">{log.action}</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default SystemLogsPage;