"use client";
import React, { useState } from 'react';
import AdminPageHeader from '../components/AdminPageHeader';
import Card from '../components/Card';

export default function UsersNewPage() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    country: '',
    city: '',
    zipCode: '',
    accountType: 'standard',
    initialBalance: '',
    password: '',
    confirmPassword: '',
    isVerified: false,
    permissions: {
      canTrade: true,
      canDeposit: true,
      canWithdraw: true,
      canUseSignals: false,
      canAccessTournaments: false
    },
    notes: ''
  });

  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.startsWith('permissions.')) {
      const permissionKey = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        permissions: {
          ...prev.permissions,
          [permissionKey]: checked
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid';
    if (!formData.password) newErrors.password = 'Password is required';
    if (formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters';
    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
    if (!formData.country.trim()) newErrors.country = 'Country is required';
    if (formData.initialBalance && isNaN(formData.initialBalance)) newErrors.initialBalance = 'Initial balance must be a number';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      alert('User created successfully!');
      // Reset form
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        country: '',
        city: '',
        zipCode: '',
        accountType: 'standard',
        initialBalance: '',
        password: '',
        confirmPassword: '',
        isVerified: false,
        permissions: {
          canTrade: true,
          canDeposit: true,
          canWithdraw: true,
          canUseSignals: false,
          canAccessTournaments: false
        },
        notes: ''
      });
    } catch (error) {
      alert('Error creating user. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const generatePassword = () => {
    const length = 12;
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
    let password = "";
    for (let i = 0; i < length; i++) {
      password += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    setFormData(prev => ({ ...prev, password, confirmPassword: password }));
  };

  return (
    <div>
      <AdminPageHeader 
        title="Create New User" 
        subtitle="Add a new user account to the trading platform" 
      />

      <div className="max-w-4xl">
        <Card title="User Registration Form">
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Personal Information */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                👤 Personal Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    First Name *
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 bg-[#1a1f33] border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.firstName ? 'border-red-500' : 'border-[#262b40]'
                    }`}
                    placeholder="Enter first name"
                  />
                  {errors.firstName && <p className="text-red-400 text-xs mt-1">{errors.firstName}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Last Name *
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 bg-[#1a1f33] border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.lastName ? 'border-red-500' : 'border-[#262b40]'
                    }`}
                    placeholder="Enter last name"
                  />
                  {errors.lastName && <p className="text-red-400 text-xs mt-1">{errors.lastName}</p>}
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                📞 Contact Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 bg-[#1a1f33] border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.email ? 'border-red-500' : 'border-[#262b40]'
                    }`}
                    placeholder="user@example.com"
                  />
                  {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 bg-[#1a1f33] border border-[#262b40] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
              </div>
            </div>

            {/* Location */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                🌍 Location
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Country *
                  </label>
                  <select
                    name="country"
                    value={formData.country}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 bg-[#1a1f33] border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.country ? 'border-red-500' : 'border-[#262b40]'
                    }`}
                  >
                    <option value="">Select Country</option>
                    <option value="US">United States</option>
                    <option value="UK">United Kingdom</option>
                    <option value="CA">Canada</option>
                    <option value="AU">Australia</option>
                    <option value="DE">Germany</option>
                    <option value="FR">France</option>
                    <option value="JP">Japan</option>
                    <option value="BD">Bangladesh</option>
                    <option value="IN">India</option>
                  </select>
                  {errors.country && <p className="text-red-400 text-xs mt-1">{errors.country}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    City
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 bg-[#1a1f33] border border-[#262b40] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter city"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    ZIP Code
                  </label>
                  <input
                    type="text"
                    name="zipCode"
                    value={formData.zipCode}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 bg-[#1a1f33] border border-[#262b40] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="12345"
                  />
                </div>
              </div>
            </div>

            {/* Account Settings */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                ⚙️ Account Settings
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Account Type
                  </label>
                  <select
                    name="accountType"
                    value={formData.accountType}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 bg-[#1a1f33] border border-[#262b40] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="standard">Standard Account</option>
                    <option value="premium">Premium Account</option>
                    <option value="vip">VIP Account</option>
                    <option value="demo">Demo Account</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Initial Balance ($)
                  </label>
                  <input
                    type="number"
                    name="initialBalance"
                    value={formData.initialBalance}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 bg-[#1a1f33] border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.initialBalance ? 'border-red-500' : 'border-[#262b40]'
                    }`}
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                  />
                  {errors.initialBalance && <p className="text-red-400 text-xs mt-1">{errors.initialBalance}</p>}
                </div>
              </div>

              <div className="mt-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="isVerified"
                    checked={formData.isVerified}
                    onChange={handleInputChange}
                    className="mr-2 rounded"
                  />
                  <span className="text-sm text-gray-300">Mark account as verified</span>
                </label>
              </div>
            </div>

            {/* Security */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                🔒 Security
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Password *
                  </label>
                  <div className="relative">
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 bg-[#1a1f33] border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 pr-20 ${
                        errors.password ? 'border-red-500' : 'border-[#262b40]'
                      }`}
                      placeholder="Enter password"
                    />
                    <button
                      type="button"
                      onClick={generatePassword}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 text-xs bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700"
                    >
                      Generate
                    </button>
                  </div>
                  {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Confirm Password *
                  </label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 bg-[#1a1f33] border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.confirmPassword ? 'border-red-500' : 'border-[#262b40]'
                    }`}
                    placeholder="Confirm password"
                  />
                  {errors.confirmPassword && <p className="text-red-400 text-xs mt-1">{errors.confirmPassword}</p>}
                </div>
              </div>
            </div>

            {/* Permissions */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                🔑 Permissions
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="permissions.canTrade"
                    checked={formData.permissions.canTrade}
                    onChange={handleInputChange}
                    className="mr-2 rounded"
                  />
                  <span className="text-sm text-gray-300">Can Trade</span>
                </label>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="permissions.canDeposit"
                    checked={formData.permissions.canDeposit}
                    onChange={handleInputChange}
                    className="mr-2 rounded"
                  />
                  <span className="text-sm text-gray-300">Can Deposit</span>
                </label>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="permissions.canWithdraw"
                    checked={formData.permissions.canWithdraw}
                    onChange={handleInputChange}
                    className="mr-2 rounded"
                  />
                  <span className="text-sm text-gray-300">Can Withdraw</span>
                </label>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="permissions.canUseSignals"
                    checked={formData.permissions.canUseSignals}
                    onChange={handleInputChange}
                    className="mr-2 rounded"
                  />
                  <span className="text-sm text-gray-300">Can Use Signals</span>
                </label>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="permissions.canAccessTournaments"
                    checked={formData.permissions.canAccessTournaments}
                    onChange={handleInputChange}
                    className="mr-2 rounded"
                  />
                  <span className="text-sm text-gray-300">Can Access Tournaments</span>
                </label>
              </div>
            </div>

            {/* Notes */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                📝 Additional Notes
              </h3>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-3 py-2 bg-[#1a1f33] border border-[#262b40] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter any additional notes or comments about this user..."
              />
            </div>

            {/* Submit Buttons */}
            <div className="flex justify-end space-x-4 pt-4 border-t border-[#262b40]">
              <button
                type="button"
                onClick={() => window.history.back()}
                className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Creating User...' : 'Create User'}
              </button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}
