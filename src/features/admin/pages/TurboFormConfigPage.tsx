import React from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { BackToDashboard } from '@/components/core';
import TurboFormConfig from '../components/TurboFormConfig';

const TurboFormConfigPage: React.FC = () => {
  return (
    <MainLayout>
      <div className="container mx-auto p-4">
        <div className="flex items-center gap-4 mb-6">
          <BackToDashboard variant="outline" position="header" />
        </div>
        <TurboFormConfig />
      </div>
    </MainLayout>
  );
};

export default TurboFormConfigPage;