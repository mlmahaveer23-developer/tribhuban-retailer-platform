import { UserRole } from './auth';

export type AuditEventType =
  | 'RETAILER_CREATED'
  | 'ASSIGNMENT_CHANGED'
  | 'QUALIFICATION_COMPLETED'
  | 'STATUS_CHANGED'
  | 'SURVEY_AUTOSAVED'
  | 'SURVEY_SUBMITTED'
  | 'CONSENT_RECORDED'
  | 'INTERNAL_ASSESSMENT_ADDED'
  | 'FOLLOW_UP_CREATED'
  | 'FOLLOW_UP_UPDATED'
  | 'USER_CREATED'
  | 'USER_DEACTIVATED'
  | 'ROLE_CHANGED'
  | 'CONFIG_UPDATED';

export type AuditEntityType =
  | 'retailer'
  | 'qualification'
  | 'survey'
  | 'consent'
  | 'assessment'
  | 'follow_up'
  | 'user'
  | 'config';

export interface AuditEvent {
  id: string;
  actor_id: string;
  actor_role: UserRole;
  event_type: AuditEventType;
  entity_type: AuditEntityType;
  entity_id?: string;
  metadata?: Record<string, unknown>;
  ip_address?: string;
  created_at: string;
}
