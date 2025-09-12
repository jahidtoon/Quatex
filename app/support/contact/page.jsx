"use client";
import React, { useState } from 'react';
import Link from 'next/link';

export default function SupportContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    priority: 'medium',
    category: 'general',
    message: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      setSubmitting(false);
      setSubmitted(true);
    }, 2000);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="max-w-md w-full bg-gray-800 rounded-lg border border-gray-700 p-8 text-center">
          <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <i className="fas fa-check text-white text-2xl"></i>
          </div>
          <h2 className="text-2xl font-bold mb-4">Ticket Submitted!</h2>
          <p className="text-gray-400 mb-6">
            Your support ticket has been submitted successfully. Our team will get back to you within 24 hours.
          </p>
          <div className="space-y-3">
            <Link 
              href="/support"
              className="block w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
            >
              Back to Support
            </Link>
            <Link 
              href="/"
              className="block w-full bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
            >
              Back to Trading
            </Link>
          </div>
        </div>
      </div>
    );
  }

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
              <i className="fas fa-headset text-green-400 mr-3"></i>
              Contact Support
            </h1>
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="max-w-2xl mx-auto">
          {/* Quick Help Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-blue-600 rounded-lg p-4 text-center">
              <i className="fas fa-clock text-2xl mb-2"></i>
              <div className="font-semibold">Response Time</div>
              <div className="text-sm opacity-90">Within 24 hours</div>
            </div>
            <div className="bg-green-600 rounded-lg p-4 text-center">
              <i className="fas fa-comments text-2xl mb-2"></i>
              <div className="font-semibold">Live Chat</div>
              <div className="text-sm opacity-90">Mon-Fri 9AM-6PM</div>
            </div>
            <div className="bg-purple-600 rounded-lg p-4 text-center">
              <i className="fas fa-phone text-2xl mb-2"></i>
              <div className="font-semibold">Phone Support</div>
              <div className="text-sm opacity-90">+1 (555) 123-4567</div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-gray-800 rounded-lg border border-gray-700">
            <div className="p-6 border-b border-gray-700">
              <h2 className="text-xl font-semibold">Submit a Support Ticket</h2>
              <p className="text-gray-400">Fill out the form below and we'll get back to you as soon as possible</p>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Full Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter your full name"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Email Address *</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter your email"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Category</label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="general">General Question</option>
                    <option value="account">Account Issues</option>
                    <option value="trading">Trading Problems</option>
                    <option value="deposits">Deposits & Withdrawals</option>
                    <option value="technical">Technical Issues</option>
                    <option value="billing">Billing Questions</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Priority</label>
                  <select
                    name="priority"
                    value={formData.priority}
                    onChange={handleChange}
                    className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Subject *</label>
                <input
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                  className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Brief description of your issue"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Message *</label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows={6}
                  className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Please provide detailed information about your issue..."
                ></textarea>
              </div>

              <div className="flex items-center space-x-3">
                <input type="checkbox" required className="rounded" />
                <span className="text-sm text-gray-400">
                  I agree to the <Link href="/terms" className="text-blue-400 hover:underline">Terms of Service</Link> and <Link href="/privacy" className="text-blue-400 hover:underline">Privacy Policy</Link>
                </span>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center"
              >
                {submitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Submitting...
                  </>
                ) : (
                  <>
                    <i className="fas fa-paper-plane mr-2"></i>
                    Submit Ticket
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Alternative Contact Methods */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <i className="fas fa-comments text-blue-400 mr-2"></i>
                Live Chat
              </h3>
              <p className="text-gray-400 mb-4">
                Get instant help from our support team through live chat.
              </p>
              <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors">
                Start Live Chat
              </button>
            </div>

            <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <i className="fas fa-question-circle text-green-400 mr-2"></i>
                Knowledge Base
              </h3>
              <p className="text-gray-400 mb-4">
                Find answers to common questions in our FAQ section.
              </p>
              <Link 
                href="/support/faq"
                className="block w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg text-center transition-colors"
              >
                Browse FAQ
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
