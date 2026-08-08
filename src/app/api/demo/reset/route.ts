import { NextResponse } from "next/server";
import { resetDemo } from "@/server/store";

export const runtime = "nodejs";

export async function POST() {
  if (process.env.DEMO_MODE === "false") {
    return NextResponse.json(
      { error: "Demo reset is disabled outside demo mode" },
      { status: 403 },
    );
  }
  const result = await resetDemo();
  return NextResponse.json({ ok: true, receipt: result.receipt, snapshot: result.snapshot });
}
