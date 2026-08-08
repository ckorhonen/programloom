import { NextResponse } from "next/server";
import { z } from "zod";
import { updateSpeaker } from "@/server/store";

export const runtime = "nodejs";

const updateSchema = z.object({
  bio: z.string().max(1000).optional(),
  company: z.string().max(160).optional(),
  title: z.string().max(160).optional(),
  completeTaskId: z.string().max(100).optional(),
  file: z
    .object({
      originalFilename: z.string().max(180),
      contentType: z.string().max(100),
      sizeBytes: z.number().int().nonnegative().max(20_000_000),
    })
    .optional(),
});

export async function POST(request: Request, context: { params: Promise<{ speakerId: string }> }) {
  const { speakerId } = await context.params;
  const parsed = updateSchema.safeParse(await request.json());
  if (!parsed.success)
    return NextResponse.json({ error: "Invalid portal update" }, { status: 400 });
  try {
    const snapshot = await updateSpeaker(speakerId, parsed.data);
    return NextResponse.json({
      ok: true,
      snapshot,
      speaker: snapshot.speakers.find((item) => item.id === speakerId),
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to save portal update" },
      { status: 400 },
    );
  }
}
