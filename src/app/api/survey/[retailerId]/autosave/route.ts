import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/session';
import { repository } from '@/lib/store/repository';

export async function POST(
  req: NextRequest,
  { params }: { params: { retailerId: string } }
) {
  try {
    const user = await getCurrentUser();
    const body = await req.json();

    const session = await repository.autosaveSurvey(
      params.retailerId,
      body.currentStep || 1,
      body.responses || {},
      body.concerns || null,
      body.suggestions || null,
      user
    );

    return NextResponse.json({ session });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Autosave error';
    const isAccessDenied =
      message.toLowerCase().includes('access denied') ||
      message.toLowerCase().includes('unauthorized') ||
      message.toLowerCase().includes('forbidden');

    return NextResponse.json(
      { error: isAccessDenied ? 'Forbidden: Access denied to this retailer.' : message },
      { status: isAccessDenied ? 403 : 400 }
    );
  }
}
