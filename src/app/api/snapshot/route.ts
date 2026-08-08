import { NextResponse } from "next/server";
import { serializePublicSnapshot } from "@/domain";
import { getSnapshot } from "@/server/store";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const snapshot = await getSnapshot();
  const demoAdmin =
    process.env.DEMO_MODE !== "false" && request.headers.get("x-programloom-demo-admin") === "true";
  return NextResponse.json(demoAdmin ? snapshot : serializePublicSnapshot(snapshot));
}
