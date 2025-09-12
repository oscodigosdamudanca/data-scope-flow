import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Constants, type Enums } from '@/integrations/supabase/types';
import { X } from 'lucide-react';
import type { CreateUserData, UpdateUserData, UserWithRoles, AppRole } from '../hooks/useUsers';

type AppRoleType = Enums<'app_role'>;

interface UserFormData {
  email: string;
  password?: string;
  display_name: string;
  phone: string;
  roles: AppRole[];
}

interface UserFormProps {
  user?: UserWithRoles;
  onSubmit: (userData: CreateUserData | { userId: string; userData: UpdateUserData }) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

const ROLE_LABELS: Record<AppRole, string> = {
  developer: 'Desenvolvedor',
  organizer: 'Organizador',
  admin: 'Administrador',
  interviewer: 'Entrevistador',
  fair_organizer: 'Organizador da Feira'
};

const ROLE_DESCRIPTIONS: Record<AppRole, string> = {
  developer: 'Acesso total ao sistema, incluindo configurações avançadas',
  organizer: 'Pode organizar entrevistas e gerenciar processos seletivos',
  admin: 'Administra empresas e usuários dentro do escopo permitido',
  interviewer: 'Realiza entrevistas e avalia candidatos',
  fair_organizer: 'Gerencia feedback da feira e pesquisas personalizadas'
};

export const UserForm: React.FC<UserFormProps> = ({
  user,
  onSubmit,
  onCancel,
  isLoading = false
}) => {
  const [formData, setFormData] = useState<UserFormData>({
    email: user?.email || '',
    password: '',
    display_name: user?.display_name || '',
    phone: user?.phone || '',
    roles: user?.roles || []
  });

  const [errors, setErrors] = useState<Partial<Record<keyof UserFormData, string>>>({});

  useEffect(() => {
    if (user) {
      setFormData({
        email: user.email || '',
        password: '',
        display_name: user.display_name || '',
        phone: user.phone || '',
        roles: user.roles || []
      });
    }
  }, [user]);

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof UserFormData, string>> = {};

    if (!formData.email.trim()) {
      newErrors.email = 'Email é obrigatório';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email inválido';
    }

    if (!formData.display_name.trim()) {
      newErrors.display_name = 'Nome de exibição é obrigatório';
    }

    if (formData.phone && !/^\+?[1-9]\d{1,14}$/.test(formData.phone.replace(/\s/g, ''))) {
      newErrors.phone = 'Telefone inválido';
    }

    if (formData.roles.length === 0) {
      newErrors.roles = 'Pelo menos um papel deve ser selecionado';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      if (user) {
        // Modo edição
        await onSubmit({
          userId: user.id,
          userData: {
            display_name: formData.display_name.trim() || undefined,
            phone: formData.phone.trim() || undefined,
            roles: formData.roles
          }
        });
      } else {
        // Modo criação
        if (!formData.password?.trim()) {
          return;
        }
        await onSubmit({
          email: formData.email.trim(),
          password: formData.password.trim(),
          display_name: formData.display_name.trim() || undefined,
          phone: formData.phone.trim() || undefined,
          roles: formData.roles
        });
      }
    } catch (error) {
      // Erro já tratado no hook
    }
  };

  const handleRoleChange = (role: AppRole, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      roles: checked 
        ? [...prev.roles, role]
        : prev.roles.filter(r => r !== role)
    }));
    
    // Limpar erro de roles se algum papel for selecionado
    if (checked && errors.roles) {
      setErrors(prev => ({ ...prev, roles: undefined }));
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>
          {user ? 'Editar Usuário' : 'Novo Usuário'}
        </CardTitle>
        <Button
          variant="ghost"
          size="sm"
          onClick={onCancel}
          disabled={isLoading}
        >
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              disabled={!!user || isLoading}
              className={errors.email ? 'border-red-500' : ''}
            />
            {errors.email && (
              <p className="text-sm text-red-500">{errors.email}</p>
            )}
            {user && (
              <p className="text-sm text-gray-500">O email não pode ser alterado após a criação</p>
            )}
          </div>

          {!user && (
            <div className="space-y-2">
              <Label htmlFor="password">Senha *</Label>
              <Input
                id="password"
                type="password"
                value={formData.password || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                disabled={isLoading}
                className={errors.password ? 'border-red-500' : ''}
              />
              {errors.password && (
                <p className="text-sm text-red-500">{errors.password}</p>
              )}
            </div>
          )}

          {/* Nome de Exibição */}
          <div className="space-y-2">
            <Label htmlFor="display_name">Nome de Exibição *</Label>
            <Input
              id="display_name"
              value={formData.display_name}
              onChange={(e) => setFormData(prev => ({ ...prev, display_name: e.target.value }))}
              disabled={isLoading}
              className={errors.display_name ? 'border-red-500' : ''}
            />
            {errors.display_name && (
              <p className="text-sm text-red-500">{errors.display_name}</p>
            )}
          </div>

          {/* Telefone */}
          <div className="space-y-2">
            <Label htmlFor="phone">Telefone</Label>
            <Input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
              disabled={isLoading}
              placeholder="+55 11 99999-9999"
              className={errors.phone ? 'border-red-500' : ''}
            />
            {errors.phone && (
              <p className="text-sm text-red-500">{errors.phone}</p>
            )}
          </div>

          {/* Papéis */}
          <div className="space-y-4">
            <div>
              <Label>Papéis do Sistema *</Label>
              {errors.roles && (
                <p className="text-sm text-red-500 mt-1">{errors.roles}</p>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Constants.public.Enums.app_role.map((role) => (
                <div key={role} className="flex items-start space-x-3 p-3 border rounded-lg">
                  <Checkbox
                    id={role}
                    checked={formData.roles.includes(role)}
                    onCheckedChange={(checked) => handleRoleChange(role, checked as boolean)}
                    disabled={isLoading}
                  />
                  <div className="flex-1">
                    <Label 
                      htmlFor={role} 
                      className="font-medium cursor-pointer"
                    >
                      {ROLE_LABELS[role]}
                    </Label>
                    <p className="text-sm text-gray-600 mt-1">
                      {ROLE_DESCRIPTIONS[role]}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Botões */}
          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? 'Salvando...' : (user ? 'Atualizar' : 'Criar')}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};