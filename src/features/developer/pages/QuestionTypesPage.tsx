import React from 'react';
import { Link } from 'react-router-dom';
import MainLayout from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ArrowLeft, Plus } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

// Dados de exemplo para tipos de perguntas
const mockQuestionTypes = [
  { id: 1, name: 'Texto Curto', description: 'Resposta em texto com limite de caracteres', inputType: 'text' },
  { id: 2, name: 'Texto Longo', description: 'Resposta em texto sem limite de caracteres', inputType: 'textarea' },
  { id: 3, name: 'Múltipla Escolha', description: 'Seleção de uma opção entre várias', inputType: 'radio' },
  { id: 4, name: 'Caixas de Seleção', description: 'Seleção de múltiplas opções', inputType: 'checkbox' },
  { id: 5, name: 'Escala', description: 'Avaliação em escala numérica', inputType: 'range' }
];

const QuestionTypesPage = () => {
  return (
    <MainLayout>
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="icon" asChild>
              <Link to="/developer">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <h1 className="text-2xl font-bold">Tipos de Perguntas</h1>
          </div>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Novo Tipo
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Tipos de Perguntas Disponíveis</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">ID</TableHead>
                  <TableHead className="w-[200px]">Nome</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead className="w-[150px]">Tipo de Input</TableHead>
                  <TableHead className="w-[150px]">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockQuestionTypes.map((type) => (
                  <TableRow key={type.id}>
                    <TableCell>{type.id}</TableCell>
                    <TableCell>{type.name}</TableCell>
                    <TableCell>{type.description}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{type.inputType}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">Editar</Button>
                        <Button variant="outline" size="sm" className="text-red-500">Excluir</Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default QuestionTypesPage;