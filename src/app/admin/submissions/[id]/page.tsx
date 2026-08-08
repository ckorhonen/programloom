import { AppShell } from "@/components/app-shell";
import { AlertBanner, Button, Card, SectionTitle, StatusPill } from "@/components/ui";
import { getSnapshot } from "@/server/store";

export const dynamic = "force-dynamic";

export default async function SubmissionDetailRoute({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const snapshot = await getSnapshot();
  const submission = snapshot.submissions.find((item) => item.id === id) ?? snapshot.submissions[0];
  const speaker = snapshot.speakers.find((item) => item.id === submission?.speakerIds[0]);
  return (
    <AppShell
      active="/admin/submissions"
      eyebrow="Submission detail"
      title={submission?.title ?? "Submission"}
      description="The complete context for a human program decision."
      action={
        <Button href="/admin/submissions" variant="secondary">
          Back to submissions
        </Button>
      }
    >
      <div className="grid-main">
        <div className="stack">
          <Card>
            <div className="card-header">
              <div>
                <div className="eyebrow">
                  {submission?.reviewQueue ?? "main-review"} ·{" "}
                  {submission?.categoryId
                    ? snapshot.categories.find((item) => item.id === submission.categoryId)?.name
                    : "General"}
                </div>
                <h2>{submission?.title}</h2>
                <p>
                  Submitted{" "}
                  {submission?.createdAt
                    ? new Date(submission.createdAt).toLocaleDateString()
                    : "—"}
                </p>
              </div>
              <StatusPill tone={submission ? "blue" : "neutral"}>
                {submission?.status.replace("_", " ")}
              </StatusPill>
            </div>
            <div className="detail-abstract">
              <h3>Abstract</h3>
              <p>{String(submission?.answers.abstract ?? "No abstract supplied.")}</p>
            </div>
            <div className="detail-tags">
              {(submission?.tags ?? []).map((tag) => (
                <StatusPill tone="purple" key={tag}>
                  {tag}
                </StatusPill>
              ))}
            </div>
          </Card>
          <Card>
            <SectionTitle
              title="Route audit"
              description="Server-side routing result attached to this proposal."
            />
            <div className="metric-row">
              <span className="metric-label">Category</span>
              <strong className="metric-value">
                {submission?.categoryId
                  ? snapshot.categories.find((item) => item.id === submission.categoryId)?.name
                  : "Fallback"}
              </strong>
            </div>
            <div className="metric-row">
              <span className="metric-label">Track candidate</span>
              <strong className="metric-value">
                {submission?.trackCandidateId
                  ? snapshot.tracks.find((item) => item.id === submission.trackCandidateId)?.name
                  : "Main program"}
              </strong>
            </div>
            <div className="metric-row">
              <span className="metric-label">Evaluation plan</span>
              <strong className="metric-value">
                {submission?.evaluationPlanId
                  ? snapshot.evaluationPlans.find((item) => item.id === submission.evaluationPlanId)
                      ?.name
                  : "Main Program Review"}
              </strong>
            </div>
            <div className="metric-row">
              <span className="metric-label">Review queue</span>
              <strong className="metric-value">{submission?.reviewQueue ?? "main-review"}</strong>
            </div>
          </Card>
        </div>
        <div className="stack">
          <Card>
            <SectionTitle title="Speaker context" />
            <div className="person-cell">
              <span className="avatar avatar-teal">{speaker?.name.slice(0, 2).toUpperCase()}</span>
              <div>
                <strong>{speaker?.name ?? "Unknown speaker"}</strong>
                <small>
                  {speaker?.title} · {speaker?.company}
                </small>
              </div>
            </div>
            <AlertBanner tone="info">
              Contact details are visible only inside the authenticated organizer workspace.
            </AlertBanner>
          </Card>
          <Card>
            <SectionTitle
              title="Decision"
              description="Acceptance creates or updates a session record."
            />
            <Button href={`/admin/submissions?focus=${submission?.id}`} icon={<CheckIcon />}>
              Open decision queue
            </Button>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}

function CheckIcon() {
  return <span aria-hidden="true">✓</span>;
}
