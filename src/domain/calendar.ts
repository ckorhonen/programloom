import type { EventConfig, ScheduleEntry, Session } from "./types";

export interface CalendarArtifact {
  ics: string;
  googleUrl: string;
  outlookUrl: string;
}

export function buildCalendarArtifact(params: {
  event: EventConfig;
  scheduleEntry: ScheduleEntry;
  session: Session;
  organizerEmail: string;
  location: string;
}): CalendarArtifact {
  const { event, scheduleEntry, session, organizerEmail, location } = params;
  const details = {
    title: session.title,
    description: session.description,
    start: scheduleEntry.start,
    end: scheduleEntry.end,
    timezone: scheduleEntry.timezone,
    location,
  };
  const ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//ProgramLoom//Event Program//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${escapeIcs(scheduleEntry.calendarUid)}`,
    `SEQUENCE:${scheduleEntry.calendarSequence}`,
    `DTSTAMP:${toIcsUtc(new Date())}`,
    `DTSTART:${toIcsUtc(new Date(details.start))}`,
    `DTEND:${toIcsUtc(new Date(details.end))}`,
    `SUMMARY:${escapeIcs(details.title)}`,
    `DESCRIPTION:${escapeIcs(details.description)}`,
    `LOCATION:${escapeIcs(details.location)}`,
    `ORGANIZER:mailto:${organizerEmail}`,
    `X-WR-TIMEZONE:${event.timezone}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");

  return {
    ics,
    googleUrl: buildGoogleUrl(details),
    outlookUrl: buildOutlookUrl(details),
  };
}

export function nextCalendarSequence(entry: ScheduleEntry): ScheduleEntry {
  return { ...entry, calendarSequence: entry.calendarSequence + 1 };
}

function buildGoogleUrl(details: {
  title: string;
  start: string;
  end: string;
  description: string;
  location: string;
}): string {
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: details.title,
    dates: `${toIcsUtc(new Date(details.start))}/${toIcsUtc(new Date(details.end))}`,
    details: details.description,
    location: details.location,
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

function buildOutlookUrl(details: {
  title: string;
  start: string;
  end: string;
  description: string;
  location: string;
}): string {
  const params = new URLSearchParams({
    path: "/calendar/action/compose",
    rru: "addevent",
    subject: details.title,
    startdt: details.start,
    enddt: details.end,
    body: details.description,
    location: details.location,
  });
  return `https://outlook.office.com/calendar/0/deeplink/compose?${params.toString()}`;
}

function toIcsUtc(date: Date): string {
  return date
    .toISOString()
    .replace(/[-:]/g, "")
    .replace(/\.\d{3}Z$/, "Z");
}

function escapeIcs(value: string): string {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/\n/g, "\\n")
    .replace(/,/g, "\\,")
    .replace(/;/g, "\\;");
}
