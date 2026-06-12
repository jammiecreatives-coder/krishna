/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  ConfirmationResult,
  signOut
} from 'firebase/auth';
import { auth, googleProvider } from '../firebase';
import {
  createUserProfile,
  getUserProfile,
  UserProfile
} from '../services/dbService';
import {
  Mail,
  Lock,
  Phone,
  User,
  Building,
  Loader2,
  CheckCircle,
  AlertCircle,
  Sparkles,
  ArrowRight,
  Shield,
  KeyRound,
  Chrome
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface AuthSystemProps {
  onClose?: () => void;
  onSuccess?: (userProfile: UserProfile) => void;
  initialMode?: 'signin' | 'signup';
}

export default function AuthSystem({ onClose, onSuccess, initialMode = 'signin' }: AuthSystemProps) {
  const [mode, setMode] = useState<'signin' | 'signup'>(initialMode);
  const [authMethod, setAuthMethod] = useState<'email' | 'phone'>('email');
  
  // Form fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [companyName, setCompanyName] = useState('');
  
  // Phone verification state
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  
  // Statuses
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  
  const recaptchaVerifierRef = useRef<RecaptchaVerifier | null>(null);

  // Clear reCAPTCHA on unmount
  useEffect(() => {
    return () => {
      if (recaptchaVerifierRef.current) {
        recaptchaVerifierRef.current.clear();
        recaptchaVerifierRef.current = null;
      }
    };
  }, []);

  // Initializeinvisible reCAPTCHA
  const setupRecaptcha = (): RecaptchaVerifier => {
    if (recaptchaVerifierRef.current) {
      return recaptchaVerifierRef.current;
    }
    
    // Create an invisible recaptcha container or retrieve it if container is already mounted.
    try {
      const container = document.getElementById('recaptcha-container');
      if (!container) {
        const div = document.createElement('div');
        div.id = 'recaptcha-container';
        document.body.appendChild(div);
      }
      
      const verifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        size: 'invisible',
        callback: () => {
          // Recaptcha resolved
        },
        'expired-callback': () => {
          setErrorMsg('reCAPTCHA expired. Please try requesting OTP again.');
        }
      });
      recaptchaVerifierRef.current = verifier;
      return verifier;
    } catch (err: any) {
      console.error('Recaptcha preparation issue:', err);
      throw new Error('Failed to prepare verification safety checks.');
    }
  };

  // Google Authentication Handler (Single Sign-on)
  const handleGoogleSignIn = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      
      // Attempt to retrieve existing role profile
      let profile = await getUserProfile(user.uid);
      if (!profile) {
        // Create matching B2B profile for the user
        const companyLabel = companyName.trim() || 'Direct B2B Client';
        profile = await createUserProfile(user.uid, {
          name: user.displayName || 'B2B Client',
          email: user.email || '',
          phone: user.phoneNumber || '',
          companyName: companyLabel
        });
      }
      
      setSuccessMsg('Authenticated successfully with Google.');
      setTimeout(() => {
        if (onSuccess && profile) onSuccess(profile);
        if (onClose) onClose();
      }, 1000);
    } catch (err: any) {
      console.error('Google Sign-In Error:', err);
      // Give a helpful, descriptive error
      if (err.code === 'auth/popup-closed-by-user' || err.code === 'auth/cancelled-popup-request' || err.message?.includes('popup-closed')) {
        setErrorMsg("Google Sign-In popups are blocked or closed in this secure preview window. To sign in via Google, please click the 'Open in New Tab' button in the top-right corner to open the app directly. Alternatively, you can use Email & Password or Mobile OTP login below, which work seamlessly here!");
      } else {
        setErrorMsg(err.message || 'Google verification failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Email/Password login & signup
  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      if (mode === 'signup') {
        if (!name.trim()) throw new Error('Please fill out your contact name profile.');
        if (!companyName.trim()) throw new Error('Company enterprise name is required for registration.');
        if (!email.trim() || !password.trim()) throw new Error('Email and password must not be empty.');
        if (password.length < 6) throw new Error('Password must hold at least 6 characters.');

        const result = await createUserWithEmailAndPassword(auth, email.trim(), password);
        const profile = await createUserProfile(result.user.uid, {
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim(),
          companyName: companyName.trim()
        });

        setSuccessMsg('Account registered successfully! Welcome aboard.');
        setTimeout(() => {
          if (onSuccess) onSuccess(profile);
          if (onClose) onClose();
        }, 1200);
      } else {
        if (!email.trim() || !password.trim()) throw new Error('Email credentials must be populated.');
        const result = await signInWithEmailAndPassword(auth, email.trim(), password);
        const profile = await getUserProfile(result.user.uid);
        
        let targetProfile = profile;
        if (!targetProfile) {
          // Graceful fallback profile
          targetProfile = await createUserProfile(result.user.uid, {
            name: result.user.displayName || 'B2B Client',
            email: result.user.email || email.trim(),
            phone: result.user.phoneNumber || '',
            companyName: 'Independent Corporate Client'
          });
        }

        setSuccessMsg('Signed in successfully.');
        setTimeout(() => {
          if (onSuccess && targetProfile) onSuccess(targetProfile);
          if (onClose) onClose();
        }, 1000);
      }
    } catch (err: any) {
      console.error('Email Auth Error:', err);
      let friendlyMessage = err.message;
      if (err.code === 'auth/email-already-in-use') {
        friendlyMessage = 'This email is already registered on our platform. Please log in.';
      } else if (err.code === 'auth/wrong-password' || err.code === 'auth/user-not-found') {
        friendlyMessage = 'Incorrect email or password combination.';
      } else if (err.code === 'auth/invalid-credential') {
        friendlyMessage = 'Invalid credentials. Please double check.';
      }
      setErrorMsg(friendlyMessage || 'Authentication failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  // Trigger Phone OTP request
  const handlePhoneRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone.startsWith('+')) {
      setErrorMsg('Please input your international country code format (e.g., +91 98290 88124).');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const verifier = setupRecaptcha();
      const cleanPhone = phone.replace(/\s+/g, '');
      const confirmResult = await signInWithPhoneNumber(auth, cleanPhone, verifier);
      setConfirmationResult(confirmResult);
      setOtpSent(true);
      setSuccessMsg('SMS verification code sent to your mobile phone.');
    } catch (err: any) {
      console.error('Phone OTP request issue:', err);
      setErrorMsg(err.message || 'Failed to dispatch verification SMS. Please check your number.');
    } finally {
      setLoading(false);
    }
  };

  // Verify code & complete Phone profile
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!confirmationResult) {
      setErrorMsg('No verification session found. Please dispatch OTP code again.');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const credential = await confirmationResult.confirm(otpCode);
      const user = credential.user;

      // Find or establish corresponding profile
      let profile = await getUserProfile(user.uid);
      if (!profile) {
        // Since mobile signup doesn't capture company & name instantly, we prompt or establish default placeholder fields
        profile = await createUserProfile(user.uid, {
          name: name.trim() || 'Client (Mobile Sign-In)',
          email: email.trim() || `${phone.replace(/[^0-9]/g, '')}@b2b-krishna.com`,
          phone: phone.trim() || user.phoneNumber || '',
          companyName: companyName.trim() || 'Corporate Entity'
        });
      }

      setSuccessMsg('Mobile authentication passed successfully.');
      setTimeout(() => {
        if (onSuccess && profile) onSuccess(profile);
        if (onClose) onClose();
      }, 1000);
    } catch (err: any) {
      console.error('OTP confirmation code failure:', err);
      setErrorMsg(err.code === 'auth/invalid-verification-code' ? 'Incorrect verification code entered. Please try again.' : err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white border-2 border-brand-blue shadow-2xl p-6 max-w-md w-full mx-auto text-slate-800">
      {/* Brand Header */}
      <div className="text-center mb-6 border-b border-slate-100 pb-4">
        <div className="w-12 h-12 bg-gradient-to-br from-brand-orange to-amber-600 flex items-center justify-center mx-auto mb-2 select-none">
          <Shield className="w-6 h-6 text-white" />
        </div>
        <h3 className="text-lg font-black tracking-tight text-brand-blue uppercase font-sans">
          Krishna Packaging <span className="text-brand-orange">Portal</span>
        </h3>
        <p className="text-xs text-slate-500 mt-1 font-sans">
          {mode === 'signin' ? 'Sign in to access your dashboard & manage quotations' : 'Establish your enterprise account profile'}
        </p>
      </div>

      {/* Tabs for Sign In vs Sign Up */}
      <div className="flex bg-slate-100 p-1 rounded-none mb-5 border border-slate-200">
        <button
          onClick={() => {
            setMode('signin');
            setErrorMsg('');
            setSuccessMsg('');
          }}
          className={`flex-1 py-1.5 text-xs font-bold uppercase tracking-wider text-center cursor-pointer transition-colors ${
            mode === 'signin' ? 'bg-brand-blue text-white' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Sign In
        </button>
        <button
          onClick={() => {
            setMode('signup');
            setErrorMsg('');
            setSuccessMsg('');
          }}
          className={`flex-1 py-1.5 text-xs font-bold uppercase tracking-wider text-center cursor-pointer transition-colors ${
            mode === 'signup' ? 'bg-brand-blue text-white' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Sign Up
        </button>
      </div>

      {/* Method Toggles (Email Account vs Mobile Phone SMS Verification) */}
      <div className="flex justify-center space-x-4 mb-4 text-xs font-sans">
        <button
          onClick={() => {
            setAuthMethod('email');
            setErrorMsg('');
            setOtpSent(false);
          }}
          className={`pb-1 border-b-2 font-semibold cursor-pointer ${
            authMethod === 'email' ? 'border-brand-orange text-brand-blue' : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          Email & Password
        </button>
        <button
          onClick={() => {
            setAuthMethod('phone');
            setErrorMsg('');
            setOtpSent(false);
          }}
          className={`pb-1 border-b-2 font-semibold cursor-pointer ${
            authMethod === 'phone' ? 'border-brand-orange text-brand-blue' : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          Mobile Number OTP
        </button>
      </div>

      {/* Displays active informational messages */}
      {errorMsg && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs flex items-start space-x-2 rounded-none font-sans">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{errorMsg}</span>
        </div>
      )}
      {successMsg && (
        <div className="mb-4 p-3 bg-emerald-50 border border-emerald-250 text-emerald-850 text-xs flex items-start space-x-2 rounded-none font-sans">
          <CheckCircle className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Form Area */}
      {authMethod === 'email' ? (
        <form onSubmit={handleEmailAuth} className="space-y-4">
          {mode === 'signup' && (
            <>
              {/* Full Contact Name */}
              <div className="space-y-1">
                <label className="block text-[10px] font-mono text-slate-500 uppercase tracking-widest font-bold">Your Name *</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                    <User className="w-4 h-4 text-slate-400" />
                  </span>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Vikram Singhal"
                    required
                    className="w-full bg-slate-50 border border-slate-300 px-3 py-2 pl-9 text-xs text-brand-blue outline-none focus:border-brand-orange focus:bg-white transition font-sans"
                  />
                </div>
              </div>

              {/* Company Enterprise name */}
              <div className="space-y-1">
                <label className="block text-[10px] font-mono text-slate-500 uppercase tracking-widest font-bold">Enterprise/Company Name *</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                    <Building className="w-4 h-4 text-slate-400" />
                  </span>
                  <input
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="e.g. Rajasthan Solar Solutions Ltd"
                    required
                    className="w-full bg-slate-50 border border-slate-300 px-3 py-2 pl-9 text-xs text-brand-blue outline-none focus:border-brand-orange focus:bg-white transition font-sans"
                  />
                </div>
              </div>

              {/* Contact phone (optional inside email flow but nice to have) */}
              <div className="space-y-1">
                <label className="block text-[10px] font-mono text-slate-500 uppercase tracking-widest font-bold">Phone (Mobile) Number</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                    <Phone className="w-4 h-4 text-slate-400" />
                  </span>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="e.g. +91 98290 88124"
                    className="w-full bg-slate-50 border border-slate-300 px-3 py-2 pl-9 text-xs text-brand-blue outline-none focus:border-brand-orange focus:bg-white transition font-sans"
                  />
                </div>
              </div>
            </>
          )}

          {/* Email Address */}
          <div className="space-y-1">
            <label className="block text-[10px] font-mono text-slate-500 uppercase tracking-widest font-bold">B2B Corporate Email *</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                <Mail className="w-4 h-4 text-slate-400" />
              </span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. purchase@rajasthansolar.in"
                required
                className="w-full bg-slate-50 border border-slate-300 px-3 py-2 pl-9 text-xs text-brand-blue outline-none focus:border-brand-orange focus:bg-white transition font-sans"
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-1">
            <label className="block text-[10px] font-mono text-slate-500 uppercase tracking-widest font-bold">Secure Password *</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                <Lock className="w-4 h-4 text-slate-400" />
              </span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••"
                required
                className="w-full bg-slate-50 border border-slate-300 px-3 py-2 pl-9 text-xs text-brand-blue outline-none focus:border-brand-orange focus:bg-white transition font-sans"
              />
            </div>
          </div>

          {/* Execute Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-brand-orange hover:bg-brand-orange/95 disabled:bg-slate-200 disabled:text-slate-400 font-extrabold uppercase py-3 border-transparent tracking-wider text-xs text-white flex items-center justify-center space-x-2 cursor-pointer transition-all duration-150 min-h-[44px]"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-white shrink-0" />
                <span>Working on gateway...</span>
              </>
            ) : (
              <>
                <span>{mode === 'signin' ? 'Sign In' : 'Sign Up & Create Profile'}</span>
                <ArrowRight className="w-4 h-4 text-white" />
              </>
            )}
          </button>
        </form>
      ) : (
        /* Phone Authentication flow options */
        <div className="space-y-4">
          {!otpSent ? (
            <form onSubmit={handlePhoneRequestOtp} className="space-y-4">
              {mode === 'signup' && (
                <>
                  <div className="space-y-1">
                    <label className="block text-[10px] font-mono text-slate-500 uppercase tracking-widest font-bold">Your Name *</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Vikram Singhal"
                      required
                      className="w-full bg-slate-50 border border-slate-300 px-3 py-2 text-xs text-brand-blue outline-none focus:border-brand-orange focus:bg-white transition font-sans"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-[10px] font-mono text-slate-500 uppercase tracking-widest font-bold">Enterprise/Company Name *</label>
                    <input
                      type="text"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      placeholder="e.g. Rajasthan Solar Solutions Ltd"
                      required
                      className="w-full bg-slate-50 border border-slate-300 px-3 py-2 text-xs text-brand-blue outline-none focus:border-brand-orange focus:bg-white transition font-sans"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-[10px] font-mono text-slate-500 uppercase tracking-widest font-bold">Email Address *</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g. contact@yourcompany.com"
                      required
                      className="w-full bg-slate-50 border border-slate-300 px-3 py-2 text-xs text-brand-blue outline-none focus:border-brand-orange focus:bg-white transition font-sans"
                    />
                  </div>
                </>
              )}

              <div className="space-y-1">
                <label className="block text-[10px] font-mono text-slate-500 uppercase tracking-widest font-bold">Mobile Phone (with country code) *</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                    <Phone className="w-4 h-4 text-slate-400" />
                  </span>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="e.g. +91 98290 88124"
                    required
                    className="w-full bg-slate-50 border border-slate-300 px-3 py-2 pl-9 text-xs text-brand-blue outline-none focus:border-brand-orange focus:bg-white transition font-sans"
                  />
                </div>
                <p className="text-[10px] text-slate-400 font-sans italic pt-0.5">Please provide international style prefix like +91 for India.</p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-brand-orange hover:bg-brand-orange/95 disabled:bg-slate-100 disabled:text-slate-404 font-extrabold uppercase py-3 border-transparent tracking-wider text-xs text-white flex items-center justify-center space-x-2 cursor-pointer min-h-[44px]"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin text-white shrink-0" /> : <span>Request SMS OTP Code</span>}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div className="space-y-1">
                <label className="block text-[10px] font-mono text-slate-500 uppercase tracking-widest font-bold">Enter SMS Code Code *</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                    <KeyRound className="w-4 h-4 text-slate-400" />
                  </span>
                  <input
                    type="text"
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value)}
                    placeholder="e.g. 123456"
                    required
                    maxLength={6}
                    className="w-full bg-slate-50 border border-slate-300 px-3 py-2 pl-9 text-xs text-brand-blue outline-none focus:border-brand-orange focus:bg-white transition font-sans text-center font-bold text-lg tracking-widest"
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-brand-orange hover:bg-brand-orange/95 disabled:bg-slate-100 text-white font-extrabold text-xs uppercase py-3 tracking-wider flex items-center justify-center space-x-2 pointer-events-auto cursor-pointer min-h-[44px]"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin text-white shrink-0" /> : <span>Verify OTP</span>}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setOtpSent(false);
                    setErrorMsg('');
                  }}
                  className="bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-700 px-4 text-xs font-bold pointer-events-auto cursor-pointer min-h-[44px]"
                >
                  Back
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {/* Google SSO Divider and Actions */}
      <div className="relative my-6 text-center select-none">
        <div className="absolute inset-0 flex items-center pointer-events-none">
          <div className="w-full border-t border-slate-200" />
        </div>
        <span className="relative bg-white px-3 text-[10px] font-mono text-slate-400 uppercase tracking-widest font-extrabold">Instant Integration</span>
      </div>

      <button
        onClick={handleGoogleSignIn}
        disabled={loading}
        className="w-full border-2 border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-extrabold text-xs uppercase py-3 pl-4 flex items-center justify-center space-x-2 cursor-pointer hover:border-brand-blue/30 active:scale-98 transition duration-150 min-h-[44px]"
      >
        <Chrome className="w-4 h-4 text-brand-orange" />
        <span>Continue with Google</span>
      </button>

      {window.self !== window.top && (
        <p className="text-[10px] text-slate-400 text-center mt-1.5 font-sans leading-normal">
          💡 Inside the preview iframe, please use Email/OTP login options below or click the <strong>"Open in New Tab"</strong> button on the top right for Google Sign-In.
        </p>
      )}

      {/* Safe secure disclaimer */}
      <div className="mt-6 flex items-center justify-center space-x-2 text-[10px] font-mono text-slate-400 border-t border-slate-100 pt-4 text-center">
        <Shield className="w-3.5 h-3.5 text-emerald-600" />
        <span>Firebase Multi-Factor Encrypted Onboarding</span>
      </div>
    </div>
  );
}
