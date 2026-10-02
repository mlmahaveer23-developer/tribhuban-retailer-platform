import { Retailer, RetailerStatus, RetailerAssignment, InternalAssessment, FollowUp } from '@/types/retailer';
import { AppUser } from '@/types/auth';
import { QualificationInputs, QualificationResult, QualificationAssessmentRecord } from '@/types/qualification';
import { SurveySession, SurveyResponseMap, SurveySubmissionPayload, RetailerConcernData, RetailerSuggestionData, ConsentData } from '@/types/survey';
import { AuditEvent } from '@/types/audit';
import { evaluateQualification } from '@/lib/qualification/engine';
import { canTransitionStatus } from '@/lib/status/transitions';
import { validateSurveySubmission } from '@/lib/survey/validator';
import { logAuditEvent, getInMemoryAuditLogs } from '@/lib/audit/logger';
import { hasPermission, canViewInternalAssessment } from '@/lib/auth/rbac';
import {
  INITIAL_USERS,
  INITIAL_RETAILERS,
  INITIAL_ASSIGNMENTS,
  INITIAL_ASSESSMENTS,
  INITIAL_SESSIONS,
  INITIAL_RESPONSES,
  INITIAL_CONCERNS,
  INITIAL_SUGGESTIONS,
  INITIAL_CONSENTS,
  INITIAL_INTERNAL_ASSESSMENTS,
  INITIAL_FOLLOW_UPS,
} from './mock-data';

// In-Memory Database for local dev & testing
class InMemStore {
  users: AppUser[] = [...INITIAL_USERS];
  retailers: Retailer[] = [...INITIAL_RETAILERS];
  assignments: RetailerAssignment[] = [...INITIAL_ASSIGNMENTS];
  qualifications: QualificationAssessmentRecord[] = [...INITIAL_ASSESSMENTS];
  sessions: SurveySession[] = [...INITIAL_SESSIONS];
  responses: Record<string, SurveyResponseMap> = { ...INITIAL_RESPONSES };
  concerns: Record<string, RetailerConcernData> = { ...INITIAL_CONCERNS };
  suggestions: Record<string, RetailerSuggestionData> = { ...INITIAL_SUGGESTIONS };
  consents: Record<string, ConsentData> = { ...INITIAL_CONSENTS };
  internalAssessments: Record<string, InternalAssessment> = { ...INITIAL_INTERNAL_ASSESSMENTS };
  followUps: FollowUp[] = [...INITIAL_FOLLOW_UPS];

  reset() {
    this.users = [...INITIAL_USERS];
    this.retailers = [...INITIAL_RETAILERS];
    this.assignments = [...INITIAL_ASSIGNMENTS];
    this.qualifications = [...INITIAL_ASSESSMENTS];
    this.sessions = [...INITIAL_SESSIONS];
    this.responses = { ...INITIAL_RESPONSES };
    this.concerns = { ...INITIAL_CONCERNS };
    this.suggestions = { ...INITIAL_SUGGESTIONS };
    this.consents = { ...INITIAL_CONSENTS };
    this.internalAssessments = { ...INITIAL_INTERNAL_ASSESSMENTS };
    this.followUps = [...INITIAL_FOLLOW_UPS];
  }
}

// Global singleton to persist during fast-refresh in local dev
declare global {
  // eslint-disable-next-line no-var
  var __tribhuban_store__: InMemStore | undefined;
}

const store = global.__tribhuban_store__ ?? new InMemStore();
if (process.env.NODE_ENV !== 'production') {
  global.__tribhuban_store__ = store;
}

export const repository = {
  resetStore() {
    store.reset();
  },

  // USERS
  async getUsers(): Promise<AppUser[]> {
    return [...store.users];
  },

  async getUserById(id: string): Promise<AppUser | null> {
    return store.users.find((u) => u.id === id) || null;
  },

  async getUserByEmail(email: string): Promise<AppUser | null> {
    return store.users.find((u) => u.email.toLowerCase() === email.toLowerCase()) || null;
  },

  // RETAILERS
  async getRetailers(user: AppUser): Promise<Retailer[]> {
    if (user.role === 'admin' || user.role === 'reviewer') {
      return [...store.retailers].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }

    // Coordinator view: only retailers assigned or created by this coordinator
    const assignedIds = store.assignments
      .filter((a) => a.coordinator_id === user.id && a.active)
      .map((a) => a.retailer_id);

    return store.retailers
      .filter((r) => assignedIds.includes(r.id) || r.created_by === user.id)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  },

  async getRetailerById(id: string, user: AppUser): Promise<Retailer | null> {
    const retailer = store.retailers.find((r) => r.id === id);
    if (!retailer) return null;

    if (user.role === 'admin' || user.role === 'reviewer') {
      return { ...retailer };
    }

    // Check coordinator authorization
    const isAssigned = store.assignments.some(
      (a) => a.retailer_id === id && a.coordinator_id === user.id && a.active
    );
    const isCreator = retailer.created_by === user.id;

    if (!isAssigned && !isCreator) {
      throw new Error('Access denied: Coordinator is not assigned to this retailer.');
    }

    return { ...retailer };
  },

  async createRetailer(
    data: Omit<Retailer, 'id' | 'status' | 'created_at' | 'updated_at'>,
    user: AppUser
  ): Promise<Retailer> {
    if (!hasPermission(user.role, 'retailer:create')) {
      throw new Error('Unauthorized to create retailer.');
    }

    const newId = `ret_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const now = new Date().toISOString();

    const retailer: Retailer = {
      ...data,
      id: newId,
      status: 'QUALIFICATION_PENDING',
      created_by: user.id,
      created_at: now,
      updated_at: now,
    };

    store.retailers.unshift(retailer);

    // Auto-assign to creating coordinator
    const assignment: RetailerAssignment = {
      id: `asgn_${Date.now()}`,
      retailer_id: newId,
      coordinator_id: user.id,
      assigned_by: user.id,
      assigned_at: now,
      active: true,
      notes: 'Initial assignment on creation',
    };
    store.assignments.push(assignment);

    await logAuditEvent({
      actorId: user.id,
      actorRole: user.role,
      eventType: 'RETAILER_CREATED',
      entityType: 'retailer',
      entityId: newId,
      metadata: { business_name: data.business_name, city: data.city },
    });

    return retailer;
  },

  async updateRetailerStatus(
    id: string,
    newStatus: RetailerStatus,
    user: AppUser,
    reason?: string
  ): Promise<Retailer> {
    const retailer = store.retailers.find((r) => r.id === id);
    if (!retailer) {
      throw new Error(`Retailer with ID "${id}" not found.`);
    }

    const check = canTransitionStatus(retailer.status, newStatus, user.role);
    if (!check.allowed) {
      throw new Error(check.reason || 'Invalid status transition.');
    }

    const oldStatus = retailer.status;
    retailer.status = newStatus;
    retailer.updated_at = new Date().toISOString();

    await logAuditEvent({
      actorId: user.id,
      actorRole: user.role,
      eventType: 'STATUS_CHANGED',
      entityType: 'retailer',
      entityId: id,
      metadata: { from: oldStatus, to: newStatus, reason: reason || 'Standard workflow progression' },
    });

    return { ...retailer };
  },

  // QUALIFICATION
  async saveQualification(
    retailerId: string,
    inputs: QualificationInputs,
    user: AppUser
  ): Promise<{ assessment: QualificationAssessmentRecord; result: QualificationResult; retailer: Retailer }> {
    const retailer = await this.getRetailerById(retailerId, user);
    if (!retailer) throw new Error('Retailer not found.');

    const result = evaluateQualification(inputs);

    const now = new Date().toISOString();
    const assessment: QualificationAssessmentRecord = {
      id: `qual_${Date.now()}`,
      retailer_id: retailerId,
      rule_version: result.ruleVersion,
      monthly_grocery_sales: inputs.monthlyGrocerySales,
      tribhuban_sales_potential: inputs.tribhubanSalesPotential,
      potential_sales_channels: inputs.potentialSalesChannels,
      operational_capacity: inputs.operationalCapacity,
      exception_grounds: inputs.exceptionGrounds,
      exception_notes: inputs.exceptionNotes,
      result_state: result.state,
      assessed_by: user.id,
      created_at: now,
    };

    // Store assessment
    const existingIdx = store.qualifications.findIndex((q) => q.retailer_id === retailerId);
    if (existingIdx >= 0) {
      store.qualifications[existingIdx] = assessment;
    } else {
      store.qualifications.push(assessment);
    }

    // Advance retailer status according to qualification outcome
    let nextStatus: RetailerStatus = 'QUALIFICATION_PENDING';
    if (result.state === 'QUALIFIED') {
      nextStatus = 'QUALIFIED';
    } else if (result.state === 'EXCEPTION_REVIEW') {
      nextStatus = 'EXCEPTION_REVIEW';
    } else if (result.state === 'NOT_TARGET') {
      nextStatus = 'NOT_TARGET';
    } else if (result.state === 'NEEDS_VALIDATION') {
      nextStatus = 'NEEDS_VALIDATION';
    }

    const updatedRetailer = await this.updateRetailerStatus(retailerId, nextStatus, user, result.reason);

    await logAuditEvent({
      actorId: user.id,
      actorRole: user.role,
      eventType: 'QUALIFICATION_COMPLETED',
      entityType: 'qualification',
      entityId: assessment.id,
      metadata: {
        retailer_id: retailerId,
        rule_version: result.ruleVersion,
        state: result.state,
        meetsBenchmark: result.meetsPotentialBenchmark,
      },
    });

    return { assessment, result, retailer: updatedRetailer };
  },

  async getQualification(retailerId: string): Promise<QualificationAssessmentRecord | null> {
    return store.qualifications.find((q) => q.retailer_id === retailerId) || null;
  },

  // SURVEY AUTOSAVE & SUBMISSION
  async getSurveySession(retailerId: string): Promise<{
    session: SurveySession | null;
    responses: SurveyResponseMap;
    concerns: RetailerConcernData | null;
    suggestions: RetailerSuggestionData | null;
    consent: ConsentData | null;
  }> {
    const session = store.sessions.find((s) => s.retailer_id === retailerId) || null;
    const responses = session ? store.responses[session.id] || {} : {};
    const concerns = store.concerns[retailerId] || null;
    const suggestions = store.suggestions[retailerId] || null;
    const consent = store.consents[retailerId] || null;

    return { session, responses, concerns, suggestions, consent };
  },

  async autosaveSurvey(
    retailerId: string,
    currentStep: number,
    responses: SurveyResponseMap,
    concerns: RetailerConcernData | null,
    suggestions: RetailerSuggestionData | null,
    user: AppUser
  ): Promise<SurveySession> {
    const retailer = await this.getRetailerById(retailerId, user);
    if (!retailer) throw new Error('Retailer not found.');

    // Only QUALIFIED or approved EXCEPTION_REVIEW can conduct survey
    if (retailer.status !== 'QUALIFIED' && retailer.status !== 'SURVEY_IN_PROGRESS') {
      throw new Error(`Cannot conduct survey for retailer in status "${retailer.status}". Retailer must be QUALIFIED.`);
    }

    let session = store.sessions.find((s) => s.retailer_id === retailerId);
    const now = new Date().toISOString();

    if (!session) {
      session = {
        id: `sess_${Date.now()}`,
        retailer_id: retailerId,
        survey_version: 'survey_v1',
        current_step: currentStep,
        status: 'in_progress',
        started_at: now,
        last_saved_at: now,
      };
      store.sessions.push(session);

      // Transition retailer to SURVEY_IN_PROGRESS
      if (retailer.status === 'QUALIFIED') {
        await this.updateRetailerStatus(retailerId, 'SURVEY_IN_PROGRESS', user, 'Survey session initiated');
      }
    } else {
      session.current_step = currentStep;
      session.last_saved_at = now;
    }

    // Update responses
    store.responses[session.id] = { ...(store.responses[session.id] || {}), ...responses };

    if (concerns) {
      store.concerns[retailerId] = concerns;
    }
    if (suggestions) {
      store.suggestions[retailerId] = suggestions;
    }

    await logAuditEvent({
      actorId: user.id,
      actorRole: user.role,
      eventType: 'SURVEY_AUTOSAVED',
      entityType: 'survey',
      entityId: session.id,
      metadata: { retailer_id: retailerId, step: currentStep },
    });

    return { ...session };
  },

  async submitSurvey(
    payload: SurveySubmissionPayload,
    user: AppUser
  ): Promise<{ session: SurveySession; retailer: Retailer }> {
    const { retailerId } = payload;
    const retailer = await this.getRetailerById(retailerId, user);
    if (!retailer) throw new Error('Retailer not found.');

    // Duplicate submission protection (Section 13)
    const existingSession = store.sessions.find((s) => s.retailer_id === retailerId);
    if (existingSession && existingSession.status === 'submitted') {
      return { session: existingSession, retailer };
    }

    // Validate submission data
    const validation = validateSurveySubmission(payload);
    if (!validation.valid) {
      throw new Error(`Survey validation failed: ${validation.issues.map((i) => i.message).join(' ')}`);
    }

    const now = new Date().toISOString();
    let session = existingSession;
    if (!session) {
      session = {
        id: `sess_${Date.now()}`,
        retailer_id: retailerId,
        survey_version: payload.surveyVersion || 'survey_v1',
        current_step: 10,
        status: 'submitted',
        started_at: now,
        completed_at: now,
        last_saved_at: now,
      };
      store.sessions.push(session);
    } else {
      session.status = 'submitted';
      session.completed_at = now;
      session.last_saved_at = now;
    }

    store.responses[session.id] = payload.responses;
    store.concerns[retailerId] = payload.concerns;
    store.suggestions[retailerId] = payload.suggestions;
    store.consents[retailerId] = {
      ...payload.consent,
      consented_at: now,
    };

    // Transition retailer to SURVEY_COMPLETED
    const updatedRetailer = await this.updateRetailerStatus(
      retailerId,
      'SURVEY_COMPLETED',
      user,
      'Full survey submitted with consent'
    );

    await logAuditEvent({
      actorId: user.id,
      actorRole: user.role,
      eventType: 'SURVEY_SUBMITTED',
      entityType: 'survey',
      entityId: session.id,
      metadata: {
        retailer_id: retailerId,
        policy_version: payload.consent.policy_version,
      },
    });

    await logAuditEvent({
      actorId: user.id,
      actorRole: user.role,
      eventType: 'CONSENT_RECORDED',
      entityType: 'consent',
      entityId: retailerId,
      metadata: {
        contact_consent: payload.consent.contact_consent,
        policy_acknowledgement: payload.consent.policy_acknowledgement,
        follow_up_permission: payload.consent.follow_up_permission,
      },
    });

    return { session: { ...session }, retailer: updatedRetailer };
  },

  // INTERNAL ASSESSMENT (Section 5 — Never exposed to retailers or coordinators)
  async getInternalAssessment(retailerId: string, user: AppUser): Promise<InternalAssessment | null> {
    if (!canViewInternalAssessment(user.role)) {
      return null;
    }
    return store.internalAssessments[retailerId] || null;
  },

  async saveInternalAssessment(
    retailerId: string,
    data: Omit<InternalAssessment, 'id' | 'retailer_id' | 'assessed_by' | 'created_at' | 'updated_at'>,
    user: AppUser
  ): Promise<InternalAssessment> {
    if (!hasPermission(user.role, 'retailer:assess_internal')) {
      throw new Error('Unauthorized to record internal assessments. Reviewer or Admin role required.');
    }

    const now = new Date().toISOString();
    const existing = store.internalAssessments[retailerId];

    const assessment: InternalAssessment = {
      id: existing ? existing.id : `int_ass_${Date.now()}`,
      retailer_id: retailerId,
      retailer_potential: data.retailer_potential,
      expected_tribhuban_potential: data.expected_tribhuban_potential,
      next_action: data.next_action,
      internal_notes: data.internal_notes,
      assessed_by: user.id,
      created_at: existing ? existing.created_at : now,
      updated_at: now,
    };

    store.internalAssessments[retailerId] = assessment;

    // Map next_action to status transition
    const retailer = store.retailers.find((r) => r.id === retailerId);
    if (retailer) {
      let targetStatus: RetailerStatus = retailer.status;
      if (data.next_action === 'Proceed') {
        targetStatus = 'READY_FOR_NEXT_STAGE';
      } else if (data.next_action === 'Internal review') {
        targetStatus = 'INTERNAL_REVIEW';
      } else if (data.next_action === 'Follow-up required') {
        targetStatus = 'FOLLOW_UP_REQUIRED';
      } else if (data.next_action === 'Not target currently') {
        targetStatus = 'NOT_TARGET';
      }

      if (targetStatus !== retailer.status) {
        await this.updateRetailerStatus(retailerId, targetStatus, user, `Internal assessment next action: ${data.next_action}`);
      }
    }

    await logAuditEvent({
      actorId: user.id,
      actorRole: user.role,
      eventType: 'INTERNAL_ASSESSMENT_ADDED',
      entityType: 'assessment',
      entityId: assessment.id,
      metadata: {
        retailer_id: retailerId,
        next_action: data.next_action,
        potential: data.retailer_potential,
      },
    });

    return { ...assessment };
  },

  // FOLLOW-UPS
  async getFollowUps(user: AppUser): Promise<FollowUp[]> {
    if (user.role === 'admin' || user.role === 'reviewer') {
      return [...store.followUps].map((f) => {
        const ret = store.retailers.find((r) => r.id === f.retailer_id);
        return { ...f, retailer_name: ret?.business_name || 'Retailer' };
      });
    }

    return store.followUps
      .filter((f) => f.assigned_to === user.id)
      .map((f) => {
        const ret = store.retailers.find((r) => r.id === f.retailer_id);
        return { ...f, retailer_name: ret?.business_name || 'Retailer' };
      });
  },

  async createFollowUp(
    data: Omit<FollowUp, 'id' | 'created_at' | 'updated_at'>,
    user: AppUser
  ): Promise<FollowUp> {
    const now = new Date().toISOString();
    const newFollowUp: FollowUp = {
      ...data,
      id: `flw_${Date.now()}`,
      created_at: now,
      updated_at: now,
    };

    store.followUps.unshift(newFollowUp);

    await logAuditEvent({
      actorId: user.id,
      actorRole: user.role,
      eventType: 'FOLLOW_UP_CREATED',
      entityType: 'follow_up',
      entityId: newFollowUp.id,
      metadata: { retailer_id: data.retailer_id, due_date: data.due_date },
    });

    return newFollowUp;
  },

  async updateFollowUpStatus(
    id: string,
    status: FollowUp['status'],
    user: AppUser
  ): Promise<FollowUp> {
    const item = store.followUps.find((f) => f.id === id);
    if (!item) throw new Error('Follow-up not found.');

    item.status = status;
    item.updated_at = new Date().toISOString();
    if (status === 'COMPLETED') {
      item.completed_at = new Date().toISOString();
    }

    await logAuditEvent({
      actorId: user.id,
      actorRole: user.role,
      eventType: 'FOLLOW_UP_UPDATED',
      entityType: 'follow_up',
      entityId: id,
      metadata: { status },
    });

    return { ...item };
  },

  // ASSIGNMENTS & REASSIGNMENT (Admin)
  async reassignRetailer(retailerId: string, newCoordinatorId: string, user: AppUser): Promise<void> {
    if (!hasPermission(user.role, 'retailer:assign')) {
      throw new Error('Unauthorized to reassign retailers.');
    }

    // Deactivate old active assignments
    store.assignments
      .filter((a) => a.retailer_id === retailerId && a.active)
      .forEach((a) => {
        a.active = false;
      });

    // Create new active assignment
    store.assignments.push({
      id: `asgn_${Date.now()}`,
      retailer_id: retailerId,
      coordinator_id: newCoordinatorId,
      assigned_by: user.id,
      assigned_at: new Date().toISOString(),
      active: true,
      notes: 'Reassigned by admin',
    });

    await logAuditEvent({
      actorId: user.id,
      actorRole: user.role,
      eventType: 'ASSIGNMENT_CHANGED',
      entityType: 'retailer',
      entityId: retailerId,
      metadata: { new_coordinator: newCoordinatorId },
    });
  },

  // AUDIT LOGS
  async getAuditLogs(user: AppUser): Promise<AuditEvent[]> {
    if (!hasPermission(user.role, 'admin:audit')) {
      throw new Error('Unauthorized: Admin access required to view audit logs.');
    }
    return getInMemoryAuditLogs();
  },

  // METRICS / REPORTING
  async getSummaryMetrics(user: AppUser) {
    const retailers = await this.getRetailers(user);
    const followUps = await this.getFollowUps(user);

    const counts: Record<RetailerStatus, number> = {
      QUALIFICATION_PENDING: 0,
      QUALIFIED: 0,
      SURVEY_IN_PROGRESS: 0,
      SURVEY_COMPLETED: 0,
      INTERNAL_REVIEW: 0,
      FOLLOW_UP_REQUIRED: 0,
      READY_FOR_NEXT_STAGE: 0,
      EXCEPTION_REVIEW: 0,
      NOT_TARGET: 0,
      NEEDS_VALIDATION: 0,
    };

    retailers.forEach((r) => {
      counts[r.status] = (counts[r.status] || 0) + 1;
    });

    return {
      totalRetailers: retailers.length,
      counts,
      pendingFollowUps: followUps.filter((f) => f.status === 'PENDING').length,
      overdueFollowUps: followUps.filter((f) => f.status === 'OVERDUE').length,
    };
  },
};
