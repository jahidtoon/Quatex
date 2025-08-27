import React from 'react';

const SidebarHamburger = ({
  isOpen,
  onToggle,
  variant = 'hamburger', // 'hamburger' | 'chevron'
  direction = 'right', // for chevron: 'left' | 'right'
  size = 'md', // 'sm' | 'md' | 'lg'
  className = '',
  ...props
}) => {
  const sizeClasses = size === 'sm' ? 'p-1.5' : size === 'lg' ? 'p-3' : 'p-2';
  const baseBtn = `${sizeClasses} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-[#23283a] hover:bg-[#31374a] shadow-sm hover:shadow transition-all duration-300 ${className}`;

  return (
    <button
      className={baseBtn}
      aria-label={props['aria-label'] || (isOpen ? 'Collapse sidebar' : 'Expand sidebar')}
      aria-expanded={isOpen}
      onClick={onToggle}
      title={isOpen ? 'Collapse sidebar' : 'Expand sidebar'}
      {...props}
    >
      {variant === 'hamburger' ? (
        <span className="block">
          <span className={`block w-6 h-0.5 bg-white mb-1 transition-all duration-300 ${isOpen ? 'rotate-45 translate-y-2' : ''}`}></span>
          <span className={`block w-6 h-0.5 bg-white mb-1 transition-all duration-300 ${isOpen ? 'opacity-0' : ''}`}></span>
          <span className={`block w-6 h-0.5 bg-white transition-all duration-300 ${isOpen ? '-rotate-45 -translate-y-2' : ''}`}></span>
        </span>
      ) : (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          className={`w-5 h-5 transition-transform duration-300 ${direction === 'left' ? 'rotate-180' : ''}`}
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
        </svg>
      )}
    </button>
  );
};

export default SidebarHamburger;
