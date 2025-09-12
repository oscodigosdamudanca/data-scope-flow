import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Code, Plus, Edit, Trash2, Type } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const QuestionTypes = () => {
  const questionTypes = [
    {
      id: 1,
      name: 'Texto Curto',
      description: 'Campo de texto simples para respostas breves',
      component: 'TextInput',
      validation: 'string',
      active: true
    },
    {
      id: 2,
      name: 'Texto Longo',
      description: 'Área de texto para respostas extensas',
      component: 'TextArea',
      validation: 'string',
      active: true
    },
    {
      id: 3,
      name: 'Múltipla Escolha',
      description: 'Seleção única entre várias opções',
      component: 'RadioGroup',
      validation: 'enum',
      active: true
    },
    {
      id: 4,
      name: 'Seleção Múltipla',
      description: 'Permite selecionar várias opções',
      component: 'CheckboxGroup',
      validation: 'array',
      active: true
    },
    {
      id: 5,
      name: 'Escala Numérica',
      description: 'Avaliação em escala de 1 a 10',
      component: 'NumberScale',
      validation: 'number',
      active: true
    }
  ];

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tipos de Pergunta</h1>
          <p className="text-muted-foreground">
            Gerencie os tipos de pergunta disponíveis no sistema
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Novo Tipo
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Tipos Ativos
            </CardTitle>
            <Type className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{questionTypes.filter(t => t.active).length}</div>
            <p className="text-xs text-muted-foreground">
              Disponíveis para uso
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total de Tipos
            </CardTitle>
            <Code className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{questionTypes.length}</div>
            <p className="text-xs text-muted-foreground">
              Tipos cadastrados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Componentes
            </CardTitle>
            <Code className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{new Set(questionTypes.map(t => t.component)).size}</div>
            <p className="text-xs text-muted-foreground">
              Componentes únicos
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Tipos de Pergunta Disponíveis</CardTitle>
          <CardDescription>
            Configure os tipos de pergunta que podem ser usados nas pesquisas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {questionTypes.map((type) => (
              <div key={type.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold">{type.name}</h3>
                    <Badge variant={type.active ? "default" : "secondary"}>
                      {type.active ? "Ativo" : "Inativo"}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">{type.description}</p>
                  <div className="flex gap-4 text-xs text-muted-foreground">
                    <span><strong>Componente:</strong> {type.component}</span>
                    <span><strong>Validação:</strong> {type.validation}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default QuestionTypes;