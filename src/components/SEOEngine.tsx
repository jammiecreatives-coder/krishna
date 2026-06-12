/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from 'react';
import { INITIAL_PRODUCTS, FAQ_ITEMS } from '../data';

export default function SEOEngine() {
  useEffect(() => {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://krishnapackagingjaipur.com';

    // 1. Local Business Schema (Jaipur, Rajasthan)
    const localBusinessSchema = {
      '@context': 'https://schema.org',
      '@type': 'LocalBusiness',
      'name': 'Krishna Packaging Company',
      'image': 'https://images.unsplash.com/photo-1595079676339-1534801ad6cf?auto=format&fit=crop&q=80&w=800',
      '@id': `${origin}/#localbusiness`,
      'url': origin,
      'telephone': '+91 98290 88124',
      'priceRange': '$$$',
      'address': {
        '@type': 'PostalAddress',
        'streetAddress': 'S-24,25 Janta Colony, Saket Colony, Adarsh Nagar',
        'addressLocality': 'Jaipur',
        'addressRegion': 'Rajasthan',
        'postalCode': '302004',
        'addressCountry': 'IN'
      },
      'geo': {
        '@type': 'GeoCoordinates',
        'latitude': '26.8973',
        'longitude': '75.8274'
      },
      'openingHoursSpecification': {
        '@type': 'OpeningHoursSpecification',
        'dayOfWeek': [
          'Monday',
          'Tuesday',
          'Wednesday',
          'Thursday',
          'Friday',
          'Saturday'
        ],
        'opens': '09:00',
        'closes': '19:30'
      }
    };

    // 2. Organization Schema
    const organizationSchema = {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      'name': 'Krishna Packaging Company',
      'url': origin,
      'logo': 'https://images.unsplash.com/photo-1513258496099-48168024aec0?auto=format&fit=crop&q=80&w=400',
      'contactPoint': {
        '@type': 'ContactPoint',
        'telephone': '+91 98290 88124',
        'contactType': 'sales',
        'areaServed': 'IN',
        'availableLanguage': ['en', 'Hindi']
      }
    };

    // 3. Product Schemas
    const productSchemas = INITIAL_PRODUCTS.map((prod) => ({
      '@context': 'https://schema.org',
      '@type': 'Product',
      'name': prod.name,
      'image': prod.image,
      'description': prod.description,
      'category': prod.category,
      'offers': {
        '@type': 'AggregateOffer',
        'lowPrice': '15',
        'highPrice': '950',
        'priceCurrency': 'INR',
        'offerCount': '1000'
      }
    }));

    // 4. FAQ Schema
    const faqSchema = {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      'mainEntity': FAQ_ITEMS.map((item) => ({
        '@type': 'Question',
        'name': item.question,
        'acceptedAnswer': {
          '@type': 'Answer',
          'text': item.answer
        }
      }))
    };

    // Inject tags safely
    const injectScript = (id: string, schemaObj: any) => {
      let existing = document.getElementById(id);
      if (existing) {
        existing.remove();
      }
      const script = document.createElement('script');
      script.id = id;
      script.type = 'application/ld+json';
      script.innerHTML = JSON.stringify(schemaObj);
      document.head.appendChild(script);
    };

    injectScript('seo-schema-local', localBusinessSchema);
    injectScript('seo-schema-org', organizationSchema);
    injectScript('seo-schema-faq', faqSchema);
    injectScript('seo-schema-products', productSchemas);

    return () => {
      // Clean up injected tags on unmount
      ['seo-schema-local', 'seo-schema-org', 'seo-schema-faq', 'seo-schema-products'].forEach((id) => {
        const script = document.getElementById(id);
        if (script) {
          script.remove();
        }
      });
    };
  }, []);

  return null; // Side-effect element only, handles header inject natively in pipeline
}
