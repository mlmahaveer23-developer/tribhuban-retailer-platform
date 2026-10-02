'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/Card';
import { Alert } from '@/components/ui/Alert';
import { ChevronLeft, Building2, ShieldAlert } from 'lucide-react';

const BUSINESS_TYPES = [
  'Kirana & Grocery',
  'Supermarket / Mini Mart',
  'General Store',
  'Wholesale & Retail Provision',
  'Dairy & Daily Essentials',
  'Other Retail',
];

export default function NewRetailerPage() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    business_name: '',
    owner_name: '',
    phone: '',
    email: '',
    address: '',
    city: 'Jaipur',
    state: 'Rajasthan',
    pincode: '',
    business_type: 'Kirana & Grocery',
    years_in_business: '5',
    gst_number: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const res = await fetch('/api/retailers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to create retailer record.');
      }

      const { retailer } = await res.json();
      router.push(`/retailers/${retailer.id}`);
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An error occurred during submission.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-2">
        <Link href="/dashboard" className="text-slate-500 hover:text-navy-900 transition flex items-center text-sm">
          <ChevronLeft className="h-4 w-4 mr-0.5" /> Back to Dashboard
        </Link>
      </div>

      <Card>
        <CardHeader className="pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-lg bg-navy-100 text-navy-900 flex items-center justify-center">
              <Building2 className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-lg">Register New Retailer</CardTitle>
              <CardDescription>
                Initial profile for business qualification and partnership survey.
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        {/* Non-Banking / Privacy Notice Banner */}
        <div className="bg-sky-50 border-b border-sky-100 p-3.5 px-6 flex items-start gap-2.5 text-xs text-sky-900">
          <ShieldAlert className="h-4 w-4 text-sky-600 mt-0.5 shrink-0" />
          <p>
            <strong>Data Minimization Standard:</strong> Collect only commercial contact and store information.
            Do NOT enter Aadhaar, CIBIL, bank login credentials or sensitive financial numbers.
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4 pt-5">
            {error && <Alert variant="error">{error}</Alert>}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Store / Business Name"
                name="business_name"
                required
                placeholder="e.g. Balaji Kirana Store"
                value={formData.business_name}
                onChange={handleChange}
              />
              <Input
                label="Owner / Contact Person"
                name="owner_name"
                required
                placeholder="e.g. Ramesh Sharma"
                value={formData.owner_name}
                onChange={handleChange}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Mobile Phone (Calling & WhatsApp)"
                name="phone"
                required
                placeholder="e.g. +91 98290 12345"
                value={formData.phone}
                onChange={handleChange}
              />
              <Input
                label="Email Address (Optional)"
                name="email"
                type="email"
                placeholder="e.g. store@example.com"
                value={formData.email}
                onChange={handleChange}
              />
            </div>

            <Input
              label="Store Address / Street Location"
              name="address"
              required
              placeholder="e.g. Shop No. 12, Main Mandi Road"
              value={formData.address}
              onChange={handleChange}
            />

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Input
                label="City / District"
                name="city"
                required
                value={formData.city}
                onChange={handleChange}
              />
              <Input
                label="State"
                name="state"
                required
                value={formData.state}
                onChange={handleChange}
              />
              <Input
                label="Pincode"
                name="pincode"
                required
                placeholder="e.g. 302001"
                value={formData.pincode}
                onChange={handleChange}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="w-full space-y-1.5 sm:col-span-1">
                <label className="block text-sm font-medium text-slate-700">Business Type</label>
                <select
                  name="business_type"
                  value={formData.business_type}
                  onChange={handleChange}
                  className="flex h-11 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-navy-900"
                >
                  {BUSINESS_TYPES.map((bt) => (
                    <option key={bt} value={bt}>
                      {bt}
                    </option>
                  ))}
                </select>
              </div>

              <Input
                label="Years in Business"
                name="years_in_business"
                type="number"
                min="0"
                required
                value={formData.years_in_business}
                onChange={handleChange}
              />

              <Input
                label="GST Number (Optional)"
                name="gst_number"
                placeholder="e.g. 08AAAAA0000A1Z5"
                value={formData.gst_number}
                onChange={handleChange}
              />
            </div>
          </CardContent>

          <CardFooter className="pt-2 flex justify-end gap-3 border-t border-slate-100">
            <Link href="/dashboard">
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </Link>
            <Button type="submit" size="lg" isLoading={isSubmitting}>
              Create Retailer & Proceed to Qualification
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
