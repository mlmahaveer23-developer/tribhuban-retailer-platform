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

    const followUp = await repository.createFollowUp(
      {
        retailer_id: params.id,
        assigned_to: user.id,
        created_by: user.id,
        due_date: body.due_date,
        status: 'PENDING',
        priority: body.priority || 'MEDIUM',
        notes: body.notes || '',
      },
      user
    );

    return NextResponse.json({ followUp }, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error creating follow up';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
