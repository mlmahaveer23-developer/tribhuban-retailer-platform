import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { 
  Boxes, 
  Handshake, 
  PackageCheck, 
  Layers, 
  Truck, 
  TrendingUp, 
  Store, 
  Building, 
  ArrowRight,
  ShieldCheck
} from 'lucide-react';

const PRESENTATION_CARDS = [
  {
    icon: Boxes,
    title: 'Direct Factory Sourcing',
    desc: 'Tribhuban sources staple grocery and FMCG directly from certified manufacturing facilities, eliminating multi-tier middlemen margins.',
    highlight: 'Higher Retail Margins',
  },
  {
    icon: Handshake,
    title: 'Retailer Partnership',
    desc: 'You remain the independent business owner. Tribhuban functions as your direct supply, digital enablement, and growth partner.',
    highlight: 'Retain Full Independence',
  },
  {
    icon: PackageCheck,
    title: 'Individual Products & SKUs',
    desc: 'Access verified fast-moving consumer goods with guaranteed batch freshness, transparent invoicing, and clear MRP markups.',
    highlight: 'Verified Quality',
  },
  {
    icon: Layers,
    title: 'Curated Value Bundles',
    desc: 'Pre-assembled consumer grocery combos designed to increase average basket size and customer retention in your neighborhood.',
    highlight: 'Bigger Basket Size',
  },
  {
    icon: Truck,
    title: 'Bulk & Institutional Orders',
    desc: 'Ability to fulfill wholesale, catering, hostel, and local institutional supply orders backed by Tribhuban central warehousing stock.',
    highlight: 'Wholesale Scale',
  },
  {
    icon: Store,
    title: 'Offline & Online Growth',
    desc: 'Combine counter walk-in retail sales with localized digital ordering and doorstep delivery support for regular households.',
    highlight: 'Omnichannel Reach',
  },
  {
    icon: TrendingUp,
    title: 'Retailer Benefits & Rewards',
    desc: 'Volume-tiered procurement discounts, priority stock dispatch during peak festive seasons, and transparent digital sales tracking.',
    highlight: 'Performance Rewards',
  },
  {
    icon: Building,
    title: 'Partner Coordination Layer',
    desc: 'Tribhuban coordinates with regulated financial and logistics partners. Note: Tribhuban does not issue loans or underwrite finance.',
    highlight: 'Partner Coordination',
  },
];

export function BusinessModelCards() {
  return (
    <div className="space-y-6">
      <div className="border-b border-slate-200 pb-4">
        <h3 className="text-xl font-bold text-navy-900">Tribhuban Commercial Partnership Model</h3>
        <p className="text-sm text-slate-600 mt-1">
          Review these core operational concepts with the retailer before continuing the survey.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {PRESENTATION_CARDS.map((item, idx) => {
          const Icon = item.icon;
          return (
            <Card key={idx} className="border-slate-200 hover:border-slate-300 transition-shadow hover:shadow-sm">
              <CardHeader className="p-4 pb-2">
                <div className="h-10 w-10 rounded-lg bg-navy-50 text-navy-900 flex items-center justify-center mb-2">
                  <Icon className="h-5 w-5" />
                </div>
                <CardTitle className="text-sm font-semibold text-navy-900">{item.title}</CardTitle>
                <span className="text-[11px] font-semibold text-brand-700 bg-brand-50 px-2 py-0.5 rounded w-fit border border-brand-200">
                  {item.highlight}
                </span>
              </CardHeader>
              <CardContent className="p-4 pt-1 text-xs text-slate-600 leading-relaxed">
                {item.desc}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Operational Expectations & Next Steps Callout */}
      <div className="rounded-xl border border-sky-200 bg-sky-50/50 p-4 sm:p-5">
        <div className="flex items-start gap-3">
          <ShieldCheck className="h-5 w-5 text-sky-700 mt-0.5 shrink-0" />
          <div className="text-xs sm:text-sm text-sky-900 space-y-1">
            <h4 className="font-semibold text-sky-950">Operational Expectations & Next Steps:</h4>
            <p>
              1. Transparent communication on stock velocity and storage.
              2. Standard payment terms upon order replenishment.
              3. Dedicated support coordinator assigned to the store for ongoing order and relationship management.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
