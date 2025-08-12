"use client";
import React from 'react';

const Account = ({ setCurrentPage }) => (
  <div className="w-full h-full bg-[#23283a] p-6 overflow-x-auto">


    {/* Main Content: 3 columns */}
    <div className="flex gap-6 mt-4">
      {/* Left: Personal Data */}
      <div className="flex-1 max-w-xs bg-[#23283a] rounded-lg p-6 shadow-md border-r border-[#31374a] min-w-[320px]">
        <h2 className="text-lg font-bold text-white mb-4">Personal data:</h2>
        <div className="flex items-center mb-6">
          <div className="relative mr-4">
            <div className="w-16 h-16 bg-[#2a3142] rounded-full flex items-center justify-center">
              <i className="fas fa-user-circle text-5xl text-blue-400" />
            </div>
            <button className="absolute bottom-1 right-1 bg-[#23283a] border border-gray-600 rounded-full p-1 hover:bg-[#31374a]">
              <i className="fas fa-camera text-gray-400 text-xs" />
            </button>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-white font-semibold">biradotristan@gmail.com</span>
            </div>
            <div className="text-gray-400 text-xs">ID: 64315633</div>
            <span className="inline-flex items-center mt-2 px-2 py-0.5 bg-red-500 text-xs text-white rounded"><i className="fas fa-exclamation-circle mr-1" /> Not verified</span>
          </div>
        </div>
        <form className="space-y-3">
          <div>
            <label className="block text-gray-400 text-xs mb-1">Nickname</label>
            <input type="text" value="#64315633" className="w-full bg-[#23283a] border border-[#31374a] rounded px-3 py-2 text-white" readOnly />
          </div>
          <div>
            <label className="block text-gray-400 text-xs mb-1">First Name</label>
            <input type="text" value="Empty" className="w-full bg-[#23283a] border border-[#31374a] rounded px-3 py-2 text-white" readOnly />
          </div>
          <div>
            <label className="block text-gray-400 text-xs mb-1">Last Name</label>
            <input type="text" value="Empty" className="w-full bg-[#23283a] border border-[#31374a] rounded px-3 py-2 text-white" readOnly />
          </div>
          <div>
            <label className="block text-gray-400 text-xs mb-1">Date of birth</label>
            <input type="text" value="mm/dd/yyyy" className="w-full bg-[#23283a] border border-[#31374a] rounded px-3 py-2 text-white" readOnly />
          </div>
          <div>
            <label className="block text-gray-400 text-xs mb-1">Email</label>
            <div className="flex items-center gap-2">
              <input type="email" value="biradotristan@gmail.com" className="w-full bg-[#23283a] border border-[#31374a] rounded px-3 py-2 text-gray-400" readOnly />
              <span className="text-xs text-gray-400">Unverified</span>
              <button className="text-xs px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700">RESEND</button>
            </div>
          </div>
          <div>
            <label className="block text-gray-400 text-xs mb-1">Country</label>
            <select className="w-full bg-[#23283a] border border-[#31374a] rounded px-3 py-2 text-white appearance-none">
              <option>Åland Islands</option>
            </select>
          </div>
          <div>
            <label className="block text-gray-400 text-xs mb-1">Address</label>
            <input type="text" value="Empty" className="w-full bg-[#23283a] border border-[#31374a] rounded px-3 py-2 text-white" readOnly />
          </div>
          <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded mt-2">Save</button>
        </form>
      </div>

      {/* Middle: Document Verification & Security */}
      <div className="flex-1 min-w-[350px] max-w-md px-6">
        <div className="mb-6">
          <h2 className="text-lg font-bold text-white mb-4">Documents verification:</h2>
          <div className="bg-[#2a3142] border border-red-500 text-red-200 rounded p-6 flex items-center gap-3">
            <i className="fas fa-exclamation-triangle text-2xl text-red-500" />
            <span>You need fill identity information before verification your profile.</span>
          </div>
        </div>
        <div>
          <h2 className="text-lg font-bold text-white mb-4">Security:</h2>
          <div className="flex items-center mb-2">
            <span className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center mr-2"><i className="fas fa-check text-white text-xs" /></span>
            <span className="font-semibold text-white">Two-step verification</span>
          </div>
          <div className="flex items-center text-gray-400 text-sm mb-4">
            Receiving codes via Email
            <button className="ml-2 text-blue-400 hover:underline"><i className="fas fa-pen" /></button>
          </div>
          <div className="flex flex-col gap-2 mb-4">
            <div className="flex items-center gap-2">
              <span className="relative inline-block w-8 h-4 mr-2">
                <input type="checkbox" checked readOnly className="sr-only peer" />
                <span className="absolute left-0 top-0 w-8 h-4 bg-blue-600 rounded-full peer-checked:bg-blue-600 transition" />
                <span className="absolute left-0 top-0 w-4 h-4 bg-white rounded-full border border-gray-300 peer-checked:translate-x-4 transition-transform" />
              </span>
              <span className="text-white font-semibold">To enter the platform</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="relative inline-block w-8 h-4 mr-2">
                <input type="checkbox" checked readOnly className="sr-only peer" />
                <span className="absolute left-0 top-0 w-8 h-4 bg-blue-600 rounded-full peer-checked:bg-blue-600 transition" />
                <span className="absolute left-0 top-0 w-4 h-4 bg-white rounded-full border border-gray-300 peer-checked:translate-x-4 transition-transform" />
              </span>
              <span className="text-white font-semibold">To withdraw funds</span>
            </div>
          </div>
          <hr className="border-[#31374a] my-4" />
          <form className="space-y-3">
            <input type="password" placeholder="Old password" className="w-full bg-[#23283a] border border-[#31374a] rounded px-3 py-2 text-white" />
            <input type="password" placeholder="New password" className="w-full bg-[#23283a] border border-[#31374a] rounded px-3 py-2 text-white" />
            <input type="password" placeholder="Confirm new password" className="w-full bg-[#23283a] border border-[#31374a] rounded px-3 py-2 text-white" />
            <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded mt-2">Change Password</button>
          </form>
        </div>
      </div>

      {/* Right: Language, Timezone, Delete Account */}
      <div className="flex-1 min-w-[250px] max-w-xs bg-[#23283a] rounded-lg p-6 shadow-md flex flex-col gap-6 border-l border-[#31374a]">
        <div>
          <label className="block text-gray-400 text-xs mb-1">Language</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"><i className="fas fa-globe" /></span>
            <select className="w-full bg-[#23283a] border border-[#31374a] rounded px-8 py-2 text-white appearance-none">
              <option>English</option>
            </select>
          </div>
        </div>
        <div>
          <label className="block text-gray-400 text-xs mb-1">Timezone</label>
          <select className="w-full bg-[#23283a] border border-[#31374a] rounded px-3 py-2 text-white appearance-none">
            <option>(UTC+06:00)</option>
          </select>
        </div>
        <button className="text-red-500 font-semibold text-left hover:underline mt-2"><i className="fas fa-times-circle mr-2" />Delete Account</button>
      </div>
    </div>

    {/* Card Verification Section */}
    <div className="mt-10 bg-[#23283a] rounded-lg p-6 shadow-md">
      <h2 className="text-lg font-bold text-white mb-4">Credit / debit card verification:</h2>
      <div className="flex justify-end">
        <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded">ADD NEW CARD</button>
      </div>
    </div>
  </div>
);

export default Account;