import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET() {
  return NextResponse.json({
    openapi: "3.1.0",
    info: {
      title: "ProgramLoom API",
      version: "0.1.0",
      description:
        "Event-program operations API. Demo providers are explicitly local or dry-run only.",
    },
    servers: [{ url: "/api" }],
    paths: {
      "/healthz": {
        get: {
          summary: "Health and provider status",
          responses: { "200": { description: "Runtime status" } },
        },
      },
      "/snapshot": {
        get: {
          summary: "Read the public event projection",
          description:
            "Returns redacted public fields by default. The local demo test harness may send x-programloom-demo-admin while DEMO_MODE is enabled.",
          responses: { "200": { description: "Domain snapshot" } },
        },
      },
      "/submissions": {
        post: {
          summary: "Submit and route a CFP proposal",
          responses: {
            "201": { description: "Created" },
            "400": { description: "Validation error" },
          },
        },
      },
      "/evaluations/reviews": {
        post: {
          summary: "Persist an assigned evaluator review",
          responses: {
            "200": { description: "Review saved" },
            "400": { description: "Validation or assignment error" },
          },
        },
      },
      "/demo/reset": {
        post: {
          summary: "Reset the demo event",
          responses: {
            "200": { description: "Reset receipt" },
            "403": { description: "Disabled outside demo mode" },
          },
        },
      },
      "/schedule": {
        post: {
          summary: "Save a schedule entry and return conflicts",
          responses: { "200": { description: "Schedule result" } },
        },
      },
    },
  });
}
