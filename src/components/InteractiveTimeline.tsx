/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Package, Cpu, ShieldCheck, Truck, ClipboardCheck, ArrowRight, Settings, Sliders, Server, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function InteractiveTimeline() {
  const [activeStep, setActiveStep] = useState(0);

  const steps = [
    {
      title: 'Step 1: Raw Material',
      subtitle: 'Rigorous Kraft Grade Sourcing',
      desc: 'We source high-grade virgin pulp and recycled Kraft linerboards directly from premium mills. Before feeding to our line, rolls are lab-verified for GSM accuracy, Ring Crush Values, and moisture compliance.',
      stats: {
        'Calibration Check': 'Moisture levels kept strictly between 8% - 10%',
        'Kraft Grades': '120 GSM to 350 GSM High-Tensile virgin',
        'Inlet Assay Testing': 'Bursting Factor (BF) index verification',
      },
      metricName: 'Milling Moisture Rating',
      metricVal: '8.4%',
      icon: DatabaseIcon,
      color: 'bg-brand-blue',
      outlineColor: 'border-brand-blue'
    },
    {
      title: 'Step 2: Production',
      subtitle: 'Automatic Corrugation and Adhesive Bond',
      desc: 'Our state-of-the-art high-speed corrugation lines pressurize and heat the Kraft. We construct individual high-rebound flutes (A, B, C, E flutes) adhering them with organic cornstarch-based waterproof bindings.',
      stats: {
        'Corrugator Temp': '160°C - 180°C continuous board adhesion',
        'Line Yield Speed': '150 meters per minute production output',
        'Creasing Quality': 'Automatic pre-creasing done directly on deck',
      },
      metricName: 'Adhesion Shear Hold',
      metricVal: '99.8%',
      icon: CpuIcon,
      color: 'bg-brand-orange',
      outlineColor: 'border-brand-orange'
    },
    {
      title: 'Step 3: Quality Testing',
      subtitle: 'Calibrated Hydraulic Burst Testing',
      desc: 'Every batch of 3-ply, 5-ply, and 7-ply corrugated board goes to our QA Lab. Our automated testers verify performance against IS:2771 standards, applying extreme vertical compression forces.',
      stats: {
        'Burst Factor range': '18 BF to 35 BF structural strength indexes',
        'RSC Joint Test': 'Dual stapled joint resistance verification',
        'Compliance Certificate': 'Full batch ISO 9001:2015 certification standard',
      },
      metricName: 'Burst Factor BF Level',
      metricVal: '32 BF Premium',
      icon: ShieldCheckIcon,
      color: 'bg-brand-blue',
      outlineColor: 'border-brand-blue'
    },
    {
      title: 'Step 4: Packaging',
      subtitle: 'Strapping and Solid Palletization',
      desc: 'Finished boxes and sheets are grouped, aligned, and tied with heavy-tensile PET strapping bands. We wrap entire pallets with premium 100-gauge moisture-proof stretch wrap to prevent transit environmental hazards.',
      stats: {
        'Strapping Tensile': 'Over 2,200 Newtons structural bands strength',
        'Wrap Thickness': '100 Gauge (25 microns) high-yield wrapping',
        'Bundling Unit': '50 or 100 sheets per strap pack configuration',
      },
      metricName: 'PET Strap Retainer',
      metricVal: '2400N Spec',
      icon: PackageIcon,
      color: 'bg-brand-orange',
      outlineColor: 'border-brand-orange'
    },
    {
      title: 'Step 5: Dispatch',
      subtitle: 'Fleet Loading and Direct Destination Transit',
      desc: 'We load cargo onto our privately owned distribution vehicles. Our transport operators route directly to major industrial corridors (BKI, Sitapura, Kaladera, Kaladera Extension, Boranada) ensuring zero-damage door deliveries.',
      stats: {
        'Delivery Window': '24 - 48 Hours within Rajasthan manufacturing hubs',
        'Fleet Capacity': '6-axle cargo transports handling extreme weight packs',
        'Delivery Tracking': 'Direct logistics dispatcher status communication',
      },
      metricName: 'On-Time Direct Dispatch',
      metricVal: '98.7%',
      icon: TruckIcon,
      color: 'bg-brand-blue',
      outlineColor: 'border-brand-blue'
    }
  ];

  // Helper local icons inside compiled timeline to maintain clean modular code:
  function DatabaseIcon() {
    return <Server className="w-6 h-6 text-white" />;
  }
  function CpuIcon() {
    return <Cpu className="w-6 h-6 text-white" />;
  }
  function ShieldCheckIcon() {
    return <ShieldCheck className="w-6 h-6 text-white" />;
  }
  function PackageIcon() {
    return <Package className="w-6 h-6 text-white" />;
  }
  function TruckIcon() {
    return <Truck className="w-6 h-6 text-white" />;
  }  const ActiveIcon = steps[activeStep].icon;
  const scrollContainerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (scrollContainerRef.current) {
      const activeEl = scrollContainerRef.current.querySelector('[data-active="true"]');
      if (activeEl) {
        activeEl.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      }
    }
  }, [activeStep]);

  return (
    <div className="bg-white border-2 border-brand-blue rounded-none p-4 md:p-6 shadow-md text-[#002147]">
      {/* Description Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 border-b border-slate-205 pb-4 gap-4">
        <div>
          <h3 className="text-lg md:text-xl font-bold tracking-tight text-brand-blue flex items-center space-x-2">
            <Sliders className="w-5 h-5 text-brand-orange shrink-0" />
            <span>Interactive Industrial Manufacturing Process Flow</span>
          </h3>
          <p className="text-xs text-slate-500 mt-1 font-sans">
            Understanding how our Jaipur plant achieves consistent IS:2771 bursting ratings. Click steps below.
          </p>
        </div>
        <span className="text-[10px] bg-brand-orange/10 border border-brand-orange/40 text-brand-orange px-3 py-1 rounded-none font-mono uppercase font-bold shrink-0">
          IS:2771 Certified Line
        </span>
      </div>

      {/* Steps horizontal selection tracker */}
      <div 
        ref={scrollContainerRef}
        className="relative mb-8 pt-4 overflow-x-auto pb-4 scrollbar-none -mx-4 px-4 md:mx-0 md:px-0"
      >
        <div className="min-w-[500px] md:min-w-0 relative">
          {/* Connector Line behind steps */}
          <div className="absolute top-[38px] left-[10%] right-[10%] h-1 bg-slate-200 rounded-none -z-10" />
          <div
            className="absolute top-[38px] left-[10%] h-1 bg-brand-orange rounded-none transition-all duration-500 -z-10"
            style={{ width: `${(activeStep / (steps.length - 1)) * 80}%` }}
          />

          <div className="relative flex justify-between z-10">
            {steps.map((step, idx) => {
              const stepIcon = step.icon;
              const isCompleted = idx < activeStep;
              const isActive = idx === activeStep;

              return (
                <motion.button
                  key={idx}
                  data-active={isActive ? "true" : "false"}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setActiveStep(idx)}
                  className="flex flex-col items-center group cursor-pointer relative outline-none min-w-[100px] md:min-w-0 md:flex-1"
                >
                  <div
                    className={`w-11 h-11 rounded-none flex items-center justify-center transition-all duration-300 border-2 ${
                      isActive
                        ? `${step.color} border-white text-white shadow-md`
                        : isCompleted
                        ? 'bg-white border-brand-orange text-brand-orange'
                        : 'bg-white border-slate-300 text-slate-500 hover:border-slate-500'
                    }`}
                  >
                    <span className="text-sm font-mono font-black">{idx + 1}</span>
                  </div>
                  <span
                    className={`mt-2 text-[10px] uppercase font-mono tracking-widest text-center mt-3 block ${
                      isActive ? 'text-brand-orange font-bold font-mono' : 'text-slate-500'
                    }`}
                  >
                    {step.title.split(': ')[1]}
                  </span>
                </motion.button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Focus Detail Display Card */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 bg-slate-50 border border-slate-205 rounded-none p-4 md:p-6 relative overflow-hidden shadow-sm">
        {/* Accent Indicator bar */}
        <div className={`absolute top-0 inset-x-0 h-1.5 ${steps[activeStep].color}`} />

        <AnimatePresence mode="wait">
          <motion.div
            key={activeStep}
            initial={{ opacity: 0, scale: 0.98, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: -15 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="grid grid-cols-1 md:grid-cols-12 gap-6 col-span-12 w-full"
          >
            <div className="md:col-span-12 lg:col-span-7 space-y-4 w-full">
              <div className="flex items-center space-x-3">
                <div className={`w-12 h-12 rounded-none flex items-center justify-center ${steps[activeStep].color} shrink-0`}>
                  <ActiveIcon />
                </div>
                <div>
                  <span className="text-[10px] font-mono uppercase text-brand-orange tracking-wider font-bold">JAIPUR FACTORY TIMELINE</span>
                  <h4 className="text-base md:text-lg font-bold text-brand-blue mt-0.5 font-sans uppercase">{steps[activeStep].title}</h4>
                </div>
              </div>

              <p className="text-xs text-slate-650 leading-relaxed font-sans pt-1">
                {steps[activeStep].desc}
              </p>

              <div className="pt-2">
                <h5 className="text-[10px] font-mono uppercase text-slate-500 tracking-widest mb-2 font-bold">Process Criteria Checklist:</h5>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {Object.entries(steps[activeStep].stats).map(([k, v], i) => (
                    <div key={i} className="flex items-start space-x-2 bg-white border border-slate-200 p-2.5 rounded-none text-xs select-none w-full">
                      <ClipboardCheck className="w-4 h-4 text-brand-orange shrink-0 mt-0.5" />
                      <div>
                        <p className="font-bold text-brand-blue font-sans">{k}</p>
                        <p className="text-[10px] text-slate-505 mt-0.5 font-sans">{v}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right column of active step card - Live Telemetry simulated */}
            <div className="md:col-span-12 lg:col-span-5 bg-white border border-slate-250 rounded-none p-5 flex flex-col justify-between space-y-5 md:space-y-6 shadow-sm w-full">
              <div className="space-y-1.5">
                <p className="text-[9px] font-mono text-slate-500 uppercase tracking-widest">Active Line Calibration Parameter</p>
                <h5 className="text-sm font-bold text-brand-blue font-sans">{steps[activeStep].subtitle}</h5>
              </div>

              {/* Graphical representation of standard control indices */}
              <div className="space-y-3">
                <div className="flex justify-between items-center text-[10px] font-mono text-slate-500">
                  <span>{steps[activeStep].metricName}</span>
                  <span className="font-bold text-brand-blue">{steps[activeStep].metricVal}</span>
                </div>
                <div className="h-3 w-full bg-slate-100 rounded-none overflow-hidden border border-slate-200">
                  <div
                    className={`h-full ${steps[activeStep].color} rounded-none transition-all duration-700`}
                    style={{ width: activeStep === 0 ? '84%' : activeStep === 1 ? '94%' : activeStep === 2 ? '90%' : activeStep === 3 ? '80%' : '98%' }}
                  />
                </div>
                <p className="text-[10px] text-slate-500 font-mono italic leading-relaxed pt-1">
                  Verification cycles are fully synchronized against Jaipur laboratory master gauges in Adarsh Nagar daily.
                </p>
              </div>

              <div className="border-t border-slate-100 pt-3 flex justify-between items-center text-xs">
                <div className="flex items-center space-x-1.5 font-mono text-[10px]">
                  <Zap className="w-4 h-4 text-brand-orange animate-pulse" />
                  <span className="text-emerald-600 font-bold">STATUS: LINE ONLINE</span>
                </div>
                <button
                  onClick={() => {
                    setActiveStep((prev) => (prev + 1) % steps.length);
                  }}
                  className="hover:text-brand-orange text-brand-blue flex items-center space-x-1 font-bold text-xs cursor-pointer transition-colors"
                >
                  <span>Next Core Phase</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
