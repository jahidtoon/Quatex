"use client";
import React from 'react';
import Link from 'next/link';

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center space-x-4">
            <Link href="/" className="text-blue-400 hover:text-blue-300">
              <i className="fas fa-arrow-left"></i> Back to Home
            </Link>
            <h1 className="text-3xl font-bold">Privacy Policy</h1>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-gray-800 rounded-lg border border-gray-700 p-8">
          <div className="prose prose-invert max-w-none">
            <p className="text-gray-400 mb-8">Last updated: January 2024</p>

            <h2 className="text-2xl font-bold mb-4">1. Information We Collect</h2>
            <p className="text-gray-300 mb-4">
              We collect information you provide directly to us, such as when you:
            </p>
            <ul className="list-disc list-inside text-gray-300 mb-6 space-y-2">
              <li>Create an account or update your profile</li>
              <li>Make trades or transactions</li>
              <li>Contact us for support</li>
              <li>Participate in surveys or promotions</li>
            </ul>

            <h2 className="text-2xl font-bold mb-4">2. How We Use Your Information</h2>
            <p className="text-gray-300 mb-4">
              We use the information we collect to:
            </p>
            <ul className="list-disc list-inside text-gray-300 mb-6 space-y-2">
              <li>Provide, maintain, and improve our services</li>
              <li>Process transactions and send related information</li>
              <li>Send technical notices and support messages</li>
              <li>Respond to your comments and questions</li>
              <li>Monitor and analyze trends and usage</li>
            </ul>

            <h2 className="text-2xl font-bold mb-4">3. Information Sharing</h2>
            <p className="text-gray-300 mb-6">
              We do not sell, trade, or otherwise transfer your personal information to third parties without your consent, except as described in this privacy policy or as required by law.
            </p>

            <h2 className="text-2xl font-bold mb-4">4. Data Security</h2>
            <p className="text-gray-300 mb-6">
              We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.
            </p>

            <h2 className="text-2xl font-bold mb-4">5. Cookies and Tracking</h2>
            <p className="text-gray-300 mb-6">
              We use cookies and similar tracking technologies to enhance your experience on our platform. You can control cookie settings through your browser preferences.
            </p>

            <h2 className="text-2xl font-bold mb-4">6. Your Rights</h2>
            <p className="text-gray-300 mb-4">
              You have the right to:
            </p>
            <ul className="list-disc list-inside text-gray-300 mb-6 space-y-2">
              <li>Access and update your personal information</li>
              <li>Request deletion of your data</li>
              <li>Object to processing of your data</li>
              <li>Data portability</li>
              <li>Withdraw consent at any time</li>
            </ul>

            <h2 className="text-2xl font-bold mb-4">7. Third-Party Services</h2>
            <p className="text-gray-300 mb-6">
              Our platform may contain links to third-party websites or services. We are not responsible for the privacy practices of these third parties.
            </p>

            <h2 className="text-2xl font-bold mb-4">8. Children's Privacy</h2>
            <p className="text-gray-300 mb-6">
              Our services are not directed to children under 18. We do not knowingly collect personal information from children under 18.
            </p>

            <h2 className="text-2xl font-bold mb-4">9. Changes to This Policy</h2>
            <p className="text-gray-300 mb-6">
              We may update this privacy policy from time to time. We will notify you of any changes by posting the new policy on this page.
            </p>

            <h2 className="text-2xl font-bold mb-4">10. Contact Us</h2>
            <div className="bg-gray-700 rounded-lg p-6">
              <p className="text-gray-300 mb-4">
                If you have any questions about this Privacy Policy, please contact us:
              </p>
              <div className="space-y-2 text-gray-300">
                <p><i className="fas fa-envelope mr-2 text-blue-400"></i> privacy@quatex.com</p>
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
