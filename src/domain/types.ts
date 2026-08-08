export type EventScopedId = string;

export type Timestamp = string;

export interface EventEntity {
  id: EventScopedId;
  eventId: EventScopedId;
}

export interface EventConfig {
  id: EventScopedId;
  name: string;
  slug: string;
  description: string;
  timezone: string;
  startDate: string;
  endDate: string;
  branding: {
    primaryColor: string;
    accentColor: string;
  };
  defaultSessionDurationMinutes: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface Track extends EventEntity {
  name: string;
  slug: string;
  color: string;
}

export interface Room extends EventEntity {
  name: string;
  capacity: number;
}

export interface Category extends EventEntity {
  name: string;
  slug: string;
}

export interface SeedSnapshot extends EventEntity {
  seedVersion: string;
  fingerprint: string;
  resetAt: Timestamp;
  counts: Record<string, number>;
}

export type SubmissionStatus =
  | "draft"
  | "submitted"
  | "in_review"
  | "accepted"
  | "waitlisted"
  | "declined";

export interface StatusTransition {
  from: SubmissionStatus;
  to: SubmissionStatus;
  actorId: string;
  reason?: string;
  at: Timestamp;
}

export type FieldType =
  | "short_text"
  | "long_text"
  | "email"
  | "url"
  | "number"
  | "single_select"
  | "multi_select"
  | "radio"
  | "checkbox"
  | "file"
  | "section"
  | "content";

export interface FieldOption {
  value: string;
  label: string;
}

export interface FormField extends EventEntity {
  formId: string;
  versionId: string;
  key: string;
  label: string;
  type: FieldType;
  required: boolean;
  options?: FieldOption[];
  mapsTo?: "speaker_name" | "speaker_email" | "session_title" | "session_description" | "category";
}

export interface SubmissionForm extends EventEntity {
  slug: string;
  name: string;
  description: string;
  status: "draft" | "published" | "unpublished";
  currentVersionId: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface FormVersion extends EventEntity {
  formId: string;
  version: number;
  status: "draft" | "published" | "retired";
  fields: FormField[];
  conditionalRules: ConditionalRule[];
  publishedAt?: Timestamp;
}

export type RuleOperator =
  | "equals"
  | "notEquals"
  | "contains"
  | "in"
  | "exists"
  | "gt"
  | "gte"
  | "lt"
  | "lte";

export interface RuleCondition {
  fieldKey: string;
  operator: RuleOperator;
  value?: unknown;
}

export interface ConditionalRule extends EventEntity {
  targetFieldKey: string;
  conditions: RuleCondition[];
  action: {
    visible?: boolean;
    required?: boolean;
  };
  priority?: number;
}

export interface RoutingAssignment {
  categoryId?: string;
  trackId?: string;
  evaluationPlanId?: string;
  reviewQueue?: string;
  tags: string[];
}

export interface RoutingRule extends EventEntity {
  id: string;
  name: string;
  priority: number;
  conditions: RuleCondition[];
  assignment: RoutingAssignment;
}

export interface Submission extends EventEntity {
  formVersionId: string;
  title: string;
  status: SubmissionStatus;
  answers: Record<string, unknown>;
  speakerIds: string[];
  categoryId?: string;
  trackCandidateId?: string;
  evaluationPlanId?: string;
  reviewQueue?: string;
  tags: string[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface SubmissionParticipant extends EventEntity {
  submissionId: string;
  speakerId?: string;
  role: "primary" | "co_speaker";
  name: string;
  email: string;
}

export interface PublicAccessToken extends EventEntity {
  tokenHash: string;
  subjectType: "submission" | "portal" | "review";
  subjectId: string;
  expiresAt: Timestamp;
  usedAt?: Timestamp;
}

export interface Speaker extends EventEntity {
  name: string;
  email: string;
  title?: string;
  company?: string;
  bio?: string;
  headshotFileId?: string;
  portalToken?: string;
}

export interface Session extends EventEntity {
  title: string;
  description: string;
  status: "draft" | "accepted" | "published" | "cancelled";
  submissionId?: string;
  speakerIds: string[];
  moderatorIds?: string[];
  trackId?: string;
}

export interface RubricCriterion extends EventEntity {
  roundId: string;
  key: string;
  label: string;
  weight: number;
  maxScore: number;
}

export interface EvaluationPlan extends EventEntity {
  name: string;
  instructions: string;
  status: "draft" | "active" | "closed";
  blindReview: boolean;
  identifyingFieldKeys: string[];
}

export interface EvaluationRound extends EventEntity {
  planId: string;
  name: string;
  roundNumber: number;
  status: "draft" | "open" | "closed";
  startsAt?: Timestamp;
  endsAt?: Timestamp;
}

export interface Evaluator extends EventEntity {
  name: string;
  email: string;
}

export interface EvaluatorAssignment extends EventEntity {
  planId: string;
  roundId: string;
  evaluatorId: string;
  submissionId: string;
  status: "assigned" | "in_progress" | "submitted" | "abstained";
  conflictOfInterest?: boolean;
}

export interface ReviewScore {
  criterionKey: string;
  score: number;
}

export interface Review extends EventEntity {
  assignmentId: string;
  roundId: string;
  submissionId: string;
  evaluatorId: string;
  scores: ReviewScore[];
  abstained: boolean;
  abstentionReason?: string;
  comment?: string;
}

export interface RoundSubmissionState extends EventEntity {
  planId: string;
  roundId: string;
  submissionId: string;
  status: "pending" | "advanced" | "held" | "rejected";
  aggregateScore?: number;
}

export interface Decision extends EventEntity {
  submissionId: string;
  planId: string;
  roundId: string;
  decision: "accept" | "waitlist" | "decline" | "advance";
  decidedBy: string;
  decidedAt: Timestamp;
  reason?: string;
}

export interface PortalTask extends EventEntity {
  title: string;
  required: boolean;
  due: DueDateRule;
  target: "all" | "category" | "track" | "selected";
  targetIds?: string[];
  linkedFormId?: string;
  externalUrl?: string;
}

export interface TaskAssignment extends EventEntity {
  taskId: string;
  speakerId: string;
  completedAt?: Timestamp;
}

export interface PortalForm extends EventEntity {
  slug: string;
  name: string;
  currentVersionId: string;
}

export interface PortalFormResponse extends EventEntity {
  formId: string;
  formVersionId: string;
  speakerId: string;
  answers: Record<string, unknown>;
  submittedAt: Timestamp;
  linkedTaskId?: string;
}

export interface FileRequest extends EventEntity {
  key: string;
  title: string;
  required: boolean;
  ownerType: "speaker" | "session" | "submission";
  acceptedContentTypes: string[];
}

export interface ResourcePage extends EventEntity {
  slug: string;
  title: string;
  audience: "all_speakers" | "track" | "category" | "selected";
  targetIds?: string[];
  sanitizedHtml: string;
}

export type DueDateRule =
  | { kind: "absolute"; localDateTime: string }
  | { kind: "beforeEventStart"; days: number; hour: number; minute: number }
  | { kind: "afterAcceptance"; days: number; hour: number; minute: number };

export interface ScheduleEntry extends EventEntity {
  sessionId: string;
  roomId: string;
  start: Timestamp;
  end: Timestamp;
  timezone: string;
  speakerIds: string[];
  moderatorIds?: string[];
  calendarUid: string;
  calendarSequence: number;
  published: boolean;
}

export interface ConflictOverride extends EventEntity {
  conflictKey: string;
  acknowledgedBy: string;
  reason: string;
  at: Timestamp;
}

export interface ConflictRecord extends EventEntity {
  key: string;
  type:
    | "room_overlap"
    | "speaker_overlap"
    | "moderator_overlap"
    | "outside_event_bounds"
    | "invalid_duration";
  entryIds: string[];
  overridden: boolean;
  detectedAt: Timestamp;
}

export type FileVisibility = "private" | "speaker-visible" | "public-approved";
export type FileAssetStatus = "pending" | "accepted" | "rejected" | "replaced" | "deleted";
export type FileScanStatus = "not_required" | "pending" | "passed" | "failed";

export interface FileAsset extends EventEntity {
  ownerType: "speaker" | "session" | "submission" | "resource";
  ownerId: string;
  requestId?: string;
  storageProvider: "local" | "r2" | "external";
  bucket: string;
  objectKey: string;
  version: string;
  sizeBytes: number;
  originalFilename: string;
  contentType: string;
  contentHash: string;
  uploadedByRole: "admin" | "speaker" | "system";
  visibility: FileVisibility;
  status: FileAssetStatus;
  scanStatus: FileScanStatus;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  replacedByFileId?: string;
}

export interface CommunicationTemplate extends EventEntity {
  key: string;
  subject: string;
  body: string;
  allowedVariables: string[];
}

export interface RenderedMessageRecord extends EventEntity {
  templateId: string;
  targetType: "speaker" | "submission" | "evaluator";
  targetId: string;
  subject: string;
  body: string;
  renderedAt: Timestamp;
}

export interface ReminderRule extends EventEntity {
  templateId: string;
  target: "incomplete_required_tasks" | "selected_speakers";
  targetIds?: string[];
  schedule:
    | { kind: "send_now" }
    | { kind: "once"; localDateTime: string }
    | {
        kind: "relative_to_due_date";
        taskId: string;
        daysBefore: number;
        hour: number;
        minute: number;
      };
  status: "active" | "cancelled";
}

export interface ScheduledMessage extends EventEntity {
  reminderRuleId?: string;
  templateId: string;
  targetType: "speaker" | "submission" | "evaluator";
  targetId: string;
  scheduledFor: Timestamp;
  status: "pending" | "cancelled" | "sent" | "skipped" | "failed";
  idempotencyKey: string;
}

export interface DeliveryLog extends EventEntity {
  messageId: string;
  status: "queued" | "sent" | "failed" | "skipped";
  at: Timestamp;
  detail?: Record<string, unknown>;
}

export interface CalendarArtifactRecord extends EventEntity {
  scheduleEntryId: string;
  uid: string;
  sequence: number;
  ics: string;
  generatedAt: Timestamp;
}

export interface IdempotencyRecord<T = unknown> extends EventEntity {
  key: string;
  scope: string;
  requestHash: string;
  status: "reserved" | "completed" | "failed";
  response?: T;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface AuditEntry extends EventEntity {
  actorId: string;
  action: string;
  targetType: string;
  targetId: string;
  at: Timestamp;
  detail?: Record<string, unknown>;
}

export interface DomainSnapshot {
  events: EventConfig[];
  seedSnapshots: SeedSnapshot[];
  tracks: Track[];
  rooms: Room[];
  categories: Category[];
  forms: SubmissionForm[];
  formVersions: FormVersion[];
  routingRules: RoutingRule[];
  submissions: Submission[];
  submissionParticipants: SubmissionParticipant[];
  publicAccessTokens: PublicAccessToken[];
  evaluationPlans: EvaluationPlan[];
  evaluationRounds: EvaluationRound[];
  rubricCriteria: RubricCriterion[];
  evaluators: Evaluator[];
  evaluatorAssignments: EvaluatorAssignment[];
  reviews: Review[];
  roundStates: RoundSubmissionState[];
  decisions: Decision[];
  speakers: Speaker[];
  sessions: Session[];
  scheduleEntries: ScheduleEntry[];
  conflictRecords: ConflictRecord[];
  conflictOverrides: ConflictOverride[];
  files: FileAsset[];
  fileRequests: FileRequest[];
  tasks: PortalTask[];
  taskAssignments: TaskAssignment[];
  portalForms: PortalForm[];
  portalFormResponses: PortalFormResponse[];
  resourcePages: ResourcePage[];
  templates: CommunicationTemplate[];
  renderedMessages: RenderedMessageRecord[];
  reminderRules: ReminderRule[];
  scheduledMessages: ScheduledMessage[];
  deliveryLogs: DeliveryLog[];
  calendarArtifacts: CalendarArtifactRecord[];
  idempotency: IdempotencyRecord[];
  audit: AuditEntry[];
}
