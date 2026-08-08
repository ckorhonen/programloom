import { NextResponse } from "next/server";
import { getSnapshot } from "@/server/store";

export const runtime = "nodejs";

export async function POST() {
  const snapshot = await getSnapshot();
  const accepted = snapshot.submissions.filter((item) => item.status === "accepted").length;
  const scheduled = snapshot.scheduleEntries.length;
  return NextResponse.json({
    ok: true,
    mode: "dry-run",
    externalWrites: 0,
    provider: "Accelevents",
    status: "blocked-live-unconfigured",
    plan: [
      {
        operation: "create",
        resource: "speakers",
        count: Math.max(0, accepted - 6),
        reason: "Local accepted speaker records not mapped",
      },
      {
        operation: "update",
        resource: "sessions",
        count: scheduled,
        reason: "Published local schedule would be sent in live mode",
      },
      {
        operation: "no-change",
        resource: "event",
        count: 1,
        reason: "Sandbox event selector is stable",
      },
    ],
    note: "No Accelevents credentials are configured; this receipt is a local diff plan, not live proof.",
  });
}
