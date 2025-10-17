"use client";
import React, { useState, useEffect } from 'react';
import { useClickOutside } from '../../lib/useClickOutside';
import { useAuth } from '../../lib/AuthContext';
import { useApi } from '../../lib/hooks';
import { CURRENCIES, formatCurrency, getCurrencySymbol } from '@/lib/currency';

const Header = ({ setCurrentPage }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showSignupModal, setShowSignupModal] = useState(false);
  const { user, token, login, logout, loading, accountType, setAccountType, refreshSession } = useAuth();
  const { apiCall } = useApi();
  const [liveBalance, setLiveBalance] = useState(null);
  const [demoBalance, setDemoBalance] = useState(null);
  const [tournamentBalance, setTournamentBalance] = useState(null);
  const [acctDropdownOpen, setAcctDropdownOpen] = useState(false);
  const [inActiveTournament, setInActiveTournament] = useState(false);
  const [displayCurrency, setDisplayCurrency] = useState('USD');
  const [convertedBalances, setConvertedBalances] = useState({ live: null, demo: null, tournament: null });
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [signupForm, setSignupForm] = useState({ 
    firstName: '', 
    lastName: '', 
    email: '', 
    password: '', 
    confirmPassword: '',
    phone: '',
    country: '',
    agreeToTerms: false 
  });
  const [loginLoading, setLoginLoading] = useState(false);
  const [signupLoading, setSignupLoading] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [signupError, setSignupError] = useState('');
  
  const dropdownRef = useClickOutside(() => {
    setIsDropdownOpen(false);
  });

  const handleLoginClick = () => {
    if (user) {
      logout();
    } else {
      setShowLoginModal(true);
    }
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError('');
    
    try {
      await login(loginForm.email, loginForm.password);
      setShowLoginModal(false);
      setLoginForm({ email: '', password: '' });
    } catch (error) {
      setLoginError(error.message || 'Login failed');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    setSignupLoading(true);
    setSignupError('');
    
    if (signupForm.password !== signupForm.confirmPassword) {
      setSignupError('Passwords do not match');
      setSignupLoading(false);
      return;
    }
    
    if (!signupForm.agreeToTerms) {
      setSignupError('Please agree to terms and conditions');
      setSignupLoading(false);
      return;
    }
    
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(signupForm),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setShowSignupModal(false);
        setShowLoginModal(true);
        setSignupForm({ 
          firstName: '', 
          lastName: '', 
          email: '', 
          password: '', 
          confirmPassword: '',
          phone: '',
          country: '',
          agreeToTerms: false 
        });
        alert('Account created successfully! Please login.');
      } else {
        setSignupError(data.error || 'Registration failed');
      }
    } catch (error) {
      setSignupError('Registration failed. Please try again.');
    } finally {
      setSignupLoading(false);
    }
  };

  const handleAccountClick = () => {
    window.location.href = '/account';
  };

  const handleSettingsClick = () => {
    window.location.href = '/settings';
  };

  const handleDepositClick = () => {
    window.location.href = '/deposit';
  };

  const handleWithdrawalClick = () => {
    window.location.href = '/withdrawal';
  };

  // Initialize preferred currency from user profile
  useEffect(() => {
    if (user?.preferred_currency) {
      setDisplayCurrency(user.preferred_currency);
    }
  }, [user]);

  // Fetch fresh live account balance so header doesn't show 0.00 from stale user context
  useEffect(() => {
    let cancelled = false;

    const fetchBalance = async () => {
      if (!user || !token) return;
      try {
        const resp = await apiCall('/api/users/stats');
  const bal = Number(resp?.stats?.currentBalance ?? 0);
  const demo = Number(resp?.stats?.demoBalance ?? user?.demo_balance ?? 0);
  const tour = Number(resp?.stats?.tournamentBalance ?? user?.tournament_balance ?? 0);
        if (!cancelled) {
          setLiveBalance(bal);
          setDemoBalance(demo);
          setTournamentBalance(tour);
          setInActiveTournament(Boolean(resp?.stats?.isInActiveTournament));
        }
      } catch (_) {
        // ignore; fallback to user.balance
      }
    };

    const onBalanceUpdated = () => {
      fetchBalance();
    };

    if (user) {
      fetchBalance();
      // light polling to keep it reasonably fresh while user is active
      const id = setInterval(fetchBalance, 15000);
      window.addEventListener('wallet:balance-updated', onBalanceUpdated);
      return () => {
        cancelled = true;
        clearInterval(id);
        window.removeEventListener('wallet:balance-updated', onBalanceUpdated);
      };
    } else {
      setLiveBalance(null);
    }
  }, [user, token]);

  // Ensure we never show tournament account if not in an active tournament
  useEffect(() => {
    if (accountType === 'tournament' && !inActiveTournament) {
      setAccountType('live');
    }
  }, [accountType, inActiveTournament, setAccountType]);

  const currentBalanceRaw = () => {
    if (!user) return 10000;
    if (accountType === 'demo') return (demoBalance ?? user?.demo_balance ?? 10000);
    if (accountType === 'tournament') return (tournamentBalance ?? user?.tournament_balance ?? 0);
    return (liveBalance ?? user?.balance ?? 0);
  };

  const currentBalanceDisplay = () => {
    const raw = Number(currentBalanceRaw() ?? 0);
    // Only convert LIVE account balance; others stay USD
    if (accountType === 'live') {
      const converted = Number(convertedBalances.live ?? raw);
      return formatCurrency(converted, displayCurrency);
    }
    return formatCurrency(raw, 'USD');
  };

  // Convert balances when displayCurrency changes
  useEffect(() => {
    const convert = async () => {
      const rawLive = Number(liveBalance ?? user?.balance ?? 0);
      // We keep demo/tournament in USD, no conversion needed
      try {
        const [resLive] = await Promise.all([
          fetch('/api/currency/convert', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ from_currency: 'USD', to_currency: displayCurrency, amount: rawLive }) }).then(r=>r.json()).catch(()=>({ converted_amount: rawLive })),
        ]);
        setConvertedBalances({
          live: Number(resLive.converted_amount ?? rawLive),
          demo: null,
          tournament: null,
        });
      } catch {
        setConvertedBalances({ live: rawLive, demo: null, tournament: null });
      }
    };
    convert();
  }, [displayCurrency, liveBalance, demoBalance, tournamentBalance, user]);

  const handleChangeDisplayCurrency = async (code) => {
    const prev = displayCurrency;
    setDisplayCurrency(code);
    // Persist to profile if logged-in (server will deduct $0.10 fee when currency actually changes)
    try {
      if (user && code !== prev) {
        const res = await apiCall('/api/users/profile', { method: 'PUT', body: JSON.stringify({ preferred_currency: code }) });
        // Ask UI to refresh balances
        window.dispatchEvent(new Event('wallet:balance-updated'));
      }
    } catch (e) {
      alert(e?.message || 'Failed to change currency');
      // Revert selection on error
      setDisplayCurrency(prev);
    }
  };

  // Ensure header reflects cookie session right away on first load/refresh
  useEffect(() => {
    // If user is null but we might have cookie, try hydrate once
    if (!user) {
      refreshSession().catch(()=>{});
    }
  }, []);

  return (
    <header className="w-full max-w-none bg-[#2a3142] flex items-center justify-between px-4 py-3 border-b border-gray-700 shadow-lg flex-shrink-0">
      <div className="flex items-center space-x-4">
        <div className="text-white font-bold text-xl">Trading</div>
        <div className="hidden md:block text-gray-400 text-sm font-medium">WEB TRADING PLATFORM</div>
      </div>
      <div className="flex items-center space-x-3">
        <div className="hidden lg:flex items-center bg-green-500/10 border border-green-500/30 rounded-lg px-4 py-2 text-sm">
          <i className="fas fa-gift mr-2 text-green-400" />
          <span className="text-white font-medium">Get a 30% bonus on your first deposit</span>
          <div className="ml-3 bg-green-500 text-white text-xs font-bold rounded px-2 py-1">30%</div>
        </div>
        <div className="relative">
          <button
            onClick={() => setAcctDropdownOpen((v) => !v)}
            className="flex items-center space-x-2 bg-[#1a2036] px-3 py-2 rounded-lg border border-gray-600 hover:bg-[#242b46]"
          >
            <i className={`fas ${accountType==='demo' ? 'fa-graduation-cap text-blue-400' : accountType==='tournament' ? 'fa-trophy text-purple-400' : 'fa-wallet text-green-400'}`} />
            <div className="text-left">
              <div className="text-xs text-gray-400 font-medium">
                {accountType==='demo' ? 'DEMO ACCOUNT' : accountType==='tournament' ? 'TOURNAMENT' : 'LIVE ACCOUNT'}
              </div>
              <div className="text-white font-bold">
                {currentBalanceDisplay()}
              </div>
            </div>
            <i className="fas fa-chevron-down text-xs text-gray-400"></i>
          </button>
          {acctDropdownOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-gray-800 border border-gray-700 rounded-lg shadow-lg z-50">
              <div className="px-4 py-2 text-xs text-gray-400">Switch Account</div>
              {[{key:'live', label:'Live', icon:'fa-wallet', color:'text-green-400', value:(liveBalance ?? user?.balance ?? 0)},
                {key:'demo', label:'Demo', icon:'fa-graduation-cap', color:'text-blue-400', value:(demoBalance ?? user?.demo_balance ?? 10000)},
                ...(inActiveTournament ? [{key:'tournament', label:'Tournament', icon:'fa-trophy', color:'text-purple-400', value:(tournamentBalance ?? user?.tournament_balance ?? 0)}] : [])].map((opt)=> (
                <button
                  key={opt.key}
                  onClick={()=>{ setAccountType(opt.key); setAcctDropdownOpen(false); window.dispatchEvent(new Event('wallet:balance-updated')); }}
                  className={`flex w-full items-center justify-between px-4 py-2 hover:bg-gray-700 ${accountType===opt.key ? 'bg-gray-700' : ''}`}
                >
                  <span className="flex items-center gap-2">
                    <i className={`fas ${opt.icon} ${opt.color}`}></i>
                    <span className="text-white text-sm">{opt.label}</span>
                  </span>
                  <span className="text-gray-300 text-sm">
                    {opt.key === 'live'
                      ? formatCurrency(Number(convertedBalances.live ?? opt.value), displayCurrency)
                      : formatCurrency(Number(opt.value), 'USD')}
                  </span>
                </button>
              ))}
              <div className="border-t border-gray-700 mt-1" />
              <div className="px-4 py-2 text-xs text-gray-400">Live Currency</div>
              <div className="px-3 pb-3">
                <select
                  value={displayCurrency}
                  onChange={(e)=>handleChangeDisplayCurrency(e.target.value)}
                  className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1 text-xs text-white"
                >
                  {Object.entries(CURRENCIES).map(([code, info]) => (
                    <option key={code} value={code}>{info.symbol} {code}</option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </div>
        <button 
          onClick={handleDepositClick} 
          className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-lg transition duration-300 shadow-md"
        >
          <i className="fas fa-plus-circle mr-2" />Deposit
        </button>
        <button 
          onClick={handleWithdrawalClick} 
          className="bg-[#1a2036] hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg transition duration-300 border border-gray-600"
        >
          Withdrawal
        </button>
        
        <div className="relative" ref={dropdownRef}>
          <button 
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center space-x-2 bg-gray-700 hover:bg-gray-600 px-3 py-2 rounded-lg transition-colors"
          >
            <i className="fas fa-user text-gray-300"></i>
            <span className="text-sm">
              {user ? `${user.firstName || 'User'}` : 'Account'}
            </span>
            <i className="fas fa-chevron-down text-xs"></i>
          </button>
          
          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-gray-800 border border-gray-700 rounded-lg shadow-lg z-50">
              {user ? (
                <>
                  <div className="px-4 py-2 border-b border-gray-700">
                    <div className="text-sm text-white font-medium">{user.firstName} {user.lastName}</div>
                    <div className="text-xs text-gray-400">{user.email}</div>
                  </div>
                  <button 
                    onClick={handleAccountClick}
                    className="block w-full text-left px-4 py-2 hover:bg-gray-700 transition-colors"
                  >
                    <i className="fas fa-user mr-2"></i>
                    My Account
                  </button>
                  <button 
                    onClick={handleSettingsClick}
                    className="block w-full text-left px-4 py-2 hover:bg-gray-700 transition-colors"
                  >
                    <i className="fas fa-cog mr-2"></i>
                    Settings
                  </button>
                  <hr className="border-gray-700 my-1" />
                  <button 
                    onClick={handleLoginClick}
                    className="block w-full text-left px-4 py-2 hover:bg-gray-700 text-red-400 transition-colors"
                  >
                    <i className="fas fa-sign-out-alt mr-2"></i>
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <button 
                    onClick={handleLoginClick}
                    className="block w-full text-left px-4 py-2 hover:bg-gray-700 text-green-400 transition-colors"
                  >
                    <i className="fas fa-sign-in-alt mr-2"></i>
                    Login
                  </button>
                  <button 
                    onClick={() => setShowSignupModal(true)}
                    className="block w-full text-left px-4 py-2 hover:bg-gray-700 transition-colors"
                  >
                    <i className="fas fa-user-plus mr-2"></i>
                    Sign Up
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Login Modal */}
      {showLoginModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-white">Login to Your Account</h2>
              <button 
                onClick={() => setShowLoginModal(false)}
                className="text-gray-400 hover:text-white"
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              {loginError && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-red-400 text-sm">
                  {loginError}
                </div>
              )}
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={loginForm.email}
                  onChange={(e) => setLoginForm({...loginForm, email: e.target.value})}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white"
                  placeholder="Enter your email"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Password
                </label>
                <input
                  type="password"
                  value={loginForm.password}
                  onChange={(e) => setLoginForm({...loginForm, password: e.target.value})}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white"
                  placeholder="Enter your password"
                  required
                />
              </div>
              
              <div className="flex justify-between items-center">
                <button
                  type="button"
                  onClick={() => window.location.href = '/auth/forgot-password'}
                  className="text-sm text-blue-400 hover:text-blue-300"
                >
                  Forgot Password?
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowLoginModal(false);
                    setShowSignupModal(true);
                  }}
                  className="text-sm text-blue-400 hover:text-blue-300"
                >
                  Create Account
                </button>
              </div>
              
              <button
                type="submit"
                disabled={loginLoading}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg transition duration-300"
              >
                {loginLoading ? 'Logging in...' : 'Login'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Signup Modal */}
      {showSignupModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-white">Create Your Account</h2>
              <button 
                onClick={() => setShowSignupModal(false)}
                className="text-gray-400 hover:text-white"
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            
            <form onSubmit={handleSignupSubmit} className="space-y-4">
              {signupError && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-red-400 text-sm">
                  {signupError}
                </div>
              )}
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    First Name
                  </label>
                  <input
                    type="text"
                    value={signupForm.firstName}
                    onChange={(e) => setSignupForm({...signupForm, firstName: e.target.value})}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white"
                    placeholder="First name"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Last Name
                  </label>
                  <input
                    type="text"
                    value={signupForm.lastName}
                    onChange={(e) => setSignupForm({...signupForm, lastName: e.target.value})}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white"
                    placeholder="Last name"
                    required
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={signupForm.email}
                  onChange={(e) => setSignupForm({...signupForm, email: e.target.value})}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white"
                  placeholder="Enter your email"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={signupForm.phone}
                  onChange={(e) => setSignupForm({...signupForm, phone: e.target.value})}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white"
                  placeholder="Enter your phone number"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Country
                </label>
                <select
                  value={signupForm.country}
                  onChange={(e) => setSignupForm({...signupForm, country: e.target.value})}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white"
                  required
                >
                  <option value="">Select your country</option>
                  <option value="US">United States</option>
                  <option value="UK">United Kingdom</option>
                  <option value="CA">Canada</option>
                  <option value="AU">Australia</option>
                  <option value="DE">Germany</option>
                  <option value="FR">France</option>
                  <option value="BD">Bangladesh</option>
                  <option value="IN">India</option>
                  <option value="PK">Pakistan</option>
                  <option value="SG">Singapore</option>
                  <option value="JP">Japan</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Password
                </label>
                <input
                  type="password"
                  value={signupForm.password}
                  onChange={(e) => setSignupForm({...signupForm, password: e.target.value})}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white"
                  placeholder="Create a strong password"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Confirm Password
                </label>
                <input
                  type="password"
                  value={signupForm.confirmPassword}
                  onChange={(e) => setSignupForm({...signupForm, confirmPassword: e.target.value})}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white"
                  placeholder="Confirm your password"
                  required
                />
              </div>
              
              <div className="flex items-start">
                <input
                  type="checkbox"
                  id="agreeToTerms"
                  checked={signupForm.agreeToTerms}
                  onChange={(e) => setSignupForm({...signupForm, agreeToTerms: e.target.checked})}
                  className="mt-1 mr-2"
                  required
                />
                <label htmlFor="agreeToTerms" className="text-sm text-gray-300">
                  I agree to the{' '}
                  <a href="/terms" className="text-blue-400 hover:text-blue-300" target="_blank">
                    Terms of Service
                  </a>{' '}
                  and{' '}
                  <a href="/privacy" className="text-blue-400 hover:text-blue-300" target="_blank">
                    Privacy Policy
                  </a>
                </label>
              </div>
              
              <div className="flex justify-between items-center">
                <button
                  type="button"
                  onClick={() => {
                    setShowSignupModal(false);
                    setShowLoginModal(true);
                  }}
                  className="text-sm text-blue-400 hover:text-blue-300"
                >
                  Already have an account? Login
                </button>
              </div>
              
              <button
                type="submit"
                disabled={signupLoading}
                className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg transition duration-300"
              >
                {signupLoading ? 'Creating Account...' : 'Create Account'}
              </button>
            </form>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
