import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/session';
import { repository } from '@/lib/store/repository';

export async function GET() {
  try {
    const user = await getCurrentUser();
    const retailers = await repository.getRetailers(user);
    return NextResponse.json({ retailers });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to retrieve retailers';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    const body = await req.json();

    // Sensitive field rejection (Section 3: Do NOT collect Aadhaar, CIBIL, bank credentials)
    const forbidden = ['aadhaar', 'cibil', 'bank_account', 'bank_details', 'credit_score'];
    for (const key of Object.keys(body)) {
      if (forbidden.some((f) => key.toLowerCase().includes(f))) {
        return NextResponse.json(
          { error: `Forbidden field "${key}". Tribhuban Retailer Platform does not collect sensitive credit/banking credentials.` },
          { status: 400 }
        );
      }
    }

    const {
      business_name,
      owner_name,
      phone,
      email,
      address,
      city,
      state = 'Rajasthan',
      pincode,
      business_type,
      years_in_business,
      gst_number,
    } = body;

    if (!business_name || !owner_name || !phone || !address || !city || !pincode || !business_type) {
      return NextResponse.json({ error: 'Missing required retailer fields.' }, { status: 400 });
    }

    const parsedYears = parseInt(years_in_business, 10);
    if (isNaN(parsedYears) || parsedYears < 0) {
      return NextResponse.json({ error: 'Valid years in business is required.' }, { status: 400 });
    }

    const retailer = await repository.createRetailer(
      {
        business_name,
        owner_name,
        phone,
        email: email || null,
        address,
        city,
        state,
        pincode,
        business_type,
        years_in_business: parsedYears,
        gst_number: gst_number || null,
      },
      user
    );

    return NextResponse.json({ retailer }, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to create retailer';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
