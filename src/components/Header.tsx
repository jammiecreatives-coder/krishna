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
              className="text-brand-orange text-[10px] font-bold uppercase px-2.5 py-2 border border-brand-orange/40 hover:bg-white/5 rounded-none transition"
            >
              Portal
            </button>
          ) : (
            <button
              onClick={() => onOpenAuth('signin')}
              className="text-slate-200 text-[10px] font-bold uppercase px-2 py-2"
            >
              Sign In
            </button>
          )}
          <button
            onClick={openQuoteForm}
            className="bg-brand-orange text-white text-[10px] font-extrabold uppercase px-3 py-2 rounded-none shadow transition-all duration-150"
          >
            Quote
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="text-slate-200 hover:text-white p-2 rounded-none hover:bg-white/5 transition-colors"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="xl:hidden bg-brand-blue border-t border-brand-orange/40 px-4 py-3 space-y-2 overflow-hidden"
          >
            {navItems.map((item) => {
              const isActive = activeTab === item.value;
              return (
                <button
                  key={item.value}
                  onClick={() => {
                    setActiveTab(item.value);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2.5 rounded-none text-sm font-medium transition-colors flex items-center justify-between ${
                    isActive ? 'bg-white/10 text-brand-orange font-bold' : 'text-slate-200 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <span className="font-sans">{item.label}</span>
                  {item.icon && <item.icon className="w-4 h-4 text-slate-300" />}
                </button>
              );
            })}
            <div className="pt-3 border-t border-white/10 flex flex-col space-y-2">
              {userProfile ? (
                <>
                  <button
                    onClick={() => {
                      setActiveTab('dashboard');
                      setMobileMenuOpen(false);
                    }}
                    className="bg-white/5 text-slate-100 py-2.5 rounded-none text-xs font-bold uppercase tracking-wider text-center cursor-pointer flex items-center justify-center space-x-2"
                  >
                    <User className="w-4 h-4 text-brand-orange" />
                    <span>My Dashboard Portal</span>
                  </button>
                  <button
                    onClick={() => {
                      onSignOut();
                      setMobileMenuOpen(false);
                    }}
                    className="bg-red-950/20 text-red-100 py-2.5 rounded-none text-xs font-bold uppercase tracking-wider text-center cursor-pointer"
                  >
                    Sign Out Account
                  </button>
                </>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => {
                      onOpenAuth('signin');
                      setMobileMenuOpen(false);
                    }}
                    className="bg-white/5 text-white py-2.5 rounded-none text-xs font-bold uppercase tracking-wider text-center cursor-pointer"
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => {
                      onOpenAuth('signup');
                      setMobileMenuOpen(false);
                    }}
                    className="bg-white/10 text-white py-2.5 rounded-none text-xs font-bold uppercase tracking-wider text-center cursor-pointer"
                  >
                    Sign Up
                  </button>
                </div>
              )}
              <a href="tel:+919829088124" className="bg-white/5 text-white text-center py-2.5 rounded-none font-bold text-xs flex items-center justify-center space-x-2">
                <Phone className="w-4 h-4 text-brand-orange" />
                <span>Call Now: +91 98290 88124</span>
              </a>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  openQuoteForm();
                }}
                className="bg-brand-orange text-white text-center py-2.5 rounded-none font-extrabold text-xs uppercase tracking-wider"
              >
                Request Quotation
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
