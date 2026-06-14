/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Gift, Sparkles, Phone, MessageCircle, ArrowRight, CheckCircle2, FileText, Smartphone } from 'lucide-react';
import { createQuotation } from '../services/dbService';
import { INITIAL_PRODUCTS } from '../data';

export default function LeadCaptureSystem() {
  // Popups visibility state
  const [isLeadPopupOpen, setIsLeadPopupOpen] = useState(false);
  const [isExitIntentOpen, setIsExitIntentOpen] = useState(false);

  // Success states
  const [leadSubmitSuccess, setLeadSubmitSuccess] = useState(false);
  const [exitSubmitSuccess, setExitSubmitSuccess] = useState(false);

  // Loader states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Primary Lead Form states (synced with Local Storage)
  const [leadFormData, setLeadFormData] = useState(() => {
    const saved = localStorage.getItem('kpc_lead_form_progress');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* fallback */ }
    }
    return {
      name: '',
      companyName: '',
      mobile: '',
      email: '',
      productRequirement: 'Corrugated Boxes',
      message: ''
    };
  });

  // Exit Intent Form states (synced with Local Storage)
  const [exitFormData, setExitFormData] = useState(() => {
    const saved = localStorage.getItem('kpc_exit_form_progress');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* fallback */ }
    }
    return {
      name: '',
      mobile: '',
      email: ''
    };
  });

  // Automatically save Lead Form progress to Local Storage
  useEffect(() => {
    localStorage.setItem('kpc_lead_form_progress', JSON.stringify(leadFormData));
  }, [leadFormData]);

  // Automatically save Exit Intent Form progress to Local Storage
  useEffect(() => {
    localStorage.setItem('kpc_exit_form_progress', JSON.stringify(exitFormData));
  }, [exitFormData]);

  // Handle 10 seconds of user activity for the LEAD POPUP
  useEffect(() => {
    // Check if shown in current session
    const isShown = sessionStorage.getItem('kpc_lead_popup_shown') === 'true';
    if (isShown) return;

    let timer: NodeJS.Timeout;
    
    // User activity listener to trigger popup only upon active engagement (any move, click, press, scroll)
    const handleUserActivity = () => {
      // Start 10 seconds timer
      timer = setTimeout(() => {
        setIsLeadPopupOpen(true);
        sessionStorage.setItem('kpc_lead_popup_shown', 'true');
        removeListeners();
      }, 10000);
      removeListeners();
    };

    const removeListeners = () => {
      window.removeEventListener('mousemove', handleUserActivity);
      window.removeEventListener('mousedown', handleUserActivity);
      window.removeEventListener('keypress', handleUserActivity);
      window.removeEventListener('scroll', handleUserActivity);
    };

    window.addEventListener('mousemove', handleUserActivity);
    window.addEventListener('mousedown', handleUserActivity);
    window.addEventListener('keypress', handleUserActivity);
    window.addEventListener('scroll', handleUserActivity);

    return () => {
      removeListeners();
      if (timer) clearTimeout(timer);
    };
  }, []);

  // Handle EXIT INTENT detection
  useEffect(() => {
    const isShown = sessionStorage.getItem('kpc_exit_popup_shown') === 'true';
    if (isShown) return;

    const handleMouseLeave = (e: MouseEvent) => {
      // Detect pointer leaving the top viewport bounds (intent to close or switch tabs)
      if (e.clientY < 20) {
        setIsExitIntentOpen(true);
        sessionStorage.setItem('kpc_exit_popup_shown', 'true');
        document.removeEventListener('mouseleave', handleMouseLeave);
      }
    };

    document.addEventListener('mouseleave', handleMouseLeave);
    return () => {
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  // Handle Lead Popup submission
  const handleLeadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!leadFormData.name || !leadFormData.companyName || !leadFormData.mobile || !leadFormData.email) {
      setErrorMessage('Please complete all corporate validation fields.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');

    try {
      const now = new Date();
      await createQuotation({
        companyName: leadFormData.companyName,
        contactPerson: leadFormData.name,
        phone: leadFormData.mobile,
        email: leadFormData.email,
        productType: leadFormData.productRequirement,
        quantity: 1000, // Safe default required by Firestore Rules schema
        destination: 'Not Specified / Managed on Callback',
        notes: leadFormData.message || `Lead Popup Inquiry. Required: ${leadFormData.productRequirement}`,
        message: leadFormData.message || '',
        submissionDate: now.toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata' }),
        submissionTime: now.toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit' }),
        leadSource: 'Lead Popup',
        pageUrl: window.location.href
      });

      setLeadSubmitSuccess(true);
      // Clear storage
      localStorage.removeItem('kpc_lead_form_progress');
      setLeadFormData({
        name: '',
        companyName: '',
        mobile: '',
        email: '',
        productRequirement: 'Corrugated Boxes',
        message: ''
      });
    } catch (err: any) {
      setErrorMessage(err.message || 'Error syncing with production servers.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Exit Intent submission
  const handleExitSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!exitFormData.name || !exitFormData.mobile || !exitFormData.email) {
      setErrorMessage('Please verify your name, phone and email coordinates.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');

    try {
      const now = new Date();
      await createQuotation({
        companyName: 'Individual / Consultation Request',
        contactPerson: exitFormData.name,
        phone: exitFormData.mobile,
        email: exitFormData.email,
        productType: 'Free Packaging Consultation',
        quantity: 1, // Default consultation reference quantity
        destination: 'Online Portal / Call Callback',
        notes: 'Exit Intent Promotion: Free Packaging Consultation requested.',
        message: 'Exit Intent Free Consultation request.',
        submissionDate: now.toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata' }),
        submissionTime: now.toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit' }),
        leadSource: 'Exit Intent',
        pageUrl: window.location.href
      });

      setExitSubmitSuccess(true);
      // Clear storage
      localStorage.removeItem('kpc_exit_form_progress');
      setExitFormData({
        name: '',
        mobile: '',
        email: ''
      });
    } catch (err: any) {
      setErrorMessage(err.message || 'Error transmitting your consultation parameters.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* 1. LEAD POPUP MODAL */}
      <AnimatePresence>
        {isLeadPopupOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="relative w-full max-w-lg bg-white border-4 border-[#002147] shadow-2xl text-[#002147] overflow-hidden"
            >
              {/* Top Warning/Promo ribbon */}
              <div className="bg-[#002147] text-white py-3 px-4 flex items-center justify-between border-b border-brand-orange">
                <span className="text-xs font-mono font-bold uppercase tracking-wider flex items-center space-x-1.5 text-brand-orange">
                  <Sparkles className="w-4 h-4 animate-pulse" />
                  <span>Limited Time B2B Quote Offer</span>
                </span>
                <button
                  onClick={() => setIsLeadPopupOpen(false)}
                  className="p-1 text-slate-300 hover:text-white transition-colors duration-150 cursor-pointer"
                  id="close-lead-popup"
                  aria-label="Close popup"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {leadSubmitSuccess ? (
                <div className="p-8 text-center space-y-4">
                  <div className="w-16 h-16 bg-emerald-50 border border-emerald-500 rounded-none flex items-center justify-center mx-auto text-emerald-600">
                    <CheckCircle2 className="w-10 h-10" />
                  </div>
                  <h3 className="text-xl font-bold uppercase tracking-wide text-[#002147]">Quote Inquiry Confirmed</h3>
                  <p className="text-xs text-slate-600 max-w-sm mx-auto leading-relaxed">
                    Thank you. Your corporate RFPs have been successfully synchronised directly to our production ledger. An industrial logistics specialist will call you back within 2 hours.
                  </p>
                  <button
                    onClick={() => {
                      setLeadSubmitSuccess(false);
                      setIsLeadPopupOpen(false);
                    }}
                    className="mt-4 bg-[#002147] hover:bg-[#002147]/90 text-white font-bold text-xs px-6 py-2.5 uppercase tracking-wide cursor-pointer rounded-none transition duration-150"
                  >
                    Close Window
                  </button>
                </div>
              ) : (
                <form onSubmit={handleLeadSubmit} className="p-5 sm:p-6 space-y-4">
                  <div className="text-center sm:text-left space-y-1">
                    <h3 className="text-xl sm:text-2xl font-black text-brand-blue uppercase tracking-tight">
                      Optimize Your Supply Chain
                    </h3>
                    <p className="text-xs text-slate-500 leading-normal font-sans">
                      Let us audit your corrugation dimensions & GSM layers. Get your free factory quote.
                    </p>
                  </div>

                  {errorMessage && (
                    <div className="p-2.5 bg-rose-50 border border-rose-300 text-rose-700 text-xs font-sans">
                      {errorMessage}
                    </div>
                  )}

                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="block text-[10px] font-mono text-slate-500 uppercase tracking-widest font-bold">Your Name *</label>
                        <input
                          type="text"
                          required
                          value={leadFormData.name}
                          onChange={(e) => setLeadFormData({ ...leadFormData, name: e.target.value })}
                          placeholder="e.g. Vikram Sharma"
                          className="w-full bg-slate-50 border border-slate-300 p-2 text-xs text-brand-blue focus:border-brand-orange focus:bg-white outline-none font-sans"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="block text-[10px] font-mono text-slate-500 uppercase tracking-widest font-bold">Company Name *</label>
                        <input
                          type="text"
                          required
                          value={leadFormData.companyName}
                          onChange={(e) => setLeadFormData({ ...leadFormData, companyName: e.target.value })}
                          placeholder="e.g. Apex Industries Pvt Ltd"
                          className="w-full bg-slate-50 border border-slate-300 p-2 text-xs text-brand-blue focus:border-brand-orange focus:bg-white outline-none font-sans"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="block text-[10px] font-mono text-slate-500 uppercase tracking-widest font-bold">Corporate Email *</label>
                        <input
                          type="email"
                          required
                          value={leadFormData.email}
                          onChange={(e) => setLeadFormData({ ...leadFormData, email: e.target.value })}
                          placeholder="purchase@apex.com"
                          className="w-full bg-slate-50 border border-slate-300 p-2 text-xs text-brand-blue focus:border-brand-orange focus:bg-white outline-none font-sans"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="block text-[10px] font-mono text-slate-500 uppercase tracking-widest font-bold">Mobile Number *</label>
                        <input
                          type="tel"
                          required
                          value={leadFormData.mobile}
                          onChange={(e) => setLeadFormData({ ...leadFormData, mobile: e.target.value })}
                          placeholder="+91 98290 XXXXX"
                          className="w-full bg-slate-50 border border-slate-300 p-2 text-xs text-brand-blue focus:border-brand-orange focus:bg-white outline-none font-sans"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="block text-[10px] font-mono text-slate-505 uppercase tracking-widest font-bold">Product Class Needed</label>
                      <select
                        value={leadFormData.productRequirement}
                        onChange={(e) => setLeadFormData({ ...leadFormData, productRequirement: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-300 p-2 text-xs text-[#002147] focus:border-brand-orange outline-none font-sans cursor-pointer"
                      >
                        {INITIAL_PRODUCTS.map((prod) => (
                          <option key={prod.id} value={prod.name}>
                            {prod.name} ({prod.category})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="block text-[10px] font-mono text-slate-505 uppercase tracking-widest font-bold">Special Custom Instructions (Optional)</label>
                      <textarea
                        value={leadFormData.message}
                        onChange={(e) => setLeadFormData({ ...leadFormData, message: e.target.value })}
                        rows={2}
                        placeholder="GSM criteria, double-wall flute, custom printing..."
                        className="w-full bg-slate-50 border border-slate-300 p-2 text-xs text-brand-blue focus:border-brand-orange focus:bg-white outline-none font-sans resize-none"
                      />
                    </div>
                  </div>

                  <div className="pt-2 flex flex-col sm:flex-row gap-3">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full flex-1 bg-brand-orange hover:bg-brand-orange/90 text-white font-bold p-3.5 text-xs uppercase tracking-wider flex items-center justify-center space-x-2 rounded-none transition duration-150 min-h-[44px] cursor-pointer"
                    >
                      {isSubmitting ? (
                        <span>Configuring your custom rates...</span>
                      ) : (
                        <>
                          <span>Get Free Quote</span>
                          <ArrowRight className="w-4 h-4 text-white" />
                        </>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsLeadPopupOpen(false)}
                      className="w-full sm:w-auto bg-slate-100 hover:bg-slate-200 text-[#002147] border border-slate-350 px-5 text-xs font-bold py-3 text-center transition duration-150 min-h-[44px] cursor-pointer"
                    >
                      No Thanks
                    </button>
                  </div>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 2. EXIT INTENT CONSULTATION POPUP */}
      <AnimatePresence>
        {isExitIntentOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
            <motion.div
              initial={{ y: 25, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 25, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 200, damping: 20 }}
              className="relative w-full max-w-md bg-white border-4 border-brand-orange shadow-2xl text-[#002147] overflow-hidden"
            >
              {/* Warning Promo Line */}
              <div className="bg-brand-orange text-white text-[10px] font-mono font-bold uppercase tracking-widest text-center py-2 relative">
                WAIT! DON'T MISS OUT ON DECREASING LOGISTICS WASTE
                <button
                  onClick={() => setIsExitIntentOpen(false)}
                  className="absolute right-2.5 top-1.5 text-white hover:text-slate-100 duration-150 cursor-pointer"
                  id="close-exit-popup"
                  aria-label="Close consultation popup"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {exitSubmitSuccess ? (
                <div className="p-8 text-center space-y-4">
                  <div className="w-16 h-16 bg-emerald-50 border border-emerald-500 rounded-none flex items-center justify-center mx-auto text-emerald-600">
                    <CheckCircle2 className="w-10 h-10 animate-bounce" />
                  </div>
                  <h3 className="text-lg font-black uppercase tracking-wide text-brand-blue">Consultation Booked!</h3>
                  <p className="text-xs text-slate-650 max-w-sm mx-auto leading-relaxed">
                    Splendid choice. An industrial advisor from our team has been reserved to review your corrugation dimensions & GSM factors.
                  </p>
                  <button
                    onClick={() => {
                      setExitSubmitSuccess(false);
                      setIsExitIntentOpen(false);
                    }}
                    className="mt-4 bg-[#002147] hover:bg-[#002147]/90 text-white font-bold text-xs px-6 py-2.5 uppercase tracking-wide cursor-pointer rounded-none transition duration-150"
                  >
                    Return to Page
                  </button>
                </div>
              ) : (
                <form onSubmit={handleExitSubmit} className="p-5 sm:p-6 space-y-4 text-center">
                  <div className="w-14 h-14 bg-brand-orange/10 border-2 border-brand-orange rounded-none flex items-center justify-center mx-auto text-brand-orange">
                    <Gift className="w-7 h-7" />
                  </div>

                  <div className="space-y-1">
                    <h3 className="text-lg sm:text-xl font-bold uppercase tracking-tight text-brand-blue leading-normal">
                      Get a Free Packaging Consultation
                    </h3>
                    <p className="text-xs text-slate-500 font-sans max-w-xs mx-auto leading-relaxed">
                      Before you leave, unlock a free structural evaluation of your boxes from our Jaipur plant corrugation engineers. Saves up to 25% on wastage.
                    </p>
                  </div>

                  {errorMessage && (
                    <div className="p-2.5 bg-rose-50 border border-rose-300 text-rose-700 text-xs font-sans text-left">
                      {errorMessage}
                    </div>
                  )}

                  <div className="space-y-3 text-left">
                    <div className="space-y-1">
                      <label className="block text-[10px] font-mono text-slate-500 uppercase tracking-widest font-bold">Your Name *</label>
                      <input
                        type="text"
                        required
                        value={exitFormData.name}
                        onChange={(e) => setExitFormData({ ...exitFormData, name: e.target.value })}
                        placeholder="e.g. Rajendra Prasad"
                        className="w-full bg-slate-50 border border-slate-300 p-2 text-xs text-brand-blue focus:border-brand-orange focus:bg-white outline-none font-sans"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="block text-[10px] font-mono text-slate-505 uppercase tracking-widest font-bold">Email Address *</label>
                        <input
                          type="email"
                          required
                          value={exitFormData.email}
                          onChange={(e) => setExitFormData({ ...exitFormData, email: e.target.value })}
                          placeholder="purchase@company.com"
                          className="w-full bg-slate-50 border border-slate-300 p-2 text-xs text-brand-blue focus:border-brand-orange focus:bg-white outline-none font-sans"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="block text-[10px] font-mono text-slate-500 uppercase tracking-widest font-bold">Mobile Number *</label>
                        <input
                          type="tel"
                          required
                          value={exitFormData.mobile}
                          onChange={(e) => setExitFormData({ ...exitFormData, mobile: e.target.value })}
                          placeholder="+91 94140 XXXXX"
                          className="w-full bg-slate-50 border border-slate-300 p-2 text-xs text-brand-blue focus:border-brand-orange focus:bg-white outline-none font-sans"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 flex gap-3">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full bg-brand-blue hover:bg-brand-blue/90 disabled:bg-slate-200 disabled:text-slate-500 text-white font-bold p-3.5 text-xs uppercase tracking-wider transition duration-150 min-h-[44px] cursor-pointer"
                    >
                      {isSubmitting ? 'Registering...' : 'Secure Free Consultation'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsExitIntentOpen(false)}
                      className="bg-slate-100 hover:bg-slate-200 text-[#002147] border border-slate-300 px-4 text-xs font-bold py-3 text-center min-h-[44px] cursor-pointer"
                    >
                      Decline
                    </button>
                  </div>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 3. PREMIUM FLOATING MOBILE CTA APP DOCK */}
      <div className="sm:hidden fixed bottom-4 left-3 right-3 z-40 bg-slate-950/95 backdrop-blur-xl border border-white/20 shadow-2xl p-2 rounded-2xl flex items-center justify-between gap-1.5 ring-1 ring-black/5">
        <a
          href="tel:+919829088124"
          className="flex-1 flex flex-col items-center justify-center bg-white/5 hover:bg-white/10 active:scale-95 transition-all text-white py-2 rounded-xl text-[10px] font-mono font-bold uppercase tracking-wide min-h-[48px]"
          id="mobile-cta-call"
        >
          <Phone className="w-4 h-4 text-brand-orange mb-1 shrink-0" />
          <span className="text-[9px] text-[#f1f5f9]">Call Now</span>
        </a>

        <a
          href="https://wa.me/919829088124?text=Hi%2C%20I%20am%20interested%20in%20packaging%20materials%20and%20would%20like%20a%20free%20quote."
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 flex flex-col items-center justify-center bg-[#25D366]/10 hover:bg-[#25D366]/20 active:scale-95 transition-all text-white py-2 rounded-xl text-[10px] font-mono font-bold uppercase tracking-wide min-h-[48px] border border-[#25D366]/25"
          id="mobile-cta-whatsapp"
        >
          <MessageCircle className="w-4 h-4 text-[#25D366] mb-1 shrink-0" />
          <span className="text-[9px] text-[#f1f5f9]">WhatsApp</span>
        </a>

        <button
          onClick={() => {
            setLeadFormData(prev => ({ ...prev, productRequirement: 'Corrugated Boxes', message: 'Requested standard rapid quote' }));
            setIsLeadPopupOpen(true);
          }}
          className="flex-grow-[1.3] flex flex-col items-center justify-center bg-brand-orange hover:bg-brand-orange/95 active:scale-95 transition-all text-white py-2 rounded-xl text-[10px] font-mono font-extrabold uppercase tracking-wide min-h-[48px] shadow-lg shadow-brand-orange/20"
          id="mobile-cta-quote"
        >
          <FileText className="w-4 h-4 text-white mb-1 shrink-0" />
          <span className="text-[9px] text-white font-black">Get Quote</span>
        </button>

        <button
          onClick={() => {
            setLeadFormData(prev => ({ ...prev, productRequirement: 'Shipper Boxes (RSC & Custom)', message: 'Direct factory callback inquiry requested' }));
            setIsLeadPopupOpen(true);
          }}
          className="flex-1 flex flex-col items-center justify-center bg-[#002147]/40 hover:bg-[#002147]/65 active:scale-95 transition-all text-white py-2 rounded-xl text-[10px] font-mono font-bold uppercase tracking-wide min-h-[48px] border border-white/10"
          id="mobile-cta-inquiry"
        >
          <Sparkles className="w-4 h-4 text-brand-orange mb-1 shrink-0" />
          <span className="text-[9px] text-[#f1f5f9]">Inquiry</span>
        </button>
      </div>
    </>
  );
}
