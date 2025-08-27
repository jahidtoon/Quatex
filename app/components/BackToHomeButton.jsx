'use client';
import React from 'react';
import Link from 'next/link';

const BackToHomeButton = () => {
  return (
    <Link 
      href="/"
      className="inline-flex items-center px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors duration-200 mb-6"
    >
      <i className="fas fa-arrow-left mr-2"></i>
      Back to Home
    </Link>
  );
};

export default BackToHomeButton;
