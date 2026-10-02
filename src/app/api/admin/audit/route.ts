import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/session';
import { repository } from '@/lib/store/repository';

export async function GET() {
  try {
    const user = await getCurrentUser();
    const logs = await repository.getAuditLogs(user);
    return NextResponse.json({ logs });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Audit log fetch error';
    return NextResponse.json({ error: message }, { status: 403 });
  }
}
