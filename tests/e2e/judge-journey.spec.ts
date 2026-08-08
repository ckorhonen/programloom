import { expect, test } from "@playwright/test";

test.describe.serial("ProgramLoom judge journey", () => {
  test.beforeEach(async ({ request }) => {
    const response = await request.post("/api/demo/reset");
    expect(response.ok()).toBeTruthy();
  });

  test("walks from conditional CFP to persisted public program", async ({ page, request }) => {
    await page.goto("/");
    await expect(page.getByText("ProgramLoom").first()).toBeVisible();
    await page.getByRole("link", { name: "Enter the demo" }).click();
    await expect(page).toHaveURL(/\/demo$/);
    await page.getByRole("link", { name: "Admin overview" }).click();
    await expect(page).toHaveURL(/\/admin$/);
    await expect(page.getByText("AI Engineer Sandbox Summit").first()).toBeVisible();

    const publicSnapshot = await (await request.get("/api/snapshot")).json();
    expect(publicSnapshot).not.toHaveProperty("submissions");
    expect(JSON.stringify(publicSnapshot)).not.toContain("portal_token_");
    expect(JSON.stringify(publicSnapshot)).not.toContain("assignment_");

    await page.goto("/admin/forms");
    await page.locator(".logic-top select").selectOption("Talk");
    await expect(page.getByText("Hidden · Not required")).toBeVisible();
    await page.locator(".logic-top select").selectOption("Workshop");
    await expect(page.getByText("Visible · Required")).toBeVisible();

    await page.goto("/cfp/ai-engineer-sandbox-summit");
    const title = `Judge path ${Date.now()}`;
    await page.getByLabel("Session title *").fill(title);
    await page
      .getByLabel("Abstract *")
      .fill(
        "A practical workshop showing how to build a safer, more observable event program workflow.",
      );
    await page
      .getByLabel("Hands-on requirements *")
      .fill("Bring a laptop with a local TypeScript project.");
    await page.getByLabel("Your name *").fill("Demo Judge");
    await page.getByLabel("Email *").fill("judge@example.test");
    await page.getByRole("checkbox").check();
    await page.getByRole("button", { name: "Submit proposal" }).click();
    await expect(page.getByText("Your idea is in the room.")).toBeVisible();

    const snapshotResponse = await request.get("/api/snapshot", {
      headers: { "x-programloom-demo-admin": "true" },
    });
    const snapshot = await snapshotResponse.json();
    const created = snapshot.submissions.find(
      (submission: { title: string }) => submission.title === title,
    );
    expect(created).toBeTruthy();

    await page.goto("/admin/evaluations");
    await expect(page.getByText("Evaluator queue")).toBeVisible();
    await page.getByRole("button", { name: new RegExp(title) }).click();
    await page.getByRole("button", { name: "Save review" }).click();
    await expect(page.getByText(/Review saved to the local evaluation record/)).toBeVisible();
    const reviewedSnapshot = await (
      await request.get("/api/snapshot", {
        headers: { "x-programloom-demo-admin": "true" },
      })
    ).json();
    const reviewedAssignment = reviewedSnapshot.evaluatorAssignments.find(
      (assignment: { submissionId: string }) => assignment.submissionId === created.id,
    );
    expect(reviewedAssignment.status).toBe("submitted");
    expect(
      reviewedSnapshot.reviews.some(
        (review: { submissionId: string; abstained: boolean }) =>
          review.submissionId === created.id && !review.abstained,
      ),
    ).toBeTruthy();

    const acceptResponse = await request.post(`/api/submissions/${created.id}`);
    expect(acceptResponse.ok()).toBeTruthy();

    await page.goto("/portal/speaker_8");
    await expect(page.getByText("Onboarding progress")).toBeVisible();
    await page.getByRole("button", { name: /Complete Confirm bio/ }).click();
    await expect(page.getByText("Done").first()).toBeVisible();

    await page.goto("/admin/schedule");
    await page.getByRole("button", { name: "Place" }).click();
    await expect(page.getByText(/conflicts detected/i)).toBeVisible();
    await page.getByRole("button", { name: "Override with audit" }).click();
    await expect(page.getByText(/Session placed and persisted/i)).toBeVisible();

    const calendarResponse = await request.get("/api/calendar/session_1");
    expect(calendarResponse.ok()).toBeTruthy();
    const calendar = await calendarResponse.json();
    expect(calendar.ics).toContain("BEGIN:VCALENDAR");
    expect(calendar.ics).toContain("UID:session_1@programloom.local");

    await page.goto("/admin/integrations");
    await page.getByRole("button", { name: "Run dry-run" }).click();
    await expect(page.getByText(/External writes: 0/)).toBeVisible();

    await page.goto("/public/ai-engineer-sandbox-summit/schedule");
    await expect(page.getByText("Hardening Agentic Coding Workflows")).toBeVisible();
    await expect(
      page.getByText("Public projection hides private speaker contact details"),
    ).toBeVisible();
    const scheduleHtml = await page.content();
    for (const sentinel of [
      "speaker1@example.test",
      "portal_token_1",
      "assignment_",
      "file_headshot_1",
    ]) {
      expect(scheduleHtml).not.toContain(sentinel);
    }

    await page.goto("/public/ai-engineer-sandbox-summit/speakers");
    await expect(page.getByText("Meet the people building what’s next.")).toBeVisible();
    const speakersHtml = await page.content();
    expect(speakersHtml).not.toContain("speaker8@example.test");
    expect(speakersHtml).not.toContain("portal_token_1");
  });
});
