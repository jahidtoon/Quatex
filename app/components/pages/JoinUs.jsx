import React from 'react';

const JoinUs = () => (
  <div className="w-full p-8 flex-1 items-center justify-center flex">
    <div className="w-full max-w-md mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-white">Create Your Account</h1>
        <p className="text-secondary mt-2">Join our community and start trading today.</p>
      </div>
      <div className="bg-secondary p-8 rounded-lg shadow-lg">
        <form>
          <div className="space-y-6">
            <div>
              <label htmlFor="join_full_name" className="block mb-2 text-sm font-medium text-main">Full Name</label>
              <input type="text" id="join_full_name" className="bg-tertiary border border-custom text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5" placeholder="John Doe" required />
            </div>
            <div>
              <label htmlFor="join_email" className="block mb-2 text-sm font-medium text-main">Email Address</label>
              <input type="email" id="join_email" className="bg-tertiary border border-custom text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5" placeholder="name@company.com" required />
            </div>
            <div>
              <label htmlFor="join_password" className="block mb-2 text-sm font-medium text-main">Password</label>
              <input type="password" id="join_password" className="bg-tertiary border border-custom text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5" placeholder="••••••••" required />
            </div>
          </div>
          <button type="submit" className="mt-8 w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-md">Create Account</button>
          <p className="text-sm text-secondary text-center mt-4">Already have an account? <a href="#" className="font-medium text-blue-500 hover:underline">Sign in</a></p>
        </form>
      </div>
    </div>
  </div>
);
export default JoinUs;
