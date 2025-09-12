import React from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { SurveyManager } from '../components';

const SurveysPage: React.FC = () => {
  return (
    <MainLayout>
      <SurveyManager />
    </MainLayout>
  );
};

export default SurveysPage;