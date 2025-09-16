import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Filter, RefreshCw } from 'lucide-react';

interface ReportFiltersProps {
  onFilterChange?: (filters: any) => void;
  onRefresh?: () => void;
}

export const ReportFilters: React.FC<ReportFiltersProps> = ({ onFilterChange, onRefresh }) => {
  return (
    <Card className="mb-4">
      <CardContent className="pt-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-end">
          <div className="flex-1 space-y-2">
            <Label htmlFor="date-range">Período</Label>
            <Select defaultValue="last-30-days">
              <SelectTrigger id="date-range">
                <SelectValue placeholder="Selecione o período" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="today">Hoje</SelectItem>
                <SelectItem value="yesterday">Ontem</SelectItem>
                <SelectItem value="last-7-days">Últimos 7 dias</SelectItem>
                <SelectItem value="last-30-days">Últimos 30 dias</SelectItem>
                <SelectItem value="this-month">Este mês</SelectItem>
                <SelectItem value="last-month">Mês passado</SelectItem>
                <SelectItem value="custom">Personalizado</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex-1 space-y-2">
            <Label htmlFor="source">Fonte</Label>
            <Select defaultValue="all">
              <SelectTrigger id="source">
                <SelectValue placeholder="Selecione a fonte" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as fontes</SelectItem>
                <SelectItem value="form">Formulário</SelectItem>
                <SelectItem value="api">API</SelectItem>
                <SelectItem value="import">Importação</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex-1 space-y-2">
            <Label htmlFor="search">Busca</Label>
            <Input id="search" placeholder="Buscar por nome, email..." />
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" size="icon" onClick={onRefresh}>
              <RefreshCw className="h-4 w-4" />
            </Button>
            <Button variant="default" onClick={() => onFilterChange && onFilterChange({})}>
              <Filter className="h-4 w-4 mr-2" />
              Filtrar
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};