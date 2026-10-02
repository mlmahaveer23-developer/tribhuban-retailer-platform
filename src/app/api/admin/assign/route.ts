import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/session';
import { repository } from '@/lib/store/repository';

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    const { retailerId, coordinatorId } = await req.json();

    if (!retailerId || !coordinatorId) {
      return NextResponse.json({ error: 'Retailer ID and Coordinator ID are required.' }, { status: 400 });
    }

    await repository.reassignRetailer(retailerId, coordinatorId, user);

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Reassignment error';
    return NextResponse.json({ error: message }, { status: 403 });
  }
}
