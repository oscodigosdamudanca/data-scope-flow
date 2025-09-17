import React from 'react';
import LeadFormTest from '@/features/leads/components/LeadFormTest';
import MainLayout from '@/components/layout/MainLayout';

export default function TestPage() {
  return (
    <MainLayout>
      <div className="container mx-auto py-6">
        <LeadFormTest />
      </div>
    </MainLayout>
  );
}