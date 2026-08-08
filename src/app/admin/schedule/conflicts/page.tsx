import { AppShell } from "@/components/app-shell";
import { AlertBanner, Button, Card, SectionTitle, StatusPill } from "@/components/ui";
import { detectScheduleConflicts } from "@/domain";
import { getSnapshot } from "@/server/store";

export const dynamic = "force-dynamic";

export default async function ScheduleConflictsRoute() {
  const snapshot = await getSnapshot();
  const conflicts = snapshot.events[0]
    ? detectScheduleConflicts(
        snapshot.events[0],
        snapshot.scheduleEntries,
        snapshot.conflictOverrides,
      )
    : [];
  return (
    <AppShell
      active="/admin/schedule"
      eyebrow="Schedule · Conflict panel"
      title="Conflict watch"
      description="A precise list of overlaps, with an audit path for deliberate exceptions."
      action={
        <Button href="/admin/schedule" variant="secondary">
          Back to schedule
        </Button>
      }
    >
      <div className="stack">
        <AlertBanner tone={conflicts.length ? "warning" : "success"}>
          {conflicts.length
            ? `${conflicts.length} conflict${conflicts.length === 1 ? "" : "s"} detected in the canonical schedule.`
            : "The schedule is clear."}
        </AlertBanner>
        <Card>
          <SectionTitle
            title="Detected conflicts"
            description="Conflicts are recalculated from the same schedule records used by public views."
          />
          {conflicts.length ? (
            conflicts.map((conflict) => (
              <div className="conflict-detail" key={conflict.key}>
                <div>
                  <StatusPill tone={conflict.overridden ? "green" : "orange"}>
                    {conflict.overridden ? "Overridden" : conflict.type.replace("_", " ")}
                  </StatusPill>
                  <h3>{conflict.message}</h3>
                  <p>{conflict.entryIds.join(" · ")}</p>
                </div>
                <Button variant={conflict.overridden ? "secondary" : "danger"}>
                  {conflict.overridden ? "View audit" : "Acknowledge"}
                </Button>
              </div>
            ))
          ) : (
            <div className="empty-state">
              <strong>No active conflicts</strong>
              <p>The engine checks rooms, speakers, moderators, duration, and event bounds.</p>
            </div>
          )}
        </Card>
      </div>
    </AppShell>
  );
}
