/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import { Lead, Quote, Testimonial } from './src/types';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// In-Memory Database for persistent user operations during container lifecycle
let databaseLeads: Lead[] = [
  {
    id: 'lead-101',
    companyName: 'Larsen & Toubro Ltd (Jaipur)',
    contactPerson: 'Harsh Vardhan',
    phone: '+91 94140 12345',
    email: 'h.vardhan@lntecc.com',
    productRequired: 'Custom Packaging Solutions',
    quantityRequired: 250,
    deliveryLocation: 'Sitapura Industrial Area, Jaipur',
    notes: 'Requires ISPM-15 compliance crating for heavy solar invertor units. Crucial transit scheduled for early next month.',
    status: 'Converted',
    createdAt: '2026-06-08T10:15:30.000Z',
    internalNotes: 'Offered heavy timber-reinforced corner sheets. Client paid 50% advance.',
    assignedTo: 'Vikram Singh',
    leadValue: 185000,
  },
  {
    id: 'lead-102',
    companyName: 'MedLife Diagnostics Rajasthan',
    contactPerson: 'Dr. Rahul Singhal',
    phone: '+91 98291 55432',
    email: 'procurement@medlife-rajasthan.in',
    productRequired: 'Corrugated Boxes',
    quantityRequired: 5000,
    deliveryLocation: 'Vishwakarma Industrial Area, Road No. 9, Jaipur',
    notes: 'Dust-free small medical vial cartons. 3-ply with heavy board spacers.',
    status: 'Quote Generated',
    createdAt: '2026-06-10T14:22:12.000Z',
    internalNotes: 'Drafted 3-ply 150 GSM Kraft box proposal with inner partition plates. Waiting on rate confirmation.',
    assignedTo: 'Neha Malhotra',
    leadValue: 65000,
  },
  {
    id: 'lead-103',
    companyName: 'Ghoomar Handicrafts Export',
    contactPerson: 'Ravi Kant Saini',
    phone: '+91 91166 77889',
    email: 'ghoomar.crafts@gmail.com',
    productRequired: 'Industrial Rolls',
    quantityRequired: 15,
    deliveryLocation: 'Adarsh Nagar Gateway, Jaipur',
    notes: 'Urgent requirement of anti-static bubble wrapping rolls and 2-inch tape boxes.',
    status: 'New',
    createdAt: '2026-06-11T18:05:00.000Z',
    internalNotes: 'New hot lead from the corporate quote platform. Needs same-day contact.',
    assignedTo: 'Vikram Singh',
    leadValue: 22000,
  }
];

let databaseQuotes: Quote[] = [
  {
    id: 'q-201',
    leadId: 'lead-102',
    quoteNumber: 'KPC/2026/06/102',
    subtotal: 58000,
    tax: 10440, // 18% GST standard B2B
    freightCharges: 3500,
    total: 71940,
    termsAndConditions: [
      '18% GST is fully applicable.',
      'Delivery within 5 business days of advance clearance.',
      '50% advance balance via RTGS, remaining on unloading.',
      'Freight charges included as per Vishwakarma standard drops.'
    ],
    status: 'Sent',
    validUntil: '2026-06-25T00:00:00.000Z',
    createdAt: '2026-06-11T09:30:00.000Z',
  }
];

let databaseTestimonials: Testimonial[] = [
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
  }
];

// 1. Leads REST Endpoints
app.get('/api/leads', (req, res) => {
  res.json(databaseLeads);
});

app.post('/api/leads', (req, res) => {
  const {
    companyName,
    contactPerson,
    phone,
    email,
    productRequired,
    quantityRequired,
    deliveryLocation,
    notes,
  } = req.body;

  if (!companyName || !contactPerson || !phone || !email || !productRequired || !quantityRequired) {
    res.status(400).json({ error: 'Missing required corporate criteria field.' });
    return;
  }

  const newLead: Lead = {
    id: `lead-${Date.now()}`,
    companyName,
    contactPerson,
    phone,
    email,
    productRequired,
    quantityRequired: Number(quantityRequired),
    deliveryLocation: deliveryLocation || 'Self-Pickup/Ex-Factory',
    notes,
    status: 'New',
    createdAt: new Date().toISOString(),
    assignedTo: 'Vikram Singh', // Lead allocator default role
    leadValue: Number(quantityRequired) * 15, // estimated default multiplier
    internalNotes: 'Assigned automatically via online portal platform.',
  };

  databaseLeads.unshift(newLead);
  res.status(201).json(newLead);
});

app.put('/api/leads/:id', (req, res) => {
  const { id } = req.params;
  const { status, internalNotes, assignedTo, leadValue, companyName, contactPerson, phone, email, productRequired, quantityRequired, deliveryLocation } = req.body;

  const leadIndex = databaseLeads.findIndex((l) => l.id === id);
  if (leadIndex === -1) {
    res.status(404).json({ error: 'Corporate enquiry lead not found.' });
    return;
  }

  const existing = databaseLeads[leadIndex];
  databaseLeads[leadIndex] = {
    ...existing,
    ...(status && { status }),
    ...(internalNotes !== undefined && { internalNotes }),
    ...(assignedTo !== undefined && { assignedTo }),
    ...(leadValue !== undefined && { leadValue: Number(leadValue) }),
    ...(companyName && { companyName }),
    ...(contactPerson && { contactPerson }),
    ...(phone && { phone }),
    ...(email && { email }),
    ...(productRequired && { productRequired }),
    ...(quantityRequired !== undefined && { quantityRequired: Number(quantityRequired) }),
    ...(deliveryLocation !== undefined && { deliveryLocation })
  };

  res.json(databaseLeads[leadIndex]);
});

// 2. CSV Export Endpoint
app.get('/api/leads/export', (req, res) => {
  const headers = ['Lead ID', 'Company Name', 'Contact Person', 'Phone', 'Email', 'Product', 'Quantity', 'Location', 'Status', 'Date', 'Value (INR)', 'Notes'];
  const rows = databaseLeads.map((l) => [
    l.id,
    `"${l.companyName.replace(/"/g, '""')}"`,
    `"${l.contactPerson.replace(/"/g, '""')}"`,
    l.phone,
    l.email,
    l.productRequired,
    l.quantityRequired,
    `"${(l.deliveryLocation || '').replace(/"/g, '""')}"`,
    l.status,
    l.createdAt,
    l.leadValue || 0,
    `"${(l.notes || '').replace(/"/g, '""')}"`
  ]);

  const csvContent = [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename=krishna_packaging_leads_all.csv');
  res.send(csvContent);
});

// 3. Quotes REST Endpoints
app.get('/api/quotes', (req, res) => {
  res.json(databaseQuotes);
});

app.post('/api/quotes', (req, res) => {
  const { leadId, subtotal, tax, freightCharges, termsAndConditions, validUntil } = req.body;

  if (!leadId) {
    res.status(400).json({ error: 'Missing associated lead configuration.' });
    return;
  }

  const mockQuoteNum = `KPC/${new Date().getFullYear()}/${new Date().getMonth() + 1}/${Math.floor(100 + Math.random() * 900)}`;
  const finalSubtotal = Number(subtotal) || 5000;
  const finalTax = Number(tax) || Math.round(finalSubtotal * 0.18);
  const finalFreight = Number(freightCharges) || 0;

  const newQuote: Quote = {
    id: `q-${Date.now()}`,
    leadId,
    quoteNumber: mockQuoteNum,
    subtotal: finalSubtotal,
    tax: finalTax,
    freightCharges: finalFreight,
    total: finalSubtotal + finalTax + finalFreight,
    termsAndConditions: termsAndConditions || [
      '18% GST applicable structurally.',
      'Delivery 4 days from official PO receipt.',
      'Validity 15 calendar days from quotation date.'
    ],
    status: 'Sent',
    validUntil: validUntil || new Date(Date.now() + 15 * 86400000).toISOString(),
    createdAt: new Date().toISOString(),
  };

  databaseQuotes.push(newQuote);

  // Auto update status in core Lead ledger
  const leadIndex = databaseLeads.findIndex((l) => l.id === leadId);
  if (leadIndex !== -1) {
    databaseLeads[leadIndex].status = 'Quote Generated';
    databaseLeads[leadIndex].leadValue = newQuote.total;
    databaseLeads[leadIndex].internalNotes = `Standard official quote ${mockQuoteNum} issued by administrator.`;
  }

  res.status(201).json(newQuote);
});

app.put('/api/quotes/:id', (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const quoteIndex = databaseQuotes.findIndex((q) => q.id === id);
  if (quoteIndex === -1) {
    res.status(404).json({ error: 'B2B Quotation ledger entry not found.' });
    return;
  }

  databaseQuotes[quoteIndex].status = status;
  res.json(databaseQuotes[quoteIndex]);
});

// 4. Testimonials Endpoints
app.get('/api/testimonials', (req, res) => {
  res.json(databaseTestimonials);
});

app.post('/api/testimonials', (req, res) => {
  const { clientName, company, role, comment, rating } = req.body;

  if (!clientName || !company || !comment || !rating) {
    res.status(400).json({ error: 'Verification error - incomplete testimonial fields.' });
    return;
  }

  const newTestimonial: Testimonial = {
    id: `test-${Date.now()}`,
    clientName,
    company,
    role: role || 'Business Partner',
    comment,
    rating: Number(rating) || 5,
    status: 'approved',
    createdAt: new Date().toISOString().split('T')[0],
  };

  databaseTestimonials.push(newTestimonial);
  res.status(201).json(newTestimonial);
});

app.delete('/api/testimonials/:id', (req, res) => {
  const { id } = req.params;
  const lenBefore = databaseTestimonials.length;
  databaseTestimonials = databaseTestimonials.filter((t) => t.id !== id);

  if (databaseTestimonials.length === lenBefore) {
    res.status(404).json({ error: 'Review item not found.' });
    return;
  }
  res.json({ success: true, message: 'Review successfully removed from live feeds.' });
});

// 5. Intelligent AI Recommendation Engine Route (Google GenAI)
app.post('/api/gemini/recommend', async (req, res) => {
  const { itemType, weightKg, lengthMm, widthMm, heightMm, fragility, shippingDestination } = req.body;

  if (!itemType || !weightKg) {
    res.status(400).json({ error: 'Please supply item characteristics and weight specifications.' });
    return;
  }

  try {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      // Graceful fallback when API key is not fully configured, keeping our promise of Zero Crash Startup
      res.json({
        recommendedPackaging: `Corrugated Box (Double Wall)`,
        gsmAndMaterial: `3-Ply Heavy-Duty Kraft (200 GSM Kraft Liner / 120 GSM Fluting)`,
        bubbleShielding: `Recommend placing 10mm EPE foam corner profiles around all corners.`,
        fluteType: `C-Flute (Ideal for medium stacked items)`,
        burstFactor: `24 BF High Tensile Strength`,
        packagingStrategy: `As the GEMINI_API_KEY secret is currently running on localized staging presets, we offer our standard enterprise industrial recommendation: Pre-creased custom die-cut master shippers with stapled joints, packed with desiccants. We will configure an optimal 5-ply structure if you select Request Quote.`,
        isAiGenerated: false
      });
      return;
    }

    const ai = new GoogleGenAI({ apiKey: key });

    const promptText = `
You are a senior material scientist and global industrial B2B packaging expert at "Krishna Packaging Company" based in Jaipur.

Provide a structured engineering recommendation for the following cargo:
- Cargo/Item: ${itemType}
- Weight of item: ${weightKg} kg
- Dimensions (L x W x H): ${lengthMm || 'Not Provided'}mm x ${widthMm || 'Not Provided'}mm x ${heightMm || 'Not Provided'}mm
- Fragility index: ${fragility}
- Shipping destination profile: ${shippingDestination}

Synthesize your knowledge and respond STRICTLY in JSON format with exactly the following keys:
"recommendedPackaging": (string, name of the product e.g. "5-Ply Rigid RSC Corrugated Shipper Box"),
"gsmAndMaterial": (string, exact linerboard GSM recommendation e.g. "Outer 250 GSM Virgin Import Kraft, Core 150 GSM fluting"),
"bubbleShielding": (string, specific cushioning recommendation e.g. "Double Wrapped 10mm anti-static bubble roll with custom molded pulp tray"),
"fluteType": (string, flute type recommendation e.g. "Composite B+C Double Flute combination for compressive crush load stability"),
"burstFactor": (string, expected bursting index e.g. "32 BF Premium Structural strength"),
"packagingStrategy": (string, brief 2-3 sentence expert advice explaining packaging strategy, humidity control if export, and pallet handling specs).

Generate only valid JSON. Do not write any markdown code fences, backticks, or other text outside the JSON object.
`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: promptText,
    });

    const responseText = response.text || '';
    // Clean string response if model output includes markdown elements
    const cleanJsonText = responseText.trim().replace(/^```json/i, '').replace(/```$/i, '').trim();

    try {
      const parsedData = JSON.parse(cleanJsonText);
      res.json({
        ...parsedData,
        isAiGenerated: true
      });
    } catch (parseErr) {
      console.warn("JSON parsing failure on Gemini output, serving parsed fallback:", responseText);
      res.json({
        recommendedPackaging: `Corrugated Box (Heavy-Duty RSC)`,
        gsmAndMaterial: `5-Ply heavy industrial board with 200 GSM Virgin Kraft lining.`,
        bubbleShielding: `Custom EPE foam corner molds covering all sensitive faces.`,
        fluteType: `BC flute twin-wall profile.`,
        burstFactor: `28 BF High Crash Rating`,
        packagingStrategy: `${responseText.substring(0, 300)}...`,
        isAiGenerated: true
      });
    }
  } catch (error: any) {
    console.error('Gemini API call failure:', error);
    res.json({
      recommendedPackaging: `Corrugated Box (Standard Double Wall)`,
      gsmAndMaterial: `3-Ply / 5-Ply Starch-bound Kraft sheets (180 GSM minimum profile)`,
      bubbleShielding: `EPE Corner Foam protective buffer elements.`,
      fluteType: `C-Flute standard`,
      burstFactor: `18 BF standard rating`,
      packagingStrategy: `Direct consultation recommended. Please click the "Request Quotation" button above or call +91 98290 88124 for custom physical burst testing in our Jaipur laboratory.`,
      isAiGenerated: false
    });
  }
});

// Vite Middleware integration for unified Dev Environment and Production static distribution
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Krishna Packaging] Full-Stack Server running successfully on port ${PORT}`);
  });
}

export default app;

if (!process.env.VERCEL) {
  startServer();
}
