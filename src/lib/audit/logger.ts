import { AuditEvent, AuditEventType, AuditEntityType } from '@/types/audit';
import { UserRole } from '@/types/auth';

export interface RecordAuditParams {
  actorId: string;
  actorRole: UserRole;
  eventType: AuditEventType;
  entityType: AuditEntityType;
  entityId?: string;
  metadata?: Record<string, unknown>;
  ipAddress?: string;
}

// In-memory buffer for local/mock/offline development and testing
const inMemoryAuditStore: AuditEvent[] = [];

/**
 * Sanitizes metadata to strip sensitive financial, password, or PII keys
 */
function sanitizeMetadata(meta?: Record<string, unknown>): Record<string, unknown> {
  if (!meta) return {};
  const sanitized: Record<string, unknown> = {};
  const forbiddenKeys = ['password', 'token', 'secret', 'aadhaar', 'cibil', 'bank_account', 'cvv'];

  for (const [key, value] of Object.entries(meta)) {
    if (!forbiddenKeys.some((f) => key.toLowerCase().includes(f))) {
      sanitized[key] = value;
    }
  }
  return sanitized;
}

export async function logAuditEvent(params: RecordAuditParams): Promise<AuditEvent> {
  const event: AuditEvent = {
    id: `audit_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    actor_id: params.actorId,
    actor_role: params.actorRole,
    event_type: params.eventType,
    entity_type: params.entityType,
    entity_id: params.entityId,
    metadata: sanitizeMetadata(params.metadata),
    ip_address: params.ipAddress || '127.0.0.1',
    created_at: new Date().toISOString(),
  };

  // Always retain in memory store for local development, tests, and quick inspection
  inMemoryAuditStore.unshift(event);

  // If Supabase is connected in production, write to Supabase table
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (supabaseUrl && serviceKey && !supabaseUrl.includes('your-project')) {
      const { createClient } = await import('@supabase/supabase-js');
      const supabase = createClient(supabaseUrl, serviceKey);
      await supabase.from('audit_events').insert({
        actor_id: event.actor_id,
        actor_role: event.actor_role,
        event_type: event.event_type,
        entity_type: event.entity_type,
        entity_id: event.entity_id,
        metadata: event.metadata,
        ip_address: event.ip_address,
      });
    }
  } catch (err) {
    // Audit logging failure should not crash the transaction, but should be logged to stderr
    console.error('[Audit Logger Error]', err);
  }

  return event;
}

export function getInMemoryAuditLogs(): AuditEvent[] {
  return [...inMemoryAuditStore];
}
