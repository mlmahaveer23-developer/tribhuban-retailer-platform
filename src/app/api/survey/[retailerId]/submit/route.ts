import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/session';
import { repository } from '@/lib/store/repository';
import { SurveySubmissionPayload } from '@/types/survey';

export async function POST(
  req: NextRequest,
  { params }: { params: { retailerId: string } }
) {
  try {
    const user = await getCurrentUser();
    const body = (await req.json()) as SurveySubmissionPayload;

    const outcome = await repository.submitSurvey(
      {
        ...body,
        retailerId: params.retailerId,
      },
      user
    );

    return NextResponse.json(outcome);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Survey submission error';
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
