import React from 'react';

const HamburgerMenu = ({ isOpen, onToggle }) => (
  <button
    className="md:hidden p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
    aria-label="Toggle menu"
    onClick={onToggle}
  >
    <span className="block w-6 h-0.5 bg-white mb-1 transition-all" style={{ transform: isOpen ? 'rotate(45deg) translateY(7px)' : 'none' }}></span>
    <span className={`block w-6 h-0.5 bg-white mb-1 transition-all ${isOpen ? 'opacity-0' : ''}`}></span>
    <span className="block w-6 h-0.5 bg-white transition-all" style={{ transform: isOpen ? 'rotate(-45deg) translateY(-7px)' : 'none' }}></span>
  </button>
);

export default HamburgerMenu;
