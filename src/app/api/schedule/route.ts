import { NextResponse } from "next/server";
import { z } from "zod";
import { scheduleSession } from "@/server/store";

export const runtime = "nodejs";

const scheduleSchema = z.object({
  sessionId: z.string().min(1),
  roomId: z.string().min(1),
  start: z.string().datetime({ offset: true }),
  end: z.string().datetime({ offset: true }),
  overrideReason: z.string().max(500).optional(),
});

export async function POST(request: Request) {
  const parsed = scheduleSchema.safeParse(await request.json());
  if (!parsed.success)
    return NextResponse.json({ error: "Invalid schedule change" }, { status: 400 });
  try {
    const result = await scheduleSession(parsed.data);
    return NextResponse.json({ ok: true, conflicts: result.conflicts, snapshot: result.snapshot });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to save schedule" },
      { status: 400 },
    );
  }
}
