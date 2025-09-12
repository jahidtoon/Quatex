"use client";
import React from 'react';
import Link from 'next/link';

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center space-x-4">
            <Link href="/" className="text-blue-400 hover:text-blue-300">
              <i className="fas fa-arrow-left"></i> Back to Home
            </Link>
            <h1 className="text-3xl font-bold">Terms of Service</h1>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-gray-800 rounded-lg border border-gray-700 p-8">
          <div className="prose prose-invert max-w-none">
            <p className="text-gray-400 mb-8">Last updated: January 2024</p>

            <h2 className="text-2xl font-bold mb-4">1. Acceptance of Terms</h2>
            <p className="text-gray-300 mb-6">
              By accessing and using the Quatex trading platform, you accept and agree to be bound by the terms and provision of this agreement.
            </p>

            <h2 className="text-2xl font-bold mb-4">2. Use License</h2>
            <p className="text-gray-300 mb-4">
              Permission is granted to temporarily use Quatex for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:
            </p>
            <ul className="list-disc list-inside text-gray-300 mb-6 space-y-2">
              <li>modify or copy the materials</li>
              <li>use the materials for any commercial purpose or for any public display</li>
              <li>attempt to reverse engineer any software contained on the platform</li>
              <li>remove any copyright or other proprietary notations from the materials</li>
            </ul>

            <h2 className="text-2xl font-bold mb-4">3. Trading Risks</h2>
            <p className="text-gray-300 mb-6">
              Trading binary options and other financial instruments involves substantial risk and may not be suitable for all investors. You should consider whether you can afford to take the high risk of losing your money.
            </p>

            <h2 className="text-2xl font-bold mb-4">4. Account Responsibilities</h2>
            <p className="text-gray-300 mb-6">
              You are responsible for maintaining the confidentiality of your account and password and for restricting access to your computer. You agree to accept responsibility for all activities that occur under your account or password.
            </p>

            <h2 className="text-2xl font-bold mb-4">5. Prohibited Uses</h2>
            <p className="text-gray-300 mb-4">
              You may not use our platform:
            </p>
            <ul className="list-disc list-inside text-gray-300 mb-6 space-y-2">
              <li>For any unlawful purpose or to solicit others to perform illegal acts</li>
              <li>To violate any international, federal, provincial, or state regulations, rules, laws, or local ordinances</li>
              <li>To infringe upon or violate our intellectual property rights or the intellectual property rights of others</li>
              <li>To harass, abuse, insult, harm, defame, slander, disparage, intimidate, or discriminate</li>
            </ul>

            <h2 className="text-2xl font-bold mb-4">6. Termination</h2>
            <p className="text-gray-300 mb-6">
              We may terminate or suspend your account and bar access to the service immediately, without prior notice or liability, under our sole discretion, for any reason whatsoever including without limitation if you breach the Terms.
            </p>

            <h2 className="text-2xl font-bold mb-4">7. Disclaimer</h2>
            <p className="text-gray-300 mb-6">
              The information on this platform is provided on an 'as is' basis. To the fullest extent permitted by law, this Company excludes all representations, warranties, conditions and terms.
            </p>

            <h2 className="text-2xl font-bold mb-4">8. Contact Information</h2>
            <div className="bg-gray-700 rounded-lg p-6">
              <p className="text-gray-300 mb-4">
                If you have any questions about these Terms of Service, please contact us:
              </p>
              <div className="space-y-2 text-gray-300">
                <p><i className="fas fa-envelope mr-2 text-blue-400"></i> support@quatex.com</p>
                <p><i className="fas fa-phone mr-2 text-green-400"></i> +1 (555) 123-4567</p>
                <p><i className="fas fa-map-marker-alt mr-2 text-red-400"></i> 123 Trading Street, Financial District, NY 10001</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
