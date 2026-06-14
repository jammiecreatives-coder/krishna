/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  deleteDoc
} from 'firebase/firestore';
import { db, auth, OperationType, handleFirestoreError } from '../firebase';
import { Lead, Quote } from '../types';

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  phone: string;
  role: 'customer' | 'admin';
  companyName: string;
  createdAt: string;
}

export interface QuotationRecord {
  quotationId: string;
  companyName: string;
  contactPerson: string;
  phone: string;
  email: string;
  productType: string;
  quantity: number;
  destination: string;
  notes?: string;
  status: 'New' | 'Quote Generated' | 'Pending Approval' | 'Converted' | 'Lost';
  createdAt: string;
  internalNotes?: string;
  assignedTo?: string;
  leadValue?: number;
  message?: string;
  submissionDate?: string;
  submissionTime?: string;
  leadSource?: string;
  pageUrl?: string;
}

// 1. User Profile Operations
export async function createUserProfile(uid: string, profile: Omit<UserProfile, 'uid' | 'role' | 'createdAt'>, initialRole: 'customer' | 'admin' = 'customer'): Promise<UserProfile> {
  const path = `users/${uid}`;
  try {
    const userDoc: UserProfile = {
      uid,
      ...profile,
      role: initialRole,
      createdAt: new Date().toISOString()
    };
    await setDoc(doc(db, 'users', uid), userDoc);
    
    // If the registered user is designated an admin, make sure they are written to high-privelege collection too!
    if (initialRole === 'admin') {
      await setDoc(doc(db, 'admins', uid), {
        uid,
        email: profile.email,
        role: 'admin',
        permissions: ['all']
      });
    }

    return userDoc;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const path = `users/${uid}`;
  try {
    const snap = await getDoc(doc(db, 'users', uid));
    if (snap.exists()) {
      return snap.data() as UserProfile;
    }
    return null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
}

export async function updateUserProfile(uid: string, updates: Partial<Omit<UserProfile, 'uid' | 'role' | 'createdAt'>>): Promise<void> {
  const path = `users/${uid}`;
  try {
    const userRef = doc(db, 'users', uid);
    await updateDoc(userRef, updates);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

// 2. Quotation Operations (Bridged with existing Lead interface beautifully)
export function mapQuotationToLead(q: QuotationRecord): Lead {
  return {
    id: q.quotationId,
    companyName: q.companyName,
    contactPerson: q.contactPerson,
    phone: q.phone,
    email: q.email,
    productRequired: q.productType,
    quantityRequired: q.quantity,
    deliveryLocation: q.destination,
    notes: q.notes || '',
    status: q.status === 'Quote Generated' ? 'Quote Generated' : 
            q.status === 'Converted' ? 'Converted' : 
            q.status === 'Lost' ? 'Lost' : 'New',
    createdAt: q.createdAt,
    internalNotes: q.internalNotes || 'Requested via packaging inquiry portal.',
    assignedTo: q.assignedTo || 'Vikram Singh',
    leadValue: q.leadValue || q.quantity * 15,
    message: q.message || '',
    submissionDate: q.submissionDate || '',
    submissionTime: q.submissionTime || '',
    leadSource: q.leadSource || 'Direct-Inquiry',
    pageUrl: q.pageUrl || ''
  };
}

export function mapLeadToQuotation(l: Lead): QuotationRecord {
  return {
    quotationId: l.id,
    companyName: l.companyName,
    contactPerson: l.contactPerson,
    phone: l.phone,
    email: l.email,
    productType: l.productRequired,
    quantity: l.quantityRequired,
    destination: l.deliveryLocation || 'Self-Pickup/Ex-Factory',
    notes: l.notes || '',
    status: l.status === 'Converted' ? 'Converted' : 
            l.status === 'Quote Generated' ? 'Quote Generated' : 'New',
    createdAt: l.createdAt,
    internalNotes: l.internalNotes,
    assignedTo: l.assignedTo,
    leadValue: l.leadValue,
    message: l.message,
    submissionDate: l.submissionDate,
    submissionTime: l.submissionTime,
    leadSource: l.leadSource,
    pageUrl: l.pageUrl
  };
}

export async function createQuotation(data: Omit<QuotationRecord, 'quotationId' | 'status' | 'createdAt'>): Promise<QuotationRecord> {
  const qId = `req-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  const path = `quotations/${qId}`;
  try {
    const quoteDoc: QuotationRecord = {
      quotationId: qId,
      ...data,
      status: 'New',
      createdAt: new Date().toISOString()
    };
    await setDoc(doc(db, 'quotations', qId), quoteDoc);
    return quoteDoc;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function updateQuotation(qId: string, updates: Partial<QuotationRecord>): Promise<void> {
  const path = `quotations/${qId}`;
  try {
    await updateDoc(doc(db, 'quotations', qId), updates as any);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function deleteQuotation(qId: string): Promise<void> {
  const path = `quotations/${qId}`;
  try {
    await deleteDoc(doc(db, 'quotations', qId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// 3. Realtime subscriptions (Extremely high-performance, responsive live loads)
export function subscribeToUserQuotations(email: string, onUpdate: (quotes: QuotationRecord[]) => void) {
  const q = query(
    collection(db, 'quotations'),
    where('email', '==', email),
    orderBy('createdAt', 'desc')
  );
  return onSnapshot(q, (snapshot) => {
    const list: QuotationRecord[] = [];
    snapshot.forEach((d) => {
      list.push(d.data() as QuotationRecord);
    });
    onUpdate(list);
  }, (error) => {
    console.error('Error on subscription: ', error);
  });
}

export function subscribeToAllQuotations(onUpdate: (quotes: QuotationRecord[]) => void) {
  const q = query(
    collection(db, 'quotations'),
    orderBy('createdAt', 'desc')
  );
  return onSnapshot(q, (snapshot) => {
    const list: QuotationRecord[] = [];
    snapshot.forEach((d) => {
      list.push(d.data() as QuotationRecord);
    });
    onUpdate(list);
  }, (error) => {
    console.error('Error listing quotations matches: ', error);
  });
}
