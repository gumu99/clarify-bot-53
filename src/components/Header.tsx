import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="text-center py-8 px-4">
      <h1 className="text-4xl md:text-5xl font-bold gradient-text mb-2">
        AI NOTES GENERATOR
      </h1>
      <p className="text-muted-foreground text-sm md:text-base">
        Student • Developer • Builder
      </p>
    </header>
  );
};

export default Header;
