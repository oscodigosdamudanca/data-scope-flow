import React from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Tag } from 'lucide-react';
import TagsManager from '../components/TagsManager';
import { useAuth } from '@/contexts/AuthContext';

export function TagsManagerPage() {
  const navigate = useNavigate();
  const { userRole } = useAuth();

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate(userRole === 'interviewer' ? '/leads/capture' : '/leads')}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Voltar
            </Button>
          </div>
          
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
                <Tag className="w-8 h-8 text-orange-600" />
                Gerenciar Tags
              </h1>
              <p className="text-gray-600">
                Crie, edite e organize tags para categorizar seus leads de forma eficiente
              </p>
            </div>
          </div>
        </div>

        {/* Tags Manager Component */}
        <TagsManager 
          companyId="company-1" // Em produção, isso viria do contexto da empresa
          className="mb-8"
        />
      </div>
    </MainLayout>
  );
};

export default TagsManagerPage;