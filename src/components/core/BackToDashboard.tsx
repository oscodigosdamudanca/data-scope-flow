import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Home } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BackToDashboardProps {
  /** Variante do botão */
  variant?: 'default' | 'outline' | 'ghost' | 'link';
  /** Tamanho do botão */
  size?: 'default' | 'sm' | 'lg' | 'icon';
  /** Mostrar apenas ícone */
  iconOnly?: boolean;
  /** Texto customizado do botão */
  text?: string;
  /** Classes CSS adicionais */
  className?: string;
  /** Posição do botão na página */
  position?: 'header' | 'floating' | 'inline';
  /** Callback executado antes da navegação */
  onBeforeNavigate?: () => void | Promise<void>;
}

const BackToDashboard: React.FC<BackToDashboardProps> = ({
  variant = 'outline',
  size = 'default',
  iconOnly = false,
  text = 'Voltar ao Dashboard',
  className,
  position = 'inline',
  onBeforeNavigate
}) => {
  const navigate = useNavigate();

  const handleClick = async () => {
    try {
      if (onBeforeNavigate) {
        await onBeforeNavigate();
      }
      navigate('/');
    } catch (error) {
      console.error('Erro ao navegar para o dashboard:', error);
      // Navega mesmo se houver erro no callback
      navigate('/');
    }
  };

  const getPositionClasses = () => {
    switch (position) {
      case 'floating':
        return 'fixed top-2 left-2 sm:top-4 sm:left-4 z-50 shadow-lg';
      case 'header':
        return 'flex-shrink-0';
      default:
        return '';
    }
  };

  const buttonContent = iconOnly ? (
    <>
      <ArrowLeft className="h-4 w-4" />
      <span className="sr-only">{text}</span>
    </>
  ) : (
    <>
      <ArrowLeft className="h-4 w-4 mr-2" />
      <span className="hidden sm:inline">{text}</span>
      <span className="sm:hidden sr-only">{text}</span>
    </>
  );

  return (
    <Button
      variant={variant}
      size={iconOnly ? 'icon' : size}
      onClick={handleClick}
      className={cn(
        getPositionClasses(),
        'transition-all duration-200 hover:scale-105',
        className
      )}
      title={iconOnly ? text : undefined}
    >
      {buttonContent}
    </Button>
  );
};

export default BackToDashboard;

// Componente alternativo com ícone de casa
export const HomeDashboardButton: React.FC<Omit<BackToDashboardProps, 'iconOnly'>> = (props) => {
  const navigate = useNavigate();

  const handleClick = async () => {
    try {
      if (props.onBeforeNavigate) {
        await props.onBeforeNavigate();
      }
      navigate('/');
    } catch (error) {
      console.error('Erro ao navegar para o dashboard:', error);
      navigate('/');
    }
  };

  return (
    <Button
      variant={props.variant || 'ghost'}
      size="icon"
      onClick={handleClick}
      className={cn(
        props.position === 'floating' ? 'fixed top-2 right-2 sm:top-4 sm:right-4 z-50 shadow-lg' : '',
        'transition-all duration-200 hover:scale-105',
        props.className
      )}
      title={props.text || 'Ir para Dashboard'}
    >
      <Home className="h-4 w-4" />
      <span className="sr-only">{props.text || 'Ir para Dashboard'}</span>
    </Button>
  );
};