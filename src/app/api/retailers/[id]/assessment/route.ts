import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/session';
import { repository } from '@/lib/store/repository';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    const body = await req.json();

    const assessment = await repository.saveInternalAssessment(
      params.id,
      {
        retailer_potential: body.retailer_potential,
        expected_tribhuban_potential: body.expected_tribhuban_potential,
        next_action: body.next_action,
        internal_notes: body.internal_notes,
      },
      user
    );

    return NextResponse.json({ assessment });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal assessment error';
    return NextResponse.json({ error: message }, { status: 403 });
  }
}
