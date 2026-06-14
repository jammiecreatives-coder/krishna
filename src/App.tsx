/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  Box, Phone, Mail, MapPin, ShieldCheck, Award, MessageCircle, Star, Sparkles,
  ChevronRight, ArrowRight, CheckCircle2, ThumbsUp, Layers, HelpCircle, HardDrive,
  Code, Settings, FileSpreadsheet, Lock, Check, Send, AlertTriangle, BookOpen, Clock, X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Header from './components/Header';
import Footer from './components/Footer';
import Hero from './components/Hero';
import LeadForm from './components/LeadForm';
import InteractiveTimeline from './components/InteractiveTimeline';
import SEOEngine from './components/SEOEngine';
import AdminDashboard from './components/AdminDashboard';
import { INITIAL_PRODUCTS, INITIAL_TESTIMONIALS, FAQ_ITEMS, INDUSTRIES } from './data';
import { Product } from './types';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from './firebase';
import { getUserProfile, UserProfile } from './services/dbService';
import AuthSystem from './components/AuthSystem';
import Dashboard from './components/Dashboard';
import LeadCaptureSystem from './components/LeadCaptureSystem';

export default function App() {
  const [activeTab, _setActiveTab] = useState(() => {
    const path = window.location.pathname;
    if (path === '/admin' || path === '/admin/login' || window.location.hash === '#admin') {
      return 'admin';
    }
    const cleanPath = path.substring(1);
    if (['products', 'industries', 'process', 'about', 'certifications', 'contact', 'dashboard'].includes(cleanPath)) {
      return cleanPath;
    }
    return 'home';
  });

  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [authMode, setAuthMode] = useState<'signin' | 'signup' | null>(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const profile = await getUserProfile(user.uid);
          if (profile) {
            setUserProfile(profile);
          } else {
            setUserProfile({
              uid: user.uid,
              name: user.displayName || 'Stating Corporate Client',
              email: user.email || '',
              phone: user.phoneNumber || '',
              role: 'customer',
              companyName: 'Krishna B2B Partner'
            });
          }
        } catch (err) {
          console.error('Error fetching auth user profile:', err);
          setUserProfile({
            uid: user.uid,
            name: user.displayName || 'Stating Corporate Client',
            email: user.email || '',
            phone: user.phoneNumber || '',
            role: 'customer',
            companyName: 'Krishna B2B Partner'
          });
        }
      } else {
        setUserProfile(null);
      }
    });
    return () => unsub();
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      setUserProfile(null);
      setActiveTab('home');
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  // Instantly disable custom scroll restoration to manual
  if (typeof window !== 'undefined') {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
  }

  const forceScrollToTop = () => {
    if (typeof window === 'undefined') return;
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;

    // Multiple cycles to ensure total consistency across mobile Safari/Chrome viewport state shifts
    const delays = [0, 5, 20, 50, 120, 250, 500];
    delays.forEach((t) => {
      setTimeout(() => {
        window.scrollTo(0, 0);
        document.documentElement.scrollTop = 0;
        document.body.scrollTop = 0;
      }, t);
    });
  };

  const setActiveTab = (tab: string) => {
    _setActiveTab(tab);
    const targetPath = tab === 'home' ? '/' : `/${tab}`;
    if (window.location.pathname !== targetPath) {
      window.history.pushState({ tab }, '', targetPath);
    }
    forceScrollToTop();
  };

  // Synchronize route paths like /admin or /admin/login or hash changes
  useEffect(() => {
    const handleLocationChange = () => {
      const path = window.location.pathname;
      if (path === '/admin' || path === '/admin/login' || window.location.hash === '#admin') {
        _setActiveTab('admin');
      } else if (path === '/products' || window.location.hash === '#products') {
        _setActiveTab('products');
      } else if (path === '/industries' || window.location.hash === '#industries') {
        _setActiveTab('industries');
      } else if (path === '/process' || window.location.hash === '#process') {
        _setActiveTab('process');
      } else if (path === '/about' || window.location.hash === '#about') {
        _setActiveTab('about');
      } else if (path === '/certifications' || window.location.hash === '#certifications') {
        _setActiveTab('certifications');
      } else if (path === '/contact' || window.location.hash === '#contact') {
        _setActiveTab('contact');
      } else if (path === '/dashboard' || window.location.hash === '#dashboard') {
        _setActiveTab('dashboard');
      } else if (path === '/' || path === '') {
        _setActiveTab('home');
      }
      forceScrollToTop();
    };

    window.addEventListener('popstate', handleLocationChange);
    window.addEventListener('hashchange', handleLocationChange);
    window.addEventListener('pageshow', handleLocationChange);
    window.addEventListener('load', handleLocationChange);
    
    // Initial mount check
    forceScrollToTop();

    return () => {
      window.removeEventListener('popstate', handleLocationChange);
      window.removeEventListener('hashchange', handleLocationChange);
      window.removeEventListener('pageshow', handleLocationChange);
      window.removeEventListener('load', handleLocationChange);
    };
  }, []);

  // Sync scroll to top on any manual activeTab updates
  useEffect(() => {
    forceScrollToTop();
  }, [activeTab]);

  const [isQuoteFormOpen, setIsQuoteFormOpen] = useState(false);
  const [preselectedProductForQuote, setPreselectedProductForQuote] = useState('');
  const [exitIntentTriggered, setExitIntentTriggered] = useState(false);
  const [testimonials, setTestimonials] = useState(INITIAL_TESTIMONIALS);

  // Helper check for B2B promotional pop-up dismissal
  const isPromoDismissed = () => {
    if (typeof window !== 'undefined') {
      if (sessionStorage.getItem('krishna_promo_session_shown') === 'true') {
        return true;
      }
      const dismissedUntil = localStorage.getItem('krishna_promo_dismissed_until');
      if (dismissedUntil) {
        const expiry = parseInt(dismissedUntil, 10);
        if (!isNaN(expiry) && Date.now() < expiry) {
          return true;
        }
      }
    }
    return false;
  };

  // Close promo popup completely & set 7-day local limit + session limit
  const closePromoPopup = () => {
    setExitIntentTriggered(false);
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('krishna_promo_session_shown', 'true');
      localStorage.setItem('krishna_promo_dismissed_until', (Date.now() + 7 * 24 * 60 * 60 * 1000).toString());
    }
  };

  // Trigger the popup exactly 4 seconds after landing on the website (once per session)
  useEffect(() => {
    if (isPromoDismissed()) {
      return;
    }

    const timer = setTimeout(() => {
      if (!isPromoDismissed()) {
        setExitIntentTriggered(true);
        if (typeof window !== 'undefined') {
          sessionStorage.setItem('krishna_promo_session_shown', 'true');
        }
      }
    }, 4000);

    return () => clearTimeout(timer);
  }, []);

  const openQuoteForProduct = (pName: string) => {
    setPreselectedProductForQuote(pName);
    setIsQuoteFormOpen(true);
  };

  const handleCreateRFP = () => {
    setPreselectedProductForQuote('');
    setIsQuoteFormOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#fafaf9] text-slate-900 flex flex-col font-sans selection:bg-brand-orange selection:text-white border-0 md:border-[12px] lg:border-[16px] border-brand-blue relative pb-24 sm:pb-0">
      <SEOEngine />

      {/* Primary Navigation System */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        openQuoteForm={handleCreateRFP}
        userProfile={userProfile}
        onOpenAuth={(mode) => setAuthMode(mode)}
        onSignOut={handleSignOut}
      />

      {/* Main Container Stage wrapper */}
      <main className="flex-grow">
        {activeTab === 'home' && (
          <div className="space-y-16 lg:space-y-24 animate-fadeIn">
            {/* Stunning Conveyor belt simulated Industrial Hero */}
            <Hero
              onQuoteClick={handleCreateRFP}
              setActiveTab={setActiveTab}
            />

            {/* SECTION 1: Company Overview */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              <div className="lg:col-span-6 relative rounded-none overflow-hidden border border-slate-200 group shadow-lg">
                <div className="absolute inset-0 bg-gradient-to-t from-brand-blue/90 via-transparent to-transparent z-10" />
                <img
                  src="https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&q=80&w=1200"
                  alt="Industrial Corrugating Plant"
                  referrerPolicy="no-referrer"
                  className="w-full h-80 lg:h-[480px] object-cover filter brightness-90 hover:scale-105 transition-all duration-700"
                />
                <div className="absolute bottom-6 left-6 right-6 z-25 bg-brand-blue border border-brand-blue/30 p-5 rounded-none shadow-xl">
                  <p className="text-[10px] font-mono text-brand-orange uppercase tracking-widest font-black">Adarsh Nagar Plant Headquarters</p>
                  <h4 className="text-white font-bold text-xs mt-1">S-24,25 Janta Colony, Saket Colony, Jaipur</h4>
                  <p className="text-[11px] text-slate-300 mt-1">Housing automatic corrugation lines operating 24 hours.</p>
                </div>
              </div>

              <div className="lg:col-span-6 space-y-6">
                <span className="text-xs font-mono uppercase text-brand-orange tracking-widest font-black flex items-center gap-1.5"><span className="w-6 h-[2px] bg-brand-orange"></span>FOUNDED IN 2014 • JAIPUR PACKAGING EXCELLENCE</span>
                <h3 className="text-3xl lg:text-5xl font-extrabold tracking-tight text-brand-blue leading-tight uppercase font-display">
                  Rajasthan's Premier <span className="italic font-serif font-normal text-brand-orange lowercase">Manufacturer</span> Of Heavy-Duty Corrugated Systems
                </h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  Krishna Packaging Company provides engineered corrugation solutions directly to high-volume manufacturers, tier-1 suppliers, and electronics shippers across Delhi NCR and Rajasthan.
                </p>
                <p className="text-slate-600 text-sm leading-relaxed">
                  We specialize in crafting exact-dimensions 3-Ply, 5-Ply, and 7-Ply corrugated craft sheets with bursting strength ratings certified on hydraulic lab testers before shipping. Our capacity permits delivery of 30+ Metric Tons of structural materials every single day, keeping supply lines robust.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div className="flex items-start space-x-3 p-3 bg-white border border-slate-100 shadow-sm">
                    <div className="w-9 h-9 rounded-none bg-emerald-50 border border-emerald-200 flex items-center justify-center shrink-0">
                      <ShieldCheck className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div>
                      <h5 className="font-bold text-brand-blue text-xs">Direct Core Loading</h5>
                      <p className="text-[11px] text-slate-500 mt-0.5">Tested bursting profiles matching ISO B2B standards.</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3 p-3 bg-white border border-slate-100 shadow-sm">
                    <div className="w-9 h-9 rounded-none bg-brand-orange/10 border border-brand-orange/20 flex items-center justify-center shrink-0">
                      <Award className="w-5 h-5 text-brand-orange" />
                    </div>
                    <div>
                      <h5 className="font-bold text-brand-blue text-xs">FSC Recycled Kraft</h5>
                      <p className="text-[11px] text-slate-500 mt-0.5">100% biodegradable organic cornstarch binders.</p>
                    </div>
                  </div>
                </div>

                <div className="pt-4">
                  <button
                    onClick={() => setActiveTab('process')}
                    className="border-b-2 border-brand-orange hover:border-brand-orange/80 text-brand-orange hover:text-brand-orange/80 text-xs font-mono font-bold tracking-wider uppercase pb-1 cursor-pointer transition-all flex items-center space-x-1"
                  >
                    <span>Inspect Starch Bind Heat controls</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </section>

            {/* SECTION 2: Dynamic Products Overview Grid */}
            <section className="bg-slate-100/65 border-y border-slate-200 py-16">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
                <div className="text-center space-y-2">
                  <span className="text-[10px] font-mono uppercase bg-[#002147] py-1 px-3 text-brand-orange tracking-widest border border-[#002147] font-bold">
                    B2B STRUCTURAL INVENTORY
                  </span>
                  <h3 className="text-3xl lg:text-4xl font-extrabold tracking-tight text-brand-blue leading-normal uppercase font-display animate-fadeIn">
                    Precision Industrial <span className="italic font-serif text-brand-orange lowercase font-normal">Product Classes</span>
                  </h3>
                  <p className="text-xs text-slate-600 max-w-xl mx-auto leading-relaxed font-sans">
                    Custom manufactured specifications engineered for automated container packing and heavy machinery transport.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {INITIAL_PRODUCTS.map((prod) => (
                    <div
                      key={prod.id}
                      className="bg-white border border-slate-200 rounded-none overflow-hidden hover:border-brand-orange/40 transition-all duration-300 flex flex-col justify-between group shadow-sm"
                    >
                      <div className="relative h-48 overflow-hidden">
                        <img
                          src={prod.image}
                          alt={prod.name}
                          referrerPolicy="no-referrer"
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&q=80&w=800";
                          }}
                          className="w-full h-full object-cover filter brightness-95 group-hover:scale-105 transition duration-500"
                        />
                        <div className="absolute top-3 left-3 bg-brand-blue text-brand-orange text-[10px] uppercase font-mono tracking-widest px-2 py-1 rounded-none border border-brand-blue/30">
                          {prod.category}
                        </div>
                      </div>

                      <div className="p-5 flex-grow space-y-3">
                        <h4 className="text-lg font-bold text-brand-blue group-hover:text-brand-orange transition-colors uppercase">
                          {prod.name}
                        </h4>
                        <p className="text-xs text-slate-600 leading-relaxed min-h-[48px] font-sans">
                          {prod.tagline}
                        </p>

                        <div className="pt-2 border-t border-slate-100 grid grid-cols-2 gap-x-2 gap-y-1 text-[10px] font-mono text-slate-500">
                          <p>MOQ: <span className="text-slate-800 font-bold">{prod.minOrderQuantity}</span></p>
                          <p>Lead Time: <span className="text-slate-800 font-bold">{prod.leadTime}</span></p>
                        </div>
                      </div>

                      <div className="p-5 pt-0 grid grid-cols-2 gap-2">
                        <button
                          onClick={() => {
                            setActiveTab('products');
                          }}
                          className="bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-700 px-3 py-2 rounded-none text-center text-xs font-bold transition cursor-pointer"
                        >
                          Specs Sheets
                        </button>
                        <button
                          onClick={() => openQuoteForProduct(prod.name)}
                          className="bg-brand-orange hover:bg-brand-orange/95 text-white text-center py-2 rounded-none text-xs font-bold uppercase tracking-wider transition active:scale-95 cursor-pointer"
                        >
                          Quote RFP
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* SECTION 3: Why Choose Krishna Packaging */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
              <div className="text-center space-y-2">
                <span className="text-xs font-mono uppercase text-brand-orange tracking-widest font-bold">RELIABILITY METRICS</span>
                <h3 className="text-3xl font-extrabold tracking-tight text-brand-blue uppercase font-display">Why Enterprise <span className="italic font-serif text-brand-orange lowercase font-normal">Exporters</span> Choose Us</h3>
                <p className="text-sm text-slate-600 max-w-xl mx-auto leading-relaxed font-sans">
                  We understand that transit layout failures disrupt entire manufacturing pipelines. We mitigate this through calibrated engineering.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  {
                    title: 'Hydraulic Rigidity Testing',
                    desc: 'Every corrugator batch is verified in our active lab of hydraulic testers. We certify the BF levels on paper before dispatch.',
                    metric: 'IS:2771 Certified'
                  },
                  {
                    title: 'Automated Rapid Crease',
                    desc: 'Fully pre-creased slots ensure rapid carton setup on automated fast product assembly feeds, reducing manual processing times.',
                    metric: '0.1mm Error Limits'
                  },
                  {
                    title: 'Moisture Controlled Curing',
                    desc: 'Controlled starch heat elements keep boards perfectly dry and rigid, avoiding structural collapse under heavy humidity transit cycles.',
                    metric: '8% - 10% Moisture'
                  },
                  {
                    title: 'Factory Door Supplies',
                    desc: 'Our private distribution fleet routes daily loads directly to BKI, Sitapura, Boranada, and Bhiwadi industrial corridors.',
                    metric: '24 Hour Dispatch'
                  }
                ].map((item, idx) => (
                  <div key={idx} className="bg-white border border-slate-200 p-5 rounded-none space-y-3 relative overflow-hidden group hover:border-brand-orange/40 shadow-sm transition-all">
                    <span className="text-[10px] font-mono uppercase bg-brand-orange text-white px-2 py-0.5 rounded-none absolute top-4 right-4">
                      {item.metric}
                    </span>
                    <div className="pt-2 pr-32 text-brand-blue font-extrabold text-sm uppercase">{item.title}</div>
                    <p className="text-xs text-slate-650 leading-relaxed font-sans mt-2">{item.desc}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* SECTION 4: Industries Served Showcase (B2B cards) */}
            <section className="bg-slate-100/40 py-16 border-y border-slate-200">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
                <div className="text-center space-y-2">
                  <span className="text-xs font-mono uppercase text-brand-orange tracking-widest font-bold">CLIENT HORIZONS</span>
                  <h3 className="text-3xl font-extrabold tracking-tight text-brand-blue uppercase font-display">Industries Relying On <span className="italic font-serif text-brand-orange lowercase font-normal">Our Packaging</span></h3>
                  <p className="text-xs text-slate-600 max-w-xl mx-auto leading-relaxed font-sans">
                    Custom composite designs configured to isolate vibration, shock, and temperature changes.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {INDUSTRIES.map((ind, idx) => (
                    <div
                      key={idx}
                      className="border-t-4 border-l-0 border-brand-orange bg-white border border-slate-200 p-5 rounded-none space-y-2 hover:translate-y-[-4px] transition-all duration-300 shadow-sm"
                    >
                      <h4 className="text-brand-blue font-bold text-sm uppercase tracking-wide flex items-center justify-between">
                        <span>{ind.title}</span>
                      </h4>
                      <p className="text-xs text-slate-650 leading-relaxed font-sans">
                        {ind.desc}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </section>            {/* SECTION 5: Interactive Manufacturing Process Timeline */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
              <div className="text-center space-y-2">
                <span className="text-xs font-mono uppercase text-brand-orange tracking-widest font-bold">DIGITAL AUDIT</span>
                <h3 className="text-3xl font-extrabold tracking-tight text-brand-blue uppercase font-display">The Clean Board <span className="italic font-serif text-brand-orange lowercase font-normal">Manufacturing</span> Pipeline</h3>
              </div>
              <InteractiveTimeline />
            </section>

            {/* SECTION 6: High Volume Corporate FAQ */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid grid-cols-1 lg:grid-cols-12 gap-12">
              <div className="lg:col-span-5 space-y-4">
                <span className="text-xs font-mono uppercase text-brand-orange tracking-widest font-bold">OPERATIONS PROTOCOL</span>
                <h3 className="text-2xl lg:text-3xl font-black text-brand-blue leading-tight uppercase font-display">
                  Frequently Asked B2B Purchase Questions
                </h3>
                <p className="text-slate-650 text-xs leading-relaxed font-sans">
                  Whether you require trial samples, exact bursting certification prints, or scheduling complex quarterly supply agreements, find prompt operations parameters here.
                </p>
                <div className="p-4 bg-white border border-slate-200 rounded-none shadow-sm">
                  <p className="text-xs text-slate-500 font-sans">Need direct answers from plant managers?</p>
                  <a href="tel:+919829088124" className="text-brand-orange font-extrabold text-sm hover:underline mt-1 block font-mono">
                    Call +91 98290 88124
                  </a>
                </div>
              </div>

              <div className="lg:col-span-7 space-y-3">
                {FAQ_ITEMS.map((faq) => (
                  <div key={faq.id} className="bg-white border border-slate-200 rounded-none p-5 space-y-2 text-left shadow-sm">
                    <h5 className="font-extrabold text-brand-blue text-xs tracking-normal uppercase flex items-start">
                      <HelpCircle className="w-4 h-4 text-brand-orange mr-2 shrink-0 mt-0.5" />
                      <span>{faq.question}</span>
                    </h5>
                    <p className="text-slate-650 text-xs leading-relaxed font-sans pl-6">
                      {faq.answer}
                    </p>
                  </div>
                ))}
              </div>
            </section>

            {/* SECTION 7: Premium Testimonials and B2B Reviews */}
            <section className="bg-slate-100/60 border-t border-slate-200 py-16">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
                <div className="text-center space-y-2">
                  <span className="text-xs font-mono uppercase text-brand-orange tracking-widest font-bold">CLIENT REASSURANCE</span>
                  <h3 className="text-3xl font-extrabold text-brand-blue uppercase font-display">Partnerships That Stood <span className="italic font-serif text-brand-orange lowercase font-normal">Staggered</span> Testing</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {testimonials.map((test) => (
                    <div key={test.id} className="bg-white border border-slate-200 p-6 rounded-none space-y-4 shadow-sm">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-bold text-brand-blue text-sm">{test.clientName}</h4>
                          <p className="text-[10px] text-slate-500 font-mono">{test.role}, {test.company}</p>
                        </div>
                        <div className="flex text-brand-orange">
                          {Array.from({ length: test.rating }).map((_, i) => (
                            <Star key={i} className="w-3.5 h-3.5 fill-current" />
                          ))}
                        </div>
                      </div>
                      <p className="text-slate-650 text-xs italic leading-relaxed font-sans">
                        "{test.comment}"
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </div>
        )}

        {/* PRODUCTS PAGE VIEW TAB */}
        {activeTab === 'products' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12 animate-fadeIn text-[#002147]">
            <div className="border-b border-slate-200 pb-5">
              <span className="text-xs font-mono text-brand-orange uppercase tracking-widest font-bold">Active Inventory catalog</span>
              <h2 className="text-3xl font-black text-brand-blue mt-1 uppercase">Industrial Grade <span className="italic font-serif text-brand-orange lowercase font-normal">Specifications</span></h2>
            </div>

            <div className="space-y-16">
              {INITIAL_PRODUCTS.map((prod, idx) => (
                <div
                  key={prod.id}
                  id={prod.slug}
                  className={`grid grid-cols-1 lg:grid-cols-12 gap-8 items-center border-b border-slate-200 pb-12 ${
                    idx % 2 === 1 ? 'lg:flex-row-reverse' : ''
                  }`}
                >
                  {/* Left Column: Product Info */}
                  <div className="lg:col-span-5 relative">
                    <img
                      src={prod.image}
                      alt={prod.name}
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&q=80&w=800";
                      }}
                      className="w-full h-80 object-cover rounded-none border border-slate-200 shadow-lg filter brightness-95"
                    />
                    <div className="absolute top-4 left-4 bg-[#002147] text-brand-orange font-mono text-[10px] uppercase tracking-widest px-2 py-1 border border-brand-blue rounded-none font-bold">
                      Category: {prod.category}
                    </div>
                  </div>

                  {/* Right Column: Key Details, specifications table, CTAs */}
                  <div className="lg:col-span-7 space-y-4">
                    <h3 className="text-2xl font-black text-brand-blue uppercase tracking-tight">{prod.name}</h3>
                    <p className="text-xs text-brand-orange font-mono font-bold uppercase tracking-wider">{prod.tagline}</p>
                    <p className="text-xs text-slate-650 leading-relaxed font-sans">{prod.description}</p>

                    <div>
                      <h4 className="text-[10px] font-mono uppercase text-slate-500 tracking-widest mb-2 font-bold">Technical Specifications Grid:</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 bg-slate-50 p-4 border border-slate-200 rounded-none text-xs select-none">
                        {Object.entries(prod.specifications).map(([k, v], i) => (
                          <div key={i} className="flex justify-between border-b border-slate-200/60 pb-1.5 pt-1 font-sans">
                            <span className="text-slate-550 text-[11px]">{k}</span>
                            <span className="text-[#002147] font-mono text-[11px] font-bold text-right">{v}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <h4 className="text-[10px] font-mono text-slate-500 uppercase tracking-widest mb-1.5 font-bold">Primary transit benefits:</h4>
                        <ul className="text-xs space-y-1 text-slate-600 font-sans">
                          {prod.benefits.map((b, i) => (
                            <li key={i} className="flex items-start">
                              <span className="text-brand-orange mr-1.5 shrink-0">•</span>
                              <span>{b}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h4 className="text-[10px] font-mono text-slate-500 uppercase tracking-widest mb-1.5 font-bold">Industries served:</h4>
                        <div className="flex flex-wrap gap-1">
                          {prod.industriesServed.map((ind, i) => (
                            <span key={i} className="text-[10px] font-mono bg-slate-50 border border-slate-200 text-slate-600 px-2 py-0.5 rounded-none">
                              {ind}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="pt-3 flex space-x-3">
                      <button
                        onClick={() => openQuoteForProduct(prod.name)}
                        className="bg-brand-orange hover:bg-brand-orange/90 text-white font-bold text-xs uppercase tracking-wider px-6 py-3 rounded-none shadow active:scale-95 transition-all cursor-pointer"
                      >
                        Request Quote for this Product
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* INDUSTRIES TAB VIEW */}
        {activeTab === 'industries' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12 animate-fadeIn text-[#002147]">
            <div className="border-b border-slate-205 pb-5">
              <span className="text-xs font-mono text-brand-orange uppercase tracking-widest font-bold">Client Sectors</span>
              <h2 className="text-3xl font-black text-brand-blue mt-1 uppercase">Comprehensive B2B <span className="italic font-serif text-brand-orange lowercase font-normal">Sector Deployments</span></h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                {
                  title: 'E-Commerce Logistics Platforms',
                  tag: 'HIGH-SPEED FLAP INVENTORY',
                  desc: 'Our lines manufacture Regular Slotted Cartons (RSC) and self-locking mailers. Pre-creased scoring streamlines processing layouts during tight shipping window hours.',
                  specs: ['Automatic peel adhesive option', '100% biodegradable FSC Kraft paper selection', 'High burst factors exceeding 18 BF minimums']
                },
                {
                  title: 'Heavy Aerospace & Defense Spares',
                  tag: 'CRASH-LOAD COMPLIANT',
                  desc: 'Engineered high-load crating units combining wood, metal bands, and heavy-gauge 7-ply sheets. We keep complex turbine configurations vibration-isolated.',
                  specs: ['Fitted foam isolator partitions', 'ISPM-15 compliance crating certification', 'Maximum stack loading over 2,000 kg']
                },
                {
                  title: 'Automotive Component Castings',
                  tag: 'SHEAR DAMAGE PROOF',
                  desc: 'Hardened double-butt seam boxes built to carry weight spikes without tearing. Includes customizable dividers to separate individual pistons and gears.',
                  specs: ['Tear resistant moisture film barrier option', 'Double staple-reinforced joint construction', 'Designed around standard pallet nesting counts']
                },
                {
                  title: 'Pharmaceutical Diagnostics',
                  tag: 'DUST-FREE HYGIENE STANDARDS',
                  desc: 'We use premium FDA-approved starches to bind boards, eliminating fine particle dust. Fits into high-speed automated robotic packagers without error.',
                  specs: ['Static free EPE corner blocks', 'Odorless organic binders', 'High stacking resistance under refrigerated storage']
                }
              ].map((item, i) => (
                <div key={i} className="bg-white border-2 border-brand-blue rounded-none p-6 space-y-4 hover:shadow-lg transition-shadow duration-300">
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] font-mono bg-brand-orange/10 border border-brand-orange/30 text-brand-orange px-2 py-0.5 rounded-none tracking-widest font-bold uppercase">
                      {item.tag}
                    </span>
                  </div>
                  <h3 className="font-extrabold text-brand-blue text-base uppercase leading-normal">{item.title}</h3>
                  <p className="text-xs text-slate-650 leading-relaxed font-sans">{item.desc}</p>
                  <div className="pt-2 border-t border-slate-100 space-y-1">
                    <p className="text-[9px] font-mono uppercase text-slate-400 tracking-wider font-bold">Technical criteria checks:</p>
                    <ul className="grid grid-cols-1 gap-1 text-[11px] text-slate-600 font-sans">
                      {item.specs.map((s, idx) => (
                        <li key={idx} className="flex items-center space-x-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 mr-1 shrink-0" />
                          <span>{s}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* MANUFACTURING PROCESS TAB */}
        {activeTab === 'process' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 animate-fadeIn">
            <div className="border-b border-slate-850 pb-5">
              <span className="text-xs font-mono text-orange-500 uppercase tracking-widest">Plant Operations</span>
              <h2 className="text-2xl font-black text-white mt-1">Calibrated Automated Manufacturing Process</h2>
            </div>
            <InteractiveTimeline />
          </div>
        )}

        {/* ADMIN PORTAL TAB */}
        {activeTab === 'admin' && (
          <div className="animate-fadeIn">
            <AdminDashboard />
          </div>
        )}

        {/* CUSTOMER PORTAL REGISTERED DASHBOARD */}
        {activeTab === 'dashboard' && (
          <div className="animate-fadeIn">
            <Dashboard userProfile={userProfile} onSignOut={handleSignOut} />
          </div>
        )}

        {/* ABOUT US TAB PLACEHOLDER */}
        {activeTab === 'about' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16 animate-fadeIn text-[#002147]">
            <div className="border-b border-slate-200 pb-5">
              <span className="text-xs font-mono text-brand-orange uppercase tracking-widest font-bold">About Krishna Packaging</span>
              <h2 className="text-3xl font-black text-brand-blue mt-1 uppercase">Our Heritage & <span className="italic font-serif text-brand-orange lowercase font-normal">Sourcing Standards</span></h2>
            </div>

            {/* Quick stats banner */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { value: '2014', label: 'Established in Jaipur' },
                { value: '30+ Tons', label: 'Daily Board Capacity' },
                { value: '40,000+', label: 'Square Feet Plant' },
                { value: '100%', label: 'Recyclable Sourcing' }
              ].map((stat, i) => (
                <div key={i} className="bg-white border-2 border-brand-blue p-5 text-center rounded-none font-sans">
                  <p className="text-3xl font-black text-brand-orange font-mono">{stat.value}</p>
                  <p className="text-[10px] font-mono text-slate-500 uppercase tracking-wider mt-1">{stat.label}</p>
                </div>
              ))}
            </div>

            {/* Content blocks */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              <div className="lg:col-span-7 space-y-5">
                <h3 className="text-xl font-bold uppercase text-brand-blue tracking-tight font-sans">Supplying Structural Corrugated Systems Since 2014</h3>
                <p className="text-xs text-slate-700 leading-relaxed font-sans">
                  Founded with a vision to provide tier-1 exporters and local heavy industrial manufacturers in Jaipur and NCR with reliable packaging material, Krishna Packaging Company has developed into one of Rajasthan's leading automatic corrugation manufacturers.
                </p>
                <p className="text-xs text-slate-700 leading-relaxed font-sans">
                  From our modern operations headquarters in Saket Colony, Janta Colony, Adarsh Nagar, Jaipur, our facility handles high-volume continuous corrugation lines. We engineer paper box solutions that endure humidity surges, high-vibration logistics corridors, and intense load stresses.
                </p>
                <div className="border-l-4 border-brand-orange pl-4 py-1 italic text-xs text-slate-600 bg-slate-50 font-sans">
                  "Our goal is absolute alignment with our buyers’ automation and assembly standards. If your carton takes longer to pop open, or collapses under regional humidity, your supply chain suffers. We eliminate those points of failure."
                </div>
              </div>
              <div className="lg:col-span-5 bg-white border border-slate-200 p-6 rounded-none space-y-4 shadow-sm">
                <span className="text-[9px] font-mono uppercase bg-brand-blue text-brand-orange px-2 py-1 font-bold">Plant Leadership</span>
                <div>
                  <h4 className="font-bold text-brand-blue text-sm uppercase font-sans">Vikram Singh</h4>
                  <p className="text-[10px] font-mono text-slate-500">Managing Director, Krishna Packaging Co.</p>
                </div>
                <p className="text-xs text-slate-650 font-sans leading-relaxed">
                  Vikram brings over 18 years of technical expertise in paper chemistry, corrugator heat control, and heavy stack layout design. Under his command, the Jaipur facility daily delivers 30+ Metric Tons of high-performance B2B cartons safely.
                </p>
              </div>
            </div>

            {/* Corporate Sourcing Details */}
            <div className="bg-[#002147] text-white p-8 rounded-none border-b-4 border-brand-orange grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <p className="text-brand-orange font-bold text-xs uppercase font-mono mb-2">1. FSC Standard Paper</p>
                <p className="text-xs text-slate-300 leading-relaxed font-sans">We source strictly FSC-compliant kraft sheets to keep environmental impact reduced. Your global purchasers will appreciate complete traceability.</p>
              </div>
              <div>
                <p className="text-brand-orange font-bold text-xs uppercase font-mono mb-2">2. Zero-Chemical Binders</p>
                <p className="text-xs text-slate-300 leading-relaxed font-sans">Using 100% biodegradable food-approved cornstarch formulations rather than chemical heavy adhesives. Safe for pharmacy and dietary exports.</p>
              </div>
              <div>
                <p className="text-brand-orange font-bold text-xs uppercase font-mono mb-2">3. Direct Fleet Routing</p>
                <p className="text-xs text-slate-300 leading-relaxed font-sans">We operate our own logistics vehicles to dispatch custom sized batches within 24 hours directly to Jaipur industrial sectors.</p>
              </div>
            </div>
          </div>
        )}

        {/* FACTORY CERTIFICATIONS TAB */}
        {activeTab === 'certifications' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12 animate-fadeIn text-[#002147]">
            <div className="border-b border-slate-200 pb-5">
              <span className="text-xs font-mono text-brand-orange uppercase tracking-widest font-bold">Industrial Quality Assured</span>
              <h2 className="text-3xl font-black text-brand-blue mt-1 uppercase">Factory Certifications & <span className="italic font-serif text-brand-orange lowercase font-normal">Testing Standards</span></h2>
            </div>

            {/* Cert Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white border-t-4 border-brand-orange border border-slate-200 p-6 rounded-none space-y-3 shadow-sm">
                <div className="w-10 h-10 bg-brand-orange/10 border border-brand-orange/30 flex items-center justify-center text-brand-orange font-black text-xs font-mono">ISO</div>
                <h4 className="font-bold text-brand-blue text-sm uppercase font-sans">ISO 9001:2015 Standard</h4>
                <p className="text-xs text-slate-650 font-sans leading-relaxed font-sans">
                  Registered for premium design, manufacture and distribution of high-strength corrugated sheets. Undergoes rigorous annual third-party audits to maintain processing consistency.
                </p>
              </div>
              <div className="bg-white border-t-4 border-[#002147] border border-slate-200 p-6 rounded-none space-y-3 shadow-sm">
                <div className="w-10 h-10 bg-[#001c3d]/10 border border-[#002147]/30 flex items-center justify-center text-brand-blue font-black text-xs font-mono">IS</div>
                <h4 className="font-bold text-brand-blue text-sm uppercase font-sans">IS:2771 Series Compliance</h4>
                <p className="text-xs text-slate-650 font-sans leading-relaxed font-sans">
                  Our double-walled (5-ply) and triple-walled (7-ply) box specifications are completely certified under Indian Standards Bureau for safe heavy industrial freight carriage compliance.
                </p>
              </div>
              <div className="bg-white border-t-4 border-emerald-600 border border-slate-200 p-6 rounded-none space-y-3 shadow-sm">
                <div className="w-10 h-10 bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 font-black text-xs font-mono">FSC</div>
                <h4 className="font-bold text-brand-blue text-sm uppercase font-sans">FSC Recycled Standard</h4>
                <p className="text-xs text-slate-650 font-sans leading-relaxed font-sans">
                  Ensures all raw kraft paper fibers used in our manufacturing lines trace back exclusively to post-consumer recovered materials or sustainably managed forests.
                </p>
              </div>
            </div>

            {/* Quality testing board */}
            <div className="bg-slate-50 border border-slate-200 p-8 rounded-none space-y-6">
              <div className="space-y-1 font-sans">
                <span className="text-[10px] font-mono text-brand-orange font-bold uppercase tracking-wider font-bold">LABORATORY CALIBRATION</span>
                <h3 className="text-lg font-extrabold uppercase text-brand-blue">Our Active Laboratory Testing Protocols</h3>
                <p className="text-xs text-slate-600 font-sans">We do not assume board strength; we crush-test it. Every raw paper delivery is calibrated before loading on the single-facers.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { title: 'Burst Factor Tester (BF)', desc: 'Measures hydraulic pressure capacity to ensure sheets do not rupture under sudden shift loads.' },
                  { title: 'Edge Crush Tester (ECT)', desc: 'Validates top-to-bottom structural rigidity, crucial for heavy stacked floor pallet packing counts.' },
                  { title: 'Moisture Analyser', desc: 'Calibrates sheet dampness to maintain 8% - 10% moisture ratios, preventing regional dampness collapse.' },
                  { title: 'Ring Crush Tester (RCT)', desc: 'Assures individual kraft rings hold precise compression levels before final cornstarch adhesion.' }
                ].map((test, i) => (
                  <div key={i} className="bg-white p-4 border border-slate-200 rounded-none space-y-2">
                    <p className="font-bold text-brand-blue text-xs uppercase font-sans flex items-center space-x-1">
                      <span className="text-brand-orange font-mono mr-1">{i + 1}.</span>
                      <span>{test.title}</span>
                    </p>
                    <p className="text-[11px] text-slate-655 font-sans leading-relaxed">{test.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* CONTACT US TAB */}
        {activeTab === 'contact' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12 animate-fadeIn text-[#002147]">
            <div className="border-b border-slate-200 pb-5">
              <span className="text-xs font-mono text-brand-orange uppercase tracking-widest font-bold">Contact Our Plant Managers</span>
              <h2 className="text-3xl font-black text-brand-blue mt-1 uppercase">Direct Inquiry & <span className="italic font-serif text-brand-orange lowercase font-normal">Factory Locations</span></h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
              {/* Info Column */}
              <div className="lg:col-span-5 space-y-6">
                <div>
                  <h3 className="text-sm font-mono text-slate-500 uppercase tracking-widest font-bold mb-3">Krishna Packaging Plant</h3>
                  <p className="text-xs text-slate-700 font-sans leading-relaxed font-sans">
                    We welcome factory visits and material audit inspections from corporate procurement departments. Please book an appointment using the details below.
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <MapPin className="w-5 h-5 text-brand-orange shrink-0 mt-0.5" />
                    <div>
                      <p className="text-[10px] font-mono text-slate-400 uppercase font-bold">Factory Address</p>
                      <p className="text-xs font-sans text-slate-700 font-semibold mt-0.5 leading-relaxed font-sans">
                        S-24,25 Janta Colony, Saket Colony, Adarsh Nagar, Jaipur, Rajasthan 302004, India
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <Phone className="w-5 h-5 text-brand-orange shrink-0 mt-0.5" />
                    <div>
                      <p className="text-[10px] font-mono text-slate-400 uppercase font-bold">Direct Phone Helpline</p>
                      <a href="tel:+919829088124" className="text-xs font-mono text-brand-blue font-bold hover:underline block mt-0.5">
                        +91 98290 88124
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <Mail className="w-5 h-5 text-brand-orange shrink-0 mt-0.5" />
                    <div>
                      <p className="text-[10px] font-mono text-slate-400 uppercase font-bold">Corporate Email Desk</p>
                      <a href="mailto:info@krishnapackagingjaipur.com" className="text-xs font-mono text-brand-blue font-bold hover:underline block mt-0.5 font-sans">
                        info@krishnapackagingjaipur.com
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <Clock className="w-5 h-5 text-brand-orange shrink-0 mt-0.5" />
                    <div>
                      <p className="text-[10px] font-mono text-slate-400 uppercase font-bold">Business Curing & Operations Hours</p>
                      <p className="text-xs font-sans text-[#002147] mt-0.5 leading-relaxed font-sans">
                        Monday - Saturday: 09:00 AM - 07:30 PM (IST)
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-brand-orange/10 border-l-4 border-brand-orange text-[#002147] rounded-none">
                  <h4 className="font-bold text-xs uppercase font-sans">Looking to submit an RFP?</h4>
                  <p className="text-[11px] font-sans text-slate-700 mt-1 font-sans">If you have specific dimensions and strength requests, please use our quick digital quotation form for immediate processing limits.</p>
                  <button
                    onClick={handleCreateRFP}
                    className="text-brand-orange hover:text-brand-orange/80 font-mono text-[10px] font-bold uppercase tracking-widest mt-2 underline cursor-pointer"
                  >
                    Launch RFP Form ➔
                  </button>
                </div>
              </div>

              {/* Direct message form */}
              <div className="lg:col-span-7 bg-white border-2 border-brand-blue p-6 md:p-8 rounded-none space-y-4 shadow-md bg-white">
                <div className="border-b border-slate-100 pb-3">
                  <h3 className="font-extrabold uppercase text-brand-blue text-sm tracking-tight font-sans">Direct Message Factory Team</h3>
                  <p className="text-[11px] text-slate-500 font-sans font-sans">Submit standard callbacks, material requests, or trial samples inquiries.</p>
                </div>

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    const form = e.target as HTMLFormElement;
                    alert("Your message has been logged successfully at our Jaipur corporate desk. Our plant managers will call you back within 2 business hours.");
                    form.reset();
                  }}
                  className="space-y-4 text-xs"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-mono text-[10px] text-slate-500 uppercase font-bold mb-1">Company Name</label>
                      <input
                        type="text"
                        required
                        className="w-full px-3 py-2 border border-slate-300 rounded-none font-sans focus:border-brand-orange outline-none focus:ring-0 text-slate-800"
                        placeholder="e.g. Jaipur Exporters Ltd"
                      />
                    </div>
                    <div>
                      <label className="block font-mono text-[10px] text-slate-500 uppercase font-bold mb-1">Contact Person</label>
                      <input
                        type="text"
                        required
                        className="w-full px-3 py-2 border border-slate-300 rounded-none font-sans focus:border-brand-orange outline-none focus:ring-0 text-slate-800"
                        placeholder="e.g. Vikram Sharma"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-mono text-[10px] text-slate-500 uppercase font-bold mb-1">Mobile Hotline Phone</label>
                      <input
                        type="tel"
                        required
                        className="w-full px-3 py-2 border border-slate-300 rounded-none font-mono focus:border-brand-orange outline-none focus:ring-0 text-slate-800"
                        placeholder="e.g. +91 99999 99999"
                      />
                    </div>
                    <div>
                      <label className="block font-mono text-[10px] text-slate-500 uppercase font-bold mb-1">Corporate Email Address</label>
                      <input
                        type="email"
                        required
                        className="w-full px-3 py-2 border border-slate-300 rounded-none font-mono focus:border-brand-orange outline-none focus:ring-0 text-slate-800"
                        placeholder="e.g. vikram@sharmacrafts.com"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-mono text-[10px] text-slate-500 uppercase font-bold mb-1">Inquiry Category</label>
                    <select
                      className="w-full px-3 py-2 border border-slate-300 bg-white rounded-none font-sans focus:border-brand-orange outline-none focus:ring-0 text-slate-800"
                    >
                      <option>General Corporate Inquiry</option>
                      <option>Request Custom Box Size Trial Samples</option>
                      <option>Direct Plant Audit Request</option>
                      <option>Bulk Contract Pricing Request</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-mono text-[10px] text-slate-500 uppercase font-bold mb-1">Your Detailed Message</label>
                    <textarea
                      rows={4}
                      required
                      className="w-full px-3 py-2 border border-slate-300 rounded-none font-sans focus:border-brand-orange outline-none focus:ring-0 text-slate-800 resize-none"
                      placeholder="Specify your dimensions, expected BF/ply profiles, and target shipping schedule..."
                    ></textarea>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-[#002147] hover:bg-brand-orange hover:text-white text-white font-extrabold uppercase font-sans py-3 rounded-none tracking-wider shadow-lg active:scale-95 transition-all outline-none"
                  >
                    Submit Secure Plant Inquiry
                  </button>
                </form>
              </div>
            </div>
          </div>
          )}
      </main>

      {/* FOOTER */}
      <Footer
        setActiveTab={setActiveTab}
        openQuoteForm={handleCreateRFP}
      />

      {/* FLOAT CONVERSIONS AND OVERLAYS PANEL */}

      {/* ADVANCED LEAD CAPTURE SYSTEM (LEAD POPUP, EXIT INTENT CONSULTATION POPUP, AND MOBILE CTA BAR) */}
      <LeadCaptureSystem />

      {/* MODAL ENQUIRY FORM PANEL DRAWER */}
      <AnimatePresence>
        {isQuoteFormOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex justify-center items-start overflow-y-auto p-2 sm:p-4 pt-6 pb-24 sm:py-8"
          >
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              transition={{ type: 'spring', duration: 0.4 }}
              className="max-w-2xl w-full my-auto"
            >
              <LeadForm
                onClose={() => setIsQuoteFormOpen(false)}
                preselectedProduct={preselectedProductForQuote}
                onSuccessSubmit={() => {
                  // optional hooks
                }}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* AUTH SYSTEM (SIGN IN & SIGN UP) MODAL DRAWER */}
      <AnimatePresence>
        {authMode !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex justify-center items-start overflow-y-auto p-2 sm:p-4 pt-6 pb-24 sm:py-8"
          >
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              transition={{ type: 'spring', duration: 0.4 }}
              className="max-w-md w-full my-auto"
            >
              <AuthSystem
                initialMode={authMode}
                onClose={() => setAuthMode(null)}
                onSuccess={() => {
                  setAuthMode(null);
                  setActiveTab('dashboard');
                }}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
