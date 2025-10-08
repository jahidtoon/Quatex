"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import MainAppLayout from '../components/MainAppLayout';

export default function SupportPage() {
  const [selectedCategory, setSelectedCategory] = useState('general');
  const [searchQuery, setSearchQuery] = useState('');
  const [ticketForm, setTicketForm] = useState({
    subject: '',
    category: 'general',
    priority: 'medium',
    message: ''
  });

  const categories = [
    { id: 'general', label: 'General Help', icon: 'fa-question-circle' },
    { id: 'trading', label: 'Trading Issues', icon: 'fa-chart-line' },
    { id: 'account', label: 'Account & Security', icon: 'fa-user-shield' },
    { id: 'payment', label: 'Payment & Withdrawal', icon: 'fa-credit-card' },
    { id: 'technical', label: 'Technical Support', icon: 'fa-tools' }
  ];

  const faqData = {
    general: [
      { q: 'How do I get started with trading?', a: 'To start trading, create an account, verify your identity, deposit funds, and begin with our demo account to practice.' },
      { q: 'What are the trading hours?', a: 'Cryptocurrency markets are open 24/7. Forex markets are open Monday to Friday, 24 hours.' },
      { q: 'Is there a minimum deposit amount?', a: 'Yes, the minimum deposit amount is $10 for most payment methods.' }
    ],
    trading: [
      { q: 'How do I place a trade?', a: 'Select an asset, choose your direction (UP/DOWN), set your investment amount, and click the trade button.' },
      { q: 'What is the maximum payout?', a: 'Payouts can range from 70% to 95% depending on the asset and market conditions.' },
      { q: 'Can I close a trade early?', a: 'Yes, you can close trades early, but this may affect your potential profit.' }
    ],
    account: [
      { q: 'How do I verify my account?', a: 'Upload a government-issued ID and proof of address through your account settings.' },
      { q: 'How do I change my password?', a: 'Go to Account Settings > Security > Change Password and follow the instructions.' },
      { q: 'What if I forgot my password?', a: 'Click "Forgot Password" on the login page and follow the reset instructions sent to your email.' }
    ],
    payment: [
      { q: 'What payment methods are accepted?', a: 'We accept credit/debit cards, bank transfers, e-wallets, and cryptocurrencies.' },
      { q: 'How long do withdrawals take?', a: 'Withdrawals typically take 1-3 business days depending on your payment method.' },
      { q: 'Are there any withdrawal fees?', a: 'We don\'t charge withdrawal fees, but your payment provider may have their own fees.' }
    ],
    technical: [
      { q: 'Why is the platform running slowly?', a: 'Clear your browser cache, check your internet connection, or try using a different browser.' },
      { q: 'The charts are not loading properly', a: 'Refresh the page, disable ad blockers, or contact support if the issue persists.' },
      { q: 'I can\'t access my account', a: 'Check if your account is locked, verify your login credentials, or contact support.' }
    ]
  };

  const handleTicketSubmit = (e) => {
    e.preventDefault();
    console.log('Support ticket submitted:', ticketForm);
    alert('Support ticket submitted successfully!');
    setTicketForm({ subject: '', category: 'general', priority: 'medium', message: '' });
  };

  const filteredFaqs = faqData[selectedCategory]?.filter(faq =>
    faq.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
    faq.a.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  return (
    <MainAppLayout>
      <div className="bg-gray-900 text-white">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/" className="text-blue-400 hover:text-blue-300">
              <i className="fas fa-arrow-left"></i> Back to Home
            </Link>
            <h1 className="text-3xl font-bold flex items-center">
              <i className="fas fa-headset text-green-400 mr-3"></i>
              Support Center
            </h1>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-400">
              <i className="fas fa-clock mr-1"></i>
              Available 24/7
            </div>
            <button className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg">
              <i className="fas fa-comments mr-2"></i>Live Chat
            </button>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 text-center">
            <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="fas fa-comments text-2xl"></i>
            </div>
            <h3 className="text-xl font-semibold mb-2">Live Chat</h3>
            <p className="text-gray-400 mb-4">Get instant help from our support team</p>
            <button className="bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded-lg">
              Start Chat
            </button>
          </div>

          <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 text-center">
            <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="fas fa-envelope text-2xl"></i>
            </div>
            <h3 className="text-xl font-semibold mb-2">Email Support</h3>
            <p className="text-gray-400 mb-4">Send us a detailed message</p>
            <button 
              onClick={() => document.getElementById('ticket-form').scrollIntoView({ behavior: 'smooth' })}
              className="bg-green-600 hover:bg-green-700 px-6 py-2 rounded-lg"
            >
              Create Ticket
            </button>
          </div>

          <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 text-center">
            <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="fas fa-phone text-2xl"></i>
            </div>
            <h3 className="text-xl font-semibold mb-2">Phone Support</h3>
            <p className="text-gray-400 mb-4">Call us directly for urgent issues</p>
            <button className="bg-purple-600 hover:bg-purple-700 px-6 py-2 rounded-lg">
              +1-800-QOUTEX
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* FAQ Section */}
          <div className="lg:col-span-2">
            <div className="bg-gray-800 rounded-lg border border-gray-700">
              <div className="p-6 border-b border-gray-700">
                <h2 className="text-2xl font-semibold mb-4">Frequently Asked Questions</h2>
                
                {/* Search */}
                <div className="relative mb-4">
                  <i className="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                  <input
                    type="text"
                    placeholder="Search FAQ..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Category Tabs */}
                <div className="flex flex-wrap gap-2">
                  {categories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategory(category.id)}
                      className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        selectedCategory === category.id
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      }`}
                    >
                      <i className={`fas ${category.icon}`}></i>
                      <span>{category.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* FAQ Content */}
              <div className="p-6">
                {filteredFaqs.length > 0 ? (
                  <div className="space-y-4">
                    {filteredFaqs.map((faq, index) => (
                      <div key={index} className="bg-gray-700 rounded-lg p-4">
                        <h3 className="font-semibold mb-2 flex items-start">
                          <i className="fas fa-question-circle text-blue-400 mr-2 mt-1"></i>
                          {faq.q}
                        </h3>
                        <p className="text-gray-300 ml-6">{faq.a}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <i className="fas fa-search text-4xl text-gray-600 mb-4"></i>
                    <p className="text-gray-400">No FAQs found matching your search.</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Support Ticket Form */}
          <div className="lg:col-span-1">
            <div id="ticket-form" className="bg-gray-800 rounded-lg border border-gray-700">
              <div className="p-6 border-b border-gray-700">
                <h2 className="text-xl font-semibold">Create Support Ticket</h2>
              </div>
              <div className="p-6">
                <form onSubmit={handleTicketSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Subject</label>
                    <input
                      type="text"
                      value={ticketForm.subject}
                      onChange={(e) => setTicketForm({...ticketForm, subject: e.target.value})}
                      className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Brief description of your issue"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Category</label>
                    <select
                      value={ticketForm.category}
                      onChange={(e) => setTicketForm({...ticketForm, category: e.target.value})}
                      className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>{cat.label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Priority</label>
                    <select
                      value={ticketForm.priority}
                      onChange={(e) => setTicketForm({...ticketForm, priority: e.target.value})}
                      className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="urgent">Urgent</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Message</label>
                    <textarea
                      value={ticketForm.message}
                      onChange={(e) => setTicketForm({...ticketForm, message: e.target.value})}
                      rows={6}
                      className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                      placeholder="Please describe your issue in detail..."
                      required
                    ></textarea>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
                  >
                    <i className="fas fa-paper-plane mr-2"></i>
                    Submit Ticket
                  </button>
                </form>
              </div>
            </div>

            {/* Contact Info */}
            <div className="bg-gray-800 rounded-lg border border-gray-700 mt-6">
              <div className="p-6">
                <h3 className="text-lg font-semibold mb-4">Contact Information</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center space-x-3">
                    <i className="fas fa-envelope text-blue-400"></i>
                    <span>support@qoutex.com</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <i className="fas fa-phone text-green-400"></i>
                    <span>+1-800-QOUTEX (768-8395)</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <i className="fas fa-clock text-yellow-400"></i>
                    <span>24/7 Support Available</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <i className="fas fa-globe text-purple-400"></i>
                    <span>Global Support Team</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    </MainAppLayout>
  );
}
