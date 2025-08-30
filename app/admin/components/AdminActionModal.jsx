"use client";
import React from 'react';

export default function AdminActionModal({ open, onClose, title, children, actions }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
      <div className="bg-[#151a2e] rounded-xl shadow-2xl w-full max-w-lg p-8 border border-[#262b40] relative">
        <button
          className="absolute top-4 right-4 text-gray-400 hover:text-white text-xl"
          onClick={onClose}
          aria-label="Close"
        >
          ×
        </button>
        <h2 className="text-2xl font-bold mb-4 text-white text-center">{title}</h2>
        <div className="mb-6">{children}</div>
        <div className="flex justify-end gap-3">
          {actions}
        </div>
      </div>
    </div>
  );
}
