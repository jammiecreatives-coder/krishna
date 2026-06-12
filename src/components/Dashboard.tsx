/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  UserProfile,
  QuotationRecord,
  subscribeToUserQuotations,
  updateUserProfile,
  createQuotation
} from '../services/dbService';
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';
import {
  FileSpreadsheet,
  Clock,
  CheckCircle,
  AlertTriangle,
  LogOut,
  Building,
  User,
  Phone,
  Mail,
  Box,
  MapPin,
  Calendar,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Sliders,
  Send,
  Loader2,
  Plus,
  Download,
  FileText
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import LeadForm from './LeadForm';

interface DashboardProps {
  userProfile: UserProfile;
  onSignOut: () => void;
}

export default function Dashboard({ userProfile, onSignOut }: DashboardProps) {
  const [quotes, setQuotes] = useState<QuotationRecord[]>([]);
  const [profile, setProfile] = useState<UserProfile>(userProfile);
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  
  // Profile edit states
  const [editMode, setEditMode] = useState(false);
  const [editName, setEditName] = useState(profile.name);
  const [editPhone, setEditPhone] = useState(profile.phone);
  const [editCompanyName, setEditCompanyName] = useState(profile.companyName);

  // Expanded quotation details index
  const [expandedQuoteId, setExpandedQuoteId] = useState<string | null>(null);

  // New quote creation states
  const [isNewQuoteOpen, setIsNewQuoteOpen] = useState(false);

  // Real-time quotations synchronization
  useEffect(() => {
    if (profile?.email) {
      const unsubscribe = subscribeToUserQuotations(profile.email, (syncedQuotes) => {
        setQuotes(syncedQuotes);
      });
      return () => unsubscribe();
    }
  }, [profile?.email]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');
    try {
      await updateUserProfile(profile.uid, {
        name: editName.trim(),
        phone: editPhone.trim(),
        companyName: editCompanyName.trim()
      });
      setProfile(prev => ({
        ...prev,
        name: editName.trim(),
        phone: editPhone.trim(),
        companyName: editCompanyName.trim()
      }));
      setSuccessMsg('Your B2B profile has been updated successfully.');
      setEditMode(false);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to apply profile changes.');
    } finally {
      setLoading(false);
    }
  };

  const activeQuotesCount = quotes.filter(q => q.status === 'New' || q.status === 'Pending Approval').length;
  const generatedCount = quotes.filter(q => q.status === 'Quote Generated').length;
  const completedCount = quotes.filter(q => q.status === 'Converted').length;

  const handleDownloadQuote = (q: QuotationRecord) => {
    const sub = q.leadValue ? Math.round(q.leadValue / 1.18) - 1500 : 15000;
    const tax = Math.round(sub * 0.18);
    const freight = 1500;
    const total = q.leadValue || (sub + tax + freight);

    const docText = `KRISHNA PACKAGING COMPANY
S-24,25 Janta Colony, Saket Colony, Jaipur
================================================
OFFICIAL CORRUGATED B2B ESTIMATE
================================================
Quotation ID: ${q.quotationId}
Date Issued: ${new Date(q.createdAt).toLocaleDateString('en-IN')}
Current Status: ${q.status}

CLIENT PROFILE:
------------------------------------------------
Enterprise: ${q.companyName || profile.companyName}
Contact Representative: ${q.contactPerson || profile.name}
Phone Reference: ${q.phone || profile.phone}
Email: ${q.email || profile.email}

TECHNICAL SPECIFICATIONS:
------------------------------------------------
Product Category: ${q.productType}
Required Volume: ${q.quantity.toLocaleString('en-IN')} Units
Transit Destination: ${q.destination}
Custom RFP Notes: ${q.notes || 'None'}

FINANCIAL DETAILS:
------------------------------------------------
Subtotal Kraft Material Value: ₹ ${sub.toLocaleString('en-IN')}
Estimated Freight Charges:    ₹ ${freight.toLocaleString('en-IN')}
18% GST Compliance:           ₹ ${tax.toLocaleString('en-IN')}
------------------------------------------------
TOTAL PROJECT VALUE (INR):    ₹ ${total.toLocaleString('en-IN')}
================================================
REMARKS & STIPULATIONS:
${q.internalNotes || 'Estimate based on continuous 24hr automatic corrugator output. Pricing includes 15% Wholesale bulk discount.'}

Factory Plant Head Desk,
Vikram Singh
Managing Director
Krishna Packaging Company
================================================`;
    
    const blob = new Blob([docText], { type: 'text/plain;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `Quotation_${q.quotationId}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fadeIn text-slate-800">
      
      {/* Top Welcome Panel */}
      <div className="bg-brand-blue border-l-4 border-brand-orange text-white p-6 shadow-md flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <span className="text-xs font-mono uppercase tracking-widest text-brand-orange font-bold">Client Dashboard Access</span>
          <h2 className="text-2xl font-black uppercase mt-1">Welcome back, {profile.name}</h2>
          <p className="text-xs text-slate-300 font-sans mt-0.5">{profile.companyName} • Account Verified</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setIsNewQuoteOpen(true)}
            className="bg-brand-orange hover:bg-brand-orange/90 text-white font-bold text-xs uppercase px-4 py-2.5 rounded-none flex items-center space-x-1 transition cursor-pointer shadow"
          >
            <Plus className="w-4 h-4 shrink-0" />
            <span>Submit Quotation request</span>
          </button>
          <button
            onClick={onSignOut}
            className="bg-white/10 hover:bg-white/15 border border-white/20 text-white font-bold text-xs uppercase px-4 py-2.5 rounded-none flex items-center space-x-1.5 transition cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5 shrink-0 text-brand-orange" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* KPI Cards section */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-white border border-slate-200 p-5 rounded-none shadow-sm flex items-center space-x-4">
          <div className="w-10 h-10 bg-slate-50 border border-slate-200 text-brand-blue flex items-center justify-center shrink-0">
            <FileSpreadsheet className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] font-mono uppercase text-slate-400 font-bold">Total RFPs Submitted</p>
            <p className="text-xl font-bold text-brand-blue mt-0.5">{quotes.length}</p>
          </div>
        </div>

        <div className="bg-white border border-slate-200 p-5 rounded-none shadow-sm flex items-center space-x-4">
          <div className="w-10 h-10 bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] font-mono uppercase text-slate-400 font-bold">Under Review</p>
            <p className="text-xl font-bold text-amber-600 mt-0.5">{activeQuotesCount}</p>
          </div>
        </div>

        <div className="bg-white border border-slate-200 p-5 rounded-none shadow-sm flex items-center space-x-4">
          <div className="w-10 h-10 bg-[#002147]/5 border border-brand-orange/20 text-brand-orange flex items-center justify-center shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] font-mono uppercase text-slate-400 font-bold">Active Estimates</p>
            <p className="text-xl font-bold text-brand-orange mt-0.5">{generatedCount}</p>
          </div>
        </div>

        <div className="bg-white border border-slate-200 p-5 rounded-none shadow-sm flex items-center space-x-4">
          <div className="w-10 h-10 bg-emerald-50 border border-emerald-250 text-emerald-600 flex items-center justify-center shrink-0">
            <CheckCircle className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] font-mono uppercase text-slate-400 font-bold">Converted / Completed</p>
            <p className="text-xl font-bold text-emerald-700 mt-0.5">{completedCount}</p>
          </div>
        </div>
      </div>

      {/* Main Grid: Left is Quotation feed, Right is Profile setup */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Quotations List Feed - 8 cols */}
        <div className="lg:col-span-8 bg-white border border-slate-200 rounded-none shadow-sm p-4 sm:p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-sm font-extrabold uppercase tracking-wider text-brand-blue flex items-center space-x-2">
              <FileSpreadsheet className="w-4.5 h-4.5 text-brand-orange" />
              <span>Your B2B Rfps & Estimations</span>
            </h3>
            <span className="text-[10px] font-mono text-slate-400">Live Sync Enabled</span>
          </div>

          {quotes.length === 0 ? (
            <div className="p-12 text-center border-2 border-dashed border-slate-200 max-w-lg mx-auto space-y-4">
              <Box className="w-10 h-10 text-slate-300 mx-auto" />
              <p className="text-xs text-slate-500 font-sans leading-relaxed">
                You haven't submitted any Corrugated Specifications RFPs yet. Tap the button below to retrieve custom prices.
              </p>
              <button
                onClick={() => setIsNewQuoteOpen(true)}
                className="bg-brand-orange hover:bg-brand-orange/90 text-white font-bold text-xs uppercase px-4 py-2 border-none cursor-pointer"
              >
                Submit your first RFP
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {quotes.map((q) => {
                const isExpanded = expandedQuoteId === q.quotationId;
                const statusColors = {
                  'New': 'bg-blue-50 text-blue-700 border-blue-200',
                  'Pending Approval': 'bg-amber-50 text-amber-700 border-amber-200',
                  'Quote Generated': 'bg-emerald-50 text-emerald-700 border-emerald-250',
                  'Converted': 'bg-emerald-100 text-emerald-800 border-emerald-300',
                  'Lost': 'bg-slate-100 text-slate-700 border-slate-200'
                };
                
                return (
                  <div key={q.quotationId} className="border border-slate-200 p-4 rounded-none hover:border-slate-350 transition duration-150 relative">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <span className="font-mono text-xs font-black text-slate-850">ID: {q.quotationId}</span>
                          <span className={`text-[9px] font-mono uppercase px-2 py-0.5 border font-semibold ${statusColors[q.status] || 'bg-slate-200 text-slate-600'}`}>
                            {q.status}
                          </span>
                        </div>
                        <p className="text-xs font-semibold text-brand-blue">{q.productType} • 250 GSM specs</p>
                        <p className="text-[10px] text-slate-400 font-mono">Date Submitted: {new Date(q.createdAt).toLocaleDateString('en-IN')}</p>
                      </div>

                      <div className="flex items-center space-x-4">
                        <div className="text-right shrink-0">
                          <p className="text-[9px] font-mono uppercase text-slate-400">Order Quantity</p>
                          <p className="text-xs font-bold text-slate-800">{q.quantity.toLocaleString('en-IN')} units</p>
                        </div>
                        <button
                          onClick={() => setExpandedQuoteId(isExpanded ? null : q.quotationId)}
                          className="p-1 px-2 hover:bg-slate-100 text-slate-500 rounded-none border border-slate-200 transition text-xs font-semibold flex items-center space-x-1 cursor-pointer"
                        >
                          <span>{isExpanded ? 'Hide Details' : 'View Specs'}</span>
                          {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>

                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden mt-4 pt-4 border-t border-slate-100 space-y-3 text-xs"
                        >
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-3 border border-slate-200 font-sans">
                            <div className="space-y-1">
                              <p className="text-[9px] font-mono uppercase text-slate-400">Transit Destination</p>
                              <p className="font-medium text-slate-700 flex items-center"><MapPin className="w-3.5 h-3.5 mr-1 text-slate-400 shrink-0" /> {q.destination}</p>
                            </div>
                            <div className="space-y-1">
                              <p className="text-[9px] font-mono uppercase text-slate-400">Contact Coordinator</p>
                              <p className="font-medium text-slate-700">{q.contactPerson} • {q.phone}</p>
                            </div>
                          </div>

                          <div className="space-y-1">
                            <p className="text-[9px] font-mono uppercase text-slate-400 font-bold">Your Structural Specifications / Notes</p>
                            <p className="text-slate-600 italic bg-white p-2 border.border-slate-150 leading-relaxed font-sans">{q.notes || 'No custom notes provided.'}</p>
                          </div>

                          {q.internalNotes && (
                            <div className="bg-emerald-50 border border-emerald-150 p-3 space-y-1">
                              <p className="text-[9px] font-mono uppercase text-emerald-800 font-bold flex items-center">
                                <Sparkles className="w-3 h-3 text-emerald-600 mr-1 animate-pulse" />
                                <span>Clerk / Administrator Response Notes</span>
                              </p>
                              <p className="text-emerald-900 leading-normal font-sans">{q.internalNotes}</p>
                            </div>
                          )}

                          {q.leadValue && (q.status === 'Quote Generated' || q.status === 'Converted') && (
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-slate-100 p-3.5 border border-slate-200 mt-2 gap-3">
                              <div>
                                <span className="text-[10px] font-mono text-slate-500 uppercase">Estimated Proposal Value</span>
                                <p className="text-sm font-bold text-emerald-800 font-mono">₹ {q.leadValue.toLocaleString('en-IN')}</p>
                              </div>
                              <button
                                onClick={() => handleDownloadQuote(q)}
                                className="bg-brand-blue hover:bg-brand-blue/90 text-white font-bold text-xs uppercase px-4 py-2 hover:text-brand-orange border-none cursor-pointer flex items-center space-x-1.5 transition shadow"
                              >
                                <Download className="w-4 h-4 shrink-0 text-brand-orange" />
                                <span>Download PDF Estimate</span>
                              </button>
                            </div>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Profile Details Panel - 4 cols */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white border border-slate-200 p-5 rounded-none shadow-sm space-y-4">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-xs font-extrabold uppercase tracking-widest text-[#002147] flex items-center space-x-1.5 font-sans">
                <Sliders className="w-4.5 h-4.5 text-brand-orange" />
                <span>Enterprise Coordinates</span>
              </h3>
            </div>

            {errorMsg && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs">
                {errorMsg}
              </div>
            )}
            {successMsg && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs text-center font-bold">
                {successMsg}
              </div>
            )}

            {!editMode ? (
              <div className="space-y-4 text-xs font-sans">
                <div className="space-y-1">
                  <p className="text-[10px] font-mono text-slate-400 uppercase font-bold">Contact Representative</p>
                  <p className="font-semibold text-brand-blue flex items-center"><User className="w-3.5 h-3.5 text-slate-400 mr-1.5 shrink-0" /> {profile.name}</p>
                </div>

                <div className="space-y-1">
                  <p className="text-[10px] font-mono text-slate-400 uppercase font-bold">Registered Corporate Email</p>
                  <p className="font-semibold text-brand-blue flex items-center"><Mail className="w-3.5 h-3.5 text-slate-400 mr-1.5 shrink-0" /> {profile.email}</p>
                </div>

                <div className="space-y-1">
                  <p className="text-[10px] font-mono text-slate-400 uppercase font-bold">Wholesale Company Name</p>
                  <p className="font-semibold text-brand-blue flex items-center"><Building className="w-3.5 h-3.5 text-slate-400 mr-1.5 shrink-0" /> {profile.companyName}</p>
                </div>

                <div className="space-y-1">
                  <p className="text-[10px] font-mono text-slate-400 uppercase font-bold">Assigned Mobile Phone</p>
                  <p className="font-semibold text-brand-blue flex items-center"><Phone className="w-3.5 h-3.5 text-slate-400 mr-1.5 shrink-0" /> {profile.phone || 'None registered'}</p>
                </div>

                <button
                  onClick={() => setEditMode(true)}
                  className="w-full bg-slate-103 hover:bg-slate-200 border border-slate-350 text-slate-700 py-2.5 text-xs font-bold pointer-events-auto cursor-pointer"
                >
                  Modify Coordinates
                </button>
              </div>
            ) : (
              <form onSubmit={handleUpdateProfile} className="space-y-4">
                <div className="space-y-1">
                  <label className="block text-[10px] font-mono text-slate-500 uppercase tracking-widest font-bold">Representative Name</label>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    required
                    className="w-full bg-slate-50 border border-slate-300 text-xs px-2.5 py-1.5 text-brand-blue outline-none focus:bg-white focus:border-brand-orange transition"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-mono text-slate-500 uppercase tracking-widest font-bold">Company Corporate Title</label>
                  <input
                    type="text"
                    value={editCompanyName}
                    onChange={(e) => setEditCompanyName(e.target.value)}
                    required
                    className="w-full bg-slate-50 border border-slate-300 text-xs px-2.5 py-1.5 text-brand-blue outline-none focus:bg-white focus:border-brand-orange transition"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-mono text-slate-500 uppercase tracking-widest font-bold">Mobile Phone Preference</label>
                  <input
                    type="tel"
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    placeholder="+91 94140 XXXXX"
                    className="w-full bg-slate-50 border border-slate-300 text-xs px-2.5 py-1.5 text-brand-blue outline-none focus:bg-white focus:border-brand-orange transition"
                  />
                </div>

                <div className="flex gap-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-brand-orange text-white text-xs font-bold uppercase py-2 flex items-center justify-center cursor-pointer disabled:bg-slate-100 min-h-[38px]"
                  >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin text-white" /> : 'Save Changes'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditMode(false)}
                    className="bg-slate-150 hover:bg-slate-200 border border-slate-300 text-slate-700 px-3 text-xs font-bold pointer-events-auto cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>

          <div className="bg-[#002147] border border-brand-orange p-5 text-white space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-widest text-brand-orange flex items-center"><Sliders className="w-4 h-4 mr-1 shrink-0" /> Jaipur Laboratory Services</h4>
            <p className="text-[11px] text-slate-200 leading-relaxed font-sans">
              Need certified corrugation testing? Our plant offers bursting test (BS), RCT, and ECT diagnostics fully ISO-approved for high-tonnage exports. Call our plant desk at <b>+91 98290 88124</b>.
            </p>
          </div>
        </div>
      </div>

      {/* Slide-over Modal for New Quote Creation */}
      <AnimatePresence>
        {isNewQuoteOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 overflow-y-auto">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-2xl bg-white"
            >
              <div className="absolute top-4 right-4 z-40 bg-white/20 hover:bg-white/30 p-2 text-white hover:text-brand-orange border border-transparent hover:border-brand-orange/40 transition cursor-pointer">
                <Plus className="w-5 h-5 rotate-45" onClick={() => setIsNewQuoteOpen(false)} />
              </div>
              <LeadForm 
                onClose={() => setIsNewQuoteOpen(false)}
                onSuccessSubmit={() => {
                  setTimeout(() => setIsNewQuoteOpen(false), 2000);
                }}
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
