/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  FileText, TrendingUp, Download, Search, RefreshCw, UserCheck, ShieldCheck,
  Lock, Edit3, Trash2, Plus, CheckCircle, Package, ArrowRight, ClipboardCheck, DollarSign
} from 'lucide-react';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import { auth } from '../firebase';
import {
  subscribeToAllQuotations,
  updateQuotation,
  deleteQuotation,
  mapQuotationToLead,
  getUserProfile,
  createUserProfile,
  QuotationRecord
} from '../services/dbService';
import { Lead, Quote, Testimonial, Product } from '../types';
import { INITIAL_PRODUCTS } from '../data';

export default function AdminDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [email, setEmail] = useState('b2b@krishnapackaging.com');
  const [password, setPassword] = useState('jaipurcorp');
  const [authError, setAuthError] = useState('');

  // Core administrative states synced with Firestore
  const [rawQuotes, setRawQuotes] = useState<QuotationRecord[]>([]);
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);

  const [loading, setLoading] = useState(true);
  const [authLoading, setAuthLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');

  // Modal active states
  const [selectedLeadForQuote, setSelectedLeadForQuote] = useState<Lead | null>(null);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const [viewingQuote, setViewingQuote] = useState<Quote | null>(null);
  const [viewingQuoteLead, setViewingQuoteLead] = useState<Lead | null>(null);

  // Quote form state
  const [quoteForm, setQuoteForm] = useState({
    subtotal: 15000,
    freightCharges: 1800,
    terms: '1. Standard 18% GST applicable.\n2. Delivery inside Jaipur areas. ex-factory otherwise.\n3. 50% advance via RTGS.'
  });

  // Setup Real-time Firestore synchronizer
  useEffect(() => {
    let unsubscribe: () => void = () => {};
    if (isAuthenticated) {
      setLoading(true);
      unsubscribe = subscribeToAllQuotations((list) => {
        setRawQuotes(list);
        setLoading(false);
      });
    }
    return () => unsubscribe();
  }, [isAuthenticated]);

  // Handle active admin login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError('');
    try {
      const isDemoAccount = email.trim() === 'b2b@krishnapackaging.com' && password === 'jaipurcorp';
      
      let userCredential;
      try {
        userCredential = await signInWithEmailAndPassword(auth, email.trim(), password);
      } catch (signInErr: any) {
        if (isDemoAccount && (signInErr.code === 'auth/user-not-found' || signInErr.code === 'auth/invalid-credential')) {
          // Auto-seed sandbox admin in Firebase auth if first run
          try {
            userCredential = await createUserWithEmailAndPassword(auth, email.trim(), password);
            await createUserProfile(userCredential.user.uid, {
              name: 'Jaipur Corporate Admin',
              email: email.trim(),
              phone: '+91 98290 88124',
              companyName: 'Krishna Packaging Company'
            }, 'admin');
          } catch (createErr: any) {
            throw new Error('Fallback database seeding issue: ' + createErr.message);
          }
        } else {
          throw signInErr;
        }
      }

      if (userCredential) {
        // Double check profile role in Firestore
        const profile = await getUserProfile(userCredential.user.uid);
        if (profile?.role === 'admin' || isDemoAccount) {
          setIsAuthenticated(true);
        } else {
          throw new Error('Access Denied: Only designated B2B Administrators possess ledger permissions.');
        }
      }
    } catch (err: any) {
      console.error('Admin Auth Portal Error: ', err);
      let friendly = err.message || 'Login credentials incorrect.';
      if (err.code === 'auth/wrong-password' || err.code === 'auth/user-not-found') {
        friendly = 'Incorrect administrator email or pass passkey.';
      }
      setAuthError(friendly);
    } finally {
      setAuthLoading(false);
    }
  };

  // Maps Firestore quotations array to UI structures instantly
  const leads: Lead[] = rawQuotes.map(mapQuotationToLead);

  // Derive Quote structures dynamically from computed quote specifications held on Quotation models
  const quotes: Quote[] = rawQuotes
    .filter(q => q.status === 'Quote Generated' || q.leadValue)
    .map(q => {
      const sub = q.leadValue ? Math.round(q.leadValue / 1.18) - 1500 : 15000;
      const tax = Math.round(sub * 0.18);
      const freight = 1500;
      const termsList = q.internalNotes && q.internalNotes.includes('Terms:') 
        ? q.internalNotes.split('Terms:\n')[1]?.split('\n') 
        : [
            '18% GST fully applicable under law.',
            'Delivery 4-5 working days from official PO.',
            'Quotation estimate valid for 15 days.'
          ];

      return {
        id: `q-${q.quotationId}`,
        leadId: q.quotationId,
        quoteNumber: `KP/EST-${q.quotationId.replace('req-', '')}`,
        subtotal: sub,
        tax: tax,
        freightCharges: freight,
        total: q.leadValue || (sub + tax + freight),
        termsAndConditions: termsList,
        status: 'Sent',
        validUntil: new Date(Date.now() + 15 * 86400000).toISOString(),
        createdAt: q.createdAt
      };
    });

  // Save admin lead updates
  const handleUpdateLeadStatus = async (leadId: string, status: Lead['status']) => {
    try {
      const matchingQuote = rawQuotes.find(q => q.quotationId === leadId);
      if (matchingQuote) {
        const mappedStatus = status === 'Quote Generated' ? 'Quote Generated' :
                             status === 'Converted' ? 'Converted' :
                             status === 'Lost' ? 'Lost' : 'New';
        await updateQuotation(leadId, { status: mappedStatus });
      }
    } catch (err) {
      console.error('Failed to update quotation pipeline status:', err);
    }
  };

  const handleSaveLeadEdits = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingLead) return;

    try {
      const mappedStatus = editingLead.status === 'Converted' ? 'Converted' : 
                           editingLead.status === 'Quote Generated' ? 'Quote Generated' : 'New';
      await updateQuotation(editingLead.id, {
        companyName: editingLead.companyName,
        contactPerson: editingLead.contactPerson,
        phone: editingLead.phone,
        email: editingLead.email,
        productType: editingLead.productRequired,
        quantity: editingLead.quantityRequired,
        destination: editingLead.deliveryLocation,
        status: mappedStatus,
        internalNotes: editingLead.internalNotes
      });
      setEditingLead(null);
    } catch (err) {
      console.error('Failed to update quotation record edits:', err);
    }
  };

  const handleCreateQuote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLeadForQuote) return;

    const sub = Number(quoteForm.subtotal) || 5000;
    const gstTax = Math.round(sub * 0.18);
    const freight = Number(quoteForm.freightCharges) || 0;
    const totalEstValue = sub + gstTax + freight;

    const formattedCRMNotes = `Estimate Issued:\nSubtotal: ₹${sub}\nFreight: ₹${freight}\nTerms:\n${quoteForm.terms}`;

    try {
      await updateQuotation(selectedLeadForQuote.id, {
        status: 'Quote Generated',
        leadValue: totalEstValue,
        internalNotes: formattedCRMNotes
      });
      setSelectedLeadForQuote(null);
    } catch (err) {
      console.error('CRM Quotation generation failure:', err);
    }
  };

  // Perform client-side secure CSV compilation (decoupling server routes completely for reliable offline action)
  const triggerCSVExport = () => {
    const headers = ['Quotation ID', 'Company Name', 'Contact Person', 'Phone', 'Email', 'Product Class', 'Units Required', 'Dispatch Destination', 'Status', 'Date Placed', 'Estimate (INR)'];
    const rows = rawQuotes.map((q) => [
      q.quotationId,
      `"${q.companyName.replace(/"/g, '""')}"`,
      `"${q.contactPerson.replace(/"/g, '""')}"`,
      q.phone,
      q.email,
      q.productType,
      q.quantity,
      `"${(q.destination || '').replace(/"/g, '""')}"`,
      q.status,
      q.createdAt,
      q.leadValue || 0
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' 
      + [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `krishna_packaging_rfps_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleOpenPrintQuote = (q: Quote) => {
    const matchingLead = leads.find((l) => l.id === q.leadId) || null;
    setViewingQuoteLead(matchingLead);
    setViewingQuote(q);
  };

  const handleDeleteRecord = async (leadId: string) => {
    if (window.confirm('Delete Quotation RFP? This is irreversible.')) {
      try {
        await deleteQuotation(leadId);
      } catch (err) {
        console.error('Failed to remove quotation:', err);
      }
    }
  };

  // Filter conditions
  const filteredLeads = leads.filter((lead) => {
    const matchSearch =
      lead.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.contactPerson.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.productRequired.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = statusFilter === 'All' || lead.status === statusFilter;
    return matchSearch && matchStatus;
  });

  // Calculate high-level KPIs widgets
  const kpiTotalEnquiries = leads.length;
  const kpiNewEnquiries = leads.filter((l) => l.status === 'New').length;
  const kpiPendingQuotes = leads.filter((l) => l.status === 'Quote Generated').length;
  const kpiConverted = leads.filter((l) => l.status === 'Converted').length;
  const kpiPipelineValue = leads.reduce((sum, l) => sum + (l.leadValue || 0), 0);

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto my-12 p-8 bg-white border-2 border-brand-blue rounded-none space-y-6 text-[#002147] text-center shadow-2xl font-sans">
        <div className="w-12 h-12 bg-brand-orange/10 border-2 border-brand-orange rounded-none flex items-center justify-center mx-auto text-brand-orange">
          <Lock className="w-6 h-6 animate-pulse" />
        </div>
        <div>
          <h3 className="text-xl font-black uppercase tracking-wide text-brand-blue">Jaipur Plant Secure Gateway</h3>
          <p className="text-xs text-slate-500 mt-1">Authorized supply chain management portal access only.</p>
        </div>

        {authError && (
          <div className="bg-rose-50 border border-rose-300 text-rose-700 p-2.5 rounded-none text-[11px] font-mono leading-relaxed">
            {authError}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4 text-left">
          <div className="space-y-1">
            <label className="block text-[10px] font-mono text-slate-500 uppercase tracking-widest font-bold">Operator Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-slate-5-0 border border-slate-300 rounded-none px-3 py-2 text-xs text-brand-blue focus:border-brand-orange focus:bg-white outline-none font-sans"
            />
          </div>
          <div className="space-y-1">
            <label className="block text-[10px] font-mono text-slate-500 uppercase tracking-widest font-bold">Secret Gate-Pass</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-none px-3 py-2 text-xs text-brand-blue focus:border-brand-orange focus:bg-white outline-none font-sans"
            />
          </div>

          <div className="bg-slate-50 p-3 rounded-none border border-slate-200 space-y-1 text-[11px] font-mono text-slate-600">
            <p className="text-[10px] text-slate-505 uppercase font-black tracking-widest pb-0.5 border-b border-slate-200">B2B Sandbox Staging Credentials:</p>
            <p>Email: <span className="text-brand-blue font-bold">b2b@krishnapackaging.com</span></p>
            <p>Pass: <span className="text-brand-orange font-bold">jaipurcorp</span></p>
          </div>

          <button
            type="submit"
            disabled={authLoading}
            className="w-full bg-brand-orange hover:bg-brand-orange/90 text-white font-bold cursor-pointer text-xs uppercase tracking-wider py-3 rounded-none text-center flex items-center justify-center space-x-2 transition-colors duration-150 min-h-[44px]"
          >
            {authLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <span>Authenticate Portal Session</span>}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-[#002147] space-y-8 font-sans">
      {/* Admin Title bar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-slate-300 pb-5 gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-mono text-brand-orange">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
            <span className="uppercase tracking-widest font-bold">GLOBAL OPERATOR ACCOUNT ONLINE</span>
          </div>
          <h2 className="text-3xl font-black uppercase tracking-tight text-brand-blue mt-1">Jaipur Enterprise <span className="italic font-serif text-brand-orange lowercase font-normal font-bold">supply ledger</span></h2>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={triggerCSVExport}
            className="bg-brand-orange hover:bg-brand-orange/90 text-white px-4 py-2 rounded-none text-xs flex items-center space-x-1.5 cursor-pointer font-bold uppercase transition block min-h-[38px]"
          >
            <Download className="w-3.5 h-3.5 shrink-0" />
            <span>Export CSV Ledger</span>
          </button>
          <button
            onClick={() => {
              signOut(auth);
              setIsAuthenticated(false);
            }}
            className="bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-700 px-4 py-2 text-xs font-bold pointer-events-auto cursor-pointer"
          >
            Logout
          </button>
        </div>
      </div>

      {/* KPI METRICS SHEETS */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white border-2 border-brand-blue p-4 rounded-none space-y-1 shadow-sm">
          <p className="text-[10px] font-mono uppercase tracking-widest text-slate-500 font-bold">Gross leads</p>
          <div className="flex justify-between items-baseline">
            <h4 className="text-3xl font-black text-brand-blue">{kpiTotalEnquiries}</h4>
            <span className="text-[10px] text-brand-orange font-mono font-bold">100% Verified</span>
          </div>
        </div>
        <div className="bg-white border-2 border-brand-blue p-4 rounded-none space-y-1 shadow-sm">
          <p className="text-[10px] font-mono uppercase tracking-widest text-slate-500 font-bold">Incoming (New)</p>
          <div className="flex justify-between items-baseline">
            <h4 className="text-3xl font-black text-brand-orange">{kpiNewEnquiries}</h4>
            <span className="text-[10px] text-emerald-600 font-mono font-bold">Needs Action</span>
          </div>
        </div>
        <div className="bg-white border-2 border-brand-blue p-4 rounded-none space-y-1 shadow-sm">
          <p className="text-[10px] font-mono uppercase tracking-widest text-slate-500 font-bold">Quotes Issued</p>
          <div className="flex justify-between items-baseline">
            <h4 className="text-3xl font-black text-brand-blue">{kpiPendingQuotes}</h4>
            <span className="text-[10px] text-slate-400 font-mono font-bold">Awaiting PO</span>
          </div>
        </div>
        <div className="bg-white border-2 border-brand-blue p-4 rounded-none space-y-1 shadow-sm">
          <p className="text-[10px] font-mono uppercase tracking-widest text-slate-550 font-bold">Converted Clients</p>
          <div className="flex justify-between items-baseline">
            <h4 className="text-3xl font-black text-emerald-600">{kpiConverted}</h4>
            <span className="text-[10px] text-emerald-600 font-bold font-mono">Active Orders</span>
          </div>
        </div>
        <div className="bg-[#002147] text-white border-2 border-[#002147] p-4 rounded-none col-span-2 lg:col-span-1 space-y-1 shadow-sm">
          <p className="text-[10px] font-mono uppercase tracking-widest text-slate-300 font-bold">B2B pipeline value</p>
          <div className="flex justify-between items-baseline">
            <h4 className="text-xl font-bold text-white">₹ {kpiPipelineValue.toLocaleString('en-IN')}</h4>
            <span className="text-[10px] text-brand-orange font-bold font-mono">In-Flow</span>
          </div>
        </div>
      </div>

      {/* SEARCH AND FILTERS */}
      <div className="bg-white border-2 border-brand-blue p-4 rounded-none flex flex-col lg:flex-row items-center justify-between gap-4 shadow-sm">
        {/* Search Input */}
        <div className="relative w-full lg:w-96 font-sans">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400 animate-none shrink-0" />
          <input
            type="text"
            placeholder="Search Company, Contact person or product..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 border border-slate-300 rounded-none pl-9 pr-3 py-2 text-xs text-brand-blue focus:border-brand-orange focus:bg-white outline-none font-sans"
          />
        </div>

        {/* Status filters */}
        <div className="flex space-x-1 border border-slate-200 p-0.5 rounded-none bg-slate-50 overflow-x-auto w-full lg:w-auto">
          {['All', 'New', 'Quote Generated', 'Pending Approval', 'Converted', 'Lost'].map((filt) => (
            <button
              key={filt}
              onClick={() => setStatusFilter(filt)}
              className={`px-3 py-1.5 rounded-none text-[11px] font-mono tracking-wide cursor-pointer transition ${
                statusFilter === filt ? 'bg-brand-blue text-white font-bold' : 'text-slate-500 hover:text-brand-blue'
              }`}
            >
              {filt}
            </button>
          ))}
        </div>
      </div>

      {/* ENQUIRIES LEDGER TABLE */}
      <div className="bg-white border-2 border-brand-blue rounded-none overflow-hidden shadow-xl font-sans">
        <div className="px-4 py-3 border-b-2 border-brand-blue bg-[#002147] text-white flex justify-between items-center">
          <p className="text-xs font-mono font-bold uppercase tracking-widest text-slate-400">Verified Corporate Enquiries Ledger</p>
          <span className="text-[10px] font-mono text-slate-300">Showing {filteredLeads.length} leads matching criteria</span>
        </div>

        <div className="overflow-x-auto">
          {filteredLeads.length === 0 ? (
            <div className="text-center py-12 text-slate-500 text-xs">
              {loading ? 'Fetching packaging datasets...' : 'No historical enquiries matching parameters found.'}
            </div>
          ) : (
            <table className="w-full text-left border-collapse text-xs text-[#002147]">
              <thead>
                <tr className="bg-slate-50 text-brand-blue font-mono text-[10px] uppercase border-b-2 border-brand-blue">
                  <th className="p-3 font-bold">Company Details</th>
                  <th className="p-3 font-bold">Product Spec</th>
                  <th className="p-3 font-bold">Quantity</th>
                  <th className="p-3 font-bold">Pipeline Status</th>
                  <th className="p-3 font-bold">Dispatch Destination</th>
                  <th className="p-3 font-bold">CRM actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {filteredLeads.map((lead) => {
                  const associatedQuote = quotes.find((q) => q.leadId === lead.id);

                  return (
                    <tr key={lead.id} className="hover:bg-slate-50 transition border-b border-slate-200">
                      {/* Company Name & Person */}
                      <td className="p-3 space-y-1 max-w-xs">
                        <p className="font-extrabold text-brand-blue text-sm uppercase">{lead.companyName}</p>
                        <div className="text-[10px] text-slate-500 font-mono space-x-2">
                          <span className="text-slate-400">Person:</span>
                          <span className="text-brand-blue font-bold">{lead.contactPerson}</span>
                          <span>|</span>
                          <span className="text-brand-orange hover:underline font-bold">{lead.phone}</span>
                        </div>
                        <p className="text-[10px] text-slate-500 leading-normal italic line-clamp-1 font-sans">Notes: {lead.notes || 'None'}</p>
                      </td>

                      {/* Product spec desired */}
                      <td className="p-3">
                        <span className="bg-[#002147]/5 border border-[#002147]/20 text-brand-blue font-mono font-bold px-2 py-0.5 rounded-none">
                          {lead.productRequired}
                        </span>
                      </td>

                      {/* Quantity requested */}
                      <td className="p-3 font-mono font-bold text-brand-blue text-sm">
                        {lead.quantityRequired.toLocaleString()}
                      </td>

                      {/* Pipeline Status badge */}
                      <td className="p-3">
                        <select
                          value={lead.status}
                          onChange={(e) => handleUpdateLeadStatus(lead.id, e.target.value as Lead['status'])}
                          className="bg-slate-50 border border-slate-300 px-2 py-1 select-none font-bold text-xs uppercase"
                        >
                          <option value="New">New</option>
                          <option value="Quote Generated">Quote Generated</option>
                          <option value="Converted">Converted</option>
                          <option value="Lost">Lost</option>
                        </select>
                      </td>

                      {/* Dispatch location */}
                      <td className="p-3 text-slate-650 max-w-xs font-sans">
                        {lead.deliveryLocation}
                      </td>

                      {/* Actions */}
                      <td className="p-3 space-x-2">
                        <div className="flex space-x-1.5 justify-start">
                          <button
                            onClick={() => {
                              setSelectedLeadForQuote(lead);
                            }}
                            className="bg-brand-blue text-white px-2.5 py-1 text-[10px] font-bold uppercase transition hover:bg-brand-blue/80 cursor-pointer"
                          >
                            CRM Offer
                          </button>
                          {associatedQuote && (
                            <button
                              onClick={() => handleOpenPrintQuote(associatedQuote)}
                              className="bg-[#22c55e] text-white px-2 py-1 text-[10px] font-bold uppercase transition hover:bg-emerald-600 cursor-pointer"
                            >
                              Invoice
                            </button>
                          )}
                          <button
                            onClick={() => setEditingLead(lead)}
                            className="p-1 px-1.5 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-none text-slate-600 transition cursor-pointer"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteRecord(lead.id)}
                            className="p-1 px-1.5 bg-red-50 hover:bg-red-100 border border-red-200 text-red-650 transition cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5 shrink-0 text-red-600" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* ESTIMATE / QUOTE ISSUER FORM MODAL */}
      {selectedLeadForQuote && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border-4 border-brand-blue rounded-none p-6 max-w-md w-full text-brand-blue space-y-4 shadow-3xl text-left select-none">
            <div className="flex justify-between items-center border-b border-slate-200 pb-2">
              <h4 className="font-extrabold text-sm uppercase text-brand-blue">Generate Starch B2B Estimate</h4>
              <button onClick={() => setSelectedLeadForQuote(null)} className="text-slate-400 hover:text-brand-orange font-black cursor-pointer text-lg">✕</button>
            </div>

            <div className="space-y-1 bg-slate-100 p-2.5 border border-slate-200 text-xs text-slate-705">
              <p>Client: <span className="font-bold text-brand-blue">{selectedLeadForQuote.companyName}</span></p>
              <p>Required: <span className="font-bold">{selectedLeadForQuote.productRequired} ({selectedLeadForQuote.quantityRequired.toLocaleString()} Units)</span></p>
            </div>

            <form onSubmit={handleCreateQuote} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-[10px] font-mono text-slate-500 uppercase tracking-widest font-bold">Subtotal (INR) *</label>
                  <input
                    type="number"
                    value={quoteForm.subtotal}
                    onChange={(e) => setQuoteForm({ ...quoteForm, subtotal: Number(e.target.value) })}
                    required
                    className="w-full bg-slate-50 border border-slate-300 rounded-none px-2.5 py-1.5 text-xs text-brand-blue outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-[10px] font-mono text-slate-500 uppercase tracking-widest font-bold">Freight Drops *</label>
                  <input
                    type="number"
                    value={quoteForm.freightCharges}
                    onChange={(e) => setQuoteForm({ ...quoteForm, freightCharges: Number(e.target.value) })}
                    required
                    className="w-full bg-slate-50 border border-slate-300 rounded-none px-2.5 py-1.5 text-xs text-brand-blue"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-mono text-slate-505 uppercase tracking-widest font-bold">Official Terms & Conditions (one per line)</label>
                <textarea
                  value={quoteForm.terms}
                  onChange={(e) => setQuoteForm({ ...quoteForm, terms: e.target.value })}
                  rows={4}
                  className="w-full bg-slate-50 border border-slate-300 rounded-none p-2 text-[11px] font-mono text-brand-blue"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-brand-orange hover:bg-brand-orange/90 text-white font-bold text-xs uppercase tracking-wider py-3 rounded-none text-center cursor-pointer transition-all duration-150 block min-h-[44px]"
              >
                Compile and Issue Official Quotation
              </button>
            </form>
          </div>
        </div>
      )}

      {/* GENERAL EDITING FORM MODAL */}
      {editingLead && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border-4 border-brand-blue rounded-none p-6 max-w-md w-full text-brand-blue space-y-4 shadow-3xl text-left select-none">
            <div className="flex justify-between items-center border-b border-slate-200 pb-2">
              <h4 className="font-extrabold text-sm uppercase text-brand-blue">Edit Lead Record</h4>
              <button onClick={() => setEditingLead(null)} className="text-slate-400 hover:text-brand-orange font-black cursor-pointer text-lg">✕</button>
            </div>

            <form onSubmit={handleSaveLeadEdits} className="space-y-3.5">
              <div className="space-y-1">
                <label className="block text-[10px] font-mono text-slate-500 uppercase tracking-widest font-bold">Company Name</label>
                <input
                  type="text"
                  value={editingLead.companyName}
                  onChange={(e) => setEditingLead({ ...editingLead, companyName: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-none px-2.5 py-2 text-xs text-brand-blue font-bold outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="block text-[10px] font-mono text-slate-500 uppercase tracking-widest font-bold">Contact Person</label>
                <input
                  type="text"
                  value={editingLead.contactPerson}
                  onChange={(e) => setEditingLead({ ...editingLead, contactPerson: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-none px-2.5 py-2 text-xs text-brand-blue font-bold outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-[10px] font-mono text-slate-500 uppercase tracking-widest font-bold">Phone</label>
                  <input
                    type="text"
                    value={editingLead.phone}
                    onChange={(e) => setEditingLead({ ...editingLead, phone: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-none px-2.5 py-2 text-xs text-brand-blue font-bold outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-[10px] font-mono text-slate-505 uppercase tracking-widest font-bold">Email</label>
                  <input
                    type="email"
                    value={editingLead.email}
                    onChange={(e) => setEditingLead({ ...editingLead, email: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-none px-2.5 py-2 text-xs text-brand-blue font-bold outline-none"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-[10px] font-mono text-slate-500 uppercase tracking-widest font-bold">Product</label>
                  <input
                    type="text"
                    value={editingLead.productRequired}
                    onChange={(e) => setEditingLead({ ...editingLead, productRequired: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-none px-2.5 py-2 text-xs text-brand-blue font-bold outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-[10px] font-mono text-slate-500 uppercase tracking-widest font-bold">Quantity</label>
                  <input
                    type="number"
                    value={editingLead.quantityRequired}
                    onChange={(e) => setEditingLead({ ...editingLead, quantityRequired: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-none px-2.5 py-2 text-xs text-brand-blue font-bold outline-none"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="block text-[10px] font-mono text-slate-500 uppercase tracking-widest font-bold">Destination Location</label>
                <input
                  type="text"
                  value={editingLead.deliveryLocation}
                  onChange={(e) => setEditingLead({ ...editingLead, deliveryLocation: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-none px-2.5 py-2 text-xs text-brand-blue font-bold outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="block text-[10px] font-mono text-slate-505 uppercase tracking-widest font-bold">Internal CRM Logs</label>
                <textarea
                  value={editingLead.internalNotes || ''}
                  onChange={(e) => setEditingLead({ ...editingLead, internalNotes: e.target.value })}
                  rows={2}
                  className="w-full bg-slate-50 border border-slate-300 rounded-none px-2.5 py-2 text-xs text-brand-blue font-mono outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-brand-orange hover:bg-brand-orange/90 text-white font-bold text-xs uppercase tracking-wider py-2.5 rounded-none text-center cursor-pointer transition-all duration-150 block min-h-[44px]"
              >
                Save administrative updates
              </button>
            </form>
          </div>
        </div>
      )}

      {/* PRINT-LIKE CORPORATE QUOTATION VIEW WINDOW */}
      {viewingQuote && viewingQuoteLead && (
        <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-sm overflow-y-auto flex items-center justify-center p-4">
          <div className="bg-white text-slate-900 rounded-none p-8 max-w-2xl w-full space-y-6 shadow-3xl text-left border-4 border-slate-950 select-none">
            {/* Header / Letterhead */}
            <div className="flex justify-between items-start border-b-2 border-slate-950 pb-5">
              <div>
                <h4 className="text-xl font-black tracking-tight uppercase leading-none text-slate-950">Krishna Packaging Company</h4>
                <p className="text-[10px] font-mono uppercase tracking-widest text-slate-500 mt-1">Industrial Packaging solutions partner</p>
                <p className="text-[10px] text-slate-600 mt-2 leading-relaxed font-sans">
                  S-24,25 Janta Colony, Saket Colony,<br />
                  Adarsh Nagar, Jaipur, Rajasthan 302004<br />
                  Hotline: +91 98290 88124 | info@krishnapackagingjaipur.com
                </p>
              </div>
              <div className="text-right space-y-1 font-mono">
                <p className="text-xs uppercase bg-slate-900 text-white font-bold px-2 py-1 rounded inline-block">OFFICIAL ESTIMATE</p>
                <p className="text-xs font-bold text-slate-950 mt-1">Ref: {viewingQuote.quoteNumber}</p>
                <p className="text-[10px] text-slate-505">Date: {new Date(viewingQuote.createdAt).toLocaleDateString()}</p>
                <p className="text-[10px] text-slate-505">Validity: 15 Days</p>
              </div>
            </div>

            {/* Client address */}
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <p className="font-bold text-[10px] uppercase text-slate-505 tracking-wider">PREPARED FOR CLIENT:</p>
                <p className="font-extrabold text-slate-950 text-sm mt-0.5">{viewingQuoteLead.companyName}</p>
                <p className="text-slate-650 mt-1 leading-normal">
                  Attn: {viewingQuoteLead.contactPerson}<br />
                  Email: {viewingQuoteLead.email}<br />
                  Call: {viewingQuoteLead.phone}
                </p>
              </div>
              <div>
                <p className="font-bold text-[10px] uppercase text-slate-505 tracking-wider">CONVEYOR ROUTING TARGET:</p>
                <p className="text-slate-700 leading-relaxed mt-0.5 font-sans">
                  {viewingQuoteLead.deliveryLocation}
                </p>
              </div>
            </div>

            {/* Quote details ledger table */}
            <table className="w-full border-collapse border border-slate-300 text-xs">
              <thead>
                <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-300">
                  <th className="p-3 border-r border-slate-300">Product Specification Details</th>
                  <th className="p-3 border-r border-slate-300 text-center">Config Qty</th>
                  <th className="p-3 text-right">Raw Estimate (INR)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-300">
                <tr className="align-top font-sans">
                  <td className="p-3 border-r border-slate-300">
                    <p className="font-bold text-slate-950">{viewingQuoteLead.productRequired}</p>
                    <p className="text-[10px] text-slate-505 mt-1 leading-relaxed">
                      Rigidity standards conform to IS:2771 bursting parameters. Custom design profile allocated in Jaipur corrugation facility line #2.
                    </p>
                  </td>
                  <td className="p-3 border-r border-slate-300 text-center font-mono font-bold text-slate-950">
                    {viewingQuoteLead.quantityRequired.toLocaleString()}
                  </td>
                  <td className="p-3 text-right font-mono text-slate-950">
                    ₹ {viewingQuote.subtotal.toLocaleString('en-IN')}.00
                  </td>
                </tr>
                {/* Freight charges */}
                <tr>
                   <td colSpan={2} className="p-2 text-right border-r border-slate-300 font-bold text-slate-505">Freight & Logistical drops</td>
                  <td className="p-2 text-right font-mono text-slate-950">₹ {viewingQuote.freightCharges.toLocaleString('en-IN')}.00</td>
                </tr>
                {/* 18% GST */}
                <tr>
                   <td colSpan={2} className="p-2 text-right border-r border-slate-300 font-bold text-slate-550">B2B GST (18%)</td>
                  <td className="p-2 text-right font-mono text-slate-950">₹ {viewingQuote.tax.toLocaleString('en-IN')}.00</td>
                </tr>
                {/* Grand Total */}
                <tr className="bg-slate-100 font-bold">
                  <td colSpan={2} className="p-3 text-right border-r border-slate-300 text-slate-950 text-sm">TOTAL INVESTMENT (INCLUSIVE OF GST)</td>
                  <td className="p-3 text-right font-mono text-slate-950 text-sm">₹ {viewingQuote.total.toLocaleString('en-IN')}.00</td>
                </tr>
              </tbody>
            </table>

            {/* Terms and Signatures */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              <div className="text-[10px] text-slate-505 space-y-1">
                <p className="font-bold uppercase tracking-wider text-slate-600">TERMS & TRANSACTION CONDITIONS:</p>
                {viewingQuote.termsAndConditions.map((t, idx) => (
                  <p key={idx}>{t}</p>
                ))}
              </div>
              <div className="text-right flex flex-col justify-end items-end space-y-4">
                <div className="border-b border-slate-400 w-48 h-12 flex items-end justify-center select-none font-mono text-[10px] text-slate-400">
                  [Authorized Jaipur Signatory]
                </div>
                <div className="text-[10px] text-slate-600">
                  <p className="font-bold text-slate-950 uppercase">Krishna Packaging Supply Department</p>
                  <p>Adarsh Nagar Headquarters</p>
                </div>
              </div>
            </div>

            {/* Close Print Button */}
            <div className="border-t border-slate-300 pt-5 flex justify-end space-x-2">
              <button
                onClick={() => {
                  window.print();
                }}
                className="bg-brand-blue hover:bg-brand-blue/90 text-white text-xs font-bold px-4 py-3 rounded-none uppercase transition cursor-pointer"
              >
                Print PDF Invoice
              </button>
              <button
                onClick={() => {
                  setViewingQuote(null);
                  setViewingQuoteLead(null);
                }}
                className="bg-slate-100 hover:bg-slate-200 text-brand-blue text-xs font-bold px-4 py-3 border border-slate-300 rounded-none uppercase transition cursor-pointer"
              >
                Close Invoice View
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
