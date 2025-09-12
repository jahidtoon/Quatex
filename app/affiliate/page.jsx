'use client';

import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faUsers, faDollarSign, faChartLine, faHandshake,
  faTrophy, faGift, faRocket, faCheckCircle,
  faArrowRight, faStar
} from '@fortawesome/free-solid-svg-icons';

export default function AffiliatePage() {
  const benefits = [
    {
      icon: faDollarSign,
      title: 'High Commission Rates',
      description: 'Earn up to 60% commission on every successful referral',
      color: 'text-green-500'
    },
    {
      icon: faUsers,
      title: 'Unlimited Referrals',
      description: 'No limit on how many people you can refer',
      color: 'text-blue-500'
    },
    {
      icon: faChartLine,
      title: 'Real-time Analytics',
      description: 'Track your performance with detailed reports',
      color: 'text-purple-500'
    },
    {
      icon: faHandshake,
      title: '24/7 Support',
      description: 'Dedicated affiliate support team to help you succeed',
      color: 'text-orange-500'
    },
    {
      icon: faTrophy,
      title: 'Performance Bonuses',
      description: 'Extra rewards for top-performing affiliates',
      color: 'text-yellow-500'
    },
    {
      icon: faGift,
      title: 'Marketing Materials',
      description: 'Free promotional materials and resources',
      color: 'text-pink-500'
    }
  ];

  const tiers = [
    { name: 'Bronze', commission: '30%', referrals: '0-50', color: 'from-orange-400 to-orange-600' },
    { name: 'Silver', commission: '40%', referrals: '51-100', color: 'from-gray-400 to-gray-600' },
    { name: 'Gold', commission: '45%', referrals: '101-200', color: 'from-yellow-400 to-yellow-600' },
    { name: 'Platinum', commission: '60%', referrals: '200+', color: 'from-purple-400 to-purple-600' }
  ];

  const testimonials = [
    {
      name: 'Ahmed Hassan',
      earnings: '$15,420',
      period: 'Last 6 months',
      comment: 'Quatex affiliate program has been a game-changer for my income!',
      rating: 5
    },
    {
      name: 'Sarah Khan',
      earnings: '$8,950',
      period: 'Last 3 months',
      comment: 'Easy to use platform and great commission rates.',
      rating: 5
    },
    {
      name: 'Mike Johnson',
      earnings: '$22,340',
      period: 'Last 8 months',
      comment: 'Best affiliate program in the trading industry.',
      rating: 5
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              Join the <span className="text-yellow-400">Quatex</span> Affiliate Program
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto">
              Partner with the world's leading trading platform and earn thousands of dollars monthly through our lucrative referral system
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Link 
                href="/affiliate/auth"
                className="bg-gradient-to-r from-yellow-400 to-orange-500 text-black font-bold px-8 py-4 rounded-lg hover:from-yellow-500 hover:to-orange-600 transition duration-200 text-lg"
              >
                <FontAwesomeIcon icon={faRocket} className="mr-2" />
                Start Earning Today
              </Link>
              <Link 
                href="/affiliate/auth"
                className="border-2 border-white text-white font-bold px-8 py-4 rounded-lg hover:bg-white hover:text-gray-900 transition duration-200 text-lg"
              >
                Login to Dashboard
              </Link>
            </div>

            {/* Hero Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-yellow-400">10k+</div>
                <div className="text-gray-300">Active Affiliates</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-yellow-400">$2M+</div>
                <div className="text-gray-300">Paid Out</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-yellow-400">60%</div>
                <div className="text-gray-300">Max Commission</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-yellow-400">24/7</div>
                <div className="text-gray-300">Support</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Why Choose Quatex Affiliate Program?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our affiliate program offers maximum benefits and guaranteed earnings potential for all partners
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {benefits.map((benefit, index) => (
              <div key={index} className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition duration-200">
                <div className={`text-4xl ${benefit.color} mb-4`}>
                  <FontAwesomeIcon icon={benefit.icon} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{benefit.title}</h3>
                <p className="text-gray-600">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Commission Tiers */}
      <section className="py-20 bg-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Commission Structure
            </h2>
            <p className="text-xl text-gray-600">
              Your commission rate increases based on the number of active referrals
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {tiers.map((tier, index) => (
              <div key={index} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition duration-200 border border-gray-200">
                <div className={`bg-gradient-to-r ${tier.color} p-6 text-white text-center`}>
                  <h3 className="text-2xl font-bold mb-2">{tier.name}</h3>
                  <div className="text-4xl font-bold">{tier.commission}</div>
                  <div className="text-sm opacity-90">Commission Rate</div>
                </div>
                <div className="p-6 text-center">
                  <div className="text-gray-600 mb-4">
                    <strong>{tier.referrals}</strong> Active Referrals
                  </div>
                  <ul className="text-sm text-gray-500 space-y-2">
                    <li className="flex items-center justify-center">
                      <FontAwesomeIcon icon={faCheckCircle} className="text-green-500 mr-2" />
                      Real-time tracking
                    </li>
                    <li className="flex items-center justify-center">
                      <FontAwesomeIcon icon={faCheckCircle} className="text-green-500 mr-2" />
                      Weekly payouts
                    </li>
                    <li className="flex items-center justify-center">
                      <FontAwesomeIcon icon={faCheckCircle} className="text-green-500 mr-2" />
                      Marketing support
                    </li>
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-600">
              Start your affiliate journey in just 3 simple steps
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-blue-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-blue-600">1</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Sign Up</h3>
              <p className="text-gray-600">
                Register for free and create your affiliate account to get started
              </p>
            </div>

            <div className="text-center">
              <div className="bg-green-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-green-600">2</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Share & Refer</h3>
              <p className="text-gray-600">
                Share your referral link and bring new traders to our platform
              </p>
            </div>

            <div className="text-center">
              <div className="bg-yellow-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-yellow-600">3</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Earn Money</h3>
              <p className="text-gray-600">
                Get commission for every successful referral and increase your earnings
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              What Our Affiliates Say
            </h2>
            <p className="text-xl text-gray-600">
              Success stories and experiences from our top affiliates
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-white rounded-xl shadow-lg p-8">
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <FontAwesomeIcon key={i} icon={faStar} className="text-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-600 mb-6 italic">"{testimonial.comment}"</p>
                <div className="border-t pt-4">
                  <div className="font-bold text-gray-900">{testimonial.name}</div>
                  <div className="text-green-600 font-semibold">{testimonial.earnings}</div>
                  <div className="text-sm text-gray-500">{testimonial.period}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Ready to Start Earning?
          </h2>
          <p className="text-xl mb-8">
            Join today and start your passive income journey with unlimited earning potential
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/affiliate/auth"
              className="bg-white text-blue-600 font-bold px-8 py-4 rounded-lg hover:bg-gray-100 transition duration-200 text-lg"
            >
              Join Now - It's Free!
              <FontAwesomeIcon icon={faArrowRight} className="ml-2" />
            </Link>
          </div>

          <div className="mt-8 text-sm opacity-90">
            Already have an account? 
            <Link href="/affiliate/auth" className="underline ml-1 hover:text-yellow-300">
              Login here
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4">Quatex Affiliate</h3>
              <p className="text-gray-400">
                The world's best trading platform affiliate program
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/affiliate/auth" className="hover:text-white">Join Program</Link></li>
                <li><Link href="/affiliate/auth" className="hover:text-white">Affiliate Login</Link></li>
                <li><Link href="/" className="hover:text-white">Main Platform</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/support" className="hover:text-white">Help Center</Link></li>
                <li><Link href="/support/contact" className="hover:text-white">Contact Us</Link></li>
                <li><Link href="/support/faq" className="hover:text-white">FAQ</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/terms" className="hover:text-white">Terms of Service</Link></li>
                <li><Link href="/privacy" className="hover:text-white">Privacy Policy</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 Quatex. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
