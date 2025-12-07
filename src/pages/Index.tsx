import React from 'react';
import Header from '@/components/Header';
import FloatingHeader from '@/components/FloatingHeader';
import GeneratorForm from '@/components/GeneratorForm';

const Index: React.FC = () => {
  return (
    <div className="min-h-screen bg-background relative">
      <div className="blur-gradient-top fixed top-0 left-0 right-0 h-24 z-30 pointer-events-none" />
      
      <FloatingHeader />
      
      <Header />
      
      <GeneratorForm />
    </div>
  );
};

export default Index;
