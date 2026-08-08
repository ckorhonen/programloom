import type { DueDateRule, EventConfig } from "./types";

export function assertValidEventDates(
  event: Pick<EventConfig, "timezone" | "startDate" | "endDate">,
): void {
  assertTimeZone(event.timezone);
  if (Date.parse(event.startDate) >= Date.parse(event.endDate)) {
    throw new Error("Event start must be before event end");
  }
}

export function calculateDueDate(
  rule: DueDateRule,
  event: EventConfig,
  acceptedAt?: string,
): string {
  assertTimeZone(event.timezone);
  if (rule.kind === "absolute") {
    return localTimeToUtc(rule.localDateTime, event.timezone);
  }

  const base =
    rule.kind === "beforeEventStart"
      ? new Date(event.startDate)
      : new Date(acceptedAt ?? event.startDate);
  const local = getZonedParts(base, event.timezone);
  const shifted = new Date(
    Date.UTC(
      local.year,
      local.month - 1,
      local.day + (rule.kind === "beforeEventStart" ? -rule.days : rule.days),
      rule.hour,
      rule.minute,
    ),
  );
  return localTimeToUtc(toLocalInput(shifted), event.timezone);
}

export function localTimeToUtc(localDateTime: string, timezone: string): string {
  assertTimeZone(timezone);
  const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/.exec(localDateTime);
  if (!match) throw new Error("Expected local datetime as YYYY-MM-DDTHH:mm");
  const [, year, month, day, hour, minute] = match.map(Number);
  const approximate = new Date(Date.UTC(year, month - 1, day, hour, minute));
  const offset = getTimezoneOffsetMs(approximate, timezone);
  return new Date(approximate.getTime() - offset).toISOString();
}

export function isOverdue(dueAt: string, now: string): boolean {
  return Date.parse(dueAt) < Date.parse(now);
}

function assertTimeZone(timezone: string): void {
  try {
    Intl.DateTimeFormat("en-US", { timeZone: timezone }).format(new Date());
  } catch {
    throw new Error(`Invalid timezone ${timezone}`);
  }
}

function getTimezoneOffsetMs(date: Date, timezone: string): number {
  const parts = getZonedParts(date, timezone);
  const asUtc = Date.UTC(
    parts.year,
    parts.month - 1,
    parts.day,
    parts.hour,
    parts.minute,
    parts.second,
  );
  return asUtc - date.getTime();
}

function getZonedParts(date: Date, timezone: string) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);
  const value = (type: string) => Number(parts.find((part) => part.type === type)?.value);
  return {
    year: value("year"),
    month: value("month"),
    day: value("day"),
    hour: value("hour"),
    minute: value("minute"),
    second: value("second"),
  };
}

function toLocalInput(date: Date): string {
  return date.toISOString().slice(0, 16);
}
