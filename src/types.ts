/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Product {
  id: string;
  name: string;
  slug: string;
  tagline: string;
  description: string;
  category: string;
  image: string;
  specifications: Record<string, string>;
  applications: string[];
  benefits: string[];
  industriesServed: string[];
  minOrderQuantity: string;
  leadTime: string;
}

export interface Lead {
  id: string;
  companyName: string;
  contactPerson: string;
  phone: string;
  email: string;
  productRequired: string;
  quantityRequired: number;
  deliveryLocation: string;
  notes?: string;
  status: 'New' | 'Quote Generated' | 'Pending Approval' | 'Converted' | 'Lost';
  createdAt: string;
  internalNotes?: string;
  assignedTo?: string;
  leadValue?: number;
}

export interface Quote {
  id: string;
  leadId: string;
  quoteNumber: string;
  subtotal: number;
  tax: number;
  freightCharges: number;
  total: number;
  termsAndConditions: string[];
  status: 'Draft' | 'Sent' | 'Approved' | 'Declined';
  validUntil: string;
  createdAt: string;
}

export interface Testimonial {
  id: string;
  clientName: string;
  company: string;
  role: string;
  comment: string;
  rating: number;
  status: 'unapproved' | 'approved';
  createdAt: string;
}

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
}
