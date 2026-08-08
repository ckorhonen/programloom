import { NextResponse } from "next/server";
import { getSnapshot } from "@/server/store";

export const runtime = "nodejs";

export async function GET() {
  const snapshot = await getSnapshot();
  return NextResponse.json({
    ok: true,
    app: "ProgramLoom",
    version: "0.1.0",
    mode: process.env.DEMO_MODE === "false" ? "configured" : "demo",
    storage: "local-file",
    eventId: snapshot.events[0]?.id ?? null,
    providers: {
      email: "log-only",
      accelevents: "dry-run-only",
      airtable: "blocked",
      cloudflare: "unverified",
    },
  });
}
