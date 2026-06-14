/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signInWithRedirect,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  ConfirmationResult,
  signOut,
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence
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
  Chrome,
  Globe,
  Smartphone,
  Eye,
  EyeOff
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface AuthSystemProps {
  onClose?: () => void;
  onSuccess?: (userProfile: UserProfile) => void;
  initialMode?: 'signin' | 'signup';
}

interface Country {
  name: string;
  code: string;
  flag: string;
  placeholder: string;
  digitsLength: number;
}

const POPULAR_COUNTRIES: Country[] = [
  { name: 'India', code: '+91', flag: '🇮🇳', placeholder: '98290 88124', digitsLength: 10 },
  { name: 'United States', code: '+1', flag: '🇺🇸', placeholder: '201 555 0123', digitsLength: 10 },
  { name: 'United Kingdom', code: '+44', flag: '🇬🇧', placeholder: '7911 123456', digitsLength: 10 },
  { name: 'United Arab Emirates', code: '+971', flag: '🇦🇪', placeholder: '50 123 4567', digitsLength: 9 },
  { name: 'Singapore', code: '+65', flag: '🇸🇬', placeholder: '8123 4567', digitsLength: 8 },
  { name: 'Saudi Arabia', code: '+966', flag: '🇸🇦', placeholder: '50 123 4567', digitsLength: 9 },
  { name: 'Australia', code: '+61', flag: '🇦🇺', placeholder: '412 345 678', digitsLength: 9 },
];

export default function AuthSystem({ onClose, onSuccess, initialMode = 'signin' }: AuthSystemProps) {
  const [mode, setMode] = useState<'signin' | 'signup'>(initialMode);
  const [authMethod, setAuthMethod] = useState<'email' | 'phone'>('email');
  
  // Custom Remember Me state
  const [rememberMe, setRememberMe] = useState(true);

  // Form fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState('');
  const [phoneRaw, setPhoneRaw] = useState('');
  const [companyName, setCompanyName] = useState('');
  
  // Country Selector States
  const [selectedCountry, setSelectedCountry] = useState<Country>(POPULAR_COUNTRIES[0]);
  const [countryDropdownOpen, setCountryDropdownOpen] = useState(false);

  // Phone verification state
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  
  // Resend codes / validation timer
  const [countdown, setCountdown] = useState(0);
  
  // Statuses
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [gsoNotice, setGsoNotice] = useState(false);
  
  const recaptchaVerifierRef = useRef<RecaptchaVerifier | null>(null);
  const countdownIntervalRef = useRef<any>(null);

  // Countdown timer for resending OTP codes
  useEffect(() => {
    if (countdown > 0) {
      countdownIntervalRef.current = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    } else {
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
      }
    }
    return () => {
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    };
  }, [countdown]);

  // Clean reCAPTCHA widget on unmount
  useEffect(() => {
    return () => {
      if (recaptchaVerifierRef.current) {
        recaptchaVerifierRef.current.clear();
        recaptchaVerifierRef.current = null;
      }
    };
  }, []);

  // Format phone number dynamically based on active selected country
  const formatPhoneNumber = (val: string, country: Country) => {
    const digits = val.replace(/\D/g, '');
    
    if (country.code === '+91') { // India: 5-5 split (98290 88124)
      if (digits.length <= 5) return digits;
      return `${digits.slice(0, 5)} ${digits.slice(5, 10)}`;
    } else if (country.code === '+1') { // USA: (201) 555-0123
      if (digits.length <= 3) return digits;
      if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
      return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
    } else { // Generic premium split format
      if (digits.length <= 3) return digits;
      if (digits.length <= 6) return `${digits.slice(0, 3)} ${digits.slice(3)}`;
      return `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6, 12)}`;
    }
  };

  const handlePhoneInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value;
    const cleanVal = formatPhoneNumber(rawVal, selectedCountry);
    setPhoneRaw(cleanVal);
  };

  // Get full E.164 formatted international number
  const getE164PhoneNumber = () => {
    const digits = phoneRaw.replace(/\D/g, '');
    return `${selectedCountry.code}${digits}`;
  };

  // Setup reCAPTCHA verifier for phone OTP
  const setupRecaptcha = (): RecaptchaVerifier => {
    if (recaptchaVerifierRef.current) {
      return recaptchaVerifierRef.current;
    }
    
    try {
      const container = document.getElementById('recaptcha-container');
      if (!container) {
        const div = document.createElement('div');
        div.id = 'recaptcha-container';
        document.body.appendChild(div);
      }
      
      const verifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        size: 'invisible',
        callback: () => {},
        'expired-callback': () => {
          setErrorMsg('reCAPTCHA safety expired. Please click the button to retrieve OTP again.');
        }
      });
      recaptchaVerifierRef.current = verifier;
      return verifier;
    } catch (err: any) {
      console.error('reCAPTCHA verifier issue:', err);
      throw new Error('Failed to load safety verification components. Try refreshing.');
    }
  };

  // Sync auth persistence based on User 'Remember Me' preference
  const enforceAuthPersistence = async () => {
    try {
      const persistence = rememberMe ? browserLocalPersistence : browserSessionPersistence;
      await setPersistence(auth, persistence);
    } catch (err) {
      console.warn('Set Auth Persistence failed:', err);
    }
  };

  // Multi-platform Google SSO Sign-in with active Popup Failure / Redirect Fallback
  const handleGoogleSignIn = async () => {
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');
    setGsoNotice(false);

    try {
      await enforceAuthPersistence();
      
      // Determine if active inside an iframe environment
      const isIframe = window.self !== window.top;
      
      if (isIframe) {
        // Direct descriptive fallback warning
        setGsoNotice(true);
        setErrorMsg("Note: Third-party auth popups are restricted within iframe sandbox environments. Redirecting to external Google authentication portal...");
        setTimeout(async () => {
          try {
            await signInWithRedirect(auth, googleProvider);
          } catch (redErr: any) {
            setErrorMsg(`Redirect failed: ${redErr.message}. For instant signup, please use our Email or OTP verification below!`);
          }
        }, 1200);
        return;
      }

      // Try initial popup method
      const result = await signInWithPopup(auth, googleProvider);
      await finishAuthSuccess(result.user);
    } catch (err: any) {
      console.warn('Google Sign-In popup blocked or failed:', err);
      
      // Detect popup block or closed errors - trigger Redirect fallback instantly
      if (
        err.code === 'auth/popup-closed-by-user' || 
        err.code === 'auth/cancelled-popup-request' || 
        err.code === 'auth/popup-blocked' ||
        err.message?.includes('popup-closed') ||
        err.message?.includes('blocked')
      ) {
        setErrorMsg("Popup blocked. Attempting Google secure redirect fallback...");
        setTimeout(async () => {
          try {
            await signInWithRedirect(auth, googleProvider);
          } catch (redirErr: any) {
            setErrorMsg("Redirect also blocked. Please utilize our SMS OTP or secure Email credentials instead, which operate beautifully!");
          }
        }, 1000);
      } else {
        setErrorMsg(err.message || 'Google SSO verification failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Finish authentication and record profiles safely
  const finishAuthSuccess = async (user: any) => {
    let profile = await getUserProfile(user.uid);
    if (!profile) {
      const companyLabel = companyName.trim() || 'Direct B2B Client';
      const userLabel = name.trim() || user.displayName || 'B2B Partner';
      profile = await createUserProfile(user.uid, {
        name: userLabel,
        email: user.email || `${user.uid}@krishnapackaging.com`,
        phone: user.phoneNumber || phoneRaw.trim() || '',
        companyName: companyLabel
      });
    }
    
    setSuccessMsg('Successfully authenticated! Welcome to Krishna Packaging Portal.');
    setTimeout(() => {
      if (onSuccess && profile) onSuccess(profile);
      if (onClose) onClose();
    }, 1000);
  };

  // Email and Password Registration / Login
  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      await enforceAuthPersistence();

      if (mode === 'signup') {
        if (!name.trim()) throw new Error('Please enter your contact person name.');
        if (!companyName.trim()) throw new Error('Enterprise or company name is required.');
        if (!email.trim() || !password.trim()) throw new Error('Email and password fields are required.');
        if (password.length < 6) throw new Error('Password must hold at least 6 characters.');

        const result = await createUserWithEmailAndPassword(auth, email.trim(), password);
        const profile = await createUserProfile(result.user.uid, {
          name: name.trim(),
          email: email.trim(),
          phone: phoneRaw.trim(),
          companyName: companyName.trim()
        });

        setSuccessMsg('Corporate registered successfully! Opening portal.');
        setTimeout(() => {
          if (onSuccess) onSuccess(profile);
          if (onClose) onClose();
        }, 1200);
      } else {
        if (!email.trim() || !password.trim()) throw new Error('Please fill in your email and password.');
        const result = await signInWithEmailAndPassword(auth, email.trim(), password);
        let profile = await getUserProfile(result.user.uid);
        
        if (!profile) {
          profile = await createUserProfile(result.user.uid, {
            name: result.user.displayName || 'B2B Client Partner',
            email: result.user.email || email.trim(),
            phone: result.user.phoneNumber || '',
            companyName: 'Krishna Corporate Buyer'
          });
        }

        setSuccessMsg('Access approved. Welcome back.');
        setTimeout(() => {
          if (onSuccess && profile) onSuccess(profile);
          if (onClose) onClose();
        }, 1000);
      }
    } catch (err: any) {
      console.error('Email Auth Error:', err);
      let friendlyMessage = err.message;
      if (err.code === 'auth/email-already-in-use') {
        friendlyMessage = 'This email is already in use by another enterprise profile.';
      } else if (err.code === 'auth/wrong-password' || err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential') {
        friendlyMessage = 'Invalid email or password. Please verify your credentials.';
      } else if (err.code === 'auth/invalid-email') {
        friendlyMessage = 'Please enter a valid enterprise email format.';
      } else if (err.code === 'auth/operation-not-allowed') {
        friendlyMessage = "Email/Password sign-in is currently disabled. Please go to your Firebase Console -> 'Authentication' -> 'Sign-in method' tab and enable 'Email/Password'.";
      }
      setErrorMsg(friendlyMessage || 'Authentication gateway error. Provide valid parameters.');
    } finally {
      setLoading(false);
    }
  };

  // Dispatch Phone verification SMS OTP
  const handlePhoneRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    // Field validations
    const rawDigits = phoneRaw.replace(/\D/g, '');
    if (!rawDigits) {
      setErrorMsg('Please input your mobile phone number.');
      return;
    }
    
    if (rawDigits.length < selectedCountry.digitsLength - 1) {
      setErrorMsg(`Invalid length. ${selectedCountry.name} numbers require ${selectedCountry.digitsLength} digits.`);
      return;
    }

    if (mode === 'signup') {
      if (!name.trim()) { setErrorMsg('Contact person name is required.'); return; }
      if (!companyName.trim()) { setErrorMsg('Company / Enterprise name is required.'); return; }
      if (!email.trim()) { setErrorMsg('Corporate email address is required.'); return; }
    }

    setLoading(true);
    try {
      await enforceAuthPersistence();
      const verifier = setupRecaptcha();
      const fullPhoneNumber = getE164PhoneNumber();
      
      const confirmResult = await signInWithPhoneNumber(auth, fullPhoneNumber, verifier);
      setConfirmationResult(confirmResult);
      setOtpSent(true);
      setCountdown(60); // 60 seconds throttle
      setSuccessMsg(`A secure 6-digit OTP code has been dispatched to ${fullPhoneNumber}.`);
    } catch (err: any) {
      console.error('Phone SMS Dispatch Error:', err);
      let msg = err.message || 'SMS transmission failed.';
      if (err.code === 'auth/invalid-phone-number') {
        msg = 'Incorrect mobile phone specification. Please check code or length.';
      } else if (err.code === 'auth/too-many-requests') {
        msg = 'Too many requests received for this country code prefix. Please try again after some time.';
      } else if (err.code === 'auth/operation-not-allowed') {
        msg = "Phone OTP sign-in is currently disabled. Please go to your Firebase Console -> 'Authentication' -> 'Sign-in method' tab and enable the 'Phone' sign-in provider.";
      }
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  // Verify Phone OTP SMS
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!confirmationResult) {
      setErrorMsg('Expired SMS authentication session. Request a new OTP code.');
      return;
    }

    if (otpCode.length !== 6) {
      setErrorMsg('Verification code must contain exactly 6 digits.');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const credential = await confirmationResult.confirm(otpCode);
      await finishAuthSuccess(credential.user);
    } catch (err: any) {
      console.error('OTP confirmation code failure:', err);
      setErrorMsg(err.code === 'auth/invalid-verification-code' || err.code === 'auth/missing-verification-code' 
        ? 'Incorrect 6-digit confirmation code. Please recheck SMS or request a new one.' 
        : err.message
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative bg-white border border-[#e2e8f0] [box-shadow:0_25px_50px_-12px_rgba(0,33,71,0.25)] p-5 sm:p-7 max-w-md w-full mx-auto text-slate-800">
      {/* Brand Header */}
      <div className="text-center mb-5 pb-4 border-b border-slate-100">
        <div className="w-12 h-12 bg-brand-blue flex items-center justify-center mx-auto mb-2 relative group-hover:scale-105 transition-transform">
          <Shield className="w-6 h-6 text-[#FF6B00]" />
        </div>
        <h3 className="text-lg font-black tracking-tight text-brand-blue uppercase font-sans">
          Krishna Packaging <span className="text-[#FF6B00]">Portal</span>
        </h3>
        <p className="text-xs text-slate-500 mt-1 font-sans font-medium">
          {mode === 'signin' 
            ? 'Sign in to access your dashboard & verify live proposals' 
            : 'Establish your enterprise corporate B2B profile'
          }
        </p>
      </div>

      {/* Tabs for Sign In vs Sign Up */}
      <div className="flex bg-slate-50 p-1 rounded-none mb-5 border border-slate-200">
        <button
          onClick={() => {
            setMode('signin');
            setErrorMsg('');
            setSuccessMsg('');
          }}
          className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider text-center cursor-pointer transition-all duration-150 min-h-[38px] ${
            mode === 'signin' 
              ? 'bg-brand-blue text-white shadow-sm' 
              : 'text-slate-500 hover:text-slate-900'
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
          className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider text-center cursor-pointer transition-all duration-150 min-h-[38px] ${
            mode === 'signup' 
              ? 'bg-brand-blue text-white shadow-sm' 
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          Sign Up
        </button>
      </div>

      {/* Method Toggles (Email/Password vs SMS Mobile Phone Verification) */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        <button
          onClick={() => {
            setAuthMethod('email');
            setErrorMsg('');
            setSuccessMsg('');
            setOtpSent(false);
          }}
          className={`py-2 px-1 text-[11px] font-bold uppercase tracking-wider text-center border cursor-pointer transition-colors ${
            authMethod === 'email' 
              ? 'border-brand-blue bg-slate-50 text-brand-blue' 
              : 'border-slate-200 bg-white text-slate-400 hover:text-slate-600'
          }`}
        >
          Email & Password
        </button>
        <button
          onClick={() => {
            setAuthMethod('phone');
            setErrorMsg('');
            setSuccessMsg('');
            setOtpSent(false);
          }}
          className={`py-2 px-1 text-[11px] font-bold uppercase tracking-wider text-center border cursor-pointer transition-colors ${
            authMethod === 'phone' 
              ? 'border-brand-blue bg-slate-50 text-brand-blue' 
              : 'border-slate-200 bg-white text-slate-400 hover:text-slate-600'
          }`}
        >
          Mobile Number OTP
        </button>
      </div>

      {/* Action Notices */}
      {errorMsg && (
        <div className="mb-4 p-3 bg-rose-50 border-l-4 border-rose-500 text-rose-700 text-xs flex items-start space-x-2 font-sans rounded-none leading-relaxed">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span className="flex-1">{errorMsg}</span>
        </div>
      )}
      {successMsg && (
        <div className="mb-4 p-3 bg-emerald-50 border-l-4 border-emerald-500 text-emerald-900 text-xs flex items-start space-x-2 font-sans rounded-none leading-relaxed">
          <CheckCircle className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
          <span className="flex-1">{successMsg}</span>
        </div>
      )}

      {/* Google SSO frame error helper */}
      {gsoNotice && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 text-blue-900 text-xs space-y-1.5 font-sans rounded-none">
          <p className="font-bold flex items-center shrink-0">
            <Sparkles className="w-3.5 h-3.5 mr-1 text-[#FF6B00]" /> 
            Google Auth Platform Fallback
          </p>
          <p className="text-[11px] leading-relaxed">
            Popups are blocked inside preview window wrapper. To complete with Google SSO:
          </p>
          <a 
            href={window.location.href}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block bg-brand-orange hover:bg-brand-orange/90 text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-none shadow-sm cursor-pointer"
          >
            Launch Portal in a Dedicated Tab
          </a>
        </div>
      )}

      {/* Forms Segment container */}
      {authMethod === 'email' ? (
        <form onSubmit={handleEmailAuth} className="space-y-4">
          {mode === 'signup' && (
            <div className="space-y-4 animate-fadeIn">
              {/* Full Contact Name */}
              <div className="space-y-1">
                <label className="block text-[10px] font-mono text-slate-500 uppercase tracking-widest font-bold">Contact Name *</label>
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
                    className="w-full bg-slate-55 border border-slate-300 px-3 py-2 pl-9 text-xs text-brand-blue outline-none [border-radius:0] focus:border-[#FF6B00] focus:bg-white transition font-sans min-h-[40px]"
                  />
                </div>
              </div>

              {/* Company Enterprise name */}
              <div className="space-y-1">
                <label className="block text-[10px] font-mono text-slate-500 uppercase tracking-widest font-bold">Enterprise / Company Name *</label>
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
                    className="w-full bg-slate-55 border border-slate-300 px-3 py-2 pl-9 text-xs text-brand-blue outline-none [border-radius:0] focus:border-[#FF6B00] focus:bg-white transition font-sans min-h-[40px]"
                  />
                </div>
              </div>
            </div>
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
                className="w-full bg-slate-55 border border-slate-300 px-3 py-2 pl-9 text-xs text-brand-blue outline-none [border-radius:0] focus:border-[#FF6B00] focus:bg-white transition font-sans min-h-[40px]"
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
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••"
                required
                className="w-full bg-slate-55 border border-slate-300 px-3 py-2 pl-9 pr-9 text-xs text-brand-blue outline-none [border-radius:0] focus:border-[#FF6B00] focus:bg-white transition font-sans min-h-[40px]"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Remember Me controls */}
          <div className="flex items-center justify-between pt-1 select-none text-xs font-sans">
            <label className="flex items-center space-x-2 text-slate-600 font-semibold cursor-pointer">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="accent-[#FF6B00] h-4 w-4 rounded-none border-slate-300"
              />
              <span>Remember Me</span>
            </label>
            <button 
              type="button" 
              onClick={() => setErrorMsg("Please click the 'Contact Us' tab. Our support team can assist in verifying your company profile reset.")}
              className="text-[#FF6B00] hover:underline font-bold"
            >
              Forgot Password?
            </button>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-brand-orange hover:bg-brand-orange/95 disabled:bg-slate-200 disabled:text-slate-400 font-extrabold uppercase py-3.5 tracking-wider text-xs text-white flex items-center justify-center space-x-2 cursor-pointer transition-all duration-150 min-h-[44px]"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-white grow-0 shrink-0" />
                <span>Synchronizing credentials...</span>
              </>
            ) : (
              <>
                <span>{mode === 'signin' ? 'Access Account' : 'Sign Up & Establish Partner'}</span>
                <ArrowRight className="w-4 h-4 text-white" />
              </>
            )}
          </button>
        </form>
      ) : (
        /* Phone Authentication flow options with Country selectors */
        <div className="space-y-4">
          {!otpSent ? (
            <form onSubmit={handlePhoneRequestOtp} className="space-y-4">
              {mode === 'signup' && (
                <div className="space-y-4 animate-fadeIn">
                  <div className="space-y-1">
                    <label className="block text-[10px] font-mono text-slate-500 uppercase tracking-widest font-bold">Your Name *</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Vikram Singhal"
                      required
                      className="w-full bg-slate-55 border border-slate-300 px-3 py-2 text-xs text-brand-blue outline-none [border-radius:0] focus:border-[#FF6B00] focus:bg-white transition font-sans min-h-[40px]"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-[10px] font-mono text-slate-500 uppercase tracking-widest font-bold">Enterprise / Company Name *</label>
                    <input
                      type="text"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      placeholder="e.g. Rajasthan Solar Solutions Ltd"
                      required
                      className="w-full bg-slate-55 border border-slate-300 px-3 py-2 text-xs text-brand-blue outline-none [border-radius:0] focus:border-[#FF6B00] focus:bg-white transition font-sans min-h-[40px]"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-[10px] font-mono text-slate-500 uppercase tracking-widest font-bold">Corporate Email *</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g. contact@yourcompany.com"
                      required
                      className="w-full bg-slate-55 border border-slate-300 px-3 py-2 text-xs text-brand-blue outline-none [border-radius:0] focus:border-[#FF6B00] focus:bg-white transition font-sans min-h-[40px]"
                    />
                  </div>
                </div>
              )}

              {/* Advanced Phone Inputs with Flag Selection Dropdown */}
              <div className="space-y-1">
                <label className="block text-[10px] font-mono text-slate-500 uppercase tracking-widest font-bold">Mobile Phone Call number *</label>
                <div className="flex relative">
                  {/* Country Selector Button */}
                  <button
                    type="button"
                    onClick={() => setCountryDropdownOpen(!countryDropdownOpen)}
                    className="flex items-center space-x-1.5 px-3 border border-r-0 border-slate-300 bg-slate-50 text-xs font-semibold text-slate-750 outline-none hover:bg-slate-100 min-w-[76px] cursor-pointer"
                  >
                    <span className="text-base leading-none select-none">{selectedCountry.flag}</span>
                    <span className="text-[11px]">{selectedCountry.code}</span>
                  </button>

                  <input
                    type="tel"
                    value={phoneRaw}
                    onChange={handlePhoneInputChange}
                    placeholder={selectedCountry.placeholder}
                    required
                    className="flex-1 bg-slate-55 border border-slate-300 px-3 py-2 text-xs text-brand-blue outline-none [border-radius:0] focus:border-[#FF6B00] focus:bg-white transition font-sans font-semibold min-h-[40px]"
                  />

                  {/* Country Selection Dropdown menu list */}
                  <AnimatePresence>
                    {countryDropdownOpen && (
                      <>
                        <div 
                          className="fixed inset-0 z-45" 
                          onClick={() => setCountryDropdownOpen(false)} 
                        />
                        <motion.div
                          initial={{ opacity: 0, y: -5 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -5 }}
                          className="absolute left-0 bottom-full mb-1 z-50 bg-white border border-slate-200 shadow-xl max-h-52 overflow-y-auto w-56 scrollbar"
                        >
                          <div className="p-1 px-2 border-b border-slate-100 bg-slate-50 text-[9px] font-mono text-slate-400 uppercase tracking-wider font-bold">
                            Choose Your Country
                          </div>
                          {POPULAR_COUNTRIES.map((ct) => (
                            <button
                              key={ct.code}
                              type="button"
                              onClick={() => {
                                setSelectedCountry(ct);
                                setPhoneRaw('');
                                setCountryDropdownOpen(false);
                              }}
                              className="w-full text-left px-3 py-2 hover:bg-slate-50 flex items-center justify-between text-xs font-sans text-slate-700 cursor-pointer"
                            >
                              <span className="flex items-center space-x-2">
                                <span className="text-base">{ct.flag}</span>
                                <span>{ct.name}</span>
                              </span>
                              <span className="text-[10px] text-slate-400 font-bold">{ct.code}</span>
                            </button>
                          ))}
                        </motion.div>
                      </>
                    )}
                  </AnimatePresence>
                </div>

                <div className="flex items-center justify-between pt-1 select-none text-[10px] font-mono text-slate-400">
                  <p className="italic">Length validation: {selectedCountry.digitsLength} digits.</p>
                  <label className="flex items-center space-x-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="accent-[#FF6B00]"
                    />
                    <span>Remember login</span>
                  </label>
                </div>
              </div>

              <div id="recaptcha-container" className="mb-2" />

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#FF6B00] hover:bg-[#FF6B00]/95 disabled:bg-slate-250 disabled:text-slate-450 font-extrabold uppercase py-3 px-4 tracking-wider text-xs text-white flex items-center justify-center space-x-2 cursor-pointer transition-colors min-h-[44px]"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white shrink-0" />
                    <span>Preparing cellular channel...</span>
                  </>
                ) : (
                  <span>Request SMS Verification OTP</span>
                )}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div className="space-y-1">
                <label className="block text-[10px] font-mono text-slate-500 uppercase tracking-widest font-bold">Enter SMS Code *</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                    <KeyRound className="w-4 h-4 text-slate-400" />
                  </span>
                  <input
                    type="text"
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                    placeholder="e.g. 123456"
                    required
                    maxLength={6}
                    className="w-full bg-slate-50 border border-slate-300 px-3 py-2 pl-9 text-brand-blue outline-none [border-radius:0] focus:border-[#FF6B00] focus:bg-white transition text-center font-bold text-lg tracking-widest min-h-[44px]"
                  />
                </div>
              </div>

              <div className="text-[10px] text-center font-mono text-slate-400 flex items-center justify-center">
                {countdown > 0 ? (
                  <p>Request new code OTP in <span className="text-[#FF6B00] font-bold">{countdown}s</span></p>
                ) : (
                  <button
                    type="button"
                    onClick={handlePhoneRequestOtp}
                    className="text-[#FF6B00] font-bold underline cursor-pointer"
                  >
                    Resend Verification SMS Code
                  </button>
                )}
              </div>

              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-brand-orange hover:bg-brand-orange/95 disabled:bg-slate-100 text-white font-extrabold text-xs uppercase py-3 tracking-wider flex items-center justify-center space-x-2 cursor-pointer min-h-[44px]"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin text-white shrink-0" /> : <span>Confirm SMS OTP</span>}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setOtpSent(false);
                    setErrorMsg('');
                    setSuccessMsg('');
                  }}
                  className="bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-700 px-4 text-xs font-bold cursor-pointer min-h-[44px]"
                >
                  Back
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {/* Google SSO Partner Integration */}
      <div className="relative my-5 text-center select-none">
        <div className="absolute inset-0 flex items-center pointer-events-none">
          <div className="w-full border-t border-slate-200" />
        </div>
        <span className="relative bg-white px-3 text-[10px] font-mono text-slate-400 uppercase tracking-widest font-extrabold">Instant SSO Integration</span>
      </div>

      <button
        onClick={handleGoogleSignIn}
        disabled={loading}
        className="w-full border-2 border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-extrabold text-xs uppercase py-3.5 flex items-center justify-center space-x-2 cursor-pointer hover:border-brand-blue/30 active:scale-[0.98] transition-all min-h-[44px]"
      >
        <Chrome className="w-4 h-4 text-brand-orange" />
        <span>Continue with Google Account</span>
      </button>

      {/* Safe secure disclaimer */}
      <div className="mt-5 flex items-center justify-center space-x-1.5 text-[10px] font-mono text-slate-400 border-t border-slate-100 pt-4 text-center">
        <Shield className="w-3.5 h-3.5 text-emerald-600" />
        <span>ISO Security Certified Firebase Authentication</span>
      </div>
    </div>
  );
}
