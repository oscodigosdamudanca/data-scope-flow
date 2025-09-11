import React from 'react';
import { QuestionTypesManager } from '@/features/admin/components/QuestionTypesManager';
import MainLayout from '@/components/layout/MainLayout';

export const QuestionTypesPage: React.FC = () => {
  return (
    <MainLayout>
      <QuestionTypesManager />
    </MainLayout>
  );
};

export default QuestionTypesPage;