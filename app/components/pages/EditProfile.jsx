"use client";
import React from 'react';

const EditProfile = ({ setCurrentPage }) => (
  <div className="w-full max-w-4xl mx-auto p-8">
    <button onClick={() => setCurrentPage('account')} className="text-secondary hover:text-white mb-6"><i className="fas fa-arrow-left mr-2" /> Back to Account</button>
    <h1 className="text-4xl font-bold text-white mb-8">Edit Profile</h1>
    <div className="bg-secondary p-6 rounded-lg">
      <form>
        <div className="flex items-center space-x-6 mb-8">
          <img src="https://placehold.co/100x100/2a2e39/ffffff?text=User" alt="User Avatar" className="rounded-full" />
          <div>
            <label htmlFor="avatar-upload" className="cursor-pointer bg-tertiary hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-md">Upload New Picture</label>
            <input id="avatar-upload" type="file" className="hidden" />
          </div>
        </div>
        <div className="space-y-6">
          <div>
            <label htmlFor="full_name" className="block mb-2 text-sm font-medium text-main">Full Name</label>
            <input type="text" id="full_name" className="bg-tertiary border border-custom text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5" defaultValue="John Doe" required />
          </div>
          <div>
            <label htmlFor="email" className="block mb-2 text-sm font-medium text-main">Email Address</label>
            <input type="email" id="email" className="bg-tertiary border border-custom text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5" defaultValue="john.doe@example.com" required />
          </div>
          <div>
            <label htmlFor="country" className="block mb-2 text-sm font-medium text-main">Country</label>
            <input type="text" id="country" className="bg-tertiary border border-custom text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5" defaultValue="USA" required />
          </div>
        </div>
        <button type="submit" className="mt-8 bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-md">Save Changes</button>
      </form>
    </div>
  </div>
);
export default EditProfile;
