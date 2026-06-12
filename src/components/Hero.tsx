/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { ShieldCheck, ArrowRight, Flame, Layers, Box, Truck, Compass, Settings } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface HeroProps {
  onQuoteClick: () => void;
  setActiveTab: (tab: string) => void;
}

export default function Hero({ onQuoteClick, setActiveTab }: HeroProps) {
  const [activeBoxIndex, setActiveBoxIndex] = useState(0);
  const [simulationSpeed, setSimulationSpeed] = useState<'normal' | 'fast'>('normal');

  // Conveyor Belt micro-interaction loop
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveBoxIndex((prev) => (prev + 1) % 4);
    }, simulationSpeed === 'normal' ? 3000 : 1500);
    return () => clearInterval(interval);
  }, [simulationSpeed]);

  const simulatedBoxes = [
    { id: 'b1', label: '7-Ply Corrugated Sheet', status: 'Curing Flutes', size: '2000x1200mm', weight: '22kg' },
    { id: 'b2', label: 'Heavy RSC Machinery Shipper', status: 'Adhesive Stitching', size: '600x400x500mm', weight: '85kg' },
    { id: 'b3', label: 'Continuous Adhesive BOPP tape', status: 'Core Coiling', size: '48mm x 65m', weight: '0.45kg' },
    { id: 'b4', label: 'Bespoke Solar Panel Array Tray', status: 'EPE Buffer Curing', size: '1600x1000mm', weight: '34kg' },
  ];

  return (
    <div className="relative bg-[#002147] text-white overflow-hidden py-16 lg:py-24 border-b-4 border-brand-orange">
      {/* Background Tech Mesh */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#002c5c_1px,transparent_1px),linear-gradient(to_bottom,#002c5c_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-40 pointer-events-none" />

      {/* Floating Industrial Steel Elements */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-brand-orange/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        {/* Left Hand: High impact corporate copy */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0, y: 30 },
            visible: {
              opacity: 1,
              y: 0,
              transition: {
                staggerChildren: 0.15,
                delayChildren: 0.1,
                duration: 0.8,
                ease: 'easeOut',
              }
            }
          }}
          className="lg:col-span-7 space-y-6"
        >
          <motion.div
            variants={{
              hidden: { opacity: 0, scale: 0.95 },
              visible: { opacity: 1, scale: 1, transition: { duration: 0.5 } }
            }}
            className="inline-flex items-center space-x-2 bg-black/30 border border-brand-orange/40 px-3 py-1.5 rounded-none text-xs text-brand-orange font-semibold tracking-wider uppercase font-mono"
          >
            <Flame className="w-3.5 h-3.5 text-brand-orange animate-pulse" />
            <span>Industrial Packaging Manufacturer & Supplier</span>
          </motion.div>

          <motion.h2
            variants={{
              hidden: { opacity: 0, y: 20 },
              visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } }
            }}
            className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-none text-white font-sans uppercase"
          >
            Packaging Solutions <br />
            <span className="font-serif italic font-normal text-brand-orange lowercase">
              that protect what matters
            </span>
          </motion.h2>

          <motion.p
            variants={{
              hidden: { opacity: 0, y: 20 },
              visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } }
            }}
            className="text-slate-300 text-sm sm:text-base lg:text-lg leading-relaxed max-w-2xl font-sans"
          >
            Reliable Industrial Packaging Materials For Manufacturers, Exporters, Warehouses & Businesses Across Rajasthan. Custom-engineered products ranging from high-strength 7-ply sheets to precision-die buffers.
          </motion.p>

          {/* Quick Stats Grid */}
          <motion.div
            variants={{
              hidden: { opacity: 0, y: 20 },
              visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
            }}
            className="grid grid-cols-3 gap-4 py-4 border-y border-white/10"
          >
            <div className="space-y-1">
              <p className="text-lg sm:text-2xl font-mono font-bold text-white">12+ Years</p>
              <p className="text-[10px] sm:text-xs text-slate-400 uppercase tracking-widest font-mono">Industrial Trust</p>
            </div>
            <div className="space-y-1">
              <p className="text-lg sm:text-2xl font-mono font-bold text-white">30 Tons</p>
              <p className="text-[10px] sm:text-xs text-slate-400 uppercase tracking-widest font-mono">Daily Operations</p>
            </div>
            <div className="space-y-1">
              <p className="text-lg sm:text-2xl font-mono font-bold text-white">100% Recycled</p>
              <p className="text-[10px] sm:text-xs text-slate-400 uppercase tracking-widest font-mono">FSC Kraft Available</p>
            </div>
          </motion.div>

          {/* B2B Call To Actions */}
          <motion.div
            variants={{
              hidden: { opacity: 0, y: 20 },
              visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
            }}
            className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 pt-2"
          >
            <motion.button
              whileHover={{ scale: 1.03, shadow: '0px 10px 20px rgba(229, 87, 34, 0.3)' }}
              whileTap={{ scale: 0.98 }}
              onClick={onQuoteClick}
              className="bg-brand-orange hover:bg-brand-orange/90 text-white font-black text-sm uppercase tracking-wider px-8 py-4 rounded-none shadow-lg flex items-center justify-center space-x-2 cursor-pointer transition-all duration-150"
            >
              <span>Request Quotation</span>
              <ArrowRight className="w-4 h-4 text-white stroke-[2.5]" />
            </motion.button>
            <motion.a
              whileHover={{ scale: 1.03, backgroundColor: 'rgba(255, 255, 255, 0.15)' }}
              whileTap={{ scale: 0.98 }}
              href="tel:+919829088124"
              className="bg-white/10 hover:bg-white/20 text-white font-bold text-sm px-8 py-4 rounded-none border border-white/20 flex items-center justify-center space-x-2 transition-all font-mono"
            >
              <span>Call Local Factory</span>
              <span className="text-brand-orange font-bold ml-1 font-sans">+91 98290 88124</span>
            </motion.a>
          </motion.div>

          <motion.div
            variants={{
              hidden: { opacity: 0 },
              visible: { opacity: 1, transition: { duration: 0.8 } }
            }}
            className="flex items-center space-x-4 text-xs text-slate-400 pt-2 font-mono"
          >
            <span className="flex items-center">
              <ShieldCheck className="w-4 h-4 text-emerald-400 mr-1 shrink-0" />
              <span>IS:2771 Indian Standard Spec compliant</span>
            </span>
            <span className="text-slate-600">|</span>
            <button onClick={() => setActiveTab('process')} className="hover:text-brand-orange underline transition-all cursor-pointer">
              Watch Automated Process Timeline
            </button>
          </motion.div>
        </motion.div>

        {/* Right Hand: Gorgeous Animated Conveyor Belt and Warehouse Simulation */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: 'easeOut' }}
          className="lg:col-span-5 relative bg-white/5 border border-white/10 rounded-none p-6 shadow-2xl"
        >
          {/* Active Status Header */}
          <div className="flex justify-between items-center mb-4 pb-3 border-b border-white/10">
            <div className="flex items-center space-x-2 font-mono">
              <span className="w-2.5 h-2.5 bg-emerald-400 rounded-full animate-ping" />
              <span className="text-[11px] tracking-wider text-emerald-400 uppercase font-bold">JAIPUR AUTOMATED LINE #2</span>
            </div>
            <div className="flex bg-black/40 p-1 rounded-none border border-white/10 text-[10px] font-mono">
              <button
                onClick={() => setSimulationSpeed('normal')}
                className={`px-2 py-0.5 rounded-none transition cursor-pointer ${simulationSpeed === 'normal' ? 'bg-brand-orange text-white font-bold' : 'text-slate-400'}`}
              >
                Normal
              </button>
              <button
                onClick={() => setSimulationSpeed('fast')}
                className={`px-2 py-0.5 rounded-none transition cursor-pointer ${simulationSpeed === 'fast' ? 'bg-brand-orange text-white font-bold' : 'text-slate-400'}`}
              >
                Express
              </button>
            </div>
          </div>

          {/* Physical Stage - Conveyor Belt & Moving Blocks */}
          <div className="relative bg-[#001127] h-64 rounded-none overflow-hidden flex flex-col justify-between p-4 border border-white/10">
            {/* Ceiling Laser Scanner Component */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-8 flex flex-col items-center">
              <div className="w-12 h-1 bg-slate-800 rounded-b border-b border-brand-orange" />
              {/* Laser Beam Visual effect */}
              <div className="w-1 bg-gradient-to-b from-brand-orange to-transparent h-16 animate-pulse opacity-65" />
              <div className="absolute top-1 text-[8px] font-mono text-brand-orange tracking-wider">CAD SCALE LASER ACTIVE</div>
            </div>

            {/* Backdrop Machinery Grids */}
            <div className="absolute inset-x-2 top-10 flex justify-between text-slate-800 pointer-events-none">
              <Settings className="w-12 h-12 animate-spin text-white/5 font-thin" style={{ animationDuration: '10s' }} />
              <Layers className="w-10 h-10 text-white/5" />
              <Settings className="w-12 h-12 animate-spin text-white/5" style={{ animationDuration: '15s', animationDirection: 'reverse' }} />
            </div>

            {/* Active Box details panel on stage screen */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activeBoxIndex}
                initial={{ opacity: 0, scale: 0.95, y: -5 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 5 }}
                transition={{ duration: 0.25, ease: 'easeInOut' }}
                className="bg-[#002147]/95 backdrop-blur-md rounded-none border border-white/10 p-2.5 z-10 max-w-sm absolute top-4 left-4"
              >
                <p className="text-[9px] font-mono uppercase text-slate-400 tracking-wider">Active Corrugator Feed</p>
                <h5 className="text-xs font-bold text-white mt-0.5">{simulatedBoxes[activeBoxIndex].label}</h5>
                <div className="grid grid-cols-2 gap-x-2 gap-y-0.5 mt-1 text-[10px] font-mono text-slate-300">
                  <p>Status: <span className="text-brand-orange font-bold">{simulatedBoxes[activeBoxIndex].status}</span></p>
                  <p>Specs: <span className="text-white">{simulatedBoxes[activeBoxIndex].size}</span></p>
                  <p>Moisture: <span className="text-emerald-400">8.2% Standard</span></p>
                  <p>Weight: <span className="text-white">{simulatedBoxes[activeBoxIndex].weight}</span></p>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* The Conveyor Track Line */}
            <div className="relative z-10 mt-auto w-full font-mono">
              {/* Cartons Riding the Belt */}
              <div className="flex justify-around items-end h-24 mb-1.5 relative px-6">
                {simulatedBoxes.map((box, idx) => {
                  const isActive = idx === activeBoxIndex;
                  return (
                    <motion.div
                      key={box.id}
                      animate={isActive ? { scale: 1.15, y: -8, opacity: 1, zIndex: 20 } : { scale: 0.9, y: 0, opacity: 0.45, zIndex: 10 }}
                      transition={{ type: 'spring', stiffness: 120, damping: 14 }}
                      className="relative flex flex-col items-center justify-center"
                    >
                      {/* Active bounding box cursor with layId path */}
                      {isActive && (
                        <motion.div
                          layoutId="activeBoxTrackerCursor"
                          transition={{ type: 'spring', stiffness: 150, damping: 16 }}
                          className="absolute -inset-2.5 border-2 border-dashed border-brand-orange rounded-none pointer-events-none"
                        />
                      )}

                      {/* Cardboard Box Graphic Structure */}
                      <div
                        className={`w-14 h-12 rounded-none flex flex-col justify-between p-1.5 transition-colors duration-300 ${
                          isActive
                            ? 'bg-amber-700 text-amber-100 border border-brand-orange shadow-lg shadow-brand-orange/30'
                            : 'bg-amber-800 text-amber-500 border border-slate-900'
                        }`}
                      >
                        {/* Packaging markings */}
                        <div className="flex justify-between leading-none text-[6px]">
                          <Box className="w-2.5 h-2.5" />
                          <span>↑↑</span>
                        </div>
                        {/* Custom printed logo simulation on cardboard boxes */}
                        <div className="text-[4px] font-black uppercase text-center tracking-wider text-[#ffe]">
                          KRISHNA JP
                        </div>
                        <div className="flex justify-between items-center text-[5px]">
                          <span>FSC</span>
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        </div>
                      </div>

                      {/* Moving Rollers under Box */}
                      <div className="flex space-x-1 mt-1">
                        <div className={`w-2.5 h-2.5 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center ${isActive ? 'animate-spin' : ''}`}>
                          <div className="w-0.5 h-1.5 bg-slate-600 mx-auto" />
                        </div>
                        <div className={`w-2.5 h-2.5 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center ${isActive ? 'animate-spin' : ''}`}>
                          <div className="w-0.5 h-1.5 bg-slate-600 mx-auto" />
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {/* Physical Steel Conveyor Frame */}
              <div className="h-4 w-full bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border-y border-white/10 rounded-none relative overflow-hidden">
                {/* Visual conveyor slit lines moving to left direction */}
                <div className={`absolute inset-0 flex space-x-4 px-2 items-center ${simulationSpeed === 'normal' ? 'animate-conveyorNormal' : 'animate-conveyorFast'}`}>
                  {Array.from({ length: 15 }).map((_, i) => (
                    <div key={i} className="w-1 h-3 bg-black/60 shrink-0 transform -skew-x-12" />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Interactive Lab Drop Tester Callout */}
          <motion.div
            whileHover={{ y: -2, backgroundColor: 'rgba(0, 0, 0, 0.6)' }}
            className="mt-4 p-3.5 bg-black/45 border border-white/10 rounded-none flex items-center justify-between transition-colors duration-150"
          >
            <div className="flex items-center space-x-3 text-xs">
              <Truck className="w-5 h-5 text-brand-orange shrink-0" />
              <div>
                <p className="font-bold text-white leading-normal font-sans">On-Site Calibrated Lab Testing</p>
                <p className="text-[10px] text-slate-400 font-sans">Every batch undergoes rigorous hydraulic compression testing.</p>
              </div>
            </div>
            <button
              onClick={() => setActiveTab('process')}
              className="text-[10px] uppercase font-mono font-bold tracking-wider text-brand-orange hover:text-white flex items-center cursor-pointer transition-colors"
            >
              <span>Specs Specs</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </button>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
