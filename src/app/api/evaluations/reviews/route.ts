import { NextResponse } from "next/server";
import { z } from "zod";
import { submitEvaluationReview } from "@/server/store";

export const runtime = "nodejs";

const reviewSchema = z.object({
  assignmentId: z.string().min(1),
  evaluatorId: z.string().min(1),
  scores: z
    .array(
      z.object({
        criterionKey: z.string().min(1),
        score: z.number().int().min(0).max(10),
      }),
    )
    .default([]),
  comment: z.string().max(2_000).optional(),
  abstained: z.boolean().optional(),
  abstentionReason: z.string().max(500).optional(),
});

export async function POST(request: Request) {
  const parsed = reviewSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid evaluation review" }, { status: 400 });
  }
  try {
    const snapshot = await submitEvaluationReview(parsed.data);
    return NextResponse.json({
      ok: true,
      assignment: snapshot.evaluatorAssignments.find(
        (item) => item.id === parsed.data.assignmentId,
      ),
      review: snapshot.reviews.find((item) => item.assignmentId === parsed.data.assignmentId),
      snapshot,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to save evaluation review" },
      { status: 400 },
    );
  }
}
