/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Product, Testimonial, FAQItem } from './types';

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod-01',
    name: 'Corrugated Sheets',
    slug: 'corrugated-sheets',
    tagline: 'High-bursting strength sheets for premium structural rigidity.',
    category: 'Sheets & Boards',
    image: 'https://images.unsplash.com/photo-1513258496099-48168024aec0?auto=format&fit=crop&q=80&w=800',
    description: 'Our industrial Kraft corrugated sheets are manufactured under high temperatures to ensure excellent adhesion and superior crushing strength. Available in Single Face, 3-ply, 5-ply, and 7-ply configurations, tailored for heavy machinery buffers and heavy B2B wrapping.',
    specifications: {
      'GSM Range': '120 GSM to 350 GSM grade Kraft',
      'Flute Types': 'A, B, C, E, and combination flutes',
      'Ply Options': '3-Ply, 5-Ply, 7-Ply Heavy-Duty',
      'Bursting Factor': '18 BF to 35 BF (Customizable)',
      'Standard Dimensions': '1000mm x 2000mm (or custom cut-to-size)',
      'Moisture Content': 'Less than 8-10% standard',
    },
    applications: [
      'Heavy machinery pallet backing',
      'Cushion dividers in transit containers',
      'Export pallet packaging layers',
      'Floor protection sheets during high-value fits',
    ],
    benefits: [
      'Exceptional compression resistance',
      '100% biodegradable eco-friendly Kraft pulp',
      'Consistent density and flatness preventing warp',
      'Precisely trimmed clean edges for automated feed lines',
    ],
    industriesServed: [
      'Automotive Components',
      'Electronics Manufacturing',
      'Solar Panel Assembly',
      'Glassware & Ceramics',
    ],
    minOrderQuantity: '500 Sheets',
    leadTime: '3-4 Business Days',
  },
  {
    id: 'prod-02',
    name: 'Corrugated Boxes',
    slug: 'corrugated-boxes',
    tagline: 'Standard and Heavy-Duty RSC shipper boxes for rugged safety.',
    category: 'Industrial Boxes',
    image: 'https://images.unsplash.com/photo-1595079676339-1534801ad6cf?auto=format&fit=crop&q=80&w=800',
    description: 'Engineered Regular Slotted Cartons (RSC) and Custom Die-Cut Boxes designed to withstand harsh warehouse stacking and global export shipping stresses. Features double-butt seams and high crushing load capacities.',
    specifications: {
      'Locking Style': 'Self-locking tabs or Standard Flap RSC',
      'Load Capability': 'Up to 150 kg static load capacity',
      'Joint Construction': 'Heavy staple pinned or High-adhesion glued joints',
      'Paper Grade': 'Semi-kraft or Virgin import Kraft liner',
      'Print Options': 'Up to 3-color flexographic industrial branding',
      'Compliance': 'IS:2771 Indian Standard certified structural build',
    },
    applications: [
      'E-commerce bulk multi-packs',
      'Exporter master shipper cartoons',
      'Automotive piston and casting casings',
      'Electronics protective boxes with fitted dividers',
    ],
    benefits: [
      'Superior vertical load stacking limits',
      'Optimized volumetric ratios reducing freight weight',
      'Scratch-resistant exterior finish option available',
      'Pre-creased for rapid assembly on conveyor lines',
    ],
    industriesServed: [
      'Pharmaceuticals',
      'Consumer Electronics',
      'Apparel & Textile Exports',
      'Processed Food Packagers',
    ],
    minOrderQuantity: '1,000 Units',
    leadTime: '4-6 Business Days',
  },
  {
    id: 'prod-03',
    name: 'Industrial Rolls',
    slug: 'industrial-rolls',
    tagline: 'Flexible safety shielding with high-grade bubble and single-face wraps.',
    category: 'Continuous Packaging',
    image: 'https://images.unsplash.com/photo-1530587191325-3db32d826c18?auto=format&fit=crop&q=80&w=800',
    description: 'High-yield wrapping protective rolls including corrugated paper rolls, heavy-gauge stretch wrap films, and multi-layer laminated air-bubble wrap. Ensures scratch, moisture, and vibration prevention.',
    specifications: {
      'Roll Core Material': 'Rugged 3-inch industrial core tube',
      'Bubble Diameter': '10mm standard or 25mm heavy protection wrap',
      'Roll Thickness': '100 gauge (stretch film) to 150 GSM corrugated roll',
      'Roll Length': '50 meters to 200 meters continuous',
      'Elasticity Stretch': 'Up to 250% high tensile retention',
      'Color Avails': 'Translucent, Blue Anti-Static, Natural Kraft Brown',
    },
    applications: [
      'Surface finish sealing for structural profiles',
      'Irregularly shaped metal parts bundling',
      'Vibration and shock isolating blankets',
      'Freight pallet strapping wrappers',
    ],
    benefits: [
      'High tear and puncture resistance margins',
      'Excellent weather resistance and anti-static coatings',
      'Lightweight roll handling reduces worker strain',
      'Waterproofing barriers keep cargo pristine',
    ],
    industriesServed: [
      'Aerospace Components',
      'Furniture Manufacturing',
      'Steel & Metal Fabricators',
      'Cold Storage Logistics',
    ],
    minOrderQuantity: '10 Rolls',
    leadTime: '2-3 Business Days',
  },
  {
    id: 'prod-04',
    name: 'Packaging Tapes',
    slug: 'packaging-tapes',
    tagline: 'High-shear industrial tapes built for heavy carton lock downs.',
    category: 'Adhesives & Tapes',
    image: '/src/assets/images/packaging_tapes_1781265579844.jpg',
    description: 'Premium BOPP adhesive packaging tapes engineered with special water-based acrylic or hot-melt adhesive formula. Holds strong down to freezing temperatures and up to hot shipping container limits.',
    specifications: {
      'Base Material': 'Biaxially Oriented Polypropylene (BOPP) film',
      'Adhesive Formulation': 'Hot melt synthetic rubber / High-link Acrylic',
      'Shear Strength': 'Over 24 hours standard adhesion limit',
      'Tape Width': '48mm (2 Inch) & 72mm (3 Inch) standard',
      'Thickness': '40 Microns to 55 Microns heavy weight',
      'Tensile Strength': '35 N/cm minimum spec',
    },
    applications: [
      'Heavy box flap sealing',
      'Export cartoon security binding',
      'Custom printed security tamper-resistance seals',
      'Color coding logistic routing markers',
    ],
    benefits: [
      'Aggressive tack grabs instantly to recycled boards',
      'No peeling back under high stress or hot weather humids',
      'Unrolls smoothly with standard machine tape dispensers',
      'Tamper evident visual when peeled from cardboard',
    ],
    industriesServed: [
      'FMCG Distribution',
      'Heavy Manufacturing',
      'E-commerce Warehousing',
      'Publishing and Logistics',
    ],
    minOrderQuantity: '144 Rolls (3 Boxes)',
    leadTime: '1-2 Business Days',
  },
  {
    id: 'prod-05',
    name: 'Protective Packaging',
    slug: 'protective-packaging',
    tagline: 'Surgical shock isolation with custom inserts, foam corners, and pulp molds.',
    category: 'Cushioning & Protective',
    image: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80&w=800',
    description: 'Our tailored protective packaging elements isolate items from impact forces. Features Expandable Polyethylene (EPE) corner protectors, molded cardboard pulp grids, and custom die foam pockets.',
    specifications: {
      'Materials Available': 'EPE foam, molded pulp, high-density EVA foam',
      'Recyclability Index': 'Molded pulp: 100%, EPE: Recyclable grades',
      'Vibration Damping': 'MIL-STD equivalent shock buffer standard',
      'Density Matrix': '20 kg/m3 to 60 kg/m3 standard EPE grades',
      'Water Absorption': 'Zero water absorption for foam lines',
      'Max Shock Load': 'Undergoes custom lab drop-height certification',
    },
    applications: [
      'High-end medical tool cradles',
      'Automotive windshield and screen edge clips',
      'Premium liquor bottle cushioning assemblies',
      'Electronics corners locking',
    ],
    benefits: [
      'Repeated impact absorption bounds without fracturing',
      'Zero corrosive chemicals protecting premium steel finishes',
      'Modular layout nests to minimize storage space',
      'Dust-free clean pack structures',
    ],
    industriesServed: [
      'Defense & Aerospace Engineering',
      'Pharmaceutical Diagnostics',
      'Scientific Instrumentation',
      'Luxury Consumables',
    ],
    minOrderQuantity: '2,000 Units (Die setup fee may apply)',
    leadTime: '7-10 Business Days',
  },
  {
    id: 'prod-06',
    name: 'Custom Packaging Solutions',
    slug: 'custom-packaging-solutions',
    tagline: 'End-to-end engineered cargo systems for specialized machinery loads.',
    category: 'Expert Bespoke Packaging',
    image: '/src/assets/images/custom_packaging_1781266036447.jpg',
    description: 'Bespoke bulk industrial packs combining wood crates, structural heavy card, metal bands, and desiccants. Ideal for heavy exports, CNC machines, solar panels, and complex assemblies requiring custom design consults.',
    specifications: {
      'Design Iterations': '3D CAD visualization and drop-test simulating',
      'Hybrid Elements': 'Fitted card, structural timber pallets, metal band brackets',
      'Moisture Protection': 'VCI (Vapor Corrosion Inhibitor) lining options',
      'Maximum Dimensions': 'No limits (Fully manufactured to CAD specifications)',
      'Stacking Strength': 'Up to 2,500 kg reinforced weight margin',
      'Standards Met': 'ISPM-15 export wood compliance guidelines',
    },
    applications: [
      'Heavy solar panel arrays shipments',
      'Industrial electrical switchgear export blocks',
      'Locomotive auxiliary spare parts boxes',
      'Defense hardware shipments',
    ],
    benefits: [
      'Optimally engineered from actual industrial CAD schematics',
      'Guarantees zero-damage arrivals under global exposure',
      'Integrated lifting crane straps and fork pockets',
      'Single manufacturer contract covering card, wood, and steel wraps',
    ],
    industriesServed: [
      'Heavy Machinery Manufacturing',
      'Renewable Energy / Solar Power',
      'Mining and Metals',
      'Global Freight Integrators',
    ],
    minOrderQuantity: '100 Projects',
    leadTime: '10-12 Business Days',
  }
];

export const INITIAL_TESTIMONIALS: Testimonial[] = [
  {
    id: 'test-1',
    clientName: 'Sanjay Rawat',
    company: 'Raj Auto Parts Ltd',
    role: 'Supply Chain Operations Director',
    comment: 'Krishna Packaging has transformed our export packaging workflow. Their heavy-duty 7-ply corrugated boxes have reduced transit damage rates from 2.4% to absolute zero. Their supply frequency to our Adarsh Nagar hub is exceptionally managed.',
    rating: 5,
    status: 'approved',
    createdAt: '2026-05-18'
  },
  {
    id: 'test-2',
    clientName: 'Anshul Sharma',
    company: 'Jaipur Solar Grid Corp',
    role: 'Procurement Specialist',
    comment: 'We require exact structural boxes for our heavy-duty photovoltiac modules. Krishna Packaging designed a custom hybrid sheet and foam spacer system that was flawless. Their rapid quote generation system is perfect for corporate budgeting.',
    rating: 5,
    status: 'approved',
    createdAt: '2026-05-24'
  },
  {
    id: 'test-3',
    clientName: 'Praveen Mehta',
    company: 'Mewar Heritage Handicrafts',
    role: 'Managing Partner & Chief Exporter',
    comment: 'Artisan ceramic wares require surgical grade continuous industrial bubble rolls and fitted corrugated sheets. The quality of Kraft paper used by Krishna is consistent—never soggy, with perfect dryness and structural rebound.',
    rating: 5,
    status: 'approved',
    createdAt: '2026-06-01'
  },
  {
    id: 'test-4',
    clientName: 'Dr. Shruti Vyas',
    company: 'Rajasthan Bio-Pharma Pvt Ltd',
    role: 'Quality Assurance Lead',
    comment: 'Under ISO guidelines, dust-free protective packaging is critical for pharmaceutical transit. Krishna supplied static-free custom boxes that fit our automated cartoner perfectly. Highly recommended custom partner.',
    rating: 4,
    status: 'approved',
    createdAt: '2026-06-10'
  }
];

export const FAQ_ITEMS: FAQItem[] = [
  {
    id: 'faq-1',
    question: 'What is the standard production turnaround time for bulk custom box designs?',
    answer: 'Standard B2B orders are processed within 3-6 business days depending on design complexity. Custom die-cut boxes and bespoke structural options involving tooling setup require approximately 7-10 business days including CAD sampling and mechanical burst testing.'
  },
  {
    id: 'faq-2',
    question: 'How do you verify the quality of corrugated sheets and boxes?',
    answer: 'We operate an on-site, fully calibrated quality laboratory. Every production lot undergoes robust material testing, including checking the GSM of virgin liner boards, testing the Ring Crush Value, checking moisture levels, and confirming the Bursting Factor (BF) on our hydraulic testers, complying directly with IS:2771 Indian Standard guidelines.'
  },
  {
    id: 'faq-3',
    question: 'Can you match high-volume demands for export containers in Jaipur?',
    answer: 'Absolutely. Our Jaipur plant, located in Janta Colony near Ajmer Road / Adarsh Nagar hub, features high-speed automatic corrugation lines and multi-color flexo slotter folder gluer installations enabling a daily manufacturing output of over 30 Metric Tons of corrugated material.'
  },
  {
    id: 'faq-4',
    question: 'Do you offer door-delivery across industrial areas in Rajasthan?',
    answer: 'Yes, we manage our own logistics fleet. We offer secure direct door-delivery to major industrial zones including Vishwakarma (VKI) Jaipur, Sitapura, Kaladera, Bhiwadi, Boranada Jodhpur, Neemrana, and export zones across Rajasthan.'
  },
  {
    id: 'faq-5',
    question: 'Do you support custom branding and flexographic brand printing on boxes?',
    answer: 'We provide corporate flexographic printing of up to 3 colors directly on Kraft liner boxes. Simply upload your high-resolution vector logo during your Quote request, and our engineering team will mock up visual pre-production slots for your layout approval.'
  }
];

export const INDUSTRIES = [
  {
    title: 'E-Commerce Logistics',
    desc: 'High-speed packing boxes, custom tear-strip boxes, and lightweight air-bubble shields designed for high throughput.',
    icon: 'ShoppingBag',
    accentColor: 'border-orange-500 hover:bg-orange-950/20'
  },
  {
    title: 'Electronics & Chips',
    desc: 'Anti-static blue wraps, fitted custom box dividers, and vibration isolation corner systems protecting high-value components.',
    icon: 'Cpu',
    accentColor: 'border-blue-500 hover:bg-blue-950/20'
  },
  {
    title: 'Food & Beverage',
    desc: 'FDA-approved premium starch binding, odor-free boxes, and moisture-resistant Kraft containers for global export.',
    icon: 'UtensilsCrossed',
    accentColor: 'border-amber-500 hover:bg-amber-950/20'
  },
  {
    title: 'Pharmaceuticals',
    desc: 'Sterile moisture barriers, rigid diagnostic tool packaging cases, and highly structural partitions for vial transit safety.',
    icon: 'Pills',
    accentColor: 'border-emerald-500 hover:bg-emerald-950/20'
  },
  {
    title: 'Heavy Manufacturing',
    desc: 'Staple-pinned master shippers capable of handling 200kg+ components, steel bands packaging, and pallet boxes.',
    icon: 'Settings',
    accentColor: 'border-zinc-500 hover:bg-zinc-950/20'
  },
  {
    title: 'Export Businesses',
    desc: 'ISPM-15 export complaint crating systems and heavy moisture-absorbent packaging designed to combat ocean cargo factors.',
    icon: 'Globe',
    accentColor: 'border-cyan-500 hover:bg-cyan-950/20'
  }
];
