/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Box, Phone, Mail, FileSpreadsheet, ShieldAlert, Menu, X, Landmark, ShieldCheck, HelpCircle, Award, Users, Home, Building2, Cpu, User, LogOut } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { UserProfile } from '../services/dbService';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  openQuoteForm: () => void;
  userProfile: UserProfile | null;
  onOpenAuth: (mode: 'signin' | 'signup') => void;
  onSignOut: () => void;
}

export default function Header({ activeTab, setActiveTab, openQuoteForm, userProfile, onOpenAuth, onSignOut }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { label: 'Home', value: 'home', icon: Home },
    { label: 'Our Products', value: 'products', icon: Box },
    { label: 'Industries Served', value: 'industries', icon: Building2 },
    { label: 'Manufacturing Process', value: 'process', icon: Cpu },
    { label: 'About Us', value: 'about', icon: Users },
    { label: 'Certifications', value: 'certifications', icon: Award },
    { label: 'Contact Us', value: 'contact', icon: Phone },
  ];

  return (
    <header className="sticky top-0 z-40 bg-brand-blue border-b-2 border-brand-orange text-white w-full">
      {/* Top Bar for Industrial Trust Elements */}
      <div className="bg-brand-blue/90 border-b border-white/10 text-xs px-4 py-2 hidden lg:flex justify-between items-center max-w-7xl mx-auto">
        <div className="flex items-center space-x-6 text-slate-300">
          <span className="flex items-center space-x-1">
            <Landmark className="w-4.5 h-4.5 text-brand-orange" />
            <span className="font-semibold text-slate-100 font-sans">ISO 9001:2015 & IS:2771 Certified Plant</span>
          </span>
          <span className="flex items-center space-x-1">
            <ShieldCheck className="w-4.5 h-4.5 text-emerald-400" />
            <span className="font-sans">Daily Manufacturing Capacity: 30+ Tons</span>
          </span>
        </div>
        <div className="flex items-center space-x-4 text-slate-200">
          <a href="mailto:info@krishnapackagingjaipur.com" className="flex items-center space-x-1 text-slate-200 hover:text-brand-orange transition-colors">
            <Mail className="w-3.5 h-3.5 text-brand-orange" />
            <span className="font-sans">info@krishnapackagingjaipur.com</span>
          </a>
          <a href="tel:+919829088124" className="flex items-center space-x-1 text-slate-100 hover:text-brand-orange transition-colors font-bold font-sans">
            <Phone className="w-3.5 h-3.5 text-brand-orange" />
            <span>+91 98290 88124</span>
          </a>
        </div>
      </div>

      {/* Main Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
        {/* Brand Logo */}
        <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('home')}>
          <div className="w-10 h-10 bg-gradient-to-br from-brand-orange to-amber-600 rounded-none flex items-center justify-center shadow-lg">
            <Box className="w-6 h-6 text-white stroke-[2.2]" />
          </div>
          <div>
            <h1 className="text-lg font-black tracking-tight leading-tight text-white flex items-center font-sans">
              KRISHNA <span className="text-brand-orange ml-1 font-semibold text-xs border border-brand-orange/40 px-1 py-0.5 rounded-none">B2B</span>
            </h1>
            <p className="text-[10px] font-mono uppercase tracking-widest text-slate-300">Packaging Company</p>
          </div>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden xl:flex space-x-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.value;
            return (
              <button
                key={item.value}
                onClick={() => setActiveTab(item.value)}
                className={`relative px-2 xl:px-3 py-2 rounded-none text-xs xl:text-sm font-medium transition-all duration-200 flex items-center space-x-1 cursor-pointer outline-none ${
                  isActive
                    ? 'bg-white/10 text-brand-orange'
                    : 'text-slate-200 hover:bg-white/5 hover:text-brand-orange'
                }`}
              >
                {Icon && <Icon className="w-4 h-4 mr-0.5" />}
                <span className="font-sans">{item.label}</span>
                {isActive && (
                  <motion.div
                    layoutId="headerActiveTab"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-orange"
                    transition={{ type: 'spring', stiffness: 380, damping: 25 }}
                  />
                )}
              </button>
            );
          })}
        </nav>

        {/* Action Buttons */}
        <div className="hidden xl:flex items-center space-x-2.5">
          {userProfile ? (
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-none font-sans flex items-center space-x-1 border cursor-pointer ${
                  activeTab === 'dashboard'
                    ? 'bg-white text-[#002147] border-white'
                    : 'text-white border-white/20 hover:bg-white/5'
                }`}
              >
                <User className="w-3.5 h-3.5 text-brand-orange shrink-0" />
                <span>Dashboard</span>
              </button>
              <button
                onClick={onSignOut}
                className="hover:text-brand-orange p-2 text-slate-300 transition-colors cursor-pointer"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4 shrink-0" />
              </button>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <button
                onClick={() => onOpenAuth('signin')}
                className="text-white hover:text-brand-orange text-xs font-bold uppercase tracking-wider px-3.5 py-2 hover:bg-white/5 rounded-none cursor-pointer"
              >
                Sign In
              </button>
              <button
                onClick={() => onOpenAuth('signup')}
                className="bg-white/10 hover:bg-white/25 text-white text-xs font-extrabold uppercase tracking-wider px-4 py-2 border border-white/20 rounded-none cursor-pointer"
              >
                Sign Up
              </button>
            </div>
          )}

          <button
            onClick={openQuoteForm}
            className="bg-brand-orange hover:bg-brand-orange/90 text-white text-xs font-bold uppercase tracking-wider px-5 py-2.5 rounded-none shadow-lg active:scale-95 transition-all duration-150 cursor-pointer"
          >
            Request Quotation
          </button>
        </div>

        {/* Mobile menu button */}
        <div className="xl:hidden flex items-center space-x-2">
          {userProfile ? (
            <button
              onClick={() => setActiveTab('dashboard')}
              className="text-brand-orange text-[10px] font-bold uppercase px-3 py-2 border border-brand-orange/40 hover:bg-white/5 rounded-none transition font-sans"
            >
              Portal
            </button>
          ) : (
            <button
              onClick={() => onOpenAuth('signin')}
              className="text-slate-200 text-[10px] font-bold uppercase px-3 py-2 font-sans"
            >
              Sign In
            </button>
          )}
          <button
            onClick={openQuoteForm}
            className="bg-brand-orange hover:bg-brand-orange/90 text-white text-[11px] font-extrabold uppercase px-3.5 py-2 rounded-none shadow transition-all duration-150 min-h-[38px] flex items-center font-sans"
          >
            Quote
          </button>
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="text-slate-200 hover:text-white p-2.5 rounded-none hover:bg-white/5 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
            aria-label="Open menu"
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Mobile Premium Slide-Out Side Drawer Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            {/* Backdrop Blur Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md xl:hidden"
            />

            {/* Sidebar Container */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 26, stiffness: 220 }}
              className="fixed right-0 top-0 bottom-0 z-55 w-[85vw] max-w-sm bg-brand-blue border-l border-brand-orange/30 shadow-2xl flex flex-col justify-between text-white xl:hidden overflow-y-auto"
            >
              {/* Drawer Title Header with Custom Close click */}
              <div className="p-5 border-b border-white/10 flex items-center justify-between bg-brand-blue/95">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-brand-orange flex items-center justify-center rounded-none shadow">
                    <Box className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-sm font-black tracking-tight leading-tight uppercase font-sans">
                      Krishna <span className="text-brand-orange">B2B</span>
                    </h2>
                    <p className="text-[8px] font-mono uppercase tracking-widest text-slate-350">Jaipur Packaging</p>
                  </div>
                </div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 text-slate-300 hover:text-white hover:bg-white/5 transition-colors rounded-none outline-none min-w-[44px] min-h-[44px] flex items-center justify-center"
                  aria-label="Close menu"
                >
                  <X className="w-6 h-6 text-brand-orange" />
                </button>
              </div>

              {/* Navigation Items list - Spacious touch targets */}
              <div className="flex-grow p-4 py-6 space-y-1.5">
                <p className="text-[9px] font-mono uppercase text-slate-400 tracking-widest font-black px-3 mb-2.5">
                  Factory Navigation
                </p>
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.value;
                  return (
                    <button
                      key={item.value}
                      onClick={() => {
                        setActiveTab(item.value);
                        setMobileMenuOpen(false);
                      }}
                      className={`w-full text-left px-3.5 py-3.5 rounded-none text-sm transition-all flex items-center justify-between min-h-[48px] cursor-pointer ${
                        isActive 
                          ? 'bg-brand-orange/15 text-brand-orange font-bold border-l-4 border-brand-orange pl-2.5' 
                          : 'text-slate-200 hover:bg-white/5 hover:text-brand-orange font-medium'
                      }`}
                    >
                      <span className="font-sans text-[13.5px] uppercase tracking-wide">{item.label}</span>
                      {Icon && <Icon className={`w-4.5 h-4.5 ${isActive ? 'text-brand-orange' : 'text-slate-400'}`} />}
                    </button>
                  );
                })}
              </div>

              {/* Drawer Bottom CTA Elements */}
              <div className="p-5 border-t border-white/10 bg-[#001c3d]/60 space-y-3">
                <p className="text-[8px] font-mono uppercase text-slate-400 tracking-widest font-bold block mb-1">
                  B2B Quick Connections
                </p>

                {userProfile ? (
                  <div className="space-y-2">
                    <button
                      onClick={() => {
                        setActiveTab('dashboard');
                        setMobileMenuOpen(false);
                      }}
                      className="w-full bg-white/5 hover:bg-white/10 text-slate-100 py-3 rounded-none text-xs font-bold uppercase tracking-wider text-center cursor-pointer flex items-center justify-center space-x-2 min-h-[46px] font-sans border border-white/10"
                    >
                      <User className="w-4 h-4 text-brand-orange" />
                      <span>Inquiry Dashboard</span>
                    </button>
                    <button
                      onClick={() => {
                        onSignOut();
                        setMobileMenuOpen(false);
                      }}
                      className="w-full bg-red-950/20 text-red-200 hover:bg-red-950/30 py-3 rounded-none text-xs font-bold uppercase tracking-wider text-center min-h-[46px] font-sans"
                    >
                      Sign Out
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => {
                        onOpenAuth('signin');
                        setMobileMenuOpen(false);
                      }}
                      className="bg-white/5 text-white py-3 rounded-none text-xs font-bold uppercase tracking-wider text-center cursor-pointer min-h-[46px] font-sans border border-white/10"
                    >
                      Sign In
                    </button>
                    <button
                      onClick={() => {
                        onOpenAuth('signup');
                        setMobileMenuOpen(false);
                      }}
                      className="bg-white/10 text-white py-3 rounded-none text-xs font-bold uppercase tracking-wider text-center cursor-pointer min-h-[46px] font-sans border border-white/10"
                    >
                      Sign Up
                    </button>
                  </div>
                )}

                <a 
                  href="tel:+919829088124" 
                  className="w-full bg-[#001127] text-slate-100 text-center py-3 rounded-none font-bold text-xs flex items-center justify-center space-x-2 min-h-[46px] border border-white/5"
                >
                  <Phone className="w-4 h-4 text-brand-orange" />
                  <span className="font-mono">+91 98290 88124</span>
                </a>

                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    openQuoteForm();
                  }}
                  className="w-full bg-brand-orange hover:bg-brand-orange/90 text-white text-center py-3 rounded-none font-black text-xs uppercase tracking-widest shadow-lg min-h-[46px] font-sans"
                >
                  Request B2B Quote
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}
