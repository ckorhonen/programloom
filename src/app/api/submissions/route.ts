import { NextResponse } from "next/server";
import { z } from "zod";
import { submitProposal } from "@/server/store";

export const runtime = "nodejs";

const proposalSchema = z.object({
  title: z.string().min(3).max(160),
  format: z.string().min(1),
  abstract: z.string().min(30).max(5000),
  category: z.string().min(1),
  speakerName: z.string().min(2).max(120),
  speakerEmail: z.string().email(),
  coSpeakerName: z.string().max(120).optional(),
});

export async function POST(request: Request) {
  const parsed = proposalSchema.safeParse(await request.json());
  if (!parsed.success)
    return NextResponse.json(
      { error: "Check the highlighted fields", details: parsed.error.flatten() },
      { status: 400 },
    );
  try {
    const result = await submitProposal(parsed.data);
    return NextResponse.json(
      { ok: true, replayed: result.replayed, submission: result.submission },
      { status: result.replayed ? 200 : 201 },
    );
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to save submission" },
      { status: 400 },
    );
  }
}
