'use client';
import React from 'react';
import GlobalNavigation from '../components/GlobalNavigation';

const PageLayout = ({ children, title, subtitle }) => {
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-8">
        <GlobalNavigation title={title} subtitle={subtitle} />
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </div>
    </div>
  );
};

export default PageLayout;
