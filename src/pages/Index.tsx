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
      
      {/* Top Blur Gradient */}
      <div className="blur-gradient-top fixed top-0 left-0 right-0 h-32 z-30 pointer-events-none" />
      
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
