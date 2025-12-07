import React from 'react';
import Header from '@/components/Header';
import FloatingHeader from '@/components/FloatingHeader';
import GeneratorForm from '@/components/GeneratorForm';
import BackgroundEffects from '@/components/BackgroundEffects';

const Index: React.FC = () => {
  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background Effects */}
      <BackgroundEffects />
      
      {/* Floating Header Buttons */}
      
      {/* Floating Header Buttons */}
      <FloatingHeader />
      
      {/* Main Header */}
      <Header />
      
      {/* Main Content */}
      <GeneratorForm />
    </div>
  );
};

export default Index;
