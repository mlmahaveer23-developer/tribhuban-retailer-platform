import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/session';
import { repository } from '@/lib/store/repository';

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    const retailer = await repository.getRetailerById(params.id, user);

    if (!retailer) {
      return NextResponse.json({ error: 'Retailer not found' }, { status: 404 });
    }

    const qualification = await repository.getQualification(params.id);
    const assessment = await repository.getInternalAssessment(params.id, user);

    return NextResponse.json({ retailer, qualification, assessment });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error fetching retailer';
    return NextResponse.json({ error: message }, { status: 403 });
  }
}
