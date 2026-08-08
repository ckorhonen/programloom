import type {
  Category,
  CommunicationTemplate,
  ConditionalRule,
  Decision,
  DomainSnapshot,
  EventConfig,
  EvaluationPlan,
  EvaluationRound,
  Evaluator,
  EvaluatorAssignment,
  FileAsset,
  FileRequest,
  FormField,
  FormVersion,
  PortalTask,
  PortalForm,
  PortalFormResponse,
  PublicAccessToken,
  ReminderRule,
  Room,
  RoutingRule,
  RubricCriterion,
  ScheduleEntry,
  ScheduledMessage,
  Session,
  Speaker,
  Submission,
  SubmissionForm,
  SubmissionParticipant,
  TaskAssignment,
  Track,
  Review,
  RoundSubmissionState,
  ResourcePage,
} from "@/domain";
import { fingerprintSnapshot } from "@/storage/snapshot";

const now = "2026-08-08T12:00:00.000Z";
export const sandboxEventId = "event_ai_engineer_sandbox_summit";

export function createSandboxSeed(): DomainSnapshot {
  const event: EventConfig = {
    id: sandboxEventId,
    name: "AI Engineer Sandbox Summit",
    slug: "ai-engineer-sandbox-summit",
    description:
      "A deterministic event-program demo for CFP, review, onboarding, scheduling, and public agenda workflows.",
    timezone: "America/Los_Angeles",
    startDate: "2026-09-15T16:00:00.000Z",
    endDate: "2026-09-17T01:00:00.000Z",
    branding: { primaryColor: "#1f2937", accentColor: "#0f766e" },
    defaultSessionDurationMinutes: 45,
    createdAt: now,
    updatedAt: now,
  };

  const tracks = named(["Agent Systems", "Applied AI", "AI Safety"], "track").map(
    (track, index): Track => ({
      ...track,
      color: ["#0f766e", "#7c3aed", "#b45309"][index],
    }),
  );
  const rooms = named(["Main Hall", "Workshop A", "Workshop B", "Studio"], "room").map(
    (room, index): Room => ({
      ...room,
      capacity: [600, 120, 120, 80][index],
    }),
  );
  const categories = named(
    ["Security", "Design Engineering", "Infrastructure", "Research"],
    "category",
  ) satisfies Category[];

  const cfpForm: SubmissionForm = {
    id: "form_cfp",
    eventId: sandboxEventId,
    slug: "call-for-speakers",
    name: "AI Engineer Sandbox Summit CFP",
    description: "Collect talk and workshop proposals for the deterministic demo.",
    status: "published",
    currentVersionId: "form_version_cfp_1",
    createdAt: now,
    updatedAt: now,
  };
  const cfpFields: FormField[] = [
    field("field_name", "speaker_name", "Your name", "short_text", true, "speaker_name"),
    field("field_email", "speaker_email", "Email", "email", true, "speaker_email"),
    field("field_title", "session_title", "Session title", "short_text", true, "session_title"),
    field("field_abstract", "abstract", "Abstract", "long_text", true, "session_description"),
    field("field_format", "session_format", "Format", "single_select", true),
    field("field_category", "category", "Category", "single_select", true, "category"),
    field("field_hands_on", "hands_on_requirements", "Hands-on requirements", "long_text", false),
    field("field_supporting", "supporting_material", "Supporting material", "file", false),
  ];
  cfpFields[4].options = [
    { value: "Talk", label: "Talk" },
    { value: "Workshop", label: "Workshop" },
  ];
  cfpFields[5].options = categories.map((category) => ({
    value: category.name,
    label: category.name,
  }));
  const cfpRules: ConditionalRule[] = [
    {
      id: "rule_workshop_hands_on",
      eventId: sandboxEventId,
      targetFieldKey: "hands_on_requirements",
      conditions: [{ fieldKey: "session_format", operator: "equals", value: "Workshop" }],
      action: { visible: true, required: true },
      priority: 10,
    },
    {
      id: "rule_talk_hands_on_hidden",
      eventId: sandboxEventId,
      targetFieldKey: "hands_on_requirements",
      conditions: [{ fieldKey: "session_format", operator: "notEquals", value: "Workshop" }],
      action: { visible: false, required: false },
      priority: 1,
    },
  ];
  const formVersions: FormVersion[] = [
    {
      id: "form_version_cfp_1",
      eventId: sandboxEventId,
      formId: cfpForm.id,
      version: 1,
      status: "published",
      fields: cfpFields,
      conditionalRules: cfpRules,
      publishedAt: now,
    },
  ];
  const routingRules: RoutingRule[] = [
    routingRule("route_security", 100, "Security", {
      categoryId: categories[0].id,
      trackId: "track_1",
      evaluationPlanId: "eval_security",
      reviewQueue: "security-review",
      tags: ["security", "needs-conflict-check"],
    }),
    routingRule("route_design", 80, "Design Engineering", {
      categoryId: categories[1].id,
      trackId: "track_2",
      evaluationPlanId: "eval_general",
      reviewQueue: "main-review",
      tags: ["design"],
    }),
    routingRule("route_infrastructure", 70, "Infrastructure", {
      categoryId: categories[2].id,
      trackId: "track_3",
      evaluationPlanId: "eval_general",
      reviewQueue: "main-review",
      tags: ["infrastructure"],
    }),
  ];

  const speakers = Array.from({ length: 13 }, (_, index): Speaker => {
    const id = `speaker_${index + 1}`;
    return {
      id,
      eventId: sandboxEventId,
      name: `Speaker ${index + 1}`,
      email: `speaker${index + 1}@example.test`,
      title: index % 2 === 0 ? "Principal Engineer" : "Founder",
      company: index % 2 === 0 ? "Northstar AI" : "Signal Works",
      bio: index < 10 ? `Bio for accepted speaker ${index + 1}.` : undefined,
      headshotFileId: index < 6 ? `file_headshot_${index + 1}` : undefined,
      portalToken: `portal_token_${index + 1}`,
    };
  });

  const submissions = Array.from({ length: 12 }, (_, index): Submission => {
    const status = index < 8 ? "accepted" : index < 11 ? "waitlisted" : "declined";
    return {
      id: `submission_${index + 1}`,
      eventId: sandboxEventId,
      formVersionId: "form_version_cfp_1",
      title: `${index % 3 === 0 ? "Security" : index % 3 === 1 ? "Design Engineering" : "Infrastructure"} Session ${index + 1}`,
      status,
      answers: {
        session_format: index % 4 === 0 ? "Workshop" : "Talk",
        category:
          index % 3 === 0 ? "Security" : index % 3 === 1 ? "Design Engineering" : "Infrastructure",
        abstract: `Proposal abstract ${index + 1}`,
      },
      speakerIds:
        index < 3
          ? [`speaker_${index + 1}`, `speaker_${index + 11}`]
          : [`speaker_${(index % 10) + 1}`],
      categoryId: categories[index % categories.length].id,
      trackCandidateId: tracks[index % tracks.length].id,
      evaluationPlanId: index % 3 === 0 ? "eval_security" : "eval_general",
      reviewQueue: index % 3 === 0 ? "security-review" : "main-review",
      tags: status === "accepted" ? ["accepted"] : [status],
      createdAt: now,
      updatedAt: now,
    };
  });
  submissions[0] = {
    ...submissions[0],
    title: "Hardening Agentic Coding Workflows",
    answers: {
      ...submissions[0].answers,
      session_title: "Hardening Agentic Coding Workflows",
      abstract:
        "A hands-on workshop on eval gates, tool permissions, and recovery plans for coding agents.",
      session_format: "Workshop",
      category: "Security",
      hands_on_requirements: "Bring a laptop with a local TypeScript project.",
    },
  };
  submissions[1] = {
    ...submissions[1],
    title: "Eval Suites That Survive Product Drift",
    answers: {
      ...submissions[1].answers,
      session_title: "Eval Suites That Survive Product Drift",
      abstract: "A talk about keeping evaluation plans useful as product workflows change.",
      session_format: "Talk",
      category: "Design Engineering",
    },
  };
  const submissionParticipants: SubmissionParticipant[] = submissions.flatMap((submission) =>
    submission.speakerIds.map((speakerId, index) => {
      const speaker = speakers.find((item) => item.id === speakerId);
      return {
        id: `participant_${submission.id}_${speakerId}`,
        eventId: sandboxEventId,
        submissionId: submission.id,
        speakerId,
        role: index === 0 ? "primary" : "co_speaker",
        name: speaker?.name ?? speakerId,
        email: speaker?.email ?? `${speakerId}@example.test`,
      };
    }),
  );
  const publicAccessTokens: PublicAccessToken[] = [
    {
      id: "token_submission_1_return",
      eventId: sandboxEventId,
      tokenHash: "hash_submission_return_demo",
      subjectType: "submission",
      subjectId: "submission_1",
      expiresAt: "2026-09-01T12:00:00.000Z",
    },
    {
      id: "token_portal_speaker_1",
      eventId: sandboxEventId,
      tokenHash: "hash_portal_demo_speaker_1",
      subjectType: "portal",
      subjectId: "speaker_1",
      expiresAt: "2026-09-20T12:00:00.000Z",
    },
  ];

  const evaluationPlans: EvaluationPlan[] = [
    {
      id: "eval_security",
      eventId: sandboxEventId,
      name: "Security Review",
      instructions:
        "Score risk, practicality, and audience fit. Human decisions remain authoritative.",
      status: "active",
      blindReview: true,
      identifyingFieldKeys: ["speaker_name", "speaker_email"],
    },
    {
      id: "eval_general",
      eventId: sandboxEventId,
      name: "Main Program Review",
      instructions: "Score relevance, clarity, novelty, and audience fit.",
      status: "active",
      blindReview: true,
      identifyingFieldKeys: ["speaker_name", "speaker_email"],
    },
  ];
  const evaluationRounds: EvaluationRound[] = [
    {
      id: "round_security_1",
      eventId: sandboxEventId,
      planId: "eval_security",
      name: "Security Round 1",
      roundNumber: 1,
      status: "open",
    },
    {
      id: "round_security_2",
      eventId: sandboxEventId,
      planId: "eval_security",
      name: "Security Round 2",
      roundNumber: 2,
      status: "draft",
    },
    {
      id: "round_general_1",
      eventId: sandboxEventId,
      planId: "eval_general",
      name: "Main Round 1",
      roundNumber: 1,
      status: "open",
    },
  ];
  const rubricCriteria: RubricCriterion[] = [
    criterion("criterion_relevance", "round_security_1", "relevance", "Audience relevance", 3, 5),
    criterion(
      "criterion_practicality",
      "round_security_1",
      "practicality",
      "Practical takeaways",
      4,
      5,
    ),
    criterion("criterion_risk", "round_security_1", "risk", "Risk handling", 3, 5),
    criterion(
      "criterion_general_relevance",
      "round_general_1",
      "relevance",
      "Audience relevance",
      4,
      5,
    ),
    criterion("criterion_general_clarity", "round_general_1", "clarity", "Clarity", 3, 5),
    criterion("criterion_general_novelty", "round_general_1", "novelty", "Novelty", 3, 5),
  ];
  const evaluators: Evaluator[] = [
    {
      id: "evaluator_1",
      eventId: sandboxEventId,
      name: "Priya Reviewer",
      email: "priya.reviewer@example.test",
    },
    {
      id: "evaluator_2",
      eventId: sandboxEventId,
      name: "Mei Reviewer",
      email: "mei.reviewer@example.test",
    },
    {
      id: "evaluator_3",
      eventId: sandboxEventId,
      name: "Owen Reviewer",
      email: "owen.reviewer@example.test",
    },
  ];
  const evaluatorAssignments: EvaluatorAssignment[] = [
    assignment(
      "assignment_security_1",
      "eval_security",
      "round_security_1",
      "evaluator_1",
      "submission_1",
      "submitted",
    ),
    assignment(
      "assignment_security_2",
      "eval_security",
      "round_security_1",
      "evaluator_2",
      "submission_1",
      "abstained",
      true,
    ),
    assignment(
      "assignment_general_1",
      "eval_general",
      "round_general_1",
      "evaluator_1",
      "submission_2",
      "submitted",
    ),
    assignment(
      "assignment_general_2",
      "eval_general",
      "round_general_1",
      "evaluator_3",
      "submission_5",
      "assigned",
    ),
  ];
  const reviews: Review[] = [
    {
      id: "review_security_1",
      eventId: sandboxEventId,
      assignmentId: "assignment_security_1",
      roundId: "round_security_1",
      submissionId: "submission_1",
      evaluatorId: "evaluator_1",
      scores: [
        { criterionKey: "relevance", score: 5 },
        { criterionKey: "practicality", score: 4 },
        { criterionKey: "risk", score: 5 },
      ],
      abstained: false,
    },
    {
      id: "review_security_2",
      eventId: sandboxEventId,
      assignmentId: "assignment_security_2",
      roundId: "round_security_1",
      submissionId: "submission_1",
      evaluatorId: "evaluator_2",
      scores: [],
      abstained: true,
      abstentionReason: "Conflict of interest",
    },
    {
      id: "review_general_1",
      eventId: sandboxEventId,
      assignmentId: "assignment_general_1",
      roundId: "round_general_1",
      submissionId: "submission_2",
      evaluatorId: "evaluator_1",
      scores: [
        { criterionKey: "relevance", score: 5 },
        { criterionKey: "clarity", score: 4 },
        { criterionKey: "novelty", score: 4 },
      ],
      abstained: false,
    },
  ];
  const roundStates: RoundSubmissionState[] = [
    {
      id: "round_state_submission_1",
      eventId: sandboxEventId,
      planId: "eval_security",
      roundId: "round_security_1",
      submissionId: "submission_1",
      status: "advanced",
      aggregateScore: 91,
    },
    {
      id: "round_state_submission_2",
      eventId: sandboxEventId,
      planId: "eval_general",
      roundId: "round_general_1",
      submissionId: "submission_2",
      status: "pending",
      aggregateScore: 87,
    },
  ];
  const decisions: Decision[] = [
    {
      id: "decision_submission_1_accept",
      eventId: sandboxEventId,
      submissionId: "submission_1",
      planId: "eval_security",
      roundId: "round_security_1",
      decision: "accept",
      decidedBy: "admin_priya",
      decidedAt: now,
      reason: "Strong workshop with clear safety practices.",
    },
  ];

  const sessions = submissions
    .filter((submission) => submission.status === "accepted")
    .map(
      (submission, index): Session => ({
        id: `session_${index + 1}`,
        eventId: sandboxEventId,
        title: submission.title,
        description: String(submission.answers.abstract),
        status: "published",
        submissionId: submission.id,
        speakerIds: submission.speakerIds,
        moderatorIds: index === 2 ? ["speaker_10"] : [],
        trackId: submission.trackCandidateId,
      }),
    );
  sessions.push({
    id: "session_unscheduled",
    eventId: sandboxEventId,
    title: "Unscheduled Accepted Session",
    description: "Accepted but not placed on the agenda.",
    status: "accepted",
    submissionId: "submission_8",
    speakerIds: ["speaker_8"],
    trackId: tracks[1].id,
  });

  const scheduleEntries: ScheduleEntry[] = [
    schedule(
      "schedule_1",
      "session_1",
      rooms[0].id,
      "2026-09-15T17:00:00.000Z",
      "2026-09-15T17:45:00.000Z",
      ["speaker_1", "speaker_11"],
    ),
    schedule(
      "schedule_2",
      "session_2",
      rooms[0].id,
      "2026-09-15T17:15:00.000Z",
      "2026-09-15T18:00:00.000Z",
      ["speaker_1", "speaker_12"],
    ),
    schedule(
      "schedule_3",
      "session_3",
      rooms[1].id,
      "2026-09-15T18:00:00.000Z",
      "2026-09-15T18:45:00.000Z",
      ["speaker_3", "speaker_13"],
      ["speaker_10"],
    ),
    schedule(
      "schedule_4",
      "session_4",
      rooms[2].id,
      "2026-09-15T19:00:00.000Z",
      "2026-09-15T19:45:00.000Z",
      ["speaker_4"],
    ),
    schedule(
      "schedule_5",
      "session_5",
      rooms[3].id,
      "2026-09-16T17:00:00.000Z",
      "2026-09-16T17:45:00.000Z",
      ["speaker_5"],
    ),
    schedule(
      "schedule_6",
      "session_6",
      rooms[1].id,
      "2026-09-16T18:00:00.000Z",
      "2026-09-16T18:45:00.000Z",
      ["speaker_6"],
    ),
    schedule(
      "schedule_7",
      "session_7",
      rooms[2].id,
      "2026-09-16T19:00:00.000Z",
      "2026-09-16T19:45:00.000Z",
      ["speaker_7"],
    ),
    schedule(
      "schedule_8",
      "session_8",
      rooms[3].id,
      "2026-09-16T20:00:00.000Z",
      "2026-09-16T20:45:00.000Z",
      ["speaker_8"],
    ),
  ];

  const tasks: PortalTask[] = [
    "Confirm bio",
    "Upload headshot",
    "Upload slides",
    "Complete AV needs",
    "Confirm travel",
    "Review schedule",
  ].map((title, index) => ({
    id: `task_${index + 1}`,
    eventId: sandboxEventId,
    title,
    required: index < 4,
    due:
      index === 0
        ? { kind: "beforeEventStart", days: 14, hour: 17, minute: 0 }
        : { kind: "beforeEventStart", days: 7, hour: 17, minute: 0 },
    target: "all",
    linkedFormId: index === 3 ? "portal_form_av" : undefined,
  }));
  tasks[0] = { ...tasks[0], linkedFormId: "portal_form_profile" };
  tasks[4] = { ...tasks[4], linkedFormId: "portal_form_consent" };
  const portalForms: PortalForm[] = [
    {
      id: "portal_form_av",
      eventId: sandboxEventId,
      slug: "av-needs",
      name: "AV Needs",
      currentVersionId: "portal_form_av_v1",
    },
    {
      id: "portal_form_profile",
      eventId: sandboxEventId,
      slug: "profile-confirmation",
      name: "Profile confirmation",
      currentVersionId: "portal_form_profile_v1",
    },
    {
      id: "portal_form_consent",
      eventId: sandboxEventId,
      slug: "speaker-consent",
      name: "Speaker consent",
      currentVersionId: "portal_form_consent_v1",
    },
  ];
  const portalFormResponses: PortalFormResponse[] = [
    {
      id: "portal_response_av_speaker_1",
      eventId: sandboxEventId,
      formId: "portal_form_av",
      formVersionId: "portal_form_av_v1",
      speakerId: "speaker_1",
      answers: { microphone: "lav", confidence_monitor: true },
      submittedAt: "2026-08-08T13:00:00.000Z",
      linkedTaskId: "task_4",
    },
  ];
  const taskAssignments: TaskAssignment[] = speakers.slice(0, 10).flatMap((speaker, speakerIndex) =>
    tasks.map((task, taskIndex) => ({
      id: `assignment_${speaker.id}_${task.id}`,
      eventId: sandboxEventId,
      taskId: task.id,
      speakerId: speaker.id,
      completedAt:
        speakerIndex < 4 || (speakerIndex < 7 && taskIndex > 2)
          ? "2026-08-08T13:00:00.000Z"
          : undefined,
    })),
  );
  const fileRequests: FileRequest[] = [
    {
      id: "file_request_headshot",
      eventId: sandboxEventId,
      key: "headshot",
      title: "Approved headshot",
      required: true,
      ownerType: "speaker",
      acceptedContentTypes: ["image/jpeg", "image/png", "image/webp"],
    },
    {
      id: "file_request_slides",
      eventId: sandboxEventId,
      key: "slides",
      title: "Final slides",
      required: true,
      ownerType: "session",
      acceptedContentTypes: ["application/pdf"],
    },
  ];

  const files: FileAsset[] = speakers.slice(0, 6).map((speaker, index) => ({
    id: `file_headshot_${index + 1}`,
    eventId: sandboxEventId,
    ownerType: "speaker",
    ownerId: speaker.id,
    storageProvider: "local",
    bucket: "sandbox-files",
    objectKey: `headshots/${speaker.id}.jpg`,
    version: "1",
    sizeBytes: 1024 + index,
    originalFilename: `${speaker.id}.jpg`,
    contentType: "image/jpeg",
    contentHash: `hash_${speaker.id}`,
    uploadedByRole: "speaker",
    visibility: index < 4 ? "public-approved" : "private",
    status: "accepted",
    scanStatus: "passed",
    createdAt: now,
    updatedAt: now,
  }));

  const templates: CommunicationTemplate[] = [
    template(
      "template_acceptance",
      "acceptance",
      "Accepted: {{session.title}}",
      "Hi {{speaker.name}}, welcome to {{event.name}}.",
    ),
    template(
      "template_reminder",
      "missing-task-reminder",
      "Reminder: {{outstanding.tasks}}",
      "Please complete {{outstanding.tasks}} by {{due.date}}.",
    ),
  ];
  const resourcePages: ResourcePage[] = [
    {
      id: "resource_speaker_guide",
      eventId: sandboxEventId,
      slug: "speaker-guide",
      title: "Speaker Guide",
      audience: "all_speakers",
      sanitizedHtml:
        "<h2>Speaker Guide</h2><p>Use the portal to keep profile, files, and schedule confirmations current.</p>",
    },
    {
      id: "resource_av_guide",
      eventId: sandboxEventId,
      slug: "av-guide",
      title: "AV & room guide",
      audience: "all_speakers",
      sanitizedHtml:
        "<h2>AV &amp; room guide</h2><p>Find room layouts, microphone guidance, and the day-of support channel.</p>",
    },
  ];
  const reminderRules: ReminderRule[] = [
    {
      id: "reminder_missing_required",
      eventId: sandboxEventId,
      templateId: "template_reminder",
      target: "incomplete_required_tasks",
      schedule: {
        kind: "relative_to_due_date",
        taskId: "task_3",
        daysBefore: 2,
        hour: 9,
        minute: 0,
      },
      status: "active",
    },
    {
      id: "reminder_schedule_confirmation",
      eventId: sandboxEventId,
      templateId: "template_reminder",
      target: "selected_speakers",
      targetIds: ["speaker_8", "speaker_9"],
      schedule: { kind: "once", localDateTime: "2026-09-08T09:00" },
      status: "active",
    },
  ];
  const scheduledMessages: ScheduledMessage[] = [
    {
      id: "scheduled_missing_required_speaker_8",
      eventId: sandboxEventId,
      reminderRuleId: "reminder_missing_required",
      templateId: "template_reminder",
      targetType: "speaker",
      targetId: "speaker_8",
      scheduledFor: "2026-09-06T16:00:00.000Z",
      status: "pending",
      idempotencyKey: `${sandboxEventId}:reminder_missing_required:speaker_8:2026-09-06T16:00:00.000Z`,
    },
    {
      id: "scheduled_schedule_confirmation_speaker_8",
      eventId: sandboxEventId,
      reminderRuleId: "reminder_schedule_confirmation",
      templateId: "template_reminder",
      targetType: "speaker",
      targetId: "speaker_8",
      scheduledFor: "2026-09-08T16:00:00.000Z",
      status: "pending",
      idempotencyKey: `${sandboxEventId}:reminder_schedule_confirmation:speaker_8:2026-09-08T16:00:00.000Z`,
    },
  ];

  return {
    events: [event],
    seedSnapshots: [
      {
        id: "seed_snapshot_sandbox_v1",
        eventId: sandboxEventId,
        seedVersion: "sandbox-v1",
        fingerprint: "computed-by-reset",
        resetAt: now,
        counts: {},
      },
    ],
    tracks,
    rooms,
    categories,
    forms: [cfpForm],
    formVersions,
    routingRules,
    submissions,
    submissionParticipants,
    publicAccessTokens,
    evaluationPlans,
    evaluationRounds,
    rubricCriteria,
    evaluators,
    evaluatorAssignments,
    reviews,
    roundStates,
    decisions,
    speakers,
    sessions,
    scheduleEntries,
    conflictRecords: [],
    conflictOverrides: [],
    files,
    fileRequests,
    tasks,
    taskAssignments,
    portalForms,
    portalFormResponses,
    resourcePages,
    templates,
    renderedMessages: [],
    reminderRules,
    scheduledMessages,
    deliveryLogs: [],
    calendarArtifacts: [],
    idempotency: [],
    audit: [
      {
        id: "audit_seed",
        eventId: sandboxEventId,
        actorId: "system",
        action: "demo.seed",
        targetType: "event",
        targetId: sandboxEventId,
        at: now,
        detail: { fingerprint: "deterministic" },
      },
    ],
  };
}

export function createSandboxResetFixture() {
  const snapshot = createSandboxSeed();
  return { snapshot, fingerprint: fingerprintSnapshot(snapshot) };
}

function named(values: string[], prefix: "track" | "room" | "category") {
  return values.map((name, index) => ({
    id: `${prefix}_${index + 1}`,
    eventId: sandboxEventId,
    name,
    slug: name.toLowerCase().replaceAll(" ", "-"),
  }));
}

function field(
  id: string,
  key: string,
  label: string,
  type: FormField["type"],
  required: boolean,
  mapsTo?: FormField["mapsTo"],
): FormField {
  return {
    id,
    eventId: sandboxEventId,
    formId: "form_cfp",
    versionId: "form_version_cfp_1",
    key,
    label,
    type,
    required,
    mapsTo,
  };
}

function routingRule(
  id: string,
  priority: number,
  category: string,
  assignment: RoutingRule["assignment"],
): RoutingRule {
  return {
    id,
    eventId: sandboxEventId,
    name: `Route ${category}`,
    priority,
    conditions: [{ fieldKey: "category", operator: "equals", value: category }],
    assignment,
  };
}

function criterion(
  id: string,
  roundId: string,
  key: string,
  label: string,
  weight: number,
  maxScore: number,
): RubricCriterion {
  return { id, eventId: sandboxEventId, roundId, key, label, weight, maxScore };
}

function assignment(
  id: string,
  planId: string,
  roundId: string,
  evaluatorId: string,
  submissionId: string,
  status: EvaluatorAssignment["status"],
  conflictOfInterest = false,
): EvaluatorAssignment {
  return {
    id,
    eventId: sandboxEventId,
    planId,
    roundId,
    evaluatorId,
    submissionId,
    status,
    conflictOfInterest,
  };
}

function schedule(
  id: string,
  sessionId: string,
  roomId: string,
  start: string,
  end: string,
  speakerIds: string[],
  moderatorIds: string[] = [],
): ScheduleEntry {
  return {
    id,
    eventId: sandboxEventId,
    sessionId,
    roomId,
    start,
    end,
    timezone: "America/Los_Angeles",
    speakerIds,
    moderatorIds,
    calendarUid: `${sessionId}@programloom.local`,
    calendarSequence: 0,
    published: true,
  };
}

function template(id: string, key: string, subject: string, body: string): CommunicationTemplate {
  return {
    id,
    eventId: sandboxEventId,
    key,
    subject,
    body,
    allowedVariables: [
      "speaker.name",
      "event.name",
      "session.title",
      "outstanding.tasks",
      "due.date",
    ],
  };
}
