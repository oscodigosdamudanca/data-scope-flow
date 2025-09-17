import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import type { Enums } from '@/integrations/supabase/types';

type AppRole = Enums<'app_role'>;

// Note: The app_role enum should include: 'developer' | 'organizer' | 'admin' | 'interviewer' | 'fair_organizer'

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  userRole: AppRole | null;
  signUp: (email: string, password: string, displayName?: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<AppRole | null>(null);

  useEffect(() => {
  const ensureDefaultUserRole = async (userId: string) => {
    try {
      // Tenta inserir o papel 'organizer' para novos usuários (mais apropriado que developer)
      const { error: insertError } = await supabase
        .from('user_roles')
        .insert([{ user_id: userId, role: 'organizer' }]);

      if (insertError && insertError.code !== '23505') { // 23505 é violation de unique constraint
        console.error('Error creating default role:', insertError);
        // Se falhar, define papel padrão localmente
        setUserRole('organizer');
        return;
      }

      // Agora busca o papel atual (deve existir)
      await fetchUserRole(userId);
    } catch (error) {
      console.error('Error in ensureDefaultUserRole:', error);
      // Define papel padrão em caso de erro
      setUserRole('organizer');
    }
  };

  const fetchUserRole = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          console.log('No role found for user, attempting to create default role');
          // Chama ensureDefaultUserRole de forma assíncrona
          setTimeout(() => {
            ensureDefaultUserRole(userId);
          }, 0);
          return;
        }
        console.error('Error fetching user role:', error);
        setUserRole(null);
        return;
      }
      
      if (data) {
        setUserRole(data.role as AppRole);
      }
    } catch (error) {
      console.error('Error in fetchUserRole:', error);
      setUserRole(null);
    }
  };

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state change:', event, session);
        
        // Handle auth errors by clearing invalid tokens
        if (event === 'TOKEN_REFRESHED' && !session) {
          console.log('Token refresh failed, clearing storage');
          // Limpar todos os tokens de autenticação
          localStorage.removeItem('supabase.auth.token');
          const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
          if (supabaseUrl) {
            const storageKey = `sb-${supabaseUrl.split('//')[1]}-auth-token`;
            localStorage.removeItem(storageKey);
          }
          // Forçar redirecionamento para a página de login após limpar tokens
          window.location.href = '/login';
        }
        
        setSession(session);
        const currentUser = session?.user ?? null;
        setUser(currentUser);

        if (currentUser) {
          fetchUserRole(currentUser.id);
          if (event === 'SIGNED_IN') {
            setTimeout(() => {
              createOrUpdateProfile(currentUser);
            }, 0);
          }
        } else {
          setUserRole(null);
        }
        
        setLoading(false);
      }
    );

    supabase.auth.getSession().then(async ({ data: { session }, error }) => {
      if (error) {
        console.error('Error getting session:', error);
        // Clear potentially corrupted auth data
        localStorage.removeItem('supabase.auth.token');
        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
        if (supabaseUrl) {
          const storageKey = `sb-${supabaseUrl.split('//')[1]}-auth-token`;
          localStorage.removeItem(storageKey);
        }
        setSession(null);
        setUser(null);
        setUserRole(null);
        
        // Redirecionar para login se o erro for relacionado a token inválido
        if (error.message?.includes('Invalid Refresh Token') || 
            error.message?.includes('JWT expired') ||
            error.message?.includes('Invalid JWT')) {
          window.location.href = '/login';
        }
      } else {
        setSession(session);
        const currentUser = session?.user ?? null;
        setUser(currentUser);

        if (currentUser) {
          await fetchUserRole(currentUser.id);
        }
      }
      
      setLoading(false);
    }).catch((error) => {
      console.error('Failed to get session:', error);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const createOrUpdateProfile = async (user: User) => {
    try {
      // Check if profile exists
      const { data: profile, error: fetchError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') {
        console.error('Error fetching profile:', fetchError);
        return;
      }

      // If profile doesn't exist, create it
      if (!profile) {
        const displayName = user.user_metadata?.display_name || 
                          user.user_metadata?.full_name || 
                          user.email?.split('@')[0] || 
                          'Usuário';

        const { error: insertError } = await supabase
          .from('profiles')
          .insert([
            {
              id: user.id,
              display_name: displayName,
              phone: user.user_metadata?.phone || null,
            }
          ]);

        if (insertError) {
          console.error('Error creating profile:', insertError);
        }
      }
    } catch (error) {
      console.error('Error in createOrUpdateProfile:', error);
    }
  };

  const signUp = async (email: string, password: string, displayName?: string) => {
    const redirectUrl = `${window.location.origin}/`;
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          display_name: displayName || email.split('@')[0],
        }
      }
    });
    
    return { error };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    return { error };
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut({ scope: 'global' });
      setUserRole(null);
      // Clear localStorage to prevent auth issues
      localStorage.removeItem('supabase.auth.token');
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      if (supabaseUrl) {
        const storageKey = `sb-${supabaseUrl.split('//')[1]}-auth-token`;
        localStorage.removeItem(storageKey);
      }
      // Limpar qualquer outro dado de sessão que possa estar armazenado
      Object.keys(localStorage).forEach(key => {
        if (key.includes('supabase') || key.includes('sb-')) {
          localStorage.removeItem(key);
        }
      });
    } catch (error) {
      console.error('Error during sign out:', error);
      // Forçar redirecionamento para login em caso de erro
      window.location.href = '/login';
    }
  };

  const value = {
    user,
    session,
    loading,
    userRole,
    signUp,
    signIn,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};