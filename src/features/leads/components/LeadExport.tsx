import React, { useState } from 'react';
import { Download, FileSpreadsheet, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import { Lead } from '@/types/leads';

interface LeadExportProps {
  leads: Lead[];
  filteredLeads?: Lead[];
  className?: string;
}

export const LeadExport: React.FC<LeadExportProps> = ({
  leads,
  filteredLeads,
  className = ''
}) => {
  const [isExporting, setIsExporting] = useState(false);
  const { toast } = useToast();

  const dataToExport = filteredLeads || leads;

  const formatLeadForExport = (lead: Lead) => ({
    'ID': lead.id,
    'Nome': lead.name,
    'Email': lead.email,
    'Telefone': lead.phone || '',
    'Empresa': lead.company || '',
    'Cargo': lead.position || '',
    'Status': getStatusLabel(lead.status),
    'Fonte': getSourceLabel(lead.source),
    'Pontuação': lead.score || 0,
    'Data de Criação': new Date(lead.created_at).toLocaleDateString('pt-BR'),
    'Última Atualização': new Date(lead.updated_at).toLocaleDateString('pt-BR'),
    'Observações': lead.notes || ''
  });

  const getStatusLabel = (status: string) => {
    const statusMap: Record<string, string> = {
      'new': 'Novo',
      'contacted': 'Contatado',
      'qualified': 'Qualificado',
      'converted': 'Convertido',
      'lost': 'Perdido'
    };
    return statusMap[status] || status;
  };

  const getSourceLabel = (source: string) => {
    const sourceMap: Record<string, string> = {
      'website': 'Website',
      'social_media': 'Redes Sociais',
      'email_campaign': 'Campanha de Email',
      'referral': 'Indicação',
      'event': 'Evento',
      'other': 'Outro'
    };
    return sourceMap[source] || source;
  };

  const exportToCSV = async () => {
    setIsExporting(true);
    try {
      const formattedData = dataToExport.map(formatLeadForExport);
      
      if (formattedData.length === 0) {
        toast({
          title: 'Nenhum dado para exportar',
          description: 'Não há leads para exportar com os filtros aplicados.',
          variant: 'destructive'
        });
        return;
      }

      const headers = Object.keys(formattedData[0]);
      const csvContent = [
        headers.join(','),
        ...formattedData.map(row => 
          headers.map(header => {
            const value = row[header as keyof typeof row];
            // Escapar aspas duplas e envolver em aspas se contém vírgula
            const stringValue = String(value || '').replace(/"/g, '""');
            return stringValue.includes(',') ? `"${stringValue}"` : stringValue;
          }).join(',')
        )
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      
      link.setAttribute('href', url);
      link.setAttribute('download', `leads_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      URL.revokeObjectURL(url);

      toast({
        title: 'Exportação concluída',
        description: `${formattedData.length} leads exportados para CSV com sucesso.`
      });
    } catch (error) {
      console.error('Erro ao exportar CSV:', error);
      toast({
        title: 'Erro na exportação',
        description: 'Ocorreu um erro ao exportar os dados para CSV.',
        variant: 'destructive'
      });
    } finally {
      setIsExporting(false);
    }
  };

  const exportToExcel = async () => {
    setIsExporting(true);
    try {
      // Para uma implementação completa do Excel, seria necessário usar uma biblioteca como xlsx
      // Por enquanto, vamos usar CSV com extensão .xlsx como fallback
      const formattedData = dataToExport.map(formatLeadForExport);
      
      if (formattedData.length === 0) {
        toast({
          title: 'Nenhum dado para exportar',
          description: 'Não há leads para exportar com os filtros aplicados.',
          variant: 'destructive'
        });
        return;
      }

      // Criar conteúdo CSV para Excel
      const headers = Object.keys(formattedData[0]);
      const csvContent = [
        headers.join('\t'), // Usar tab como separador para melhor compatibilidade com Excel
        ...formattedData.map(row => 
          headers.map(header => {
            const value = row[header as keyof typeof row];
            return String(value || '');
          }).join('\t')
        )
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'application/vnd.ms-excel;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      
      link.setAttribute('href', url);
      link.setAttribute('download', `leads_${new Date().toISOString().split('T')[0]}.xls`);
      link.style.visibility = 'hidden';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      URL.revokeObjectURL(url);

      toast({
        title: 'Exportação concluída',
        description: `${formattedData.length} leads exportados para Excel com sucesso.`
      });
    } catch (error) {
      console.error('Erro ao exportar Excel:', error);
      toast({
        title: 'Erro na exportação',
        description: 'Ocorreu um erro ao exportar os dados para Excel.',
        variant: 'destructive'
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          size="sm" 
          disabled={isExporting || dataToExport.length === 0}
          className={className}
        >
          <Download className="h-4 w-4 mr-2" />
          {isExporting ? 'Exportando...' : 'Exportar'}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={exportToCSV} disabled={isExporting}>
          <FileText className="h-4 w-4 mr-2" />
          Exportar como CSV
          <span className="ml-auto text-xs text-muted-foreground">
            {dataToExport.length} {dataToExport.length === 1 ? 'lead' : 'leads'}
          </span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={exportToExcel} disabled={isExporting}>
          <FileSpreadsheet className="h-4 w-4 mr-2" />
          Exportar como Excel
          <span className="ml-auto text-xs text-muted-foreground">
            {dataToExport.length} {dataToExport.length === 1 ? 'lead' : 'leads'}
          </span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default LeadExport;