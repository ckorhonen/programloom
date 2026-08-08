import { mkdtemp, rm } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { afterEach, describe, expect, it } from "vitest";
import {
  acknowledgeConflict,
  aggregateScores,
  buildCalendarArtifact,
  buildScheduledMessages,
  calculateDueDate,
  completeIdempotency,
  completeLinkedTaskFromFormResponse,
  detectScheduleConflicts,
  evaluateConditionalRules,
  hashIdempotentRequest,
  nextCalendarSequence,
  renderTemplate,
  reserveIdempotency,
  resolveRouting,
  serializeBlindSubmission,
  serializePrivateSpeaker,
  serializePublicSchedule,
  serializePublicSpeaker,
  summarizeOnboarding,
  transitionSubmissionStatus,
} from "@/domain";
import { createSandboxResetFixture, createSandboxSeed, sandboxEventId } from "@/seed";
import { LocalObjectStore, buildResetReceipt } from "@/storage";

const tempDirs: string[] = [];

afterEach(async () => {
  await Promise.all(tempDirs.splice(0).map((dir) => rm(dir, { recursive: true, force: true })));
});

describe("domain foundation", () => {
  it("evaluates conditional CFP rules and strips hidden answers", () => {
    const seed = createSandboxSeed();
    const version = seed.formVersions[0];

    const talk = evaluateConditionalRules(version.fields, version.conditionalRules, {
      session_format: "Talk",
      hands_on_requirements: "Should be removed",
      abstract: "Talk abstract",
    });
    expect(talk.fields.find((field) => field.field.key === "hands_on_requirements")).toMatchObject({
      visible: false,
      required: false,
    });
    expect(talk.sanitizedAnswers).not.toHaveProperty("hands_on_requirements");

    const workshop = evaluateConditionalRules(version.fields, version.conditionalRules, {
      session_format: "Workshop",
      hands_on_requirements: "Bring a laptop",
    });
    expect(
      workshop.fields.find((field) => field.field.key === "hands_on_requirements"),
    ).toMatchObject({
      visible: true,
      required: true,
    });
    expect(workshop.sanitizedAnswers.hands_on_requirements).toBe("Bring a laptop");
  });

  it("routes deterministically with fallback tags, conflict reporting, and stable ordering", () => {
    const seed = createSandboxSeed();
    const result = resolveRouting(
      seed.routingRules,
      { category: "Security" },
      { reviewQueue: "fallback", tags: ["new"] },
    );

    expect(result.assignment).toMatchObject({
      categoryId: "category_1",
      trackId: "track_1",
      evaluationPlanId: "eval_security",
      reviewQueue: "security-review",
      tags: ["needs-conflict-check", "new", "security"],
    });
    expect(result.policy).toBe("single");

    const conflict = resolveRouting(
      [
        seed.routingRules[0],
        {
          ...seed.routingRules[0],
          id: "route_security_alt",
          assignment: { ...seed.routingRules[0].assignment, trackId: "track_2" },
        },
      ],
      { category: "Security" },
    );
    expect(conflict.matchedRuleIds).toEqual(["route_security", "route_security_alt"]);
    expect(conflict.conflictRuleIds).toEqual(["route_security_alt"]);
  });

  it("scores human reviews while preserving abstentions and blind serialization", () => {
    const seed = createSandboxSeed();
    const criteria = seed.rubricCriteria.filter(
      (criterion) => criterion.roundId === "round_security_1",
    );
    const reviews = seed.reviews.filter((review) => review.submissionId === "submission_1");

    expect(aggregateScores(criteria, reviews)).toMatchObject({
      reviewCount: 1,
      abstentionCount: 1,
      weightedAverage: 92,
    });

    const blind = serializeBlindSubmission(seed.submissions[0], ["speaker_name", "speaker_email"]);
    expect(blind.speakerIds).toEqual([]);
    expect(blind.answers).not.toHaveProperty("speaker_name");
    expect(blind.answers).not.toHaveProperty("speaker_email");
  });

  it("enforces status transitions and creates accepted session state without scheduling declined records", () => {
    const seed = createSandboxSeed();
    const submitted = { ...seed.submissions[11], status: "submitted" as const };

    const accepted = transitionSubmissionStatus(
      submitted,
      { from: "submitted", to: "accepted", actorId: "admin", at: "2026-08-09T00:00:00.000Z" },
      seed.speakers,
    );
    expect(accepted.submission.status).toBe("accepted");
    expect(accepted.session).toMatchObject({
      id: `session_${submitted.id}`,
      status: "accepted",
      speakerIds: submitted.speakerIds,
    });
    expect(accepted.audit.action).toBe("submission.accepted");

    const declined = transitionSubmissionStatus(
      submitted,
      { from: "submitted", to: "declined", actorId: "admin", at: "2026-08-09T00:00:00.000Z" },
      seed.speakers,
    );
    expect(declined.session).toBeUndefined();
  });

  it("calculates event-timezone due dates and onboarding completion from task primitives", () => {
    const seed = createSandboxSeed();
    const event = seed.events[0];
    expect(calculateDueDate(seed.tasks[0].due, event)).toBe("2026-09-02T00:00:00.000Z");

    const response = seed.portalFormResponses[0];
    const cleared = seed.taskAssignments.map((assignment) =>
      assignment.id === "assignment_speaker_1_task_4"
        ? { ...assignment, completedAt: undefined }
        : assignment,
    );
    const completed = completeLinkedTaskFromFormResponse(cleared, response);
    expect(
      completed.find((assignment) => assignment.id === "assignment_speaker_1_task_4")?.completedAt,
    ).toBe(response.submittedAt);

    const summary = summarizeOnboarding({
      event,
      speaker: seed.speakers[7],
      tasks: seed.tasks,
      assignments: seed.taskAssignments,
      now: "2026-09-10T00:00:00.000Z",
    });
    expect(summary.overdueRequired).toEqual(["task_1", "task_2", "task_3", "task_4"]);
    expect(summary.complete).toBe(false);
  });

  it("renders templates, builds reminder messages, and keeps idempotency replay/conflict explicit", () => {
    const seed = createSandboxSeed();
    const rendered = renderTemplate(seed.templates[0], {
      "speaker.name": "Jordan",
      "event.name": "AI Engineer Sandbox Summit",
      "session.title": "Hardening Agentic Coding Workflows",
    });
    expect(rendered.subject).toBe("Accepted: Hardening Agentic Coding Workflows");
    expect(rendered.body).toContain("Jordan");

    const messages = buildScheduledMessages({
      event: seed.events[0],
      rule: seed.reminderRules[0],
      tasks: seed.tasks,
      assignments: seed.taskAssignments,
      speakers: seed.speakers,
      now: "2026-08-08T12:00:00.000Z",
    });
    expect(messages.map((message) => message.targetId)).toContain("speaker_8");
    expect(new Set(messages.map((message) => message.idempotencyKey)).size).toBe(messages.length);

    const requestHash = hashIdempotentRequest({ a: 1, b: ["x"] });
    expect(hashIdempotentRequest({ b: ["x"], a: 1 })).toBe(requestHash);
    const reserved = reserveIdempotency(undefined, {
      eventId: sandboxEventId,
      key: "submit/one",
      scope: "public-cfp",
      requestHash,
      now: "2026-08-08T12:00:00.000Z",
    });
    expect(reserved.status).toBe("reserved");
    expect(reserved.record.id).toBe("idem_public-cfp_submit_one");
    const completed = completeIdempotency(
      reserved.record,
      { submissionId: "submission_1" },
      "2026-08-08T12:01:00.000Z",
    );
    expect(
      reserveIdempotency(completed, {
        eventId: sandboxEventId,
        key: "submit/one",
        scope: "public-cfp",
        requestHash,
        now: completed.updatedAt,
      }),
    ).toMatchObject({
      status: "replay",
    });
    expect(
      reserveIdempotency(completed, {
        eventId: sandboxEventId,
        key: "submit/one",
        scope: "public-cfp",
        requestHash: hashIdempotentRequest({ a: 2 }),
        now: completed.updatedAt,
      }),
    ).toMatchObject({ status: "conflict" });
    expect(() =>
      reserveIdempotency(undefined, {
        eventId: sandboxEventId,
        key: "",
        scope: "public-cfp",
        requestHash,
        now: completed.updatedAt,
      }),
    ).toThrow("Idempotency key is required");
  });

  it("generates valid calendar artifacts and detects schedule conflicts with overrides", () => {
    const seed = createSandboxSeed();
    const event = seed.events[0];
    const entry = seed.scheduleEntries[0];
    const session = seed.sessions.find((item) => item.id === entry.sessionId);
    if (!session) throw new Error("Missing test session");

    const artifact = buildCalendarArtifact({
      event,
      scheduleEntry: entry,
      session,
      organizerEmail: "program@example.test",
      location: "Main Hall",
    });
    expect(artifact.ics).toContain("BEGIN:VCALENDAR\r\nVERSION:2.0");
    expect(artifact.ics).toContain(`UID:${entry.calendarUid}`);
    expect(artifact.ics).toContain("SEQUENCE:0");
    expect(artifact.googleUrl).toContain("calendar.google.com");
    expect(nextCalendarSequence(entry).calendarSequence).toBe(1);

    const conflicts = detectScheduleConflicts(event, seed.scheduleEntries);
    expect(conflicts.map((conflict) => conflict.type)).toEqual(
      expect.arrayContaining(["room_overlap", "speaker_overlap"]),
    );
    const override = acknowledgeConflict(
      conflicts[0],
      sandboxEventId,
      "admin",
      "Accepted for demo conflict visibility",
      "2026-08-08T12:00:00.000Z",
    );
    expect(
      detectScheduleConflicts(event, seed.scheduleEntries, [override]).find(
        (conflict) => conflict.key === conflicts[0].key,
      )?.overridden,
    ).toBe(true);
  });

  it("serializes public/private projections without leaking portal or file object metadata", () => {
    const seed = createSandboxSeed();
    const publicSpeaker = serializePublicSpeaker(seed.speakers[0], seed.sessions, seed.files);
    expect(publicSpeaker).toMatchObject({ id: "speaker_1" });
    expect(publicSpeaker).not.toHaveProperty("headshotFileId");
    expect(publicSpeaker).not.toHaveProperty("email");
    expect(publicSpeaker).not.toHaveProperty("portalToken");

    const privateSpeaker = serializePrivateSpeaker(seed.speakers[0], seed.sessions);
    expect(privateSpeaker.email).toBe("speaker1@example.test");
    expect(privateSpeaker.portalToken).toBe("portal_token_1");

    const schedule = serializePublicSchedule(seed.scheduleEntries, seed.sessions);
    expect(schedule.length).toBeGreaterThan(0);
    expect(schedule[0]).not.toHaveProperty("calendarUid");
    expect(schedule[0]).not.toHaveProperty("objectKey");
  });

  it("keeps private file metadata separate from bytes and blocks path traversal", async () => {
    const dir = await mkdtemp(join(tmpdir(), "programloom-object-store-"));
    tempDirs.push(dir);
    const store = new LocalObjectStore(dir);
    const bytes = new Uint8Array([1, 2, 3]);

    await store.put({
      key: "speaker/speaker_1/headshot.jpg",
      bytes,
      contentType: "image/jpeg",
      contentHash: "hash",
    });
    const object = await store.get("speaker/speaker_1/headshot.jpg");
    expect(object?.bytes).toEqual(bytes);
    expect(object?.contentType).toBe("image/jpeg");

    await expect(
      store.put({ key: "../escape.txt", bytes, contentType: "text/plain", contentHash: "hash" }),
    ).rejects.toThrow("Object key escapes store root");
    await expect(
      store.put({
        key: `${dir}-sibling/escape.txt`,
        bytes,
        contentType: "text/plain",
        contentHash: "hash",
      }),
    ).rejects.toThrow();
  });

  it("builds deterministic reset receipts for the AI Engineer Sandbox Summit seed", () => {
    const first = createSandboxResetFixture();
    const second = createSandboxResetFixture();
    expect(first.fingerprint).toBe(second.fingerprint);
    expect(first.snapshot.events[0]).toMatchObject({
      name: "AI Engineer Sandbox Summit",
      slug: "ai-engineer-sandbox-summit",
    });
    expect(first.snapshot.forms).toHaveLength(1);
    expect(first.snapshot.evaluationPlans).toHaveLength(2);
    expect(first.snapshot.evaluators).toHaveLength(3);
    expect(first.snapshot.portalForms).toHaveLength(3);
    expect(first.snapshot.resourcePages).toHaveLength(2);
    expect(first.snapshot.reminderRules).toHaveLength(2);
    expect(first.snapshot.scheduledMessages).toHaveLength(2);
    expect(
      first.snapshot.evaluatorAssignments.some(
        (assignment) =>
          assignment.status === "assigned" && assignment.submissionId === "submission_5",
      ),
    ).toBe(true);
    expect(first.snapshot.tasks.length).toBeGreaterThan(0);

    const receipt = buildResetReceipt(first.snapshot);
    expect(receipt.eventId).toBe(sandboxEventId);
    expect(receipt.fingerprint).toBe(first.fingerprint);
    expect(receipt.counts).toMatchObject({
      events: 1,
      forms: 1,
      evaluationPlans: 2,
      scheduleEntries: 8,
      reminderRules: 2,
    });
  });
});
