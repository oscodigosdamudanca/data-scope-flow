import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { Loader2, User, Lock, Camera, Save, Eye, EyeOff } from 'lucide-react';
import { BackToDashboard } from '@/components/core';
import MainLayout from '@/components/layout/MainLayout';
import { supabase } from '@/integrations/supabase/client';

interface ProfileFormData {
  display_name: string;
  email: string;
  phone: string;
}

interface PasswordFormData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

const ProfilePage: React.FC = () => {
  const { user, updateProfile } = useAuth();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(false);
  const [profileData, setProfileData] = useState<ProfileFormData>({
    display_name: '',
    email: '',
    phone: ''
  });
  
  const [passwordData, setPasswordData] = useState<PasswordFormData>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Carregar dados do perfil ao montar o componente
  useEffect(() => {
    if (user) {
      loadProfileData();
    }
  }, [user]);

  const loadProfileData = async () => {
    if (!user) return;
    
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (profile) {
        setProfileData({
          display_name: profile.display_name || '',
          email: user.email || '',
          phone: profile.phone || ''
        });
        setProfileImage(profile.avatar_url);
      } else {
        // Se não existe perfil, usar dados do usuário
        setProfileData({
          display_name: user.user_metadata?.display_name || user.user_metadata?.full_name || '',
          email: user.email || '',
          phone: user.user_metadata?.phone || ''
        });
      }
    } catch (error) {
      console.error('Erro ao carregar perfil:', error);
      toast({
        title: 'Erro ao carregar perfil',
        description: 'Não foi possível carregar os dados do perfil.',
        variant: 'destructive'
      });
    }
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) return;
    
    // Validações
    if (!profileData.display_name.trim()) {
      toast({
        title: 'Campo obrigatório',
        description: 'O nome é obrigatório.',
        variant: 'destructive'
      });
      return;
    }
    
    if (!profileData.email.trim()) {
      toast({
        title: 'Campo obrigatório',
        description: 'O e-mail é obrigatório.',
        variant: 'destructive'
      });
      return;
    }
    
    // Validação de e-mail
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(profileData.email)) {
      toast({
        title: 'E-mail inválido',
        description: 'Por favor, insira um e-mail válido.',
        variant: 'destructive'
      });
      return;
    }
    
    // Validação de telefone (opcional, mas se preenchido deve ter formato válido)
    if (profileData.phone && !/^\(\d{2}\)\s\d{4,5}-\d{4}$/.test(profileData.phone)) {
      toast({
        title: 'Telefone inválido',
        description: 'Use o formato (XX) XXXXX-XXXX.',
        variant: 'destructive'
      });
      return;
    }
    
    setLoading(true);
    
    try {
      // Atualizar perfil no Supabase
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          display_name: profileData.display_name,
          phone: profileData.phone,
          updated_at: new Date().toISOString()
        });

      if (profileError) throw profileError;

      // Atualizar e-mail se mudou
      if (profileData.email !== user.email) {
        const { error: emailError } = await supabase.auth.updateUser({
          email: profileData.email
        });
        
        if (emailError) throw emailError;
        
        toast({
          title: 'Verificação de e-mail enviada',
          description: 'Um e-mail de confirmação foi enviado para o novo endereço.',
        });
      }

      // Atualizar metadados do usuário
      const { error: metadataError } = await supabase.auth.updateUser({
        data: {
          display_name: profileData.display_name,
          phone: profileData.phone
        }
      });

      if (metadataError) throw metadataError;

      toast({
        title: 'Perfil atualizado',
        description: 'Suas informações foram salvas com sucesso.',
      });
      
      // Recarregar dados do perfil
      await loadProfileData();
      
    } catch (error: any) {
      console.error('Erro ao atualizar perfil:', error);
      toast({
        title: 'Erro ao salvar',
        description: error.message || 'Não foi possível salvar as alterações.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  // Função para validar força da senha
  const validatePasswordStrength = (password: string): { isValid: boolean; message: string } => {
    if (password.length < 8) {
      return { isValid: false, message: 'A senha deve ter pelo menos 8 caracteres' };
    }
    
    if (!/[A-Z]/.test(password)) {
      return { isValid: false, message: 'A senha deve conter pelo menos uma letra maiúscula' };
    }
    
    if (!/[a-z]/.test(password)) {
      return { isValid: false, message: 'A senha deve conter pelo menos uma letra minúscula' };
    }
    
    if (!/\d/.test(password)) {
      return { isValid: false, message: 'A senha deve conter pelo menos um número' };
    }
    
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      return { isValid: false, message: 'A senha deve conter pelo menos um caractere especial (!@#$%^&*(),.?":{}|<>)' };
    }
    
    return { isValid: true, message: 'Senha forte' };
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validações de senha
    if (!passwordData.currentPassword) {
      toast({
        title: 'Campo obrigatório',
        description: 'A senha atual é obrigatória.',
        variant: 'destructive'
      });
      return;
    }
    
    if (!passwordData.newPassword) {
      toast({
        title: 'Campo obrigatório',
        description: 'A nova senha é obrigatória.',
        variant: 'destructive'
      });
      return;
    }
    
    // Validar força da nova senha
    const passwordValidation = validatePasswordStrength(passwordData.newPassword);
    if (!passwordValidation.isValid) {
      toast({
        title: 'Senha não atende aos critérios',
        description: passwordValidation.message,
        variant: 'destructive'
      });
      return;
    }
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({
        title: 'Senhas não coincidem',
        description: 'A confirmação da senha não confere.',
        variant: 'destructive'
      });
      return;
    }
    
    if (passwordData.currentPassword === passwordData.newPassword) {
      toast({
        title: 'Senha inválida',
        description: 'A nova senha deve ser diferente da atual.',
        variant: 'destructive'
      });
      return;
    }
    
    setLoading(true);
    
    try {
      // Verificar senha atual fazendo login
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user?.email || '',
        password: passwordData.currentPassword
      });
      
      if (signInError) {
        throw new Error('Senha atual incorreta');
      }
      
      // Atualizar senha
      const { error: updateError } = await supabase.auth.updateUser({
        password: passwordData.newPassword
      });
      
      if (updateError) throw updateError;
      
      toast({
        title: 'Senha alterada',
        description: 'Sua senha foi alterada com sucesso.',
      });
      
      // Limpar formulário
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      
    } catch (error: any) {
      console.error('Erro ao alterar senha:', error);
      toast({
        title: 'Erro ao alterar senha',
        description: error.message || 'Não foi possível alterar a senha.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    
    // Validar tipo de arquivo
    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Arquivo inválido',
        description: 'Por favor, selecione uma imagem (JPG, PNG, GIF, WebP).',
        variant: 'destructive'
      });
      return;
    }
    
    // Validar tamanho (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: 'Arquivo muito grande',
        description: 'A imagem deve ter no máximo 5MB.',
        variant: 'destructive'
      });
      return;
    }
    
    setUploadingImage(true);
    
    try {
      const fileExt = file.name.split('.').pop();
      // Organizar arquivos por pasta do usuário para RLS
      const fileName = `${user.id}/${user.id}-${Date.now()}.${fileExt}`;
      
      // Verificar se o bucket existe antes de tentar o upload
      const { data: buckets, error: listError } = await supabase.storage.listBuckets();
      
      if (listError) {
        console.warn('Erro ao listar buckets:', listError);
      }
      
      const avatarBucketExists = buckets?.some(bucket => bucket.name === 'avatars');
      
      // Se o bucket não existir, mostrar erro específico
      if (!avatarBucketExists) {
        throw new Error('Bucket de avatares não configurado. Entre em contato com o suporte.');
      }
      
      // Fazer upload do arquivo
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true // Permitir substituir arquivo existente
        });
      
      if (uploadError) {
        console.error('Erro detalhado do upload:', uploadError);
        
        // Tratar erros específicos
        if (uploadError.message.includes('policy')) {
          throw new Error('Erro de permissão. Verifique se você está logado corretamente.');
        } else if (uploadError.message.includes('size')) {
          throw new Error('Arquivo muito grande. Máximo permitido: 5MB.');
        } else if (uploadError.message.includes('type')) {
          throw new Error('Tipo de arquivo não permitido. Use apenas imagens.');
        } else {
          throw new Error(`Erro no upload: ${uploadError.message}`);
        }
      }
      
      if (!uploadData) {
        throw new Error('Upload não retornou dados válidos');
      }
      
      // Obter URL pública da imagem
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);
      
      if (!publicUrl) {
        throw new Error('Não foi possível obter URL pública da imagem');
      }
      
      // Verificar se o perfil existe antes de fazer upsert
      const { data: existingProfile, error: checkError } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', user.id)
        .single();
      
      if (checkError && checkError.code !== 'PGRST116') {
        console.warn('Erro ao verificar perfil existente:', checkError);
      }
      
      // Preparar dados para atualização
      const profileUpdateData = {
        id: user.id,
        avatar_url: publicUrl,
        updated_at: new Date().toISOString()
      };
      
      // Se o perfil não existe, incluir dados básicos
      if (!existingProfile) {
        profileUpdateData.display_name = profileData.display_name || user.user_metadata?.display_name || user.user_metadata?.full_name || '';
        profileUpdateData.email = profileData.email || user.email || '';
        profileUpdateData.phone = profileData.phone || user.user_metadata?.phone || '';
        profileUpdateData.created_at = new Date().toISOString();
      }
      
      // Atualizar no banco de dados
      const { error: updateError } = await supabase
        .from('profiles')
        .upsert(profileUpdateData, {
          onConflict: 'id'
        });
      
      if (updateError) {
        throw new Error(`Erro ao atualizar perfil: ${updateError.message}`);
      }
      
      // Atualizar estado local
      setProfileImage(publicUrl);
      
      // Atualizar contexto de autenticação se disponível
      if (updateProfile) {
        await updateProfile({ avatar_url: publicUrl });
      }
      
      toast({
        title: 'Foto atualizada',
        description: 'Sua foto de perfil foi atualizada com sucesso.',
      });
      
    } catch (error: any) {
      console.error('Erro ao fazer upload:', error);
      toast({
        title: 'Erro no upload',
        description: error.message || 'Não foi possível fazer upload da imagem.',
        variant: 'destructive'
      });
    } finally {
      setUploadingImage(false);
      // Limpar o input file para permitir re-upload do mesmo arquivo
      if (e.target) {
        e.target.value = '';
      }
    }
  };

  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 11) {
      return numbers.replace(/(\d{2})(\d{4,5})(\d{4})/, '($1) $2-$3');
    }
    return value;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhone(e.target.value);
    setProfileData(prev => ({ ...prev, phone: formatted }));
  };

  const userInitials = profileData.full_name
    ? profileData.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : 'U';

  return (
    <MainLayout>
      <div className="container mx-auto p-6 max-w-4xl">
        <BackToDashboard />
        
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Meu Perfil</h1>
          <p className="text-muted-foreground">
            Gerencie suas informações pessoais e configurações de conta
          </p>
        </div>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Informações Pessoais
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center gap-2">
              <Lock className="h-4 w-4" />
              Segurança
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Informações Pessoais
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleProfileSubmit} className="space-y-6">
                  {/* Foto de Perfil */}
                  <div className="flex items-center gap-6">
                    <div className="relative">
                      <Avatar className="h-24 w-24">
                        <AvatarImage src={profileImage || undefined} />
                        <AvatarFallback className="text-lg">
                          {userInitials}
                        </AvatarFallback>
                      </Avatar>
                      <label className="absolute bottom-0 right-0 bg-primary text-primary-foreground rounded-full p-2 cursor-pointer hover:bg-primary/90 transition-colors">
                        <Camera className="h-4 w-4" />
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                          disabled={uploadingImage}
                        />
                      </label>
                      {uploadingImage && (
                        <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                          <Loader2 className="h-6 w-6 animate-spin text-white" />
                        </div>
                      )}
                    </div>
                    <div>
                      <h3 className="font-medium">Foto de Perfil</h3>
                      <p className="text-sm text-muted-foreground">
                        Clique no ícone da câmera para alterar sua foto
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Formatos aceitos: JPG, PNG. Máximo 5MB.
                      </p>
                    </div>
                  </div>

                  {/* Campos do Formulário */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="display_name">
                        Nome <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="display_name"
                        value={profileData.display_name}
                        onChange={(e) => setProfileData(prev => ({ ...prev, display_name: e.target.value }))}
                        placeholder="Seu nome"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">
                        E-mail <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        value={profileData.email}
                        onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                        placeholder="seu@email.com"
                        required
                      />
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="phone">Telefone</Label>
                      <Input
                        id="phone"
                        value={profileData.phone}
                        onChange={handlePhoneChange}
                        placeholder="(XX) XXXXX-XXXX"
                        maxLength={15}
                      />
                    </div>
                  </div>

                  <Button type="submit" disabled={loading} className="w-full md:w-auto">
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Salvando...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Salvar Alterações
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="h-5 w-5" />
                  Alterar Senha
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handlePasswordSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword">
                      Senha Atual <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative">
                      <Input
                        id="currentPassword"
                        type={showPasswords.current ? "text" : "password"}
                        value={passwordData.currentPassword}
                        onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                        placeholder="Digite sua senha atual"
                        required
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowPasswords(prev => ({ ...prev, current: !prev.current }))}
                      >
                        {showPasswords.current ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="newPassword">
                      Nova Senha <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative">
                      <Input
                        id="newPassword"
                        type={showPasswords.new ? "text" : "password"}
                        value={passwordData.newPassword}
                        onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                        placeholder="Digite sua nova senha"
                        required
                        minLength={8}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowPasswords(prev => ({ ...prev, new: !prev.new }))}
                      >
                        {showPasswords.new ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      A senha deve ter pelo menos 8 caracteres, incluindo maiúscula, minúscula, número e caractere especial
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">
                      Confirmar Nova Senha <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative">
                      <Input
                        id="confirmPassword"
                        type={showPasswords.confirm ? "text" : "password"}
                        value={passwordData.confirmPassword}
                        onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                        placeholder="Confirme sua nova senha"
                        required
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowPasswords(prev => ({ ...prev, confirm: !prev.confirm }))}
                      >
                        {showPasswords.confirm ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>

                  <Button type="submit" disabled={loading} className="w-full md:w-auto">
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Alterando...
                      </>
                    ) : (
                      <>
                        <Lock className="mr-2 h-4 w-4" />
                        Alterar Senha
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default ProfilePage;