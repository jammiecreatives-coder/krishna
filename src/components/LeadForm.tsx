/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Mail, Phone, MapPin, Box, Loader2, CheckCircle2, ShieldCheck, ArrowRight, Sparkles } from 'lucide-react';
import { INITIAL_PRODUCTS } from '../data';
import { motion, AnimatePresence } from 'motion/react';
import { createQuotation } from '../services/dbService';

interface LeadFormProps {
  onClose?: () => void;
  preselectedProduct?: string;
  onSuccessSubmit?: () => void;
}

export default function LeadForm({ onClose, preselectedProduct, onSuccessSubmit }: LeadFormProps) {
  const [formData, setFormData] = useState({
    companyName: '',
    contactPerson: '',
    phone: '',
    email: '',
    productRequired: preselectedProduct || 'Corrugated Sheets',
    quantityRequired: 1000,
    deliveryLocation: 'Jaipur, Rajasthan',
    notes: '',
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Interactive Live Pricing Estimator calculations
  const [estimation, setEstimation] = useState({
    approxWeightKg: 0,
    cargoVolumeM3: 0,
    tierDiscounts: '0%',
    estInrValue: 0
  });

  useEffect(() => {
    let ratePerUnit = 25; // Standard estimated unit cost (INR)
    let unitWeightKg = 0.5; // Average packaging weight

    if (formData.productRequired === 'Corrugated Sheets') {
      ratePerUnit = 45;
      unitWeightKg = 1.2;
    } else if (formData.productRequired === 'Corrugated Boxes') {
      ratePerUnit = 75;
      unitWeightKg = 0.8;
    } else if (formData.productRequired === 'Industrial Rolls') {
      ratePerUnit = 950;
      unitWeightKg = 15;
    } else if (formData.productRequired === 'Packaging Tapes') {
      ratePerUnit = 40;
      unitWeightKg = 0.15;
    } else if (formData.productRequired === 'Protective Packaging') {
      ratePerUnit = 12;
      unitWeightKg = 0.05;
    } else if (formData.productRequired === 'Custom Packaging Solutions') {
      ratePerUnit = 320;
      unitWeightKg = 5.5;
    }

    const qty = Number(formData.quantityRequired) || 0;
    const totalWeight = qty * unitWeightKg;
    const volume = (qty * 0.002);

    let tier = '0%';
    let multiplier = 1.0;
    if (qty >= 5000) {
      tier = '15% Enterprise Bulk';
      multiplier = 0.85;
    } else if (qty >= 2000) {
      tier = '10% Tier-A Wholesale';
      multiplier = 0.90;
    } else if (qty >= 1000) {
      tier = '5% Tier-B wholesale';
      multiplier = 0.95;
    }

    setEstimation({
      approxWeightKg: Number(totalWeight.toFixed(1)),
      cargoVolumeM3: Number(volume.toFixed(2)),
      tierDiscounts: tier,
      estInrValue: Math.round(qty * ratePerUnit * multiplier)
    });
  }, [formData.productRequired, formData.quantityRequired]);

  const containerRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Scroll the whole window/document to absolute top to circumvent keyboard viewport issues
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0 });
      document.body.scrollTop = 0;
      document.documentElement.scrollTop = 0;
    }

    // Force the scroll container of the modal overlay to reset scroll to 0
    const scrollTimer = setTimeout(() => {
      if (containerRef.current) {
        // Aligns form at start position
        containerRef.current.scrollIntoView({ block: 'start' });

        let currentEl = containerRef.current.parentElement;
        while (currentEl) {
          if (
            currentEl.classList.contains('overflow-y-auto') || 
            currentEl.scrollHeight > currentEl.clientHeight
          ) {
            currentEl.scrollTop = 0;
            break;
          }
          currentEl = currentEl.parentElement;
        }
      }
    }, 15);

    return () => clearTimeout(scrollTimer);
  }, [preselectedProduct]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.companyName || !formData.contactPerson || !formData.phone || !formData.email) {
      setErrorMsg('All contact details are strictly required for corporate verification.');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      await createQuotation({
        companyName: formData.companyName,
        contactPerson: formData.contactPerson,
        phone: formData.phone,
        email: formData.email,
        productType: formData.productRequired,
        quantity: Number(formData.quantityRequired),
        destination: formData.deliveryLocation,
        notes: formData.notes
      });

      setSuccess(true);
      if (onSuccessSubmit) {
        onSuccessSubmit();
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Verification connection issues, please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div ref={containerRef} className="bg-white border-2 border-brand-blue rounded-none overflow-hidden shadow-2xl text-[#002147]">
      {/* Header Band */}
      <div className="bg-[#002147] px-4 py-5 sm:p-6 border-b border-brand-orange text-center relative">
        <h3 className="text-base sm:text-lg md:text-xl font-bold text-white tracking-tight flex items-center justify-center space-x-2 uppercase">
          <Box className="w-5 h-5 text-brand-orange shrink-0" />
          <span>B2B Industrial Quotation Request</span>
        </h3>
        <p className="text-[11px] sm:text-xs text-slate-200 mt-1 font-sans">Get custom corporate rates matched with our modern plant capacity.</p>
        <div className="absolute top-3 right-3 hidden sm:flex text-[10px] font-mono text-brand-orange items-center space-x-1 uppercase font-bold">
          <span className="w-1.5 h-1.5 rounded-full bg-brand-orange animate-pulse" />
          <span>Active Feed</span>
        </div>
      </div>

      {success ? (
        <div className="p-8 text-center space-y-4 animate-fadeIn bg-slate-50">
          <div className="w-16 h-16 bg-emerald-50 border border-emerald-500 rounded-none flex items-center justify-center mx-auto text-emerald-600">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <h4 className="text-lg font-bold text-brand-blue uppercase tracking-wider">Proposal Enquiry Registered</h4>
          <p className="text-xs text-slate-650 max-w-md mx-auto leading-relaxed font-sans">
            Thank you, <span className="font-bold text-brand-orange">{formData.contactPerson}</span>. An industrial executive from our Jaipur cluster (Adarsh Nagar) has been assigned to <span className="font-bold text-brand-blue">{formData.companyName}</span>.
          </p>
          <div className="bg-white rounded-none p-4 text-left max-w-sm mx-auto border border-slate-200 text-xs font-mono space-y-1.5 text-slate-600">
            <p className="text-[10px] text-slate-400 uppercase tracking-widest border-b border-slate-150 pb-1 mb-1 font-bold">Enquiry Specification summary</p>
            <p>Product: <span className="text-brand-blue font-bold">{formData.productRequired}</span></p>
            <p>Weight index: <span className="text-brand-blue font-bold">{estimation.approxWeightKg} kg</span></p>
            <p>Volume index: <span className="text-brand-blue font-bold">{estimation.cargoVolumeM3} m³</span></p>
            <p>Applied Discount: <span className="text-emerald-600 font-bold">{estimation.tierDiscounts}</span></p>
            <p>Reference: <span className="text-brand-orange font-bold">KPC-REQ-{Math.floor(Math.random() * 100000)}</span></p>
          </div>
          <div className="pt-4 flex justify-center space-x-3">
            {onClose ? (
              <button
                onClick={onClose}
                className="bg-brand-blue hover:bg-brand-blue/90 text-white px-5 py-2.5 rounded-none text-xs font-bold pointer-events-auto cursor-pointer"
              >
                Close Portal
              </button>
            ) : (
              <button
                onClick={() => setSuccess(false)}
                className="bg-brand-orange hover:bg-brand-orange/90 text-white font-bold px-5 py-2.5 rounded-none text-xs uppercase tracking-wider cursor-pointer"
              >
                Submit Another Enquiry
              </button>
            )}
          </div>
        </div>
      ) : (        <form onSubmit={handleSubmit} className="p-4 sm:p-5 md:p-6 space-y-4 md:space-y-5">
          {errorMsg && (
            <div className="bg-rose-50 border border-rose-300 text-rose-700 p-3 rounded-none text-xs font-sans">
              {errorMsg}
            </div>
          )}

          {/* Contact Details Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="block text-[10px] font-mono text-slate-500 uppercase tracking-widest font-bold">Company Name *</label>
              <input
                type="text"
                name="companyName"
                value={formData.companyName}
                onChange={handleChange}
                placeholder="e.g. Jaipur Polymers Ltd"
                required
                className="w-full bg-slate-50 border border-slate-300 rounded-none px-3 py-2 text-xs text-brand-blue focus:border-brand-orange focus:bg-white outline-none transition font-sans text-brand-blue"
              />
            </div>
            <div className="space-y-1">
              <label className="block text-[10px] font-mono text-slate-500 uppercase tracking-widest font-bold">Contact Person *</label>
              <input
                type="text"
                name="contactPerson"
                value={formData.contactPerson}
                onChange={handleChange}
                placeholder="e.g. S.K. Khandelwal"
                required
                className="w-full bg-slate-50 border border-slate-300 rounded-none px-3 py-2 text-xs text-brand-blue focus:border-brand-orange focus:bg-white outline-none transition font-sans text-brand-blue"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="block text-[10px] font-mono text-slate-500 uppercase tracking-widest font-bold">Phone Call number *</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="e.g. +91 94140 XXXXX"
                required
                className="w-full bg-slate-50 border border-slate-300 rounded-none px-3 py-2 text-xs text-brand-blue focus:border-brand-orange focus:bg-white outline-none transition font-sans text-brand-blue"
              />
            </div>
            <div className="space-y-1">
              <label className="block text-[10px] font-mono text-slate-500 uppercase tracking-widest font-bold">Corporate Email *</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="e.g. purchase@jaipurpolymers.com"
                required
                className="w-full bg-slate-50 border border-slate-300 rounded-none px-3 py-2 text-xs text-brand-blue focus:border-brand-orange focus:bg-white outline-none transition font-sans text-brand-blue"
              />
            </div>
          </div>

          {/* Product & Quantity Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="block text-[10px] font-mono text-slate-500 uppercase tracking-widest font-bold">Product Class Required</label>
              <select
                name="productRequired"
                value={formData.productRequired}
                onChange={handleChange}
                className="w-full bg-slate-50 border border-slate-300 rounded-none px-3 py-2 text-xs text-brand-blue focus:border-brand-orange focus:bg-white outline-none transition cursor-pointer font-sans"
              >
                {INITIAL_PRODUCTS.map((prod) => (
                  <option key={prod.id} value={prod.name}>
                    {prod.name} ({prod.category})
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <label className="block text-[10px] font-mono text-slate-500 uppercase tracking-widest font-bold">Estimated Quantity Required</label>
              <input
                type="number"
                name="quantityRequired"
                value={formData.quantityRequired}
                onChange={handleChange}
                min="10"
                required
                className="w-full bg-slate-50 border border-slate-300 rounded-none px-3 py-2 text-xs text-brand-blue focus:border-brand-orange focus:bg-white outline-none transition font-sans"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-[10px] font-mono text-slate-500 uppercase tracking-widest font-bold">Delivery Location / Destination</label>
            <input
              type="text"
              name="deliveryLocation"
              value={formData.deliveryLocation}
              onChange={handleChange}
              placeholder="e.g. Sitapura Industrial Zone, Jaipur, RJ"
              className="w-full bg-slate-50 border border-slate-300 rounded-none px-3 py-2 text-xs text-brand-blue focus:border-brand-orange focus:bg-white outline-none transition font-sans"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-[10px] font-mono text-slate-500 uppercase tracking-widest font-bold">Technical Specifications / Custom Flute Notes</label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows={3}
              placeholder="Give details about dimensions, GSM requirements, double wall configurations, custom multi-color printed brand logos..."
              className="w-full bg-slate-50 border border-slate-300 rounded-none px-3 py-2 text-xs text-brand-blue focus:border-brand-orange focus:bg-white outline-none transition font-sans"
            />
          </div>

          {/* Real-time B2B Live Estimator Module */}
          <div className="bg-slate-50 border border-slate-200 rounded-none p-3 sm:p-4 text-xs font-mono space-y-2">
            <p className="text-[10px] text-[#22c55e] sm:text-slate-505 uppercase tracking-widest flex items-center justify-between border-b border-slate-250 pb-1.5 font-bold">
              <span>B2B Freight & Custom Volume Estimator</span>
              <Sparkles className="w-3.5 h-3.5 text-brand-orange animate-pulse shrink-0" />
            </p>
            <div className="grid grid-cols-1 min-[480px]:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 text-slate-650">
              <div className="bg-white p-2 border border-slate-150">
                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Approx Cargo Weight</p>
                <motion.p
                  key={estimation.approxWeightKg}
                  initial={{ scale: 0.93, opacity: 0.6 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="text-brand-blue font-bold text-xs mt-1"
                >
                  {estimation.approxWeightKg} kg
                </motion.p>
              </div>
              <div className="bg-white p-2 border border-slate-150">
                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Volume Footprint</p>
                <motion.p
                  key={estimation.cargoVolumeM3}
                  initial={{ scale: 0.93, opacity: 0.6 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="text-brand-blue font-bold text-xs mt-1"
                >
                  {estimation.cargoVolumeM3} m³
                </motion.p>
              </div>
              <div className="bg-white p-2 border border-slate-150">
                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Corporate Tier Rate</p>
                <motion.p
                  key={estimation.tierDiscounts}
                  initial={{ scale: 0.93, opacity: 0.6 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="text-brand-orange font-bold text-xs mt-1"
                >
                  {estimation.tierDiscounts}
                </motion.p>
              </div>
              <div className="bg-white p-2 border border-slate-150">
                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Est. Order Value</p>
                <motion.p
                  key={estimation.estInrValue}
                  initial={{ scale: 1.1, color: '#f97316' }}
                  animate={{ scale: 1, color: '#047857' }}
                  transition={{ type: 'spring', stiffness: 220, damping: 14 }}
                  className="font-bold text-xs mt-1 text-[#047857]"
                >
                  ₹ {estimation.estInrValue.toLocaleString('en-IN')}
                </motion.p>
              </div>
            </div>
            <p className="text-[9px] text-slate-500 italic font-mono leading-normal pt-1">
              Values are preliminary. Exact burst factors (BF) and freight limits to Sitapura/Bhiwadi/Jaipur are detailed in standard quotation issues.
            </p>
          </div>

          {/* Submission and Close controls */}
          <div className="flex flex-col md:flex-row gap-3 pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full md:flex-1 bg-brand-orange hover:bg-brand-orange/90 disabled:bg-slate-200 disabled:text-slate-400 text-white font-bold text-xs uppercase tracking-wider py-3.5 px-4 rounded-none flex items-center justify-center space-x-2 cursor-pointer transition-all active:scale-95 duration-100 min-h-[44px]"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white shrink-0" />
                  <span>Processing B2B parameters...</span>
                </>
              ) : (
                <>
                  <span>Submit Industrial RFP</span>
                  <ArrowRight className="w-4 h-4 text-white shrink-0" />
                </>
              )}
            </button>
            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className="w-full md:w-auto bg-slate-105 hover:bg-slate-200 border border-slate-300 text-[#002147] px-6 py-3.5 rounded-none text-xs font-bold transition-colors cursor-pointer text-center min-h-[44px]"
              >
                Cancel
              </button>
            )}
          </div>

          {/* Secure Trust indicators */}
          <div className="flex flex-wrap items-center justify-center gap-2 md:gap-3 text-[10px] text-slate-500 font-mono pt-1 text-center">
            <span className="flex items-center">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 mr-0.5 shrink-0" />
              <span>IS:2771 Standards</span>
            </span>
            <span className="hidden min-[400px]:inline text-slate-300">•</span>
            <span>Same-Day Expert Review callback</span>
            <span className="hidden min-[400px]:inline text-slate-300">•</span>
            <span>Jaipur Core Supplies</span>
          </div>
        </form>
      )}
    </div>
  );
}
