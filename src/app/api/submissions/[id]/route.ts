import { NextResponse } from "next/server";
import { acceptSubmission } from "@/server/store";

export const runtime = "nodejs";

export async function POST(_request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  try {
    const snapshot = await acceptSubmission(id);
    return NextResponse.json({
      ok: true,
      submission: snapshot.submissions.find((item) => item.id === id),
      snapshot,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to accept submission" },
      { status: 400 },
    );
  }
}
