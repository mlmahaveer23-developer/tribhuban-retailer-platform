import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/session';
import { repository } from '@/lib/store/repository';
import { QualificationInputs } from '@/types/qualification';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    const body = (await req.json()) as QualificationInputs;

    const outcome = await repository.saveQualification(params.id, body, user);

    return NextResponse.json(outcome);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Qualification processing error';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
