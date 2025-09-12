"use client";
import React, { useState } from 'react';
import Link from 'next/link';

export default function FAQPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [openQuestions, setOpenQuestions] = useState(new Set());

  const categories = [
    { id: 'all', name: 'All Questions', icon: 'fa-list' },
    { id: 'account', name: 'Account', icon: 'fa-user' },
    { id: 'trading', name: 'Trading', icon: 'fa-chart-line' },
    { id: 'deposits', name: 'Deposits', icon: 'fa-download' },
    { id: 'withdrawals', name: 'Withdrawals', icon: 'fa-upload' },
    { id: 'technical', name: 'Technical', icon: 'fa-cog' },
    { id: 'security', name: 'Security', icon: 'fa-shield-alt' }
  ];

  const faqs = [
    {
      id: 1,
      category: 'account',
      question: 'How do I create an account?',
      answer: 'To create an account, click on the "Sign Up" button on the top right corner of the homepage. Fill in your personal information, verify your email address, and complete the identity verification process.'
    },
    {
      id: 2,
      category: 'account',
      question: 'How do I verify my account?',
      answer: 'Account verification requires you to submit a government-issued ID and proof of address. Go to Account Settings > Verification and upload the required documents. Verification typically takes 1-2 business days.'
    },
    {
      id: 3,
      category: 'trading',
      question: 'What is binary options trading?',
      answer: 'Binary options trading involves predicting whether the price of an asset will go up or down within a specific time frame. If your prediction is correct, you earn a predetermined payout. If wrong, you lose your investment amount.'
    },
    {
      id: 4,
      category: 'trading',
      question: 'What is the minimum trade amount?',
      answer: 'The minimum trade amount is $1. This allows you to start trading with a small investment and manage your risk effectively.'
    },
    {
      id: 5,
      category: 'trading',
      question: 'What assets can I trade?',
      answer: 'You can trade various assets including major currency pairs (EUR/USD, GBP/USD, etc.), cryptocurrencies (Bitcoin, Ethereum, etc.), stocks, and commodities like gold and oil.'
    },
    {
      id: 6,
      category: 'deposits',
      question: 'What payment methods are accepted?',
      answer: 'We accept credit/debit cards (Visa, Mastercard), bank transfers, e-wallets (PayPal, Skrill, Neteller), and cryptocurrencies (Bitcoin, Ethereum, Litecoin).'
    },
    {
      id: 7,
      category: 'deposits',
      question: 'Is there a minimum deposit amount?',
      answer: 'Yes, the minimum deposit amount is $10. This makes our platform accessible to traders of all experience levels.'
    },
    {
      id: 8,
      category: 'withdrawals',
      question: 'How long do withdrawals take?',
      answer: 'Withdrawal processing times vary by method: Credit/debit cards: 3-5 business days, Bank transfers: 5-7 business days, E-wallets: 24-48 hours, Cryptocurrencies: 1-6 hours.'
    },
    {
      id: 9,
      category: 'withdrawals',
      question: 'Are there any withdrawal fees?',
      answer: 'We offer 3 free withdrawals per month. Additional withdrawals may incur a small fee depending on the payment method used.'
    },
    {
      id: 10,
      category: 'technical',
      question: 'What browsers are supported?',
      answer: 'Our platform works best on modern browsers including Chrome, Firefox, Safari, and Edge. We recommend keeping your browser updated for the best experience.'
    },
    {
      id: 11,
      category: 'technical',
      question: 'Is there a mobile app?',
      answer: 'Yes, we have mobile apps for both iOS and Android. You can download them from the App Store or Google Play Store. The mobile app offers full trading functionality.'
    },
    {
      id: 12,
      category: 'security',
      question: 'How secure is my money?',
      answer: 'Your funds are kept in segregated accounts with tier-1 banks. We use 256-bit SSL encryption and two-factor authentication to protect your account and personal information.'
    },
    {
      id: 13,
      category: 'security',
      question: 'What is two-factor authentication?',
      answer: 'Two-factor authentication (2FA) adds an extra layer of security to your account. After enabling 2FA, you\'ll need both your password and a code from your mobile device to log in.'
    }
  ];

  const filteredFAQs = faqs.filter(faq => {
    const matchesCategory = activeCategory === 'all' || faq.category === activeCategory;
    const matchesSearch = faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         faq.answer.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const toggleQuestion = (questionId) => {
    const newOpenQuestions = new Set(openQuestions);
    if (newOpenQuestions.has(questionId)) {
      newOpenQuestions.delete(questionId);
    } else {
      newOpenQuestions.add(questionId);
    }
    setOpenQuestions(newOpenQuestions);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/support" className="text-blue-400 hover:text-blue-300">
              <i className="fas fa-arrow-left"></i> Back to Support
            </Link>
            <h1 className="text-3xl font-bold flex items-center">
              <i className="fas fa-question-circle text-blue-400 mr-3"></i>
              Frequently Asked Questions
            </h1>
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="max-w-6xl mx-auto">
          {/* Search and Categories */}
          <div className="mb-8">
            {/* Search Bar */}
            <div className="mb-6">
              <div className="relative max-w-md mx-auto">
                <input
                  type="text"
                  placeholder="Search FAQs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full p-4 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 pl-12"
                />
                <i className="fas fa-search absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
              </div>
            </div>

            {/* Category Filter */}
            <div className="flex flex-wrap justify-center gap-2">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setActiveCategory(category.id)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors flex items-center space-x-2 ${
                    activeCategory === category.id
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  <i className={`fas ${category.icon}`}></i>
                  <span>{category.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* FAQ List */}
          <div className="space-y-4">
            {filteredFAQs.length === 0 ? (
              <div className="text-center py-12">
                <i className="fas fa-search text-6xl text-gray-600 mb-4"></i>
                <h3 className="text-xl font-semibold text-gray-400 mb-2">No FAQs Found</h3>
                <p className="text-gray-500">Try adjusting your search terms or category filter.</p>
              </div>
            ) : (
              filteredFAQs.map((faq) => (
                <div key={faq.id} className="bg-gray-800 rounded-lg border border-gray-700">
                  <button
                    onClick={() => toggleQuestion(faq.id)}
                    className="w-full p-6 text-left flex items-center justify-between hover:bg-gray-750 transition-colors"
                  >
                    <h3 className="text-lg font-semibold pr-4">{faq.question}</h3>
                    <i className={`fas ${openQuestions.has(faq.id) ? 'fa-chevron-up' : 'fa-chevron-down'} text-gray-400`}></i>
                  </button>
                  
                  {openQuestions.has(faq.id) && (
                    <div className="px-6 pb-6">
                      <div className="border-t border-gray-700 pt-4">
                        <p className="text-gray-300 leading-relaxed">{faq.answer}</p>
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

          {/* Still Need Help Section */}
          <div className="mt-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">Still Need Help?</h2>
            <p className="text-blue-100 mb-6">
              Can't find the answer you're looking for? Our support team is here to help you.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link 
                href="/support/contact"
                className="bg-white text-blue-600 font-semibold py-3 px-6 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <i className="fas fa-envelope mr-2"></i>
                Contact Support
              </Link>
              <button className="bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg hover:bg-blue-800 transition-colors">
                <i className="fas fa-comments mr-2"></i>
                Live Chat
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
