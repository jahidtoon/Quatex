import React, { useState } from 'react';

const SupportContact = ({ setCurrentPage }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission here
    console.log('Support form submitted:', formData);
    alert('Your message has been sent! We will get back to you soon.');
    setFormData({ name: '', email: '', subject: '', message: '' });
  };

  return (
    <div className="w-full h-full bg-[#2a3142] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-600">
        <div className="flex items-center">
          <button 
            className="text-white mr-4"
            onClick={() => setCurrentPage('support')}
          >
            <i className="fas fa-arrow-left text-lg"></i>
          </button>
          <h1 className="text-white text-xl font-semibold">Contact Support</h1>
        </div>
        <button 
          className="text-gray-400 hover:text-white"
          onClick={() => setCurrentPage('support')}
        >
          <i className="fas fa-times text-lg"></i>
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 p-6 overflow-y-auto">
        {/* Contact Methods */}
        <div className="space-y-4 mb-6">
          <div className="bg-[#1e2532] rounded-lg p-4">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center mr-4">
                <i className="fas fa-comments text-white text-xl"></i>
              </div>
              <div>
                <h3 className="text-white font-semibold mb-1">Live Chat</h3>
                <p className="text-gray-400 text-sm">Chat with our support team in real-time</p>
              </div>
            </div>
          </div>

          <div className="bg-[#1e2532] rounded-lg p-4">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center mr-4">
                <i className="fas fa-envelope text-white text-xl"></i>
              </div>
              <div>
                <h3 className="text-white font-semibold mb-1">Email Support</h3>
                <p className="text-gray-400 text-sm">support@quotex.com</p>
              </div>
            </div>
          </div>

          <div className="bg-[#1e2532] rounded-lg p-4">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center mr-4">
                <i className="fas fa-phone text-white text-xl"></i>
              </div>
              <div>
                <h3 className="text-white font-semibold mb-1">Phone Support</h3>
                <p className="text-gray-400 text-sm">+1 (555) 123-4567</p>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <div className="bg-[#1e2532] rounded-lg p-6">
          <h3 className="text-white font-semibold mb-4">Send us a message</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full bg-[#2a3142] border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full bg-[#2a3142] border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">Subject</label>
              <input
                type="text"
                name="subject"
                value={formData.subject}
                onChange={handleInputChange}
                className="w-full bg-[#2a3142] border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">Message</label>
              <textarea
                name="message"
                value={formData.message}
                onChange={handleInputChange}
                rows="4"
                className="w-full bg-[#2a3142] border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                required
              ></textarea>
            </div>
            <button
              type="submit"
              className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
            >
              Send Message
            </button>
          </form>
        </div>

        {/* Operating Hours */}
        <div className="bg-[#1e2532] rounded-lg p-6 mt-4">
          <h3 className="text-white font-semibold mb-4">Support Hours</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-300">Monday - Friday:</span>
              <span className="text-white">9:00 AM - 8:00 PM</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-300">Saturday:</span>
              <span className="text-white">10:00 AM - 6:00 PM</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-300">Sunday:</span>
              <span className="text-white">12:00 PM - 5:00 PM</span>
            </div>
          </div>
          <p className="text-gray-400 text-xs mt-3">All times are in EST. Live chat is available 24/7.</p>
        </div>
      </div>
    </div>
  );
};

export default SupportContact;
