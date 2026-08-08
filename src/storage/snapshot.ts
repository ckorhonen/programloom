import type { DomainSnapshot } from "@/domain";
import type { SeedResetReceipt } from "./types";

export const emptySnapshot = (): DomainSnapshot => ({
  events: [],
  seedSnapshots: [],
  tracks: [],
  rooms: [],
  categories: [],
  forms: [],
  formVersions: [],
  routingRules: [],
  submissions: [],
  submissionParticipants: [],
  publicAccessTokens: [],
  evaluationPlans: [],
  evaluationRounds: [],
  rubricCriteria: [],
  evaluators: [],
  evaluatorAssignments: [],
  reviews: [],
  roundStates: [],
  decisions: [],
  speakers: [],
  sessions: [],
  scheduleEntries: [],
  conflictRecords: [],
  conflictOverrides: [],
  files: [],
  fileRequests: [],
  tasks: [],
  taskAssignments: [],
  portalForms: [],
  portalFormResponses: [],
  resourcePages: [],
  templates: [],
  renderedMessages: [],
  reminderRules: [],
  scheduledMessages: [],
  deliveryLogs: [],
  calendarArtifacts: [],
  idempotency: [],
  audit: [],
});

export function fingerprintSnapshot(snapshot: DomainSnapshot): string {
  return fingerprintString(stableStringify(snapshot));
}

export function buildResetReceipt(snapshot: DomainSnapshot): SeedResetReceipt {
  const event = snapshot.events[0];
  return {
    eventId: event?.id ?? "none",
    fingerprint: fingerprintSnapshot(snapshot),
    counts: Object.fromEntries(
      Object.entries(snapshot).map(([key, value]) => [
        key,
        Array.isArray(value) ? value.length : 0,
      ]),
    ),
  };
}

function stableStringify(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(",")}]`;
  if (value && typeof value === "object") {
    return `{${Object.entries(value as Record<string, unknown>)
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([key, item]) => `${JSON.stringify(key)}:${stableStringify(item)}`)
      .join(",")}}`;
  }
  return JSON.stringify(value);
}

function fingerprintString(value: string): string {
  let hash = 0xcbf29ce484222325n;
  const prime = 0x100000001b3n;
  const mask = 0xffffffffffffffffn;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= BigInt(value.charCodeAt(index));
    hash = (hash * prime) & mask;
  }
  return hash.toString(16).padStart(16, "0");
}
