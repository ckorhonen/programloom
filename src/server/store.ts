import { join } from "node:path";
import {
  acknowledgeConflict,
  detectScheduleConflicts,
  transitionSubmissionStatus,
  type DomainSnapshot,
  type Review,
  type FileAsset,
  type ReviewScore,
  type ScheduleEntry,
  type Submission,
} from "@/domain";
import { createSandboxSeed, sandboxEventId } from "@/seed";
import { FileBackedStorageAdapter, buildResetReceipt } from "@/storage";

const dataFile =
  process.env.PROGRAMLOOM_DATA_FILE ?? join(process.cwd(), ".data", "programloom.json");
const storage = new FileBackedStorageAdapter(dataFile);
let mutationQueue: Promise<unknown> = Promise.resolve();

export async function getSnapshot(): Promise<DomainSnapshot> {
  const current = await storage.readSnapshot();
  if (current.events[0]?.id !== sandboxEventId) {
    const seed = createSandboxSeed();
    await storage.reset(seed);
    return seed;
  }
  return current;
}

export async function resetDemo(): Promise<{
  snapshot: DomainSnapshot;
  receipt: ReturnType<typeof buildResetReceipt>;
}> {
  const operation = mutationQueue.then(async () => {
    const seed = createSandboxSeed();
    await storage.reset(seed);
    return { snapshot: seed, receipt: buildResetReceipt(seed) };
  });
  mutationQueue = operation.then(
    () => undefined,
    () => undefined,
  );
  return operation;
}

export async function updateSnapshot(
  mutator: (snapshot: DomainSnapshot) => DomainSnapshot | Promise<DomainSnapshot>,
): Promise<DomainSnapshot> {
  const operation = mutationQueue.then(async () => {
    const next = await mutator(await getSnapshot());
    await storage.writeSnapshot(next);
    return next;
  });
  mutationQueue = operation.then(
    () => undefined,
    () => undefined,
  );
  return operation;
}

export async function acceptSubmission(
  submissionId: string,
  actorId = "admin-demo",
): Promise<DomainSnapshot> {
  return updateSnapshot((snapshot) => {
    const submission = snapshot.submissions.find((item) => item.id === submissionId);
    if (!submission) throw new Error("Submission not found");
    if (submission.status === "accepted") return snapshot;
    const now = new Date().toISOString();
    const result = transitionSubmissionStatus(
      submission,
      {
        from: submission.status,
        to: "accepted",
        actorId,
        at: now,
        reason: "Accepted in ProgramLoom demo",
      },
      snapshot.speakers,
    );
    const sessions =
      result.session && !snapshot.sessions.some((item) => item.id === result.session?.id)
        ? [...snapshot.sessions, result.session]
        : snapshot.sessions.map((item) => (item.id === result.session?.id ? result.session : item));
    return {
      ...snapshot,
      submissions: snapshot.submissions.map((item) =>
        item.id === submissionId ? result.submission : item,
      ),
      sessions,
      audit: [...snapshot.audit, result.audit],
    };
  });
}

export async function submitEvaluationReview(input: {
  assignmentId: string;
  evaluatorId: string;
  scores: ReviewScore[];
  comment?: string;
  abstained?: boolean;
  abstentionReason?: string;
}): Promise<DomainSnapshot> {
  return updateSnapshot((snapshot) => {
    const assignment = snapshot.evaluatorAssignments.find((item) => item.id === input.assignmentId);
    if (!assignment) throw new Error("Evaluator assignment not found");
    if (assignment.evaluatorId !== input.evaluatorId) {
      throw new Error("Evaluator is not assigned to this submission");
    }
    const round = snapshot.evaluationRounds.find((item) => item.id === assignment.roundId);
    if (!round) throw new Error("Evaluation round not found");
    const criteria = snapshot.rubricCriteria.filter((item) => item.roundId === round.id);
    const abstained = input.abstained === true;
    if (!abstained) {
      const submittedKeys = new Set(input.scores.map((score) => score.criterionKey));
      if (
        submittedKeys.size !== criteria.length ||
        criteria.some((criterion) => !submittedKeys.has(criterion.key))
      ) {
        throw new Error("A score is required for every rubric criterion");
      }
      for (const score of input.scores) {
        const criterion = criteria.find((item) => item.key === score.criterionKey);
        if (
          !criterion ||
          !Number.isInteger(score.score) ||
          score.score < 0 ||
          score.score > criterion.maxScore
        ) {
          throw new Error("Review score is outside the rubric range");
        }
      }
    }
    const now = new Date().toISOString();
    const review: Review = {
      id: `review_${assignment.id}`,
      eventId: assignment.eventId,
      assignmentId: assignment.id,
      roundId: assignment.roundId,
      submissionId: assignment.submissionId,
      evaluatorId: assignment.evaluatorId,
      scores: abstained ? [] : input.scores,
      abstained,
      abstentionReason: abstained
        ? input.abstentionReason?.trim() || "Conflict of interest"
        : undefined,
      comment: input.comment?.trim() || undefined,
    };
    const reviews = snapshot.reviews.some((item) => item.assignmentId === assignment.id)
      ? snapshot.reviews.map((item) => (item.assignmentId === assignment.id ? review : item))
      : [...snapshot.reviews, review];
    return {
      ...snapshot,
      evaluatorAssignments: snapshot.evaluatorAssignments.map((item) =>
        item.id === assignment.id
          ? { ...item, status: abstained ? "abstained" : "submitted" }
          : item,
      ),
      reviews,
      audit: [
        ...snapshot.audit,
        {
          id: `audit_${review.id}_${now}`,
          eventId: assignment.eventId,
          actorId: assignment.evaluatorId,
          action: abstained ? "evaluation.abstained" : "evaluation.review_submitted",
          targetType: "submission",
          targetId: assignment.submissionId,
          at: now,
          detail: { assignmentId: assignment.id, comment: review.comment },
        },
      ],
    };
  });
}

export async function updateSpeaker(
  speakerId: string,
  input: {
    bio?: string;
    company?: string;
    title?: string;
    completeTaskId?: string;
    file?: Pick<FileAsset, "originalFilename" | "contentType" | "sizeBytes">;
  },
): Promise<DomainSnapshot> {
  return updateSnapshot((snapshot) => {
    const speaker = snapshot.speakers.find((item) => item.id === speakerId);
    if (!speaker) throw new Error("Speaker not found");
    const now = new Date().toISOString();
    let files = snapshot.files;
    if (input.file) {
      const fileId = `file_portal_${speakerId}_${input.file.originalFilename.replace(/[^a-z0-9]/gi, "-").toLowerCase()}`;
      files = [
        ...files.filter((file) => file.id !== fileId),
        {
          id: fileId,
          eventId: speaker.eventId,
          ownerType: "speaker",
          ownerId: speakerId,
          storageProvider: "local",
          bucket: "sandbox-files",
          objectKey: `portal/${speakerId}/${fileId}`,
          version: "1",
          sizeBytes: input.file.sizeBytes,
          originalFilename: input.file.originalFilename,
          contentType: input.file.contentType,
          contentHash: `demo-hash-${fileId}`,
          uploadedByRole: "speaker",
          visibility: input.file.contentType.startsWith("image/") ? "public-approved" : "private",
          status: "accepted",
          scanStatus: "passed",
          createdAt: now,
          updatedAt: now,
        } satisfies FileAsset,
      ];
    }
    return {
      ...snapshot,
      speakers: snapshot.speakers.map((item) =>
        item.id === speakerId
          ? {
              ...item,
              bio: input.bio ?? item.bio,
              company: input.company ?? item.company,
              title: input.title ?? item.title,
            }
          : item,
      ),
      files,
      taskAssignments: input.completeTaskId
        ? snapshot.taskAssignments.map((assignment) =>
            assignment.speakerId === speakerId && assignment.taskId === input.completeTaskId
              ? { ...assignment, completedAt: now }
              : assignment,
          )
        : snapshot.taskAssignments,
      audit: [
        ...snapshot.audit,
        {
          id: `audit_portal_${speakerId}_${now}`,
          eventId: speaker.eventId,
          actorId: speakerId,
          action: input.completeTaskId
            ? "portal.task_completed"
            : input.file
              ? "portal.file_uploaded"
              : "portal.profile_updated",
          targetType: "speaker",
          targetId: speakerId,
          at: now,
        },
      ],
    };
  });
}

export async function submitProposal(input: {
  title: string;
  format: string;
  abstract: string;
  category: string;
  speakerName: string;
  speakerEmail: string;
  coSpeakerName?: string;
}): Promise<{ snapshot: DomainSnapshot; submission: Submission; replayed: boolean }> {
  const normalizedTitle = input.title.trim();
  if (
    !normalizedTitle ||
    !input.abstract.trim() ||
    !input.speakerName.trim() ||
    !input.speakerEmail.trim()
  ) {
    throw new Error("Title, abstract, speaker name, and email are required");
  }
  const existing = await getSnapshot();
  const duplicate = existing.submissions.find(
    (submission) =>
      submission.title.toLowerCase() === normalizedTitle.toLowerCase() &&
      String(submission.answers.email ?? "").toLowerCase() ===
        input.speakerEmail.trim().toLowerCase(),
  );
  if (duplicate) return { snapshot: existing, submission: duplicate, replayed: true };

  let created!: Submission;
  const snapshot = await updateSnapshot((current) => {
    const category =
      current.categories.find((item) => item.name.toLowerCase() === input.category.toLowerCase()) ??
      current.categories[0];
    const track =
      current.tracks.find((item) =>
        item.name.toLowerCase().includes(input.category.toLowerCase().split(" ")[0]),
      ) ?? current.tracks[0];
    const speakerId = `speaker_public_${current.speakers.length + 1}`;
    const submissionId = `submission_public_${current.submissions.length + 1}`;
    const now = new Date().toISOString();
    const evaluationPlanId = input.category.toLowerCase().includes("security")
      ? "eval_security"
      : "eval_general";
    const evaluationRound = current.evaluationRounds.find(
      (item) => item.planId === evaluationPlanId && item.roundNumber === 1,
    );
    const evaluator =
      current.evaluators.find((item) => item.id === "evaluator_3") ?? current.evaluators[0];
    const speaker = {
      id: speakerId,
      eventId: sandboxEventId,
      name: input.speakerName.trim(),
      email: input.speakerEmail.trim(),
      title: "Guest speaker",
      company: "Independent",
      bio: "New proposal contributor",
      portalToken: `portal_${speakerId}`,
    };
    const speakerIds = [speakerId];
    if (input.coSpeakerName?.trim()) {
      const coSpeakerId = `speaker_public_${current.speakers.length + 2}`;
      speakerIds.push(coSpeakerId);
      current.speakers = [
        ...current.speakers,
        {
          ...speaker,
          id: coSpeakerId,
          name: input.coSpeakerName.trim(),
          email: `co-${coSpeakerId}@example.test`,
        },
      ];
    }
    created = {
      id: submissionId,
      eventId: sandboxEventId,
      formVersionId: "form_version_cfp_1",
      title: normalizedTitle,
      status: "submitted",
      answers: {
        session_format: input.format,
        category: input.category,
        abstract: input.abstract.trim(),
        email: input.speakerEmail.trim(),
      },
      speakerIds,
      categoryId: category?.id,
      trackCandidateId: track?.id,
      evaluationPlanId,
      reviewQueue: input.category.toLowerCase().includes("security")
        ? "security-review"
        : "main-review",
      tags: ["new", "routed"],
      createdAt: now,
      updatedAt: now,
    };
    return {
      ...current,
      speakers: [...current.speakers, speaker],
      submissions: [...current.submissions, created],
      evaluatorAssignments:
        evaluationRound && evaluator
          ? [
              ...current.evaluatorAssignments,
              {
                id: `assignment_${submissionId}`,
                eventId: sandboxEventId,
                planId: evaluationPlanId,
                roundId: evaluationRound.id,
                evaluatorId: evaluator.id,
                submissionId,
                status: "assigned",
              },
            ]
          : current.evaluatorAssignments,
      audit: [
        ...current.audit,
        {
          id: `audit_${submissionId}`,
          eventId: sandboxEventId,
          actorId: "public-cfp",
          action: "submission.created",
          targetType: "submission",
          targetId: submissionId,
          at: now,
          detail: { route: "demo-fallback", category: category?.name, track: track?.name },
        },
      ],
    };
  });
  return { snapshot, submission: created, replayed: false };
}

export async function scheduleSession(input: {
  sessionId: string;
  roomId: string;
  start: string;
  end: string;
  overrideReason?: string;
}): Promise<{ snapshot: DomainSnapshot; conflicts: ReturnType<typeof detectScheduleConflicts> }> {
  return updateSnapshot((snapshot) => {
    const event = snapshot.events[0];
    const session = snapshot.sessions.find((item) => item.id === input.sessionId);
    if (!event || !session) throw new Error("Session not found");
    const existing = snapshot.scheduleEntries.filter(
      (entry) => entry.sessionId !== input.sessionId,
    );
    const entry: ScheduleEntry = {
      id: `schedule_${input.sessionId}`,
      eventId: event.id,
      sessionId: input.sessionId,
      roomId: input.roomId,
      start: input.start,
      end: input.end,
      timezone: event.timezone,
      speakerIds: session.speakerIds,
      moderatorIds: session.moderatorIds ?? [],
      calendarUid: `${input.sessionId}@programloom.local`,
      calendarSequence:
        snapshot.scheduleEntries.find((item) => item.sessionId === input.sessionId)
          ?.calendarSequence ?? 0,
      published: true,
    };
    const overrides = snapshot.audit
      .filter(
        (entry) => entry.action === "schedule.conflict_overridden" && entry.detail?.conflictKey,
      )
      .map((entry) => ({ conflictKey: String(entry.detail?.conflictKey) }));
    const conflicts = detectScheduleConflicts(event, [...existing, entry], overrides as never);
    const now = new Date().toISOString();
    const overrideAudit = input.overrideReason?.trim()
      ? conflicts
          .map((conflict) =>
            acknowledgeConflict(conflict, event.id, "admin-demo", input.overrideReason ?? "", now),
          )
          .map((override) => ({
            id: `audit_${override.id}`,
            eventId: event.id,
            actorId: override.acknowledgedBy,
            action: "schedule.conflict_overridden",
            targetType: "schedule",
            targetId: entry.id,
            at: now,
            detail: { conflictKey: override.conflictKey, reason: override.reason },
          }))
      : [];
    return {
      ...snapshot,
      scheduleEntries: [...existing, entry],
      audit: [
        ...snapshot.audit,
        {
          id: `audit_schedule_${entry.id}_${now}`,
          eventId: event.id,
          actorId: "admin-demo",
          action: "schedule.saved",
          targetType: "schedule",
          targetId: entry.id,
          at: now,
        },
        ...overrideAudit,
      ],
    };
  }).then(async (snapshot) => {
    const event = snapshot.events[0];
    const overrides = snapshot.audit
      .filter(
        (entry) => entry.action === "schedule.conflict_overridden" && entry.detail?.conflictKey,
      )
      .map((entry) => ({
        id: entry.id,
        eventId: entry.eventId,
        conflictKey: String(entry.detail?.conflictKey),
        acknowledgedBy: entry.actorId,
        reason: String(entry.detail?.reason ?? ""),
        at: entry.at,
      }));
    return {
      snapshot,
      conflicts: event ? detectScheduleConflicts(event, snapshot.scheduleEntries, overrides) : [],
    };
  });
}
