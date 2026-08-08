import { NextResponse } from "next/server";
import { getSnapshot, getStorageBackend } from "@/server/store";

export const runtime = "nodejs";

export async function GET() {
  const snapshot = await getSnapshot();
  const storage = await getStorageBackend();
  return NextResponse.json({
    ok: true,
    app: "ProgramLoom",
    version: "0.1.0",
    mode: process.env.DEMO_MODE === "false" ? "configured" : "demo",
    storage,
    eventId: snapshot.events[0]?.id ?? null,
    providers: {
      email: "log-only",
      accelevents: "dry-run-only",
      airtable: "blocked",
      cloudflare: storage === "d1" ? "verified" : "unverified",
    },
  });
}
