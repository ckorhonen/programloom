import type { IdempotencyRecord } from "./types";

export type IdempotencyDecision<T> =
  | { status: "reserved"; record: IdempotencyRecord<T> }
  | { status: "replay"; record: IdempotencyRecord<T> }
  | { status: "conflict"; record: IdempotencyRecord<T> };

export function hashIdempotentRequest(payload: unknown): string {
  return fingerprintString(stableStringify(payload));
}

export function reserveIdempotency<T>(
  existing: IdempotencyRecord<T> | undefined,
  params: { eventId: string; key: string; scope: string; requestHash: string; now: string },
): IdempotencyDecision<T> {
  assertValidIdempotencyPart("scope", params.scope);
  assertValidIdempotencyPart("key", params.key);
  if (!existing) {
    return {
      status: "reserved",
      record: {
        id: `idem_${encodeIdPart(params.scope)}_${encodeIdPart(params.key)}`,
        eventId: params.eventId,
        key: params.key,
        scope: params.scope,
        requestHash: params.requestHash,
        status: "reserved",
        createdAt: params.now,
        updatedAt: params.now,
      },
    };
  }
  if (existing.requestHash !== params.requestHash) {
    return { status: "conflict", record: existing };
  }
  return existing.status === "completed"
    ? { status: "replay", record: existing }
    : { status: "reserved", record: existing };
}

function assertValidIdempotencyPart(label: "scope" | "key", value: string): void {
  if (!value.trim()) throw new Error(`Idempotency ${label} is required`);
  if (value.length > 256) throw new Error(`Idempotency ${label} is too long`);
}

function encodeIdPart(value: string): string {
  return value.replace(/[^a-zA-Z0-9_-]/g, "_");
}

export function completeIdempotency<T>(
  record: IdempotencyRecord<T>,
  response: T,
  now: string,
): IdempotencyRecord<T> {
  return { ...record, status: "completed", response, updatedAt: now };
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
