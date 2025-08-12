import React from 'react';

const SidebarHamburger = ({ isOpen, onToggle }) => (
  <button
    className="p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 bg-[#23283a] hover:bg-[#31374a] transition-all duration-300"
    aria-label="Toggle sidebar menu"
    onClick={onToggle}
    title={isOpen ? "Collapse sidebar" : "Expand sidebar"}
  >
    <span className={`block w-6 h-0.5 bg-white mb-1 transition-all duration-300 ${isOpen ? 'rotate-45 translate-y-2' : ''}`}></span>
    <span className={`block w-6 h-0.5 bg-white mb-1 transition-all duration-300 ${isOpen ? 'opacity-0' : ''}`}></span>
    <span className={`block w-6 h-0.5 bg-white transition-all duration-300 ${isOpen ? '-rotate-45 -translate-y-2' : ''}`}></span>
  </button>
);

export default SidebarHamburger;
