import type { ConflictOverride, EventConfig, ScheduleEntry } from "./types";

export type ConflictType =
  | "room_overlap"
  | "speaker_overlap"
  | "moderator_overlap"
  | "outside_event_bounds"
  | "invalid_duration";

export interface ScheduleConflict {
  key: string;
  type: ConflictType;
  entryIds: string[];
  message: string;
  overridden: boolean;
}

export function detectScheduleConflicts(
  event: EventConfig,
  entries: ScheduleEntry[],
  overrides: ConflictOverride[] = [],
): ScheduleConflict[] {
  const conflicts: ScheduleConflict[] = [];
  const overrideKeys = new Set(overrides.map((override) => override.conflictKey));

  for (const entry of entries) {
    const start = Date.parse(entry.start);
    const end = Date.parse(entry.end);
    if (end <= start) {
      conflicts.push(
        conflict("invalid_duration", [entry.id], "Session duration must be positive", overrideKeys),
      );
    }
    if (start < Date.parse(event.startDate) || end > Date.parse(event.endDate)) {
      conflicts.push(
        conflict(
          "outside_event_bounds",
          [entry.id],
          "Session is outside event bounds",
          overrideKeys,
        ),
      );
    }
  }

  for (let index = 0; index < entries.length; index += 1) {
    for (let otherIndex = index + 1; otherIndex < entries.length; otherIndex += 1) {
      const left = entries[index];
      const right = entries[otherIndex];
      if (!overlaps(left, right)) continue;
      if (left.roomId === right.roomId) {
        conflicts.push(
          conflict(
            "room_overlap",
            [left.id, right.id],
            "Sessions overlap in the same room",
            overrideKeys,
          ),
        );
      }
      if (intersects(left.speakerIds, right.speakerIds)) {
        conflicts.push(
          conflict(
            "speaker_overlap",
            [left.id, right.id],
            "A speaker is scheduled in overlapping sessions",
            overrideKeys,
          ),
        );
      }
      if (intersects(left.moderatorIds ?? [], right.moderatorIds ?? [])) {
        conflicts.push(
          conflict(
            "moderator_overlap",
            [left.id, right.id],
            "A moderator is scheduled in overlapping sessions",
            overrideKeys,
          ),
        );
      }
    }
  }

  return conflicts.sort((a, b) => a.key.localeCompare(b.key));
}

export function acknowledgeConflict(
  conflictItem: ScheduleConflict,
  eventId: string,
  actorId: string,
  reason: string,
  at: string,
): ConflictOverride {
  if (!reason.trim()) throw new Error("Conflict override requires acknowledgement reason");
  return {
    id: `override_${conflictItem.key}`,
    eventId,
    conflictKey: conflictItem.key,
    acknowledgedBy: actorId,
    reason,
    at,
  };
}

function overlaps(left: ScheduleEntry, right: ScheduleEntry): boolean {
  return (
    Date.parse(left.start) < Date.parse(right.end) && Date.parse(right.start) < Date.parse(left.end)
  );
}

function intersects(left: string[], right: string[]): boolean {
  return left.some((value) => right.includes(value));
}

function conflict(
  type: ConflictType,
  entryIds: string[],
  message: string,
  overrideKeys: Set<string>,
): ScheduleConflict {
  const key = `${type}:${[...entryIds].sort().join("+")}`;
  return { key, type, entryIds: [...entryIds].sort(), message, overridden: overrideKeys.has(key) };
}
