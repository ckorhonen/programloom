import type {
  DomainSnapshot,
  EventConfig,
  FileAsset,
  Room,
  ScheduleEntry,
  Session,
  Speaker,
  Submission,
  Track,
} from "./types";

export interface PublicSpeaker {
  id: string;
  name: string;
  title?: string;
  company?: string;
  bio?: string;
  sessions: string[];
}

export interface PrivateSpeaker extends PublicSpeaker {
  email: string;
  portalToken?: string;
  headshotFileId?: string;
}

export interface PublicSession {
  id: string;
  title: string;
  description: string;
  status: "published";
  speakerIds: string[];
  trackId?: string;
}

export interface PublicScheduleEntry {
  id: string;
  sessionId: string;
  roomId: string;
  start: string;
  end: string;
  timezone: string;
  published: true;
}

export interface PublicProgramSnapshot {
  events: Array<Pick<EventConfig, "id" | "name" | "slug" | "timezone" | "startDate" | "endDate">>;
  tracks: Array<Pick<Track, "id" | "name" | "slug" | "color">>;
  rooms: Array<Pick<Room, "id" | "name" | "capacity">>;
  speakers: PublicSpeaker[];
  sessions: PublicSession[];
  scheduleEntries: PublicScheduleEntry[];
}

export function serializePublicSpeaker(
  speaker: Speaker,
  sessions: Session[],
  files: FileAsset[] = [],
): PublicSpeaker {
  void files;
  return {
    id: speaker.id,
    name: speaker.name,
    title: speaker.title,
    company: speaker.company,
    bio: speaker.bio,
    sessions: sessions
      .filter(
        (session) => session.speakerIds.includes(speaker.id) && session.status === "published",
      )
      .map((session) => session.id),
  };
}

export function serializePublicSnapshot(snapshot: DomainSnapshot): PublicProgramSnapshot {
  const sessions: PublicSession[] = snapshot.sessions
    .filter((session) => session.status === "published")
    .map((session) => ({
      id: session.id,
      title: session.title,
      description: session.description,
      status: "published",
      speakerIds: [...session.speakerIds],
      trackId: session.trackId,
    }));
  const sessionIds = new Set(sessions.map((session) => session.id));
  const scheduleEntries: PublicScheduleEntry[] = snapshot.scheduleEntries
    .filter((entry) => entry.published && sessionIds.has(entry.sessionId))
    .map((entry) => ({
      id: entry.id,
      sessionId: entry.sessionId,
      roomId: entry.roomId,
      start: entry.start,
      end: entry.end,
      timezone: entry.timezone,
      published: true,
    }));
  const publishedSpeakerIds = new Set(sessions.flatMap((session) => session.speakerIds));
  return {
    events: snapshot.events.map(({ id, name, slug, timezone, startDate, endDate }) => ({
      id,
      name,
      slug,
      timezone,
      startDate,
      endDate,
    })),
    tracks: snapshot.tracks.map(({ id, name, slug, color }) => ({ id, name, slug, color })),
    rooms: snapshot.rooms.map(({ id, name, capacity }) => ({ id, name, capacity })),
    speakers: snapshot.speakers
      .filter((speaker) => publishedSpeakerIds.has(speaker.id))
      .map((speaker) => serializePublicSpeaker(speaker, snapshot.sessions, [])),
    sessions,
    scheduleEntries,
  };
}

export function serializePrivateSpeaker(speaker: Speaker, sessions: Session[]): PrivateSpeaker {
  return {
    ...speaker,
    sessions: sessions
      .filter((session) => session.speakerIds.includes(speaker.id))
      .map((session) => session.id),
  };
}

export function serializePublicSchedule(entries: ScheduleEntry[], sessions: Session[]) {
  return entries
    .filter((entry) => entry.published)
    .map((entry) => {
      const session = sessions.find((item) => item.id === entry.sessionId);
      if (!session || session.status !== "published") return null;
      return {
        id: entry.id,
        sessionId: session.id,
        title: session.title,
        description: session.description,
        start: entry.start,
        end: entry.end,
        timezone: entry.timezone,
        roomId: entry.roomId,
        trackId: session.trackId,
        speakerIds: session.speakerIds,
      };
    })
    .filter((item): item is NonNullable<typeof item> => item !== null);
}

export function serializeBlindSubmission(
  submission: Submission,
  identifyingFieldKeys: string[],
): Submission {
  const answers = { ...submission.answers };
  for (const key of identifyingFieldKeys) {
    delete answers[key];
  }
  return { ...submission, answers, speakerIds: [] };
}
