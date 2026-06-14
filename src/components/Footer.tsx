/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Box, MapPin, Phone, Mail, Clock, ShieldAlert, FileText, ChevronRight } from 'lucide-react';

interface FooterProps {
  setActiveTab: (tab: string) => void;
  openQuoteForm: () => void;
}

export default function Footer({ setActiveTab, openQuoteForm }: FooterProps) {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#002147] text-slate-200 border-t border-brand-orange/40">
      {/* Dynamic Industrial Trust Blue Shield */}
      <div className="bg-[#001c3d] border-b border-white/5 py-6 px-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0 text-center md:text-left">
          <div>
            <h4 className="text-white font-bold text-sm tracking-wide uppercase">Looking for Heavy Volume Discounts or Contract Packaging?</h4>
            <p className="text-xs text-slate-350 mt-1">Our production lines are equipped with high-speed automated corrugators for global container loads.</p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={openQuoteForm}
              className="bg-brand-orange hover:bg-brand-orange/90 text-white font-extrabold text-xs px-5 py-2.5 rounded-none tracking-wider uppercase transition-all duration-150 cursor-pointer"
            >
              Request Contract Quotation
            </button>
            <a
              href="tel:+919829088124"
              className="bg-white/10 hover:bg-white/15 text-white font-bold text-xs px-5 py-2.5 rounded-none border border-white/20 transition-colors flex items-center justify-center space-x-2"
            >
              <Phone className="w-4 h-4 text-brand-orange" />
              <span>Call +91 98290 88124</span>
            </a>
          </div>
        </div>
      </div>

      {/* Main Footer Body */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {/* Pitch / Identity */}
        <div className="space-y-4 animate-fadeIn">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-brand-orange rounded-none flex items-center justify-center">
              <Box className="w-5 h-5 text-white" />
            </div>
            <span className="text-white font-black tracking-tight text-base uppercase font-sans">KRISHNA PACKAGING</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed font-sans">
            Krishna Packaging Company is Rajasthan's leading packaging manufacturer, supplying high-strength corrugated sheets, shipper boxes, and protective foam pads directly from Jaipur to all national clusters.
          </p>
          <div className="text-xs space-y-2 border-t border-white/10 pt-3">
            <p className="flex items-center space-x-2 text-slate-350 font-sans">
              <Phone className="w-3.5 h-3.5 text-brand-orange shrink-0" />
              <span>Call: <a href="tel:+919829088124" className="text-white font-bold hover:text-brand-orange transition-colors">+91 98290 88124</a></span>
            </p>
            <p className="flex items-center space-x-2 text-slate-350 font-sans">
              <Mail className="w-3.5 h-3.5 text-brand-orange shrink-0" />
              <span>Email: <a href="mailto:info@krishnapackagingjaipur.com" className="text-white hover:text-brand-orange transition-colors">info@krishnapackagingjaipur.com</a></span>
            </p>
          </div>
          <div className="text-[11px] font-mono text-slate-400 space-y-1 border-t border-white/10 pt-3">
            <p>Compliance: IS:2771 Structure Assured</p>
            <p>Direct Supply: Jaipur, Sitapura, Vishwakarma, Boranada</p>
          </div>
        </div>

        {/* Product Navigation */}
        <div>
          <h4 className="text-white font-bold text-xs uppercase tracking-widest mb-4 border-l-2 border-brand-orange pl-2 font-mono">Product Catalog</h4>
          <ul className="space-y-2 text-xs">
            {[
              { name: 'Corrugated Sheets (3/5/7-ply)', type: 'Sheets & Boards' },
              { name: 'Shipper Boxes (RSC & Custom)', type: 'Boxes' },
              { name: 'Continuous Wrapping Rolls', type: 'Rolls' },
              { name: 'Adhesive BOPP Tapes', type: 'Tapes' },
              { name: 'Protective EPE Foam Spacers', type: 'Protective' },
              { name: 'Bespoke Architectural Crates', type: 'Custom' }
            ].map((prod, idx) => (
              <li key={idx}>
                <button
                  onClick={() => setActiveTab('products')}
                  className="hover:text-brand-orange flex items-center space-x-1 transition-colors text-left py-1 cursor-pointer text-slate-300 font-sans"
                >
                  <ChevronRight className="w-3 h-3 text-brand-orange shrink-0" />
                  <span>{prod.name}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Address and Reach */}
        <div className="space-y-4">
          <h4 className="text-white font-bold text-xs uppercase tracking-widest mb-4 border-l-2 border-brand-orange pl-2 font-mono">Corporate Factory</h4>
          <ul className="space-y-3.5 text-xs">
            <li className="flex items-start space-x-2">
              <MapPin className="w-4 h-4 text-brand-orange shrink-0 mt-0.5" />
              <div className="text-slate-300 leading-relaxed font-sans">
                <span className="font-semibold text-white block">S-24,25 Janta Colony, Saket Colony</span>
                <span>Adarsh Nagar, Jaipur,<br />Rajasthan 302004, India</span>
              </div>
            </li>
            <li className="border-t border-white/10 pt-3">
              <p className="text-[10px] text-slate-400 font-mono uppercase tracking-wider">Managing Director</p>
              <p className="text-white font-bold text-xs font-sans">Mr. Krishna Khandelwal</p>
              <p className="text-slate-405 text-[11px]">Industrial Corrugation Lead</p>
            </li>
            <li className="border-t border-white/10 pt-3">
              <p className="text-[10px] text-slate-400 font-mono uppercase tracking-wider">GSTIN Registry</p>
              <p className="text-brand-orange font-bold font-mono text-[11px] tracking-wide">08AAPCK8124G1Z2</p>
            </li>
          </ul>
        </div>

        {/* Quality Certs & Technical links */}
        <div className="space-y-4">
          <h4 className="text-white font-bold text-xs uppercase tracking-widest border-l-2 border-brand-orange pl-2 font-mono text-left">Quick Links</h4>
          <p className="text-xs text-slate-300 font-sans">
            Learn more about our heritage, certified corrugation processes, and how to reach our factory experts.
          </p>
          <div className="flex flex-col space-y-2">
            <button
              onClick={() => setActiveTab('about')}
              className="bg-[#001c3d] border border-white/10 hover:border-brand-orange hover:text-white px-3 py-2 rounded-none text-xs flex items-center justify-between text-left transition-all duration-150 cursor-pointer"
            >
              <div className="flex items-center space-x-2 font-sans">
                <FileText className="w-3.5 h-3.5 text-brand-orange" />
                <span>About Our Heritage</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            </button>
            <button
              onClick={() => setActiveTab('certifications')}
              className="bg-[#001c3d] border border-white/10 hover:border-brand-orange hover:text-white px-3 py-2 rounded-none text-xs flex items-center justify-between text-left transition-all duration-150 cursor-pointer"
            >
              <div className="flex items-center space-x-2 font-sans">
                <ShieldAlert className="w-3.5 h-3.5 text-brand-orange" />
                <span>Factory Certifications</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            </button>
            <button
              onClick={() => setActiveTab('contact')}
              className="bg-[#001c3d] border border-white/10 hover:border-brand-orange hover:text-white px-3 py-2 rounded-none text-xs flex items-center justify-between text-left transition-all duration-150 cursor-pointer"
            >
              <div className="flex items-center space-x-2 font-sans">
                <Clock className="w-3.5 h-3.5 text-brand-orange" />
                <span>Contact Factory Experts</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            </button>
          </div>
        </div>
      </div>

      {/* Corporate Copy & Schema Tags */}
      <div className="bg-[#001127] border-t border-white/5 py-6 px-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center text-xs text-slate-400 space-y-3 md:space-y-0 font-sans">
          <p>© {currentYear} Krishna Packaging Company. All Rights Reserved. Manufactured and supplied globally from Rajasthan.</p>
          <div className="flex space-x-4">
            <span className="text-slate-405 hover:text-slate-200 transition-colors cursor-pointer">Privacy Policy</span>
            <span>•</span>
            <span className="text-slate-405 hover:text-slate-200 transition-colors cursor-pointer">B2B Terms of Contract</span>
            <span>•</span>
            <span className="text-brand-orange hover:text-slate-200 transition-colors uppercase font-bold text-[10px] border border-brand-orange/40 px-1.5 py-0.5 rounded-none font-mono">ISO 9001:2015</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
