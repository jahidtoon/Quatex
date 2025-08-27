"use client";
import React, { useState } from 'react';
import Link from 'next/link';

export default function JoinUsPage() {
  const [selectedPlan, setSelectedPlan] = useState('starter');
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    experience: '',
    referralCode: ''
  });

  const plans = [
    {
      id: 'starter',
      name: 'Starter',
      price: 'Free',
      features: [
        'Basic trading access',
        'Standard customer support',
        'Basic analytics',
        'Mobile app access',
        'Educational resources'
      ],
      color: 'border-blue-500 bg-blue-900/20',
      buttonColor: 'bg-blue-600 hover:bg-blue-700'
    },
    {
      id: 'pro',
      name: 'Pro Trader',
      price: '$99/month',
      features: [
        'Advanced trading tools',
        'Priority customer support',
        'Advanced analytics & insights',
        'Higher withdrawal limits',
        'Exclusive trading signals',
        'Personal account manager'
      ],
      color: 'border-purple-500 bg-purple-900/20',
      buttonColor: 'bg-purple-600 hover:bg-purple-700',
      popular: true
    },
    {
      id: 'vip',
      name: 'VIP Elite',
      price: '$299/month',
      features: [
        'All Pro features',
        'VIP customer support',
        'Custom trading algorithms',
        'Unlimited withdrawals',
        'Private trading room',
        'One-on-one mentoring',
        'Exclusive market events'
      ],
      color: 'border-yellow-500 bg-yellow-900/20',
      buttonColor: 'bg-yellow-600 hover:bg-yellow-700'
    }
  ];

  const benefits = [
    {
      icon: 'fa-chart-line',
      title: 'Advanced Trading Tools',
      description: 'Access professional-grade trading tools and indicators'
    },
    {
      icon: 'fa-graduation-cap',
      title: 'Educational Resources',
      description: 'Learn from experts with our comprehensive training materials'
    },
    {
      icon: 'fa-users',
      title: 'Community Access',
      description: 'Join our exclusive community of successful traders'
    },
    {
      icon: 'fa-headset',
      title: '24/7 Support',
      description: 'Get help whenever you need it from our expert support team'
    },
    {
      icon: 'fa-mobile-alt',
      title: 'Mobile Trading',
      description: 'Trade on the go with our powerful mobile applications'
    },
    {
      icon: 'fa-shield-alt',
      title: 'Secure Platform',
      description: 'Your funds and data are protected with bank-level security'
    }
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Join request:', { ...formData, plan: selectedPlan });
    alert('Welcome to Qoutex! Your account is being set up.');
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-800 to-blue-800 border-b border-purple-500">
        <div className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/" className="text-blue-300 hover:text-blue-200">
                <i className="fas fa-arrow-left"></i> Back to Home
              </Link>
              <h1 className="text-3xl font-bold flex items-center">
                <i className="fas fa-user-plus text-pink-400 mr-3"></i>
                Join Qoutex
              </h1>
            </div>
          </div>
          <div className="mt-4 text-center">
            <h2 className="text-4xl font-bold mb-4">Start Your Trading Journey Today</h2>
            <p className="text-xl text-purple-100">Join thousands of successful traders on the leading platform</p>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Hero Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 text-center">
            <div className="text-3xl font-bold text-green-400">50K+</div>
            <div className="text-gray-400">Active Traders</div>
          </div>
          <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 text-center">
            <div className="text-3xl font-bold text-blue-400">$2.4B</div>
            <div className="text-gray-400">Monthly Volume</div>
          </div>
          <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 text-center">
            <div className="text-3xl font-bold text-purple-400">98.5%</div>
            <div className="text-gray-400">Uptime</div>
          </div>
          <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 text-center">
            <div className="text-3xl font-bold text-yellow-400">190+</div>
            <div className="text-gray-400">Countries</div>
          </div>
        </div>

        {/* Membership Plans */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-center mb-8">Choose Your Plan</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {plans.map((plan) => (
              <div
                key={plan.id}
                className={`relative rounded-lg border-2 p-8 ${plan.color} ${
                  selectedPlan === plan.id ? 'ring-2 ring-offset-2 ring-offset-gray-900' : ''
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-purple-600 text-white px-4 py-2 rounded-full text-sm font-semibold">
                      Most Popular
                    </span>
                  </div>
                )}
                
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                  <div className="text-4xl font-bold mb-4">{plan.price}</div>
                </div>

                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center">
                      <i className="fas fa-check text-green-400 mr-3"></i>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => setSelectedPlan(plan.id)}
                  className={`w-full py-3 px-4 rounded-lg font-semibold transition-colors ${
                    selectedPlan === plan.id
                      ? `${plan.buttonColor} text-white`
                      : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                  }`}
                >
                  {selectedPlan === plan.id ? 'Selected' : 'Select Plan'}
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
          {/* Registration Form */}
          <div className="bg-gray-800 rounded-lg border border-gray-700 p-8">
            <h2 className="text-2xl font-bold mb-6">Create Your Account</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">Full Name</label>
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                  className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter your full name"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Email Address</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter your email"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Phone Number</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter your phone number"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Trading Experience</label>
                <select
                  value={formData.experience}
                  onChange={(e) => setFormData({...formData, experience: e.target.value})}
                  className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select your experience level</option>
                  <option value="beginner">Beginner (0-1 years)</option>
                  <option value="intermediate">Intermediate (1-3 years)</option>
                  <option value="advanced">Advanced (3+ years)</option>
                  <option value="expert">Expert (5+ years)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Referral Code (Optional)</label>
                <input
                  type="text"
                  value={formData.referralCode}
                  onChange={(e) => setFormData({...formData, referralCode: e.target.value})}
                  className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter referral code"
                />
              </div>

              <div className="bg-gray-700 p-4 rounded-lg">
                <h3 className="font-semibold mb-2">Selected Plan: {plans.find(p => p.id === selectedPlan)?.name}</h3>
                <p className="text-sm text-gray-400">Price: {plans.find(p => p.id === selectedPlan)?.price}</p>
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold py-4 px-4 rounded-lg transition-colors"
              >
                <i className="fas fa-rocket mr-2"></i>
                Join Qoutex Now
              </button>
            </form>

            <p className="text-center text-sm text-gray-400 mt-6">
              Already have an account?{' '}
              <Link href="/auth/login" className="text-blue-400 hover:text-blue-300">
                Sign in here
              </Link>
            </p>
          </div>

          {/* Benefits */}
          <div>
            <h2 className="text-2xl font-bold mb-6">Why Choose Qoutex?</h2>
            <div className="space-y-6">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                    <i className={`fas ${benefit.icon} text-xl`}></i>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-2">{benefit.title}</h3>
                    <p className="text-gray-400">{benefit.description}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Testimonial */}
            <div className="bg-gray-800 rounded-lg border border-gray-700 p-6 mt-8">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-blue-500 rounded-full flex items-center justify-center font-bold">
                  JD
                </div>
                <div className="ml-4">
                  <h4 className="font-semibold">John Doe</h4>
                  <div className="flex text-yellow-400">
                    {[...Array(5)].map((_, i) => (
                      <i key={i} className="fas fa-star"></i>
                    ))}
                  </div>
                </div>
              </div>
              <p className="text-gray-300 italic">
                "Qoutex has transformed my trading experience. The tools are incredible and the support team is always there when I need help. Highly recommended!"
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
