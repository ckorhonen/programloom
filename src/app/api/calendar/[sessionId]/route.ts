import { NextResponse } from "next/server";
import { buildCalendarArtifact } from "@/domain";
import { getSnapshot } from "@/server/store";

export const runtime = "nodejs";

export async function GET(_request: Request, context: { params: Promise<{ sessionId: string }> }) {
  const { sessionId } = await context.params;
  const snapshot = await getSnapshot();
  const event = snapshot.events[0];
  const session = snapshot.sessions.find((item) => item.id === sessionId);
  const entry = snapshot.scheduleEntries.find((item) => item.sessionId === sessionId);
  const room = snapshot.rooms.find((item) => item.id === entry?.roomId);
  if (!event || !session || !entry || !room)
    return NextResponse.json({ error: "Scheduled session not found" }, { status: 404 });
  const artifact = buildCalendarArtifact({
    event,
    session,
    scheduleEntry: entry,
    organizerEmail: "program@programloom.local",
    location: room.name,
  });
  return NextResponse.json(artifact);
}
