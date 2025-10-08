"use client";
import React from 'react';
import Link from 'next/link';
import MainAppLayout from '../components/MainAppLayout';
import dynamic from 'next/dynamic';

// Lazy load crypto deposit component
const CryptoDeposit = dynamic(() => import('./crypto'), { ssr: false });

export default function DepositPage() {
  return (
    <MainAppLayout>
      <div className="bg-gray-900 text-white min-h-screen">
        <div className="bg-gray-800 border-b border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/" className="text-blue-400 hover:text-blue-300">
                <i className="fas fa-arrow-left" /> Back
              </Link>
              <h1 className="text-3xl font-bold flex items-center">
                <i className="fas fa-arrow-down text-green-400 mr-3" /> Crypto Deposit
              </h1>
            </div>
          </div>
        </div>

        <div className="p-6 max-w-5xl mx-auto grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <CryptoDeposit />
          </div>
          <div className="space-y-6">
            <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
              <h3 className="text-lg font-semibold mb-4">Recent Crypto Deposits</h3>
              <div className="text-xs text-gray-400">(Dynamic history API pending)</div>
            </div>
          </div>
        </div>
      </div>
    </MainAppLayout>
  );
}
