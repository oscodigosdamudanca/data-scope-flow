import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { 
  Plus, 
  X, 
  Tag, 
  Edit2, 
  Trash2, 
  Save,
  Hash,
  Palette
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface Tag {
  id: string;
  name: string;
  color: string;
  description?: string;
  category: string;
  usageCount: number;
  createdAt: string;
}

interface TagsManagerProps {
  companyId: string;
  onTagsChange?: (tags: Tag[]) => void;
  className?: string;
}

const TagsManager: React.FC<TagsManagerProps> = ({
  companyId,
  onTagsChange,
  className = ''
}) => {
  // Estado para tags
  const [tags, setTags] = useState<Tag[]>([
    {
      id: '1',
      name: 'Hot Lead',
      color: 'bg-red-500',
      description: 'Lead com alta probabilidade de conversão',
      category: 'Prioridade',
      usageCount: 45,
      createdAt: '2024-01-15'
    },
    {
      id: '2',
      name: 'Qualificado',
      color: 'bg-green-500',
      description: 'Lead que passou pela qualificação inicial',
      category: 'Status',
      usageCount: 32,
      createdAt: '2024-01-10'
    },
    {
      id: '3',
      name: 'Empresa Grande',
      color: 'bg-blue-500',
      description: 'Empresa com mais de 500 funcionários',
      category: 'Segmento',
      usageCount: 18,
      createdAt: '2024-01-08'
    },
    {
      id: '4',
      name: 'Tecnologia',
      color: 'bg-purple-500',
      description: 'Setor de tecnologia',
      category: 'Setor',
      usageCount: 28,
      createdAt: '2024-01-05'
    },
    {
      id: '5',
      name: 'Follow-up',
      color: 'bg-yellow-500',
      description: 'Necessita acompanhamento',
      category: 'Ação',
      usageCount: 15,
      createdAt: '2024-01-03'
    }
  ]);

  // Estados para criação/edição
  const [isCreating, setIsCreating] = useState(false);
  const [editingTag, setEditingTag] = useState<Tag | null>(null);
  const [newTag, setNewTag] = useState({
    name: '',
    color: 'bg-blue-500',
    description: '',
    category: 'Personalizada'
  });

  // Cores disponíveis
  const availableColors = [
    { name: 'Azul', value: 'bg-blue-500', textColor: 'text-white' },
    { name: 'Verde', value: 'bg-green-500', textColor: 'text-white' },
    { name: 'Vermelho', value: 'bg-red-500', textColor: 'text-white' },
    { name: 'Roxo', value: 'bg-purple-500', textColor: 'text-white' },
    { name: 'Amarelo', value: 'bg-yellow-500', textColor: 'text-black' },
    { name: 'Rosa', value: 'bg-pink-500', textColor: 'text-white' },
    { name: 'Laranja', value: 'bg-orange-500', textColor: 'text-white' },
    { name: 'Cinza', value: 'bg-gray-500', textColor: 'text-white' },
    { name: 'Índigo', value: 'bg-indigo-500', textColor: 'text-white' },
    { name: 'Teal', value: 'bg-teal-500', textColor: 'text-white' }
  ];

  // Categorias disponíveis
  const categories = ['Prioridade', 'Status', 'Segmento', 'Setor', 'Ação', 'Personalizada'];

  // Funções de manipulação
  const handleCreateTag = () => {
    if (!newTag.name.trim()) return;

    const tag: Tag = {
      id: Date.now().toString(),
      name: newTag.name.trim(),
      color: newTag.color,
      description: newTag.description.trim(),
      category: newTag.category,
      usageCount: 0,
      createdAt: new Date().toISOString().split('T')[0]
    };

    const updatedTags = [...tags, tag];
    setTags(updatedTags);
    onTagsChange?.(updatedTags);
    
    // Reset form
    setNewTag({
      name: '',
      color: 'bg-blue-500',
      description: '',
      category: 'Personalizada'
    });
    setIsCreating(false);
  };

  const handleEditTag = (tag: Tag) => {
    setEditingTag(tag);
    setNewTag({
      name: tag.name,
      color: tag.color,
      description: tag.description || '',
      category: tag.category
    });
  };

  const handleUpdateTag = () => {
    if (!editingTag || !newTag.name.trim()) return;

    const updatedTags = tags.map(tag => 
      tag.id === editingTag.id 
        ? {
            ...tag,
            name: newTag.name.trim(),
            color: newTag.color,
            description: newTag.description.trim(),
            category: newTag.category
          }
        : tag
    );

    setTags(updatedTags);
    onTagsChange?.(updatedTags);
    setEditingTag(null);
    setNewTag({
      name: '',
      color: 'bg-blue-500',
      description: '',
      category: 'Personalizada'
    });
  };

  const handleDeleteTag = (tagId: string) => {
    const updatedTags = tags.filter(tag => tag.id !== tagId);
    setTags(updatedTags);
    onTagsChange?.(updatedTags);
  };

  const cancelEdit = () => {
    setEditingTag(null);
    setIsCreating(false);
    setNewTag({
      name: '',
      color: 'bg-blue-500',
      description: '',
      category: 'Personalizada'
    });
  };

  // Agrupar tags por categoria
  const tagsByCategory = tags.reduce((acc, tag) => {
    if (!acc[tag.category]) {
      acc[tag.category] = [];
    }
    acc[tag.category].push(tag);
    return acc;
  }, {} as Record<string, Tag[]>);

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Tag className="h-5 w-5" />
            Gerenciar Tags
          </CardTitle>
          <Button 
            onClick={() => setIsCreating(true)}
            size="sm"
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Nova Tag
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {/* Formulário de Criação/Edição */}
        {(isCreating || editingTag) && (
          <Card className="mb-6 border-dashed">
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="tagName">Nome da Tag</Label>
                    <Input
                      id="tagName"
                      placeholder="Ex: Hot Lead, Qualificado..."
                      value={newTag.name}
                      onChange={(e) => setNewTag({ ...newTag, name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="tagCategory">Categoria</Label>
                    <Select 
                      value={newTag.category} 
                      onValueChange={(value) => setNewTag({ ...newTag, category: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione uma categoria" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map(category => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="tagDescription">Descrição (opcional)</Label>
                  <Input
                    id="tagDescription"
                    placeholder="Descreva quando usar esta tag..."
                    value={newTag.description}
                    onChange={(e) => setNewTag({ ...newTag, description: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Cor da Tag</Label>
                  <div className="flex flex-wrap gap-2">
                    {availableColors.map(color => (
                      <button
                        key={color.value}
                        type="button"
                        className={`w-8 h-8 rounded-full ${color.value} border-2 ${
                          newTag.color === color.value ? 'border-gray-800' : 'border-gray-300'
                        } hover:scale-110 transition-transform`}
                        onClick={() => setNewTag({ ...newTag, color: color.value })}
                        title={color.name}
                      />
                    ))}
                  </div>
                </div>

                {/* Preview da Tag */}
                <div className="space-y-2">
                  <Label>Preview</Label>
                  <div className="flex items-center gap-2">
                    <Badge className={`${newTag.color} ${availableColors.find(c => c.value === newTag.color)?.textColor}`}>
                      {newTag.name || 'Nome da Tag'}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      {newTag.category}
                    </span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button 
                    onClick={editingTag ? handleUpdateTag : handleCreateTag}
                    size="sm"
                    disabled={!newTag.name.trim()}
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {editingTag ? 'Atualizar' : 'Criar'} Tag
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={cancelEdit}
                    size="sm"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Cancelar
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Lista de Tags por Categoria */}
        <div className="space-y-6">
          {Object.entries(tagsByCategory).map(([category, categoryTags]) => (
            <div key={category}>
              <div className="flex items-center gap-2 mb-3">
                <Hash className="h-4 w-4 text-muted-foreground" />
                <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
                  {category}
                </h3>
                <div className="flex-1 h-px bg-border" />
                <Badge variant="secondary" className="text-xs">
                  {categoryTags.length}
                </Badge>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {categoryTags.map(tag => {
                  const colorConfig = availableColors.find(c => c.value === tag.color);
                  
                  return (
                    <Card key={tag.id} className="p-4 hover:shadow-md transition-shadow">
                      <div className="space-y-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <Badge className={`${tag.color} ${colorConfig?.textColor} mb-2`}>
                              {tag.name}
                            </Badge>
                            {tag.description && (
                              <p className="text-xs text-muted-foreground">
                                {tag.description}
                              </p>
                            )}
                          </div>
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditTag(tag)}
                              className="h-8 w-8 p-0"
                            >
                              <Edit2 className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteTag(tag.id)}
                              className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>Usado {tag.usageCount}x</span>
                          <span>Criado em {new Date(tag.createdAt).toLocaleDateString('pt-BR')}</span>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Estatísticas */}
        <Card className="mt-6 bg-muted/50">
          <CardContent className="pt-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-primary">{tags.length}</div>
                <div className="text-xs text-muted-foreground">Total de Tags</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">
                  {Object.keys(tagsByCategory).length}
                </div>
                <div className="text-xs text-muted-foreground">Categorias</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-600">
                  {tags.reduce((sum, tag) => sum + tag.usageCount, 0)}
                </div>
                <div className="text-xs text-muted-foreground">Usos Totais</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-600">
                  {tags.filter(tag => tag.usageCount > 0).length}
                </div>
                <div className="text-xs text-muted-foreground">Tags Ativas</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </CardContent>
    </Card>
  );
};

export default TagsManager;