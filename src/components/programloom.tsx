"use client";

import { Fragment, useMemo, useState } from "react";
import type {
  DomainSnapshot,
  PublicProgramSnapshot,
  PublicScheduleEntry,
  PublicSession,
  ScheduleEntry,
  Speaker,
  Submission,
} from "@/domain";
import { AppShell } from "./app-shell";
import {
  AlertBanner,
  Button,
  Card,
  EmptyState,
  LinkRow,
  ProgressBar,
  SectionTitle,
  StatCard,
  StatusPill,
  TableShell,
} from "./ui";
import {
  ArrowRight,
  BarChart3,
  BellRing,
  BookOpen,
  CalendarCheck2,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronDown,
  ClipboardList,
  Clock3,
  Code2,
  FileCheck2,
  FileText,
  Filter,
  GitBranch,
  Globe2,
  Gauge,
  Headphones,
  Image as ImageIcon,
  Layers3,
  Link2,
  LockKeyhole,
  Mail,
  MessageSquareText,
  MoreHorizontal,
  Play,
  Plus,
  RefreshCw,
  Search,
  Send,
  Settings2,
  ShieldCheck,
  Sparkles,
  Star,
  Upload,
  UserRound,
  Users,
  WandSparkles,
  X,
} from "lucide-react";

export type ProgramPageProps = { snapshot: DomainSnapshot };

function statusTone(status: string): "neutral" | "green" | "orange" | "red" | "purple" | "blue" {
  if (["accepted", "published", "complete", "completed", "passed"].includes(status)) return "green";
  if (["in_review", "in-progress", "scheduled", "submitted"].includes(status)) return "blue";
  if (["waitlisted", "pending", "overdue", "blocked"].includes(status)) return "orange";
  if (["declined", "failed", "conflict"].includes(status)) return "red";
  if (["draft", "unconfigured"].includes(status)) return "purple";
  return "neutral";
}

function formatDate(
  value: string,
  options: Intl.DateTimeFormatOptions = { month: "short", day: "numeric" },
) {
  return new Intl.DateTimeFormat("en-US", options).format(new Date(value));
}

function formatTime(value: string) {
  return new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit" }).format(
    new Date(value),
  );
}

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function completionForSpeaker(snapshot: DomainSnapshot, speakerId: string) {
  const assignments = snapshot.taskAssignments.filter((item) => item.speakerId === speakerId);
  const requiredIds = new Set(
    snapshot.tasks.filter((item) => item.required).map((item) => item.id),
  );
  const required = assignments.filter((item) => requiredIds.has(item.taskId));
  return required.length === 0
    ? 0
    : Math.round((required.filter((item) => item.completedAt).length / required.length) * 100);
}

function conflictCount(snapshot: DomainSnapshot) {
  let count = 0;
  for (let i = 0; i < snapshot.scheduleEntries.length; i += 1) {
    for (let j = i + 1; j < snapshot.scheduleEntries.length; j += 1) {
      const left = snapshot.scheduleEntries[i];
      const right = snapshot.scheduleEntries[j];
      const overlap = left.start < right.end && right.start < left.end;
      if (
        overlap &&
        (left.roomId === right.roomId ||
          left.speakerIds.some((id) => right.speakerIds.includes(id)))
      )
        count += 1;
    }
  }
  return count;
}

export function DashboardPage({ snapshot }: ProgramPageProps) {
  const event = snapshot.events[0];
  const accepted = snapshot.submissions.filter((item) => item.status === "accepted").length;
  const queuedForReview = new Set(
    snapshot.evaluatorAssignments
      .filter((item) => ["assigned", "in_progress"].includes(item.status))
      .map((item) => item.submissionId),
  );
  const inReview = snapshot.submissions.filter(
    (item) => ["submitted", "in_review"].includes(item.status) || queuedForReview.has(item.id),
  ).length;
  const onboarded = snapshot.speakers.filter(
    (speaker) => completionForSpeaker(snapshot, speaker.id) === 100,
  ).length;
  const completion = snapshot.speakers.length
    ? Math.round((onboarded / snapshot.speakers.length) * 100)
    : 0;
  const conflicts = conflictCount(snapshot);
  const activity = [...snapshot.audit].slice(-5).reverse();
  return (
    <AppShell
      active="/admin"
      eyebrow="Overview"
      title="Good morning, Chris"
      description="Your program is moving. Here’s what needs your attention today."
      action={
        <Button href="/admin/submissions" icon={<Plus size={15} />}>
          Review submissions
        </Button>
      }
    >
      <div className="stack">
        <div className="hero-card">
          <div className="hero-copy">
            <div className="eyebrow">{event?.name ?? "Sandbox event"}</div>
            <h2>The calm center for your event program.</h2>
            <p>
              Move from CFP to a polished public agenda with every decision, task, and handoff in
              one place.
            </p>
            <div className="hero-actions">
              <Button href="/demo" variant="primary" icon={<Play size={14} fill="currentColor" />}>
                Run the demo journey
              </Button>
              <Button
                href="/public/ai-engineer-sandbox-summit/schedule"
                variant="secondary"
                icon={<Globe2 size={14} />}
              >
                View public program
              </Button>
            </div>
          </div>
          <div className="hero-insight">
            <div className="hero-mini">
              <div className="hero-mini-label">Program readiness</div>
              <div className="hero-mini-value">
                <strong>{completion}%</strong>
                <span>+8% this week</span>
              </div>
              <div className="progress-track">
                <div className="progress-fill progress-teal" style={{ width: `${completion}%` }} />
              </div>
              <small>
                {onboarded} of {snapshot.speakers.length} speakers are fully onboarded
              </small>
            </div>
          </div>
        </div>
        <div className="grid grid-4">
          <StatCard
            label="Needs review"
            value={inReview}
            detail="submissions in your queue"
            tone="orange"
            icon={<ClipboardIcon />}
          />
          <StatCard
            label="Accepted sessions"
            value={accepted}
            detail="ready for the agenda"
            tone="teal"
            icon={<CheckCircle2 size={16} />}
          />
          <StatCard
            label="Onboarding"
            value={`${completion}%`}
            detail={`${snapshot.speakers.length - onboarded} speakers need work`}
            tone="purple"
            icon={<Users size={16} />}
          />
          <StatCard
            label="Schedule risks"
            value={conflicts}
            detail={conflicts ? "conflicts need a decision" : "no active conflicts"}
            tone="navy"
            icon={<CalendarCheck2 size={16} />}
          />
        </div>
        <div className="grid-main">
          <div className="stack">
            <Card>
              <SectionTitle
                title="Program health"
                description="The four signals that keep your team ahead of the next handoff."
                action={
                  <Button variant="ghost" href="/admin/onboarding">
                    Open dashboard
                  </Button>
                }
              />
              <div className="metric-row">
                <span className="metric-label">
                  <span className="inline-icon teal">
                    <FileCheck2 size={14} />
                  </span>{" "}
                  CFP is collecting proposals
                </span>
                <StatusPill tone="green">Published</StatusPill>
              </div>
              <div className="metric-row">
                <span className="metric-label">
                  <span className="inline-icon orange">
                    <BarChart3 size={14} />
                  </span>{" "}
                  Evaluation queue
                </span>
                <strong className="metric-value">{inReview} awaiting review</strong>
              </div>
              <div className="metric-row">
                <span className="metric-label">
                  <span className="inline-icon purple">
                    <Users size={14} />
                  </span>{" "}
                  Speaker onboarding
                </span>
                <span className="metric-value">
                  {onboarded}/{snapshot.speakers.length} complete
                </span>
              </div>
              <div className="metric-row">
                <span className="metric-label">
                  <span className="inline-icon navy">
                    <CalendarDays size={14} />
                  </span>{" "}
                  Agenda coverage
                </span>
                <span className="metric-value">
                  {snapshot.scheduleEntries.length}/{snapshot.sessions.length} placed
                </span>
              </div>
            </Card>
            <Card>
              <SectionTitle
                title="Submissions needing a decision"
                description="The shortest path to a stronger program is a clear next action."
                action={
                  <Button variant="ghost" href="/admin/submissions">
                    See all
                  </Button>
                }
              />
              <TableShell>
                <thead>
                  <tr>
                    <th>Proposal</th>
                    <th>Category</th>
                    <th>Route</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {snapshot.submissions
                    .filter(
                      (item) =>
                        ["submitted", "in_review", "waitlisted"].includes(item.status) ||
                        queuedForReview.has(item.id),
                    )
                    .slice(0, 5)
                    .map((submission) => (
                      <tr key={submission.id}>
                        <td>
                          <span className="table-primary">{submission.title}</span>
                          <span className="table-secondary">
                            {submission.speakerIds.length} speaker
                            {submission.speakerIds.length === 1 ? "" : "s"} ·{" "}
                            {formatDate(submission.updatedAt)}
                          </span>
                        </td>
                        <td>
                          {snapshot.categories.find(
                            (category) => category.id === submission.categoryId,
                          )?.name ?? "General"}
                        </td>
                        <td>
                          <StatusPill tone="purple">
                            {submission.reviewQueue ?? "main-review"}
                          </StatusPill>
                        </td>
                        <td>
                          <StatusPill tone={statusTone(submission.status)}>
                            {queuedForReview.has(submission.id) && submission.status === "accepted"
                              ? "review queued"
                              : submission.status.replace("_", " ")}
                          </StatusPill>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </TableShell>
            </Card>
          </div>
          <div className="stack">
            <Card>
              <SectionTitle
                title="Today’s focus"
                description="Small actions that unlock the next stage."
              />
              <div className="timeline">
                {activity.map((entry, index) => (
                  <div className="timeline-item" key={entry.id}>
                    <span className={`timeline-dot ${index === 1 ? "orange" : ""}`} />
                    <div className="timeline-copy">
                      <strong>{activityLabel(entry.action)}</strong>
                      <small>
                        {formatDate(entry.at, {
                          month: "short",
                          day: "numeric",
                          hour: "numeric",
                          minute: "2-digit",
                        })}
                      </small>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
            <Card>
              <SectionTitle title="Quick launch" />
              <LinkRow href="/admin/forms" meta={<StatusPill tone="green">Ready</StatusPill>}>
                Edit your CFP
              </LinkRow>
              <LinkRow
                href="/admin/evaluations"
                meta={
                  <span className="quick-icon">
                    <ArrowRight size={14} />
                  </span>
                }
              >
                Review a proposal
              </LinkRow>
              <LinkRow
                href="/admin/schedule"
                meta={
                  <span className="quick-icon">
                    <ArrowRight size={14} />
                  </span>
                }
              >
                Place a session
              </LinkRow>
              <LinkRow
                href="/admin/communications"
                meta={
                  <span className="quick-icon">
                    <ArrowRight size={14} />
                  </span>
                }
              >
                Preview a reminder
              </LinkRow>
            </Card>
            <AlertBanner tone="info">
              <strong>Demo workspace:</strong>&nbsp; changes are persisted locally and resettable
              from the top bar.
            </AlertBanner>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

function ClipboardIcon() {
  return <ClipboardList size={16} />;
}
function activityLabel(action: string) {
  return action.replaceAll(".", " · ").replace(/\b\w/g, (character) => character.toUpperCase());
}

export function FormsPage() {
  const [format, setFormat] = useState("Workshop");
  const [saved, setSaved] = useState(false);
  const [published, setPublished] = useState(true);
  return (
    <AppShell
      active="/admin/forms"
      eyebrow="Configure · CFP form"
      title="Shape the conversation"
      description="Build a form that asks the right question at the right time, then publish it when it feels ready."
      action={
        <>
          <Button variant="secondary" onClick={() => setSaved(true)}>
            Save draft
          </Button>
          <Button
            onClick={() => {
              setPublished(true);
              setSaved(true);
            }}
          >
            Publish form
          </Button>
        </>
      }
    >
      <div className="stack">
        <div className="stepper">
          <span className="step is-done">
            <span className="step-number">
              <Check size={12} />
            </span>{" "}
            Build
          </span>
          <span className="step-line" />
          <span className="step is-done">
            <span className="step-number">
              <Check size={12} />
            </span>{" "}
            Logic
          </span>
          <span className="step-line" />
          <span className="step">
            <span className="step-number">3</span> Preview
          </span>
        </div>
        {saved && (
          <AlertBanner tone="success">
            Draft saved locally.{" "}
            {published
              ? "The published version is still live for existing submissions."
              : "Publish when you’re ready."}
          </AlertBanner>
        )}
        <div className="grid-main">
          <Card>
            <div className="card-header">
              <div>
                <div className="eyebrow">Version 3 · live</div>
                <h2>Call for speakers</h2>
                <p>AI Engineer Sandbox Summit · {published ? "Published" : "Draft"}</p>
              </div>
              <StatusPill tone={published ? "green" : "purple"}>
                {published ? "Published" : "Draft"}
              </StatusPill>
            </div>
            <div className="form-builder-list">
              <FormFieldRow label="Session title" type="Short text" required />
              <FormFieldRow
                label="Session format"
                type="Single select"
                required
                selected={format}
                onChange={setFormat}
                options={["Talk", "Workshop", "Panel"]}
              />
              <FormFieldRow label="Abstract" type="Long text" required />
              <FormFieldRow
                label="Hands-on requirements"
                type="Long text"
                required
                locked={format !== "Workshop"}
                note={
                  format === "Workshop"
                    ? "Shown and required when Session format is Workshop"
                    : "Hidden for Talk and Panel submissions"
                }
              />
              <FormFieldRow label="Supporting material" type="File upload" />
            </div>
            <Button variant="ghost" onClick={() => setSaved(true)} icon={<Plus size={14} />}>
              Add field
            </Button>
          </Card>
          <div className="stack">
            <Card>
              <SectionTitle
                title="Logic preview"
                description="Test the form as a speaker would see it."
              />
              <div className="logic-preview">
                <div className="logic-top">
                  <span className="preview-label">Session format</span>
                  <select
                    className="select"
                    value={format}
                    onChange={(event) => setFormat(event.target.value)}
                  >
                    <option>Workshop</option>
                    <option>Talk</option>
                    <option>Panel</option>
                  </select>
                </div>
                <div
                  className={`conditional-card ${format === "Workshop" ? "is-visible" : "is-hidden"}`}
                >
                  <div className="conditional-tag">
                    <GitBranch size={13} /> Conditional field
                  </div>
                  <strong>Hands-on requirements</strong>
                  <p>{format === "Workshop" ? "Visible · Required" : "Hidden · Not required"}</p>
                </div>
                <div className="logic-foot">
                  <ShieldCheck size={14} /> Logic runs in the browser and on the server.
                </div>
              </div>
            </Card>
            <Card>
              <SectionTitle title="Share form" />
              <div className="share-url">
                <Link2 size={15} />
                <span>programloom.local/cfp/ai-engineer-sandbox-summit</span>
                <button
                  onClick={() => navigator.clipboard?.writeText("/cfp/ai-engineer-sandbox-summit")}
                >
                  <Check size={14} />
                </button>
              </div>
              <p className="muted-copy">
                Existing submissions stay linked to the version they used.
              </p>
              <Button
                href="/cfp/ai-engineer-sandbox-summit"
                variant="secondary"
                icon={<Globe2 size={14} />}
              >
                Open public form
              </Button>
            </Card>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

function FormFieldRow({
  label,
  type,
  required = false,
  locked = false,
  note,
  selected,
  onChange,
  options,
}: {
  label: string;
  type: string;
  required?: boolean;
  locked?: boolean;
  note?: string;
  selected?: string;
  onChange?: (value: string) => void;
  options?: string[];
}) {
  return (
    <div className={`form-field-row ${locked ? "is-locked" : ""}`}>
      <span className="drag-handle">⋮⋮</span>
      <span className="field-type-icon">
        <FileText size={15} />
      </span>
      <div className="form-field-copy">
        <strong>{label}</strong>
        <small>
          {note ?? type}
          {required && !note ? " · Required" : ""}
        </small>
      </div>
      {options && onChange ? (
        <select
          className="field-inline-select"
          value={selected}
          onChange={(event) => onChange(event.target.value)}
        >
          {options.map((option) => (
            <option key={option}>{option}</option>
          ))}
        </select>
      ) : (
        <span className="field-row-type">{type}</span>
      )}
      <button className="icon-button" aria-label={`Edit ${label}`}>
        <MoreHorizontal size={16} />
      </button>
    </div>
  );
}

export function SubmissionsPage({ snapshot: initialSnapshot }: ProgramPageProps) {
  const [snapshot, setSnapshot] = useState(initialSnapshot);
  const [filter, setFilter] = useState("All");
  const [query, setQuery] = useState("");
  const [busy, setBusy] = useState<string | null>(null);
  const filters = ["All", "Needs review", "Accepted", "Waitlisted"];
  const queuedForReview = new Set(
    snapshot.evaluatorAssignments
      .filter((item) => ["assigned", "in_progress"].includes(item.status))
      .map((item) => item.submissionId),
  );
  const rows = snapshot.submissions.filter((submission) => {
    const textMatch = `${submission.title} ${submission.id}`
      .toLowerCase()
      .includes(query.toLowerCase());
    const filterMatch =
      filter === "All" ||
      (filter === "Needs review"
        ? ["submitted", "in_review"].includes(submission.status) ||
          queuedForReview.has(submission.id)
        : submission.status === filter.toLowerCase());
    return textMatch && filterMatch;
  });
  async function accept(submissionId: string) {
    setBusy(submissionId);
    const response = await fetch(`/api/submissions/${submissionId}`, { method: "POST" });
    const data = await response.json();
    if (response.ok) setSnapshot(data.snapshot);
    setBusy(null);
  }
  return (
    <AppShell
      active="/admin/submissions"
      eyebrow="Workspace · Submissions"
      title="Submission desk"
      description="A clear queue for the decisions that shape the event."
      action={
        <Button href="/admin/forms" variant="secondary" icon={<Settings2 size={14} />}>
          Edit CFP
        </Button>
      }
    >
      <div className="stack">
        <div className="grid grid-4">
          <StatCard
            label="Total proposals"
            value={snapshot.submissions.length}
            detail="across this event"
            tone="navy"
            icon={<ClipboardList size={16} />}
          />
          <StatCard
            label="Needs review"
            value={
              snapshot.submissions.filter((item) =>
                ["submitted", "in_review"].includes(item.status),
              ).length
            }
            detail="next up for evaluators"
            tone="orange"
            icon={<Clock3 size={16} />}
          />
          <StatCard
            label="Accepted"
            value={snapshot.submissions.filter((item) => item.status === "accepted").length}
            detail="on the program"
            tone="teal"
            icon={<CheckCircle2 size={16} />}
          />
          <StatCard
            label="Response rate"
            value="76%"
            detail="of invited speakers"
            tone="purple"
            icon={<MessageSquareText size={16} />}
          />
        </div>
        <Card>
          <div className="filter-row">
            <div className="search-input">
              <Search size={15} />
              <input
                className="input"
                placeholder="Search proposals"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
            </div>
            {filters.map((item) => (
              <button
                className={`filter-chip ${filter === item ? "is-selected" : ""}`}
                key={item}
                onClick={() => setFilter(item)}
              >
                {item}
              </button>
            ))}
            <button className="filter-chip">
              <Filter size={13} /> More filters
            </button>
          </div>
          <TableShell>
            <thead>
              <tr>
                <th>Proposal</th>
                <th>Submitted</th>
                <th>Route</th>
                <th>Review</th>
                <th>Status</th>
                <th>
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((submission) => (
                <SubmissionRow
                  key={submission.id}
                  submission={submission}
                  snapshot={snapshot}
                  busy={busy === submission.id}
                  onAccept={() => accept(submission.id)}
                />
              ))}
            </tbody>
          </TableShell>
          {rows.length === 0 && (
            <EmptyState
              title="No proposals match"
              description="Try another filter or search term."
            />
          )}
        </Card>
      </div>
    </AppShell>
  );
}

function SubmissionRow({
  submission,
  snapshot,
  busy,
  onAccept,
}: {
  submission: Submission;
  snapshot: DomainSnapshot;
  busy: boolean;
  onAccept: () => void;
}) {
  const category =
    snapshot.categories.find((item) => item.id === submission.categoryId)?.name ?? "General";
  const speaker = snapshot.speakers.find((item) => item.id === submission.speakerIds[0]);
  return (
    <tr>
      <td>
        <span className="table-primary">{submission.title}</span>
        <span className="table-secondary">
          {speaker?.name ?? "Unknown speaker"} · {submission.speakerIds.length} participant
          {submission.speakerIds.length === 1 ? "" : "s"}
        </span>
      </td>
      <td>{formatDate(submission.createdAt)}</td>
      <td>
        <span className="route-badge">
          <span className="route-dot" />
          {category}
        </span>
        <small className="table-secondary">{submission.reviewQueue ?? "main-review"}</small>
      </td>
      <td>
        <div className="review-progress">
          <span className="avatar-group">
            <span className="avatar avatar-teal">AL</span>
            <span className="avatar avatar-purple">JM</span>
          </span>
          <small>2 assigned</small>
        </div>
      </td>
      <td>
        <StatusPill tone={statusTone(submission.status)}>
          {submission.status.replace("_", " ")}
        </StatusPill>
      </td>
      <td>
        {submission.status !== "accepted" && submission.status !== "declined" ? (
          <Button variant="ghost" onClick={onAccept} disabled={busy}>
            {busy ? <RefreshCw size={14} className="spin" /> : <Check size={14} />} Accept
          </Button>
        ) : (
          <Button variant="ghost" href={`/admin/submissions/${submission.id}`}>
            View
          </Button>
        )}
      </td>
    </tr>
  );
}

export function EvaluationsPage({ snapshot: initialSnapshot }: ProgramPageProps) {
  const [snapshot, setSnapshot] = useState(initialSnapshot);
  const [selectedId, setSelectedId] = useState(
    initialSnapshot.evaluatorAssignments.find((item) =>
      ["assigned", "in_progress"].includes(item.status),
    )?.submissionId ?? initialSnapshot.submissions[0]?.id,
  );
  const [score, setScore] = useState(4);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [note, setNote] = useState(
    "Strong fit for the security track; practical takeaways are clear.",
  );
  const selected = snapshot.submissions.find((item) => item.id === selectedId);
  const assignment = snapshot.evaluatorAssignments.find(
    (item) => item.submissionId === selected?.id,
  );
  const plan =
    snapshot.evaluationPlans.find((item) => item.id === assignment?.planId) ??
    snapshot.evaluationPlans[0];
  const round = snapshot.evaluationRounds.find((item) => item.id === assignment?.roundId);
  const criteria = snapshot.rubricCriteria.filter((item) => item.roundId === round?.id);
  async function saveReview(abstain = false) {
    if (!assignment) return;
    setSaving(true);
    setError(null);
    const response = await fetch("/api/evaluations/reviews", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        assignmentId: assignment.id,
        evaluatorId: assignment.evaluatorId,
        scores: abstain
          ? []
          : criteria.map((criterion, index) => ({
              criterionKey: criterion.key,
              score: index === 0 ? score : Math.max(1, score - index),
            })),
        comment: note,
        abstained: abstain,
        abstentionReason: abstain ? "Conflict of interest" : undefined,
      }),
    });
    const data = await response.json();
    if (response.ok) {
      setSnapshot(data.snapshot);
      setSaved(true);
    } else {
      setError(data.error ?? "Unable to save review");
    }
    setSaving(false);
  }
  return (
    <AppShell
      active="/admin/evaluations"
      eyebrow="Workspace · Evaluations"
      title="Make the next decision legible"
      description="Human review with enough structure to be consistent, and enough context to stay human."
      action={
        <Button variant="secondary" icon={<Plus size={14} />}>
          New evaluation plan
        </Button>
      }
    >
      <div className="stack">
        <div className="grid grid-4">
          <StatCard
            label="Active plan"
            value={plan?.name ?? "Main review"}
            detail={`${snapshot.evaluationRounds.filter((item) => item.planId === plan?.id).length} rounds configured`}
            tone="purple"
            icon={<BarChart3 size={16} />}
          />
          <StatCard
            label="Assigned"
            value={snapshot.evaluatorAssignments.length}
            detail="review assignments"
            tone="navy"
            icon={<Users size={16} />}
          />
          <StatCard
            label="Submitted"
            value={
              snapshot.evaluatorAssignments.filter((item) => item.status === "submitted").length
            }
            detail="reviews received"
            tone="teal"
            icon={<CheckCircle2 size={16} />}
          />
          <StatCard
            label="Abstentions"
            value={snapshot.reviews.filter((item) => item.abstained).length}
            detail="conflicts recorded"
            tone="orange"
            icon={<ShieldCheck size={16} />}
          />
        </div>
        <div className="grid-main">
          <Card>
            <SectionTitle
              title="Evaluator queue"
              description="Select a proposal to review. Identifying fields stay hidden for blind rounds."
            />
            <div className="evaluation-queue">
              {snapshot.evaluatorAssignments.map((item) => {
                const submission = snapshot.submissions.find(
                  (candidate) => candidate.id === item.submissionId,
                );
                if (!submission) return null;
                const evaluator = snapshot.evaluators.find(
                  (candidate) => candidate.id === item.evaluatorId,
                );
                return (
                  <button
                    type="button"
                    className={`queue-item ${selected?.id === submission.id ? "is-selected" : ""}`}
                    key={item.id}
                    onClick={() => {
                      setSelectedId(submission.id);
                      setSaved(false);
                      setError(null);
                    }}
                  >
                    <div className="queue-top">
                      <StatusPill
                        tone={
                          item.status === "submitted"
                            ? "green"
                            : item.status === "abstained"
                              ? "orange"
                              : "blue"
                        }
                      >
                        {item.status.replace("_", " ")}
                      </StatusPill>
                      <small>{evaluator?.name ?? "Evaluator"}</small>
                    </div>
                    <strong>{submission.title}</strong>
                    <span>
                      {submission.reviewQueue} · round {round?.roundNumber ?? 1}
                    </span>
                    <ChevronDown size={15} />
                  </button>
                );
              })}
            </div>
          </Card>
          <Card>
            <div className="card-header">
              <div>
                <div className="eyebrow">
                  {plan?.name ?? "Main review"} · {round?.name ?? "Round 1"}
                </div>
                <h2>{selected?.title ?? "Select a proposal"}</h2>
                <p>
                  {plan?.blindReview ? "Blind review · speaker identity hidden" : "Open review"}
                </p>
              </div>
              <StatusPill tone={assignment?.conflictOfInterest ? "orange" : "blue"}>
                {assignment?.conflictOfInterest ? "Conflict flagged" : "Assigned to you"}
              </StatusPill>
            </div>
            {selected ? (
              <div className="review-form">
                <div className="blind-summary">
                  <LockKeyhole size={14} />
                  <span>Blind submission view</span>
                  <span className="blind-line" />
                  <small>{selected.answers.category as string}</small>
                </div>
                <p className="review-abstract">{selected.answers.abstract as string}</p>
                <div className="rubric-list">
                  {criteria.map((criterion, index) => (
                    <div className="rubric-row" key={criterion.id}>
                      <div>
                        <strong>{criterion.label}</strong>
                        <small>
                          Weight {criterion.weight} · {criterion.maxScore} points
                        </small>
                      </div>
                      <select
                        className="field-inline-select"
                        value={index === 0 ? score : Math.max(1, score - index)}
                        onChange={(event) => setScore(Number(event.target.value))}
                      >
                        {Array.from({ length: criterion.maxScore + 1 }, (_, value) => (
                          <option key={value} value={value}>
                            {value}
                          </option>
                        ))}
                      </select>
                    </div>
                  ))}
                </div>
                <label className="field-label">
                  Private evaluator note
                  <textarea
                    className="textarea"
                    value={note}
                    onChange={(event) => setNote(event.target.value)}
                  />
                </label>
                <div className="review-actions">
                  <button
                    className="text-button"
                    type="button"
                    onClick={() => saveReview(true)}
                    disabled={saving || !assignment}
                  >
                    Abstain with conflict
                  </button>
                  <Button onClick={() => saveReview(false)} disabled={saving || !assignment}>
                    {saved ? (
                      <>
                        <Check size={14} /> Review saved
                      </>
                    ) : saving ? (
                      "Saving review"
                    ) : (
                      "Save review"
                    )}
                  </Button>
                </div>
                {error && <AlertBanner tone="warning">{error}</AlertBanner>}
                {saved && (
                  <AlertBanner tone="success">
                    Review saved to the local evaluation record. The human decision remains with the
                    organizer.
                  </AlertBanner>
                )}
              </div>
            ) : (
              <EmptyState
                title="Select a proposal"
                description="Your assigned queue is ready for review."
              />
            )}
          </Card>
        </div>
      </div>
    </AppShell>
  );
}

export function OnboardingPage({ snapshot: initialSnapshot }: ProgramPageProps) {
  const [snapshot, setSnapshot] = useState(initialSnapshot);
  const [query, setQuery] = useState("");
  const speakers = snapshot.speakers.filter((speaker) =>
    speaker.name.toLowerCase().includes(query.toLowerCase()),
  );
  const complete = snapshot.speakers.filter(
    (speaker) => completionForSpeaker(snapshot, speaker.id) === 100,
  ).length;
  const overdue = snapshot.taskAssignments.filter(
    (assignment) =>
      !assignment.completedAt &&
      snapshot.tasks.find((task) => task.id === assignment.taskId)?.required,
  ).length;
  async function completeTask(speakerId: string, taskId: string) {
    const response = await fetch(`/api/portal/${speakerId}`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ completeTaskId: taskId }),
    });
    const data = await response.json();
    if (response.ok) setSnapshot(data.snapshot);
  }
  return (
    <AppShell
      active="/admin/onboarding"
      eyebrow="Workspace · Speakers"
      title="Speaker onboarding"
      description="See the next blocker for every speaker, without opening twelve tabs."
      action={
        <Button variant="secondary" icon={<BellRing size={14} />}>
          Send reminder
        </Button>
      }
    >
      <div className="stack">
        <div className="grid grid-4">
          <StatCard
            label="Total speakers"
            value={snapshot.speakers.length}
            detail="10 accepted + co-speakers"
            tone="navy"
            icon={<Users size={16} />}
          />
          <StatCard
            label="Fully onboarded"
            value={complete}
            detail="ready for showtime"
            tone="teal"
            icon={<CheckCircle2 size={16} />}
          />
          <StatCard
            label="Outstanding work"
            value={snapshot.speakers.length - complete}
            detail="need a speaker touch"
            tone="orange"
            icon={<Clock3 size={16} />}
          />
          <StatCard
            label="Required overdue"
            value={overdue}
            detail="worth a follow-up"
            tone="purple"
            icon={<BellRing size={16} />}
          />
        </div>
        <Card>
          <div className="filter-row">
            <div className="search-input">
              <Search size={15} />
              <input
                className="input"
                placeholder="Search speakers"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
            </div>
            <button className="filter-chip is-selected">
              <Users size={13} /> All speakers
            </button>
            <button className="filter-chip">
              <Clock3 size={13} /> Needs action
            </button>
            <button className="filter-chip">
              <Filter size={13} /> Filters
            </button>
          </div>
          <TableShell>
            <thead>
              <tr>
                <th>Speaker</th>
                <th>Session</th>
                <th>Progress</th>
                <th>Next task</th>
                <th>Due</th>
                <th>
                  <span className="sr-only">Open</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {speakers.map((speaker) => {
                const progress = completionForSpeaker(snapshot, speaker.id);
                const next = snapshot.taskAssignments.find(
                  (assignment) => assignment.speakerId === speaker.id && !assignment.completedAt,
                );
                const task = snapshot.tasks.find((item) => item.id === next?.taskId);
                const session = snapshot.sessions.find((item) =>
                  item.speakerIds.includes(speaker.id),
                );
                return (
                  <tr key={speaker.id}>
                    <td>
                      <div className="person-cell">
                        <span
                          className={`avatar ${speaker.id === "speaker_1" ? "avatar-teal" : speaker.id === "speaker_2" ? "avatar-orange" : "avatar-purple"}`}
                        >
                          {initials(speaker.name)}
                        </span>
                        <div>
                          <span className="table-primary">{speaker.name}</span>
                          <span className="table-secondary">{speaker.company}</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="table-primary">
                        {session?.title ?? "No session assigned"}
                      </span>
                      <span className="table-secondary">{session?.status ?? "accepted"}</span>
                    </td>
                    <td>
                      <div className="onboarding-progress">
                        <ProgressBar value={progress} />
                        <strong>{progress}%</strong>
                      </div>
                    </td>
                    <td>
                      {task ? (
                        <button
                          className="task-action"
                          onClick={() => completeTask(speaker.id, task.id)}
                        >
                          <span className="task-checkbox" />
                          {task.title}
                        </button>
                      ) : (
                        <StatusPill tone="green">All clear</StatusPill>
                      )}
                    </td>
                    <td>
                      {task ? (
                        <span className="due-date">
                          {task.due.kind === "beforeEventStart" ? "Sep 01" : "Sep 08"}
                        </span>
                      ) : (
                        <span className="muted-copy">—</span>
                      )}
                    </td>
                    <td>
                      <Button variant="ghost" href={`/portal/${speaker.id}`}>
                        Open portal
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </TableShell>
        </Card>
        <AlertBanner tone="info">
          <strong>Live update ready:</strong>&nbsp; this view rehydrates from persisted records on
          each mutation. Production SSE/queue wiring remains an explicit deployment seam.
        </AlertBanner>
      </div>
    </AppShell>
  );
}

export function SchedulePage({ snapshot: initialSnapshot }: ProgramPageProps) {
  const [snapshot, setSnapshot] = useState(initialSnapshot);
  const [view, setView] = useState("Day");
  const [message, setMessage] = useState<{
    tone: "warning" | "success" | "info";
    text: string;
  } | null>(null);
  const unscheduled = snapshot.sessions.find(
    (session) => !snapshot.scheduleEntries.some((entry) => entry.sessionId === session.id),
  );
  const rooms = snapshot.rooms.slice(0, 4);
  const scheduled = snapshot.scheduleEntries.filter((entry) =>
    entry.start.startsWith("2026-09-15"),
  );
  async function placeSession(overrideReason?: string) {
    if (!unscheduled) return;
    const response = await fetch("/api/schedule", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        sessionId: unscheduled.id,
        roomId: rooms[0]?.id,
        start: "2026-09-15T17:30:00.000Z",
        end: "2026-09-15T18:15:00.000Z",
        overrideReason,
      }),
    });
    const data = await response.json();
    if (response.ok) {
      setSnapshot(data.snapshot);
      const activeConflicts = (data.conflicts ?? []).filter(
        (conflict: { overridden: boolean }) => !conflict.overridden,
      );
      if (activeConflicts.length)
        setMessage({
          tone: "warning",
          text: `${activeConflicts.length} conflicts detected. Choose an explicit override to keep this placement.`,
        });
      else
        setMessage({
          tone: "success",
          text: overrideReason
            ? "Session placed and persisted; conflicts recorded with an audit override."
            : "Session placed and persisted to the agenda.",
        });
    }
  }
  return (
    <AppShell
      active="/admin/schedule"
      eyebrow="Workspace · Schedule"
      title="Build the agenda with confidence"
      description="Place accepted sessions, catch conflicts before speakers do, and keep the public program in sync."
      action={
        <Button variant="secondary" icon={<CalendarCheck2 size={14} />}>
          Preview public schedule
        </Button>
      }
    >
      <div className="stack">
        <div className="schedule-toolbar">
          <div className="view-switcher">
            {["List", "Day", "Week", "Track", "Room"].map((item) => (
              <button
                key={item}
                className={view === item ? "is-selected" : ""}
                onClick={() => setView(item)}
              >
                {item}
              </button>
            ))}
          </div>
          <div className="schedule-toolbar-actions">
            <StatusPill tone={conflictCount(snapshot) ? "orange" : "green"}>
              {conflictCount(snapshot) ? `${conflictCount(snapshot)} conflicts` : "No conflicts"}
            </StatusPill>
            <Button variant="secondary" icon={<Filter size={14} />}>
              Filters
            </Button>
            <Button icon={<Check size={14} />}>Save changes</Button>
          </div>
        </div>
        {message && (
          <AlertBanner tone={message.tone}>
            {message.text}
            {message.tone === "warning" && (
              <button
                className="inline-action"
                onClick={() =>
                  placeSession(
                    "Organizer reviewed the deliberate speaker/room conflict in the demo.",
                  )
                }
              >
                Override with audit
              </button>
            )}
          </AlertBanner>
        )}
        <div className="schedule-layout">
          <Card>
            <SectionTitle
              title="September 15 · Day view"
              description={`${snapshot.events[0]?.timezone ?? "America/Los_Angeles"} · 4 rooms`}
              action={<span className="muted-copy">{view} view</span>}
            />
            <div className="schedule-grid">
              <div className="schedule-board">
                <div className="schedule-cell schedule-head">Time</div>
                {rooms.map((room) => (
                  <div className="schedule-cell schedule-head" key={room.id}>
                    {room.name}
                  </div>
                ))}
                {["5:00 PM", "5:15 PM", "6:00 PM", "7:00 PM"].map((time, row) => (
                  <Fragment key={`row-${time}`}>
                    <div className="schedule-cell time-cell">{time}</div>
                    {rooms.map((room, column) => {
                      const entry = scheduled.find(
                        (candidate) =>
                          candidate.roomId === room.id &&
                          ((row === 0 && candidate.start.includes("17:00")) ||
                            (row === 1 && candidate.start.includes("17:15")) ||
                            (row === 2 && candidate.start.includes("18:00")) ||
                            (row === 3 && candidate.start.includes("19:00"))),
                      );
                      const session = entry
                        ? snapshot.sessions.find((item) => item.id === entry.sessionId)
                        : null;
                      return (
                        <div className="schedule-cell" key={`${room.id}-${time}`}>
                          {session && (
                            <a
                              className={`schedule-event ${column === 2 ? "orange" : ""}`}
                              href={`/admin/submissions/${session.submissionId ?? session.id}`}
                            >
                              <strong>{session.title}</strong>
                              <small>
                                {formatTime(entry!.start)} · {room.name}
                              </small>
                            </a>
                          )}
                        </div>
                      );
                    })}
                  </Fragment>
                ))}
              </div>
            </div>
          </Card>
          <div className="stack">
            <Card>
              <SectionTitle
                title="Unscheduled tray"
                description="Accepted sessions ready to place."
              />
              {unscheduled ? (
                <div className="unscheduled-card">
                  <div className="session-art">
                    <Layers3 size={18} />
                  </div>
                  <div className="unscheduled-copy">
                    <strong>{unscheduled.title}</strong>
                    <small>
                      {unscheduled.speakerIds.length} speakers · {unscheduled.status}
                    </small>
                  </div>
                  <Button onClick={() => placeSession()} icon={<Plus size={14} />}>
                    Place
                  </Button>
                </div>
              ) : (
                <EmptyState
                  title="Agenda is covered"
                  description="There are no accepted sessions waiting for a time and room."
                />
              )}
            </Card>
            <Card>
              <SectionTitle
                title="Conflict watch"
                action={
                  <Button variant="ghost" href="/admin/schedule/conflicts">
                    Open panel
                  </Button>
                }
              />
              {conflictCount(snapshot) ? (
                <>
                  <div className="conflict-row">
                    <span className="conflict-icon">
                      <ShieldCheck size={15} />
                    </span>
                    <div>
                      <strong>Deliberate speaker overlap</strong>
                      <small>Session 1 · Session 2 · Main Hall</small>
                    </div>
                    <StatusPill tone="orange">Review</StatusPill>
                  </div>
                  <div className="conflict-row">
                    <span className="conflict-icon">
                      <CalendarDays size={15} />
                    </span>
                    <div>
                      <strong>Room capacity conflict</strong>
                      <small>Two sessions share Workshop B</small>
                    </div>
                    <StatusPill tone="red">Open</StatusPill>
                  </div>
                </>
              ) : (
                <EmptyState
                  title="No active conflicts"
                  description="The engine will flag room, speaker, moderator, and event-boundary overlaps here."
                />
              )}
            </Card>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

export function RoutingPage({ snapshot }: ProgramPageProps) {
  const [saved, setSaved] = useState(false);
  return (
    <AppShell
      active="/admin/routing"
      eyebrow="Configure · Routing"
      title="Make every proposal find its lane"
      description="Route by category and surface the reason, so nothing disappears between form submit and review."
      action={
        <Button onClick={() => setSaved(true)} icon={<Check size={14} />}>
          Save routing rules
        </Button>
      }
    >
      <div className="stack">
        {saved && (
          <AlertBanner tone="success">
            Routing rules saved. New submissions will use the same deterministic precedence on the
            server.
          </AlertBanner>
        )}
        <div className="grid-main">
          <Card>
            <SectionTitle
              title="Routing rules"
              description="Rules run in priority order. Ties are visible instead of silently overwriting one another."
            />
            <div className="rule-list">
              {snapshot.routingRules.map((rule, index) => (
                <div className="rule-row" key={rule.id}>
                  <span className="rule-priority">{String(rule.priority).padStart(2, "0")}</span>
                  <div className="rule-copy">
                    <strong>{rule.name}</strong>
                    <span>
                      If <b>{String(rule.conditions[0]?.fieldKey ?? "category")}</b> equals{" "}
                      <b>{String(rule.conditions[0]?.value ?? "any")}</b>
                    </span>
                  </div>
                  <ArrowRight size={15} />
                  <div className="rule-result">
                    <StatusPill tone="green">Assign</StatusPill>
                    <span>
                      {snapshot.categories.find(
                        (category) => category.id === rule.assignment.categoryId,
                      )?.name ?? "General"}{" "}
                      · {rule.assignment.reviewQueue}
                    </span>
                  </div>
                  <button className="icon-button" aria-label={`Edit ${rule.name}`}>
                    <MoreHorizontal size={16} />
                  </button>
                </div>
              ))}
              <div className="rule-row rule-fallback">
                <span className="rule-priority">—</span>
                <div className="rule-copy">
                  <strong>Default route</strong>
                  <span>When no higher-priority rule matches</span>
                </div>
                <ArrowRight size={15} />
                <div className="rule-result">
                  <StatusPill tone="purple">Fallback</StatusPill>
                  <span>Main program review</span>
                </div>
                <button className="icon-button" aria-label="Edit fallback">
                  <MoreHorizontal size={16} />
                </button>
              </div>
            </div>
            <Button variant="ghost" icon={<Plus size={14} />}>
              Add routing rule
            </Button>
          </Card>
          <div className="stack">
            <Card>
              <SectionTitle
                title="Route audit"
                description="Why the next submission will go where it goes."
              />
              <div className="route-audit">
                <div className="route-audit-step">
                  <span className="route-number">1</span>
                  <div>
                    <strong>Category selected</strong>
                    <small>Server validates the field against the published version.</small>
                  </div>
                </div>
                <div className="route-audit-step">
                  <span className="route-number">2</span>
                  <div>
                    <strong>Highest priority wins</strong>
                    <small>Conflicting same-priority rules stay in the audit log.</small>
                  </div>
                </div>
                <div className="route-audit-step">
                  <span className="route-number">3</span>
                  <div>
                    <strong>Queue and plan assigned</strong>
                    <small>Reviewers see the same route the organizer sees.</small>
                  </div>
                </div>
              </div>
            </Card>
            <AlertBanner tone="info">
              <strong>Safe default:</strong>&nbsp; no matching rule means “Main program review,”
              never an empty queue.
            </AlertBanner>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

export function CommunicationsPage({ snapshot }: ProgramPageProps) {
  const template = snapshot.templates[0];
  const [preview, setPreview] = useState(true);
  const [sent, setSent] = useState(false);
  return (
    <AppShell
      active="/admin/communications"
      eyebrow="Configure · Communications"
      title="Say the right thing at the right time"
      description="Reusable templates, clear variables, and a delivery log that makes every outbound action accountable."
      action={
        <Button onClick={() => setSent(true)} variant="secondary" icon={<Send size={14} />}>
          Send test preview
        </Button>
      }
    >
      <div className="stack">
        <div className="grid grid-3">
          <StatCard
            label="Templates"
            value={snapshot.templates.length}
            detail="ready to reuse"
            tone="navy"
            icon={<Mail size={16} />}
          />
          <StatCard
            label="Scheduled reminders"
            value={snapshot.reminderRules.length}
            detail="one local, one relative"
            tone="teal"
            icon={<BellRing size={16} />}
          />
          <StatCard
            label="Delivery log"
            value={snapshot.deliveryLogs.length}
            detail="log-only in demo mode"
            tone="purple"
            icon={<FileCheck2 size={16} />}
          />
        </div>
        {sent && (
          <AlertBanner tone="success">
            Test preview rendered locally. No email was sent; add an allowlisted recipient and
            provider before enabling live delivery.
          </AlertBanner>
        )}
        <div className="grid-main">
          <Card>
            <div className="card-header">
              <div>
                <div className="eyebrow">Template library</div>
                <h2>Acceptance</h2>
                <p>Reusable for accepted speakers and internal previews.</p>
              </div>
              <StatusPill tone="green">Validated</StatusPill>
            </div>
            <div className="template-editor">
              <label className="field-label">
                Subject
                <input
                  className="input"
                  defaultValue={template?.subject ?? "Accepted: {{session.title}}"}
                />
              </label>
              <label className="field-label">
                Body
                <textarea
                  className="textarea"
                  defaultValue={template?.body ?? "Hi {{speaker.name}}, welcome to {{event.name}}."}
                />
              </label>
              <div className="variable-row">
                <span className="muted-copy">Allowed variables</span>
                {(template?.allowedVariables ?? ["speaker.name", "event.name", "session.title"])
                  .slice(0, 5)
                  .map((variable) => (
                    <span className="variable-chip" key={variable}>{`{{${variable}}}`}</span>
                  ))}
              </div>
            </div>
            <div className="editor-actions">
              <Button variant="secondary">Save template</Button>
              <Button variant="ghost" onClick={() => setPreview((value) => !value)}>
                {preview ? "Hide preview" : "Show preview"}
              </Button>
            </div>
          </Card>
          <div className="stack">
            <Card>
              <SectionTitle
                title="Preview for Speaker 1"
                description="Variables resolve against a real seeded record."
              />
              <div className="message-preview">
                <div className="message-meta">
                  <span className="avatar avatar-teal">S1</span>
                  <div>
                    <strong>Speaker 1</strong>
                    <small>speaker1@example.test</small>
                  </div>
                  <StatusPill tone="blue">Preview</StatusPill>
                </div>
                {preview && (
                  <>
                    <div className="message-subject">
                      Accepted: Hardening Agentic Coding Workflows
                    </div>
                    <p>Hi Speaker 1, welcome to AI Engineer Sandbox Summit.</p>
                    <div className="message-footer">
                      <LockKeyhole size={13} /> Private preview · never delivered
                    </div>
                  </>
                )}
              </div>
            </Card>
            <Card>
              <SectionTitle
                title="Reminder queue"
                action={
                  <Button variant="ghost" href="/admin/communications/reminders">
                    Manage
                  </Button>
                }
              />
              {snapshot.reminderRules.map((rule) => (
                <div className="reminder-row" key={rule.id}>
                  <span className="reminder-icon">
                    <BellRing size={14} />
                  </span>
                  <div>
                    <strong>
                      {rule.target === "incomplete_required_tasks"
                        ? "Missing required work"
                        : "Selected speakers"}
                    </strong>
                    <small>{rule.schedule.kind.replaceAll("_", " ")}</small>
                  </div>
                  <StatusPill tone={rule.status === "active" ? "green" : "neutral"}>
                    {rule.status}
                  </StatusPill>
                </div>
              ))}
            </Card>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

export function IntegrationsPage() {
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<{
    plan: { operation: string; resource: string; count: number; reason: string }[];
    note: string;
  } | null>(null);
  async function runDryRun() {
    setRunning(true);
    const response = await fetch("/api/integrations/accelevents/dry-run", { method: "POST" });
    if (response.ok) setResult(await response.json());
    setRunning(false);
  }
  return (
    <AppShell
      active="/admin/integrations"
      eyebrow="Configure · Integrations"
      title="Connect only what you can verify"
      description="Every provider has a visible boundary. Dry-run planning is available now; live mutations need explicit sandbox credentials."
      action={
        <Button
          onClick={runDryRun}
          disabled={running}
          icon={running ? <RefreshCw size={14} className="spin" /> : <Play size={14} />}
        >
          {running ? "Planning" : "Run dry-run"}
        </Button>
      }
    >
      <div className="stack">
        <AlertBanner tone="warning">
          <strong>Live connectors are blocked:</strong>&nbsp; no Accelevents sandbox, Airtable base,
          or allowlisted email provider is configured in this workspace.
        </AlertBanner>
        <div className="grid grid-3">
          <Card>
            <div className="integration-card">
              <span className="integration-logo logo-accelevents">A</span>
              <div className="integration-copy">
                <strong>Accelevents</strong>
                <p>One-way speaker and session sync with dry-run diffs.</p>
                <StatusPill tone="orange">Dry-run only</StatusPill>
              </div>
            </div>
            <div className="integration-footer">
              <span>Credentials</span>
              <strong>Not configured</strong>
            </div>
            <Button variant="secondary" onClick={runDryRun} icon={<GitBranch size={14} />}>
              Plan sync
            </Button>
          </Card>
          <Card>
            <div className="integration-card">
              <span className="integration-logo logo-airtable">A</span>
              <div className="integration-copy">
                <strong>Airtable</strong>
                <p>Optional adapter for event-program persistence.</p>
                <StatusPill tone="neutral">Unconfigured</StatusPill>
              </div>
            </div>
            <div className="integration-footer">
              <span>Canonical state</span>
              <strong>Local snapshot</strong>
            </div>
            <Button variant="secondary" disabled>
              Validate connection
            </Button>
          </Card>
          <Card>
            <div className="integration-card">
              <span className="integration-logo logo-cloudflare">☁</span>
              <div className="integration-copy">
                <strong>Cloudflare</strong>
                <p>D1, R2, Queues, and Cron deployment seam.</p>
                <StatusPill tone="neutral">Unverified</StatusPill>
              </div>
            </div>
            <div className="integration-footer">
              <span>Runtime</span>
              <strong>Local Node</strong>
            </div>
            <Button variant="secondary" href="/healthz">
              Open health check
            </Button>
          </Card>
        </div>
        {result && (
          <Card>
            <SectionTitle
              title="Accelevents dry-run plan"
              description="Generated from the current persisted sandbox snapshot. External writes: 0."
            />
            <div className="dry-run-list">
              {result.plan.map((item) => (
                <div className="dry-run-row" key={`${item.operation}-${item.resource}`}>
                  <StatusPill
                    tone={
                      item.operation === "create"
                        ? "purple"
                        : item.operation === "update"
                          ? "blue"
                          : "green"
                    }
                  >
                    {item.operation}
                  </StatusPill>
                  <strong>{item.resource}</strong>
                  <span>
                    {item.count} record{item.count === 1 ? "" : "s"}
                  </span>
                  <small>{item.reason}</small>
                </div>
              ))}
            </div>
            <AlertBanner tone="info">{result.note}</AlertBanner>
          </Card>
        )}
      </div>
    </AppShell>
  );
}

export function SettingsPage({ snapshot }: ProgramPageProps) {
  const event = snapshot.events[0];
  const [saved, setSaved] = useState(false);
  return (
    <AppShell
      active="/admin/settings"
      eyebrow="Configure · Event settings"
      title="Event settings"
      description="The small set of choices every other program workflow inherits."
      action={
        <Button onClick={() => setSaved(true)} icon={<Check size={14} />}>
          Save settings
        </Button>
      }
    >
      <div className="stack">
        {saved && <AlertBanner tone="success">Settings saved to this demo workspace.</AlertBanner>}
        <div className="grid-main">
          <Card>
            <SectionTitle
              title="Event identity"
              description="Keep the event context visible and stable."
            />
            <div className="form-stack">
              <label className="field-label">
                Event name
                <input className="input" defaultValue={event?.name} />
              </label>
              <label className="field-label">
                Slug
                <input className="input" defaultValue={event?.slug} />
              </label>
              <label className="field-label">
                Description
                <textarea className="textarea" defaultValue={event?.description} />
              </label>
              <div className="grid grid-2">
                <label className="field-label">
                  Timezone
                  <select className="select" defaultValue={event?.timezone}>
                    <option>America/Los_Angeles</option>
                    <option>America/New_York</option>
                    <option>Europe/London</option>
                  </select>
                </label>
                <label className="field-label">
                  Default session length
                  <select className="select" defaultValue={event?.defaultSessionDurationMinutes}>
                    <option>30 minutes</option>
                    <option>45 minutes</option>
                    <option>60 minutes</option>
                  </select>
                </label>
              </div>
            </div>
          </Card>
          <div className="stack">
            <Card>
              <SectionTitle title="Event window" />
              <div className="metric-row">
                <span className="metric-label">Starts</span>
                <strong className="metric-value">
                  {event
                    ? formatDate(event.startDate, {
                        weekday: "short",
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                      })
                    : "—"}
                </strong>
              </div>
              <div className="metric-row">
                <span className="metric-label">Ends</span>
                <strong className="metric-value">
                  {event
                    ? formatDate(event.endDate, {
                        weekday: "short",
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                      })
                    : "—"}
                </strong>
              </div>
              <div className="metric-row">
                <span className="metric-label">Tracks</span>
                <strong className="metric-value">{snapshot.tracks.length}</strong>
              </div>
              <div className="metric-row">
                <span className="metric-label">Rooms</span>
                <strong className="metric-value">{snapshot.rooms.length}</strong>
              </div>
            </Card>
            <Card>
              <SectionTitle title="Data boundary" />
              <AlertBanner tone="info">
                This demo uses a local JSON snapshot behind the same storage port used by the D1
                seam. No production records are connected.
              </AlertBanner>
            </Card>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

function PublicTopbar() {
  return (
    <header className="public-topbar">
      <a href="/" className="public-brand">
        <span className="brand-glyph">
          <Layers3 size={16} />
        </span>{" "}
        ProgramLoom
      </a>
      <nav>
        <a href="/public/ai-engineer-sandbox-summit/schedule">Schedule</a>
        <a href="/public/ai-engineer-sandbox-summit/speakers">Speakers</a>
        <a href="/cfp/ai-engineer-sandbox-summit">Call for speakers</a>
        <a href="/admin">Organizer view</a>
      </nav>
      <span className="demo-pill">
        <span className="pulse-dot" /> Sandbox event
      </span>
    </header>
  );
}

export function PublicSchedulePage({ snapshot }: { snapshot: PublicProgramSnapshot }) {
  const [day, setDay] = useState("Sep 15");
  const [query, setQuery] = useState("");
  const sessions = snapshot.scheduleEntries
    .map((entry) => ({
      entry,
      session: snapshot.sessions.find((item) => item.id === entry.sessionId),
    }))
    .filter((item): item is { entry: PublicScheduleEntry; session: PublicSession } =>
      Boolean(
        item.session &&
          item.entry.published &&
          item.session.status === "published" &&
          item.session.title.toLowerCase().includes(query.toLowerCase()),
      ),
    );
  return (
    <>
      <PublicTopbar />
      <main className="public-wrap">
        <div className="public-hero">
          <div>
            <div className="eyebrow">AI Engineer Sandbox Summit · Public program</div>
            <h1>Two days of ideas worth making room for.</h1>
            <p>
              Talks, workshops, and practical conversations for people building the next generation
              of AI products.
            </p>
          </div>
          <div className="public-hero-aside">
            <strong>Event details</strong>
            <div className="metric-row">
              <span className="metric-label">Dates</span>
              <span className="metric-value">Sep 15–16, 2026</span>
            </div>
            <div className="metric-row">
              <span className="metric-label">Timezone</span>
              <span className="metric-value">America/Los_Angeles</span>
            </div>
            <div className="metric-row">
              <span className="metric-label">Format</span>
              <span className="metric-value">In person + live</span>
            </div>
          </div>
        </div>
        <div className="public-tabs">
          <button className="public-tab is-active">Schedule</button>
          <a className="public-tab" href="/public/ai-engineer-sandbox-summit/speakers">
            Speakers
          </a>
          <a className="public-tab" href="/cfp/ai-engineer-sandbox-summit">
            Submit a session
          </a>
        </div>
        <div className="public-toolbar">
          <div className="day-tabs">
            <button
              className={day === "Sep 15" ? "is-selected" : ""}
              onClick={() => setDay("Sep 15")}
            >
              Tue <strong>15</strong>
            </button>
            <button
              className={day === "Sep 16" ? "is-selected" : ""}
              onClick={() => setDay("Sep 16")}
            >
              Wed <strong>16</strong>
            </button>
          </div>
          <div className="search-input">
            <Search size={15} />
            <input
              className="input"
              placeholder="Search sessions"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </div>
        </div>
        <div className="public-schedule-list">
          {sessions
            .filter(({ entry }) =>
              day === "Sep 15"
                ? entry.start.includes("2026-09-15")
                : entry.start.includes("2026-09-16"),
            )
            .map(({ entry, session }) => {
              const room = snapshot.rooms.find((item) => item.id === entry.roomId);
              const track = snapshot.tracks.find((item) => item.id === session.trackId);
              return (
                <article className="public-session" key={entry.id}>
                  <time>
                    {formatTime(entry.start)}
                    <small>{formatTime(entry.end)}</small>
                  </time>
                  <div className="public-session-card">
                    <div className="public-session-top">
                      <StatusPill tone="green">{track?.name ?? "Program"}</StatusPill>
                      <span className="public-room">{room?.name ?? "Room"}</span>
                    </div>
                    <h2>{session.title}</h2>
                    <p>{session.description}</p>
                    <div className="public-session-bottom">
                      <span>
                        <UserRound size={13} />{" "}
                        {session.speakerIds
                          .map((id) => snapshot.speakers.find((speaker) => speaker.id === id)?.name)
                          .filter(Boolean)
                          .join(" + ")}
                      </span>
                      <a href={`/api/calendar/${session.id}`} className="calendar-link">
                        <CalendarDays size={13} /> iCal
                      </a>
                    </div>
                  </div>
                </article>
              );
            })}
          {sessions.length === 0 && (
            <EmptyState
              title="No public sessions match"
              description="Try another day or search term."
            />
          )}
        </div>
        <div className="public-footer-note">
          <ShieldCheck size={14} /> Public projection hides private speaker contact details,
          onboarding state, and internal notes.
        </div>
      </main>
    </>
  );
}

export function PublicSpeakersPage({ snapshot }: { snapshot: PublicProgramSnapshot }) {
  const [query, setQuery] = useState("");
  const speakers = snapshot.speakers
    .filter(
      (speaker) =>
        speaker.name.toLowerCase().includes(query.toLowerCase()) &&
        snapshot.sessions.some(
          (session) => session.status === "published" && session.speakerIds.includes(speaker.id),
        ),
    )
    .slice(0, 12);
  return (
    <>
      <PublicTopbar />
      <main className="public-wrap">
        <div className="public-hero public-hero-small">
          <div>
            <div className="eyebrow">AI Engineer Sandbox Summit · People</div>
            <h1>Meet the people building what’s next.</h1>
            <p>Practical voices across agents, safety, infrastructure, and design engineering.</p>
          </div>
        </div>
        <div className="public-tabs">
          <a className="public-tab" href="/public/ai-engineer-sandbox-summit/schedule">
            Schedule
          </a>
          <button className="public-tab is-active">Speakers</button>
          <a className="public-tab" href="/cfp/ai-engineer-sandbox-summit">
            Submit a session
          </a>
        </div>
        <div className="public-toolbar">
          <div>
            <strong>{speakers.length}</strong>
            <span className="muted-copy"> speakers on the public program</span>
          </div>
          <div className="search-input">
            <Search size={15} />
            <input
              className="input"
              placeholder="Search speakers"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </div>
        </div>
        <div className="grid grid-3 speaker-grid">
          {speakers.map((speaker) => {
            const session = snapshot.sessions.find(
              (item) => item.status === "published" && item.speakerIds.includes(speaker.id),
            );
            return (
              <article className="speaker-card" key={speaker.id}>
                <div
                  className={`speaker-photo ${speaker.id.endsWith("2") ? "photo-purple" : speaker.id.endsWith("3") ? "photo-orange" : ""}`}
                >
                  {initials(speaker.name)}
                </div>
                <div className="speaker-body">
                  <strong>{speaker.name}</strong>
                  <span className="table-secondary">
                    {speaker.title} · {speaker.company}
                  </span>
                  <p>{speaker.bio ?? "Speaker bio coming soon."}</p>
                  <div className="speaker-meta">
                    <CalendarDays size={12} /> {session?.title ?? "Program contributor"}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
        <div className="public-footer-note">
          <ShieldCheck size={14} /> Public profiles include approved identity and program
          information only.
        </div>
      </main>
    </>
  );
}

export function CfpPage() {
  const [format, setFormat] = useState("Workshop");
  const [submitted, setSubmitted] = useState<{
    title: string;
    id: string;
    replayed?: boolean;
  } | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setBusy(true);
    const form = new FormData(event.currentTarget);
    const response = await fetch("/api/submissions", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        title: form.get("title"),
        format,
        abstract: form.get("abstract"),
        category: form.get("category"),
        speakerName: form.get("speakerName"),
        speakerEmail: form.get("speakerEmail"),
        coSpeakerName: form.get("coSpeakerName") || undefined,
      }),
    });
    const data = await response.json();
    if (response.ok)
      setSubmitted({
        title: data.submission.title,
        id: data.submission.id,
        replayed: data.replayed,
      });
    else setError(data.error ?? "Unable to submit proposal");
    setBusy(false);
  }
  if (submitted)
    return (
      <>
        <PublicTopbar />
        <main className="public-wrap cfp-wrap">
          <div className="confirmation-card">
            <span className="confirmation-icon">
              <CheckCircle2 size={26} />
            </span>
            <div className="eyebrow">
              {submitted.replayed ? "Submission found" : "Submission received"}
            </div>
            <h1>
              {submitted.replayed ? "We already have this proposal." : "Your idea is in the room."}
            </h1>
            <p>
              <strong>{submitted.title}</strong> is saved in the ProgramLoom sandbox and routed to
              the {submitted.id.includes("security") ? "security" : "main"} review queue.
            </p>
            <div className="confirmation-id">
              <span>Confirmation ID</span>
              <code>{submitted.id}</code>
            </div>
            <div className="hero-actions">
              <Button href="/public/ai-engineer-sandbox-summit/schedule" variant="primary">
                Explore the program
              </Button>
              <Button href="/cfp/ai-engineer-sandbox-summit" variant="secondary">
                Submit another idea
              </Button>
            </div>
          </div>
        </main>
      </>
    );
  return (
    <>
      <PublicTopbar />
      <main className="public-wrap cfp-wrap">
        <div className="cfp-heading">
          <div className="eyebrow">Call for speakers · AI Engineer Sandbox Summit</div>
          <h1>Bring the session you wish existed.</h1>
          <p>
            We’re looking for honest, useful stories about building AI systems. Tell us what
            attendees will learn and how they’ll use it next week.
          </p>
          <div className="cfp-meta">
            <span>
              <Clock3 size={14} /> 8–45 minutes
            </span>
            <span>
              <Users size={14} /> Solo or co-speaker
            </span>
            <span>
              <LockKeyhole size={14} /> Saved as a draft on submit
            </span>
          </div>
        </div>
        <form className="cfp-form card card-padded" onSubmit={submit}>
          <div className="form-section-heading">
            <span className="form-step">01</span>
            <div>
              <h2>Your session</h2>
              <p>Start with the shape of the idea.</p>
            </div>
          </div>
          <div className="form-stack">
            <label className="field-label">
              Session title *
              <input
                className="input"
                name="title"
                required
                placeholder="e.g. Hardening agentic coding workflows"
              />
            </label>
            <div className="grid grid-2">
              <label className="field-label">
                Format *
                <select
                  className="select"
                  name="format"
                  value={format}
                  onChange={(event) => setFormat(event.target.value)}
                >
                  <option>Workshop</option>
                  <option>Talk</option>
                  <option>Panel</option>
                </select>
              </label>
              <label className="field-label">
                Category *
                <select className="select" name="category">
                  <option>Security</option>
                  <option>Design Engineering</option>
                  <option>Infrastructure</option>
                  <option>Research</option>
                </select>
              </label>
            </div>
            <label className="field-label">
              Abstract *
              <textarea
                className="textarea"
                name="abstract"
                required
                minLength={30}
                placeholder="What will people be able to do after this session?"
              />
              <small className="field-help">
                Aim for 2–4 paragraphs. We’ll use this to route your proposal.
              </small>
            </label>
            {format === "Workshop" && (
              <label className="field-label conditional-form-field">
                Hands-on requirements *
                <textarea
                  className="textarea"
                  name="handsOn"
                  required
                  placeholder="What should attendees bring or prepare?"
                />
                <small className="field-help">
                  <GitBranch size={12} /> This field appears because you selected Workshop.
                </small>
              </label>
            )}
            <label className="field-label">
              Supporting material
              <input className="input" name="file" type="file" />
              <small className="field-help">
                Optional · PDF, slides, or a link. Demo mode stores metadata only.
              </small>
            </label>
          </div>
          <div className="form-section-heading form-section-spaced">
            <span className="form-step">02</span>
            <div>
              <h2>Speaker details</h2>
              <p>We’ll use these details for review and onboarding.</p>
            </div>
          </div>
          <div className="form-stack">
            <div className="grid grid-2">
              <label className="field-label">
                Your name *
                <input className="input" name="speakerName" required placeholder="Alex Rivera" />
              </label>
              <label className="field-label">
                Email *
                <input
                  className="input"
                  name="speakerEmail"
                  type="email"
                  required
                  placeholder="alex@example.com"
                />
              </label>
            </div>
            <label className="field-label">
              Co-speaker name
              <input className="input" name="coSpeakerName" placeholder="Optional" />
            </label>
            <label className="checkbox-row">
              <input type="checkbox" required /> I’m happy for the team to contact me about this
              proposal.
            </label>
          </div>
          {error && <AlertBanner tone="warning">{error}</AlertBanner>}
          <div className="cfp-submit-row">
            <span className="muted-copy">
              <ShieldCheck size={13} /> Your proposal stays private during review.
            </span>
            <Button
              type="submit"
              disabled={busy}
              icon={busy ? <RefreshCw size={14} className="spin" /> : <ArrowRight size={14} />}
            >
              {busy ? "Saving" : "Submit proposal"}
            </Button>
          </div>
        </form>
      </main>
    </>
  );
}

export function PortalPage({
  snapshot: initialSnapshot,
  speakerId,
}: ProgramPageProps & { speakerId: string }) {
  const [snapshot, setSnapshot] = useState(initialSnapshot);
  const [saved, setSaved] = useState(false);
  const speaker = snapshot.speakers.find((item) => item.id === speakerId) ?? snapshot.speakers[0];
  const session = snapshot.sessions.find((item) => item.speakerIds.includes(speaker?.id ?? ""));
  const assignments = snapshot.taskAssignments.filter((item) => item.speakerId === speaker?.id);
  const required = snapshot.tasks.filter(
    (item) => item.required && assignments.some((assignment) => assignment.taskId === item.id),
  );
  const complete = required.filter(
    (task) => assignments.find((assignment) => assignment.taskId === task.id)?.completedAt,
  ).length;
  async function saveProfile(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const response = await fetch(`/api/portal/${speaker.id}`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        bio: form.get("bio"),
        company: form.get("company"),
        title: form.get("title"),
      }),
    });
    const data = await response.json();
    if (response.ok) {
      setSnapshot(data.snapshot);
      setSaved(true);
    }
  }
  async function upload(kind: "headshot" | "slides") {
    const response = await fetch(`/api/portal/${speaker.id}`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        file: {
          originalFilename: `${kind}-${speaker.id}.pdf`,
          contentType: kind === "headshot" ? "image/jpeg" : "application/pdf",
          sizeBytes: kind === "headshot" ? 240000 : 820000,
        },
      }),
    });
    const data = await response.json();
    if (response.ok) setSnapshot(data.snapshot);
  }
  async function markDone(taskId: string) {
    const response = await fetch(`/api/portal/${speaker.id}`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ completeTaskId: taskId }),
    });
    const data = await response.json();
    if (response.ok) setSnapshot(data.snapshot);
  }
  return (
    <>
      <PublicTopbar />
      <main className="portal-wrap">
        <div className="portal-header">
          <div>
            <div className="eyebrow">Speaker portal · secure demo link</div>
            <h1>Welcome, {speaker.name.split(" ")[0]}.</h1>
            <p>{snapshot.events[0]?.name} · Your program workspace</p>
          </div>
          <Button
            href="/public/ai-engineer-sandbox-summit/schedule"
            variant="secondary"
            icon={<Globe2 size={14} />}
          >
            View public program
          </Button>
        </div>
        <div className="portal-grid">
          <div className="stack">
            <Card>
              <div className="portal-session-head">
                <div>
                  <div className="eyebrow">Your session</div>
                  <h2>{session?.title ?? "Your session is being prepared"}</h2>
                  <p>{session?.description ?? "Your organizer will share details here."}</p>
                </div>
                <StatusPill tone="green">Accepted</StatusPill>
              </div>
              <div className="portal-session-meta">
                <span>
                  <CalendarDays size={14} /> Sep 15 · 5:00 PM
                </span>
                <span>
                  <Layers3 size={14} /> {snapshot.rooms[0]?.name}
                </span>
                <span>
                  <Users size={14} /> {session?.speakerIds.length ?? 1} speakers
                </span>
              </div>
            </Card>
            <Card>
              <SectionTitle
                title="Your profile"
                description="This is the information the public program can show."
                action={saved && <StatusPill tone="green">Saved</StatusPill>}
              />
              <form className="form-stack" onSubmit={saveProfile}>
                <div className="grid grid-2">
                  <label className="field-label">
                    Name
                    <input className="input" value={speaker.name} readOnly />
                  </label>
                  <label className="field-label">
                    Email
                    <input className="input" value={speaker.email} readOnly />
                  </label>
                </div>
                <div className="grid grid-2">
                  <label className="field-label">
                    Title
                    <input className="input" name="title" defaultValue={speaker.title} />
                  </label>
                  <label className="field-label">
                    Company
                    <input className="input" name="company" defaultValue={speaker.company} />
                  </label>
                </div>
                <label className="field-label">
                  Bio
                  <textarea className="textarea" name="bio" defaultValue={speaker.bio} />
                </label>
                <Button type="submit" icon={<Check size={14} />}>
                  Save profile
                </Button>
              </form>
            </Card>
          </div>
          <div className="stack">
            <Card>
              <SectionTitle
                title="Onboarding progress"
                description="Your required work, in one place."
              />
              <div className="portal-progress">
                <strong>{Math.round((complete / Math.max(required.length, 1)) * 100)}%</strong>
                <ProgressBar value={(complete / Math.max(required.length, 1)) * 100} />
              </div>
              <div className="portal-task-list">
                {snapshot.tasks.slice(0, 6).map((task) => {
                  const assignment = assignments.find((item) => item.taskId === task.id);
                  const done = Boolean(assignment?.completedAt);
                  return (
                    <div className={`portal-task ${done ? "is-done" : ""}`} key={task.id}>
                      <button
                        className="task-checkbox"
                        onClick={() => !done && assignment && markDone(task.id)}
                        aria-label={`${done ? "Completed" : "Complete"} ${task.title}`}
                      >
                        {done && <Check size={12} />}
                      </button>
                      <div>
                        <strong>{task.title}</strong>
                        <small>
                          {task.required ? "Required" : "Optional"} · due{" "}
                          {task.due.kind === "beforeEventStart" ? "Sep 01" : "Sep 08"}
                        </small>
                      </div>
                      {done ? (
                        <StatusPill tone="green">Done</StatusPill>
                      ) : task.required ? (
                        <StatusPill tone="orange">To do</StatusPill>
                      ) : (
                        <StatusPill>Optional</StatusPill>
                      )}
                    </div>
                  );
                })}
              </div>
            </Card>
            <Card>
              <SectionTitle
                title="Files & materials"
                description="Private by default, public only when approved."
              />
              <div className="upload-card">
                <span className="upload-icon">
                  <ImageIcon size={16} />
                </span>
                <div>
                  <strong>Headshot</strong>
                  <small>
                    {snapshot.files.some(
                      (file) =>
                        file.ownerId === speaker.id && file.contentType.startsWith("image/"),
                    )
                      ? "Uploaded · pending organizer approval"
                      : "JPG or PNG · up to 10 MB"}
                  </small>
                </div>
                <Button
                  variant="secondary"
                  onClick={() => upload("headshot")}
                  icon={<Upload size={14} />}
                >
                  Upload
                </Button>
              </div>
              <div className="upload-card">
                <span className="upload-icon upload-orange">
                  <FileText size={16} />
                </span>
                <div>
                  <strong>Slides or supporting docs</strong>
                  <small>Private to the event team</small>
                </div>
                <Button
                  variant="secondary"
                  onClick={() => upload("slides")}
                  icon={<Upload size={14} />}
                >
                  Upload
                </Button>
              </div>
            </Card>
            <Card>
              <SectionTitle title="Need a hand?" />
              <div className="support-row">
                <Headphones size={17} />
                <div>
                  <strong>Program team support</strong>
                  <small>Reply to your invitation or email program@programloom.local</small>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </main>
    </>
  );
}

export function EvaluatorDemoPage({ snapshot }: ProgramPageProps) {
  return (
    <AppShell
      active="/admin/evaluations"
      eyebrow="Evaluator demo"
      title="A focused review queue"
      description="This evaluator view keeps the rubric, blind context, and conflict path close at hand."
      action={
        <Button href="/admin/evaluations" variant="secondary">
          Open organizer view
        </Button>
      }
    >
      <div className="grid-main">
        <Card>
          <div className="reviewer-profile">
            <span className="avatar avatar-purple">PR</span>
            <div>
              <strong>Priya Reviewer</strong>
              <small>Security Review · Round 1</small>
            </div>
            <StatusPill tone="green">2 assigned</StatusPill>
          </div>
          <div className="reviewer-metrics">
            <div>
              <strong>1</strong>
              <small>to complete</small>
            </div>
            <div>
              <strong>1</strong>
              <small>submitted</small>
            </div>
            <div>
              <strong>1</strong>
              <small>conflict flagged</small>
            </div>
          </div>
          <div className="reviewer-next">
            <div className="eyebrow">Next proposal</div>
            <h2>{snapshot.submissions[0]?.title}</h2>
            <p>{snapshot.submissions[0]?.answers.abstract as string}</p>
            <Button href="/admin/evaluations" icon={<ArrowRight size={14} />}>
              Start review
            </Button>
          </div>
        </Card>
        <Card>
          <SectionTitle title="Review guardrails" />
          <div className="guardrail">
            <LockKeyhole size={15} />
            <div>
              <strong>Blind fields stay hidden</strong>
              <small>Speaker identity and email are removed from the evaluator view.</small>
            </div>
          </div>
          <div className="guardrail">
            <ShieldCheck size={15} />
            <div>
              <strong>Conflicts stay visible</strong>
              <small>Abstention is recorded and never treated as a zero score.</small>
            </div>
          </div>
          <div className="guardrail">
            <UserRound size={15} />
            <div>
              <strong>Humans decide</strong>
              <small>Scores inform the organizer; no automatic acceptance occurs.</small>
            </div>
          </div>
        </Card>
      </div>
    </AppShell>
  );
}

export function DemoCenterPage({ snapshot }: ProgramPageProps) {
  const [resetting, setResetting] = useState(false);
  const [receipt, setReceipt] = useState("");
  async function reset() {
    setResetting(true);
    const response = await fetch("/api/demo/reset", { method: "POST" });
    const data = await response.json();
    if (response.ok) setReceipt(data.receipt.fingerprint);
    setResetting(false);
  }
  const links = [
    {
      href: "/admin",
      label: "Admin overview",
      detail: "See program health and next actions",
      icon: <GaugeIcon />,
    },
    {
      href: "/admin/evaluations",
      label: "Evaluator demo",
      detail: "Score a seeded proposal with a rubric",
      icon: <BarChart3 size={18} />,
    },
    {
      href: "/portal/speaker_1",
      label: "Speaker portal",
      detail: "Complete tasks and update a profile",
      icon: <UserRound size={18} />,
    },
    {
      href: "/cfp/ai-engineer-sandbox-summit",
      label: "Public CFP",
      detail: "Submit a workshop with conditional logic",
      icon: <FileText size={18} />,
    },
    {
      href: "/public/ai-engineer-sandbox-summit/schedule",
      label: "Public program",
      detail: "Browse the published agenda",
      icon: <Globe2 size={18} />,
    },
    {
      href: "/api/docs",
      label: "API docs",
      detail: "Inspect the documented server boundary",
      icon: <Code2 size={18} />,
    },
  ];
  return (
    <AppShell
      eyebrow="Demo center"
      title="One workspace, six ways in"
      description="Use these entry points to walk the full ProgramLoom story. Reset returns the same deterministic event every time."
      action={
        <Button
          onClick={reset}
          disabled={resetting}
          icon={<RefreshCw size={14} className={resetting ? "spin" : ""} />}
        >
          {resetting ? "Resetting" : "Reset demo data"}
        </Button>
      }
    >
      <div className="stack">
        <div className="demo-banner">
          <div>
            <div className="eyebrow">Seeded event</div>
            <h2>AI Engineer Sandbox Summit</h2>
            <p>
              {snapshot.submissions.length} proposals · {snapshot.speakers.length} speakers ·{" "}
              {snapshot.sessions.length} sessions · {snapshot.tasks.length} onboarding tasks
            </p>
          </div>
          <div className="demo-fingerprint">
            <span>Seed fingerprint</span>
            <code>{receipt || "Deterministic on reset"}</code>
          </div>
        </div>
        {receipt && (
          <AlertBanner tone="success">
            Reset complete. Fingerprint recorded for this receipt.
          </AlertBanner>
        )}
        <div className="grid grid-3">
          {links.map((link) => (
            <a className="demo-entry-card" href={link.href} key={link.href}>
              <span className="demo-entry-icon">{link.icon}</span>
              <strong>{link.label}</strong>
              <p>{link.detail}</p>
              <ArrowRight size={15} />
            </a>
          ))}
        </div>
        <Card>
          <SectionTitle
            title="Judge journey"
            description="The shortest credible path through the product."
          />
          <div className="journey-grid">
            {[
              "Edit CFP logic",
              "Submit proposal",
              "Review + accept",
              "Complete portal",
              "Place session",
              "Publish program",
            ].map((label, index) => (
              <div className="journey-step" key={label}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <strong>{label}</strong>
                {index < 5 && <ArrowRight size={14} />}
              </div>
            ))}
          </div>
        </Card>
      </div>
    </AppShell>
  );
}

function GaugeIcon() {
  return <Gauge size={18} />;
}

export function ApiDocsPage() {
  const endpoints = [
    { method: "GET", path: "/api/healthz", description: "Runtime, storage, and provider status" },
    { method: "GET", path: "/api/snapshot", description: "Event-scoped demo snapshot" },
    {
      method: "POST",
      path: "/api/submissions",
      description: "Validate and route a public CFP proposal",
    },
    { method: "POST", path: "/api/demo/reset", description: "Reset only the demo event" },
    {
      method: "POST",
      path: "/api/schedule",
      description: "Save a schedule entry and return conflicts",
    },
    {
      method: "POST",
      path: "/api/integrations/accelevents/dry-run",
      description: "Plan a no-write sync diff",
    },
  ];
  return (
    <AppShell
      eyebrow="API & docs"
      title="An API boundary you can inspect"
      description="OpenAPI is part of the product contract, even while this competition build keeps auth and live providers explicit."
      action={
        <Button href="/api/openapi.json" variant="secondary" icon={<Code2 size={14} />}>
          Open JSON
        </Button>
      }
    >
      <div className="grid-main">
        <Card>
          <SectionTitle
            title="ProgramLoom API"
            description="Versioned, event-scoped, and safe to run against the sandbox."
          />
          <div className="endpoint-list">
            {endpoints.map((endpoint) => (
              <div className="endpoint-row" key={endpoint.path}>
                <span className={`method method-${endpoint.method.toLowerCase()}`}>
                  {endpoint.method}
                </span>
                <code>{endpoint.path}</code>
                <span>{endpoint.description}</span>
                <ArrowRight size={14} />
              </div>
            ))}
          </div>
        </Card>
        <div className="stack">
          <Card>
            <SectionTitle title="Example response" />
            <pre className="code-block">
              <span className="code-key">{`{`}</span>
              {"\n  "}
              <span className="code-key">"ok"</span>: true,{"\n  "}
              <span className="code-key">"mode"</span>: <span className="code-string">"demo"</span>,
              {"\n  "}
              <span className="code-key">"providers"</span>: {`{`}
              {"\n    "}
              <span className="code-key">"email"</span>:{" "}
              <span className="code-string">"log-only"</span>,{"\n    "}
              <span className="code-key">"accelevents"</span>:{" "}
              <span className="code-string">"dry-run-only"</span>
              {"\n  }\n"}
              <span className="code-key">{`}`}</span>
            </pre>
          </Card>
          <AlertBanner tone="info">
            <strong>Live boundary:</strong>&nbsp; the API reports blocked or unverified providers
            rather than implying deployment proof.
          </AlertBanner>
        </div>
      </div>
    </AppShell>
  );
}

export function LandingPage() {
  return (
    <main className="landing-page">
      <div className="landing-nav">
        <a className="brand-mark landing-brand" href="/">
          <span className="brand-glyph">
            <Layers3 size={17} />
          </span>
          ProgramLoom
        </a>
        <div className="landing-nav-links">
          <a href="/demo">Demo center</a>
          <a href="/public/ai-engineer-sandbox-summit/schedule">Public program</a>
          <a href="/api/docs">API docs</a>
          <Button href="/admin" variant="dark">
            Open workspace <ArrowRight size={14} />
          </Button>
        </div>
      </div>
      <section className="landing-hero">
        <div className="landing-hero-copy">
          <div className="eyebrow">Event program operations · open source</div>
          <h1>Make room for the work that makes an event matter.</h1>
          <p>
            ProgramLoom gives program teams one calm, observable path from call for speakers to a
            published agenda.
          </p>
          <div className="landing-actions">
            <Button href="/demo" variant="primary" icon={<Play size={14} fill="currentColor" />}>
              Enter the demo
            </Button>
            <Button
              href="/cfp/ai-engineer-sandbox-summit"
              variant="secondary"
              icon={<ArrowRight size={14} />}
            >
              Submit a session
            </Button>
          </div>
          <div className="landing-proof">
            <span>
              <CheckCircle2 size={14} /> Real local persistence
            </span>
            <span>
              <ShieldCheck size={14} /> No fake live claims
            </span>
            <span>
              <RefreshCw size={14} /> Resettable by design
            </span>
          </div>
        </div>
        <div className="landing-visual">
          <div className="visual-window">
            <div className="visual-window-bar">
              <span />
              <span />
              <span />
              <small>programloom / overview</small>
            </div>
            <div className="visual-window-content">
              <div className="visual-sidebar">
                <span className="visual-logo">
                  <Layers3 size={12} />
                </span>
                <i />
                <i />
                <i />
                <i />
              </div>
              <div className="visual-dashboard">
                <div className="visual-topline">
                  <span>Good morning, Chris</span>
                  <em>Demo mode</em>
                </div>
                <div className="visual-hero-line">
                  <div>
                    <small>AI ENGINEER SANDBOX SUMMIT</small>
                    <strong>The calm center for your event program.</strong>
                  </div>
                  <div className="visual-readiness">
                    <small>PROGRAM READINESS</small>
                    <b>72%</b>
                    <div>
                      <i />
                    </div>
                  </div>
                </div>
                <div className="visual-stats">
                  <span>
                    <small>NEEDS REVIEW</small>
                    <b>4</b>
                  </span>
                  <span>
                    <small>ONBOARDING</small>
                    <b>76%</b>
                  </span>
                  <span>
                    <small>RISKS</small>
                    <b>2</b>
                  </span>
                </div>
                <div className="visual-table">
                  <small>SUBMISSIONS NEEDING A DECISION</small>
                  <div>
                    <b>Hardening Agentic Coding Workflows</b>
                    <i>Accepted</i>
                  </div>
                  <div>
                    <b>Eval Suites That Survive Product Drift</b>
                    <i>In review</i>
                  </div>
                  <div>
                    <b>Local Models for Event Ops</b>
                    <i>Waitlisted</i>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="visual-float visual-float-one">
            <CheckCircle2 size={15} />
            <span>Speaker portal updated</span>
            <b>just now</b>
          </div>
          <div className="visual-float visual-float-two">
            <CalendarCheck2 size={15} />
            <span>Conflict detected</span>
            <b>needs a decision</b>
          </div>
        </div>
      </section>
      <section className="landing-section">
        <div className="landing-section-heading">
          <div className="eyebrow">One program, one source of truth</div>
          <h2>Every handoff gets a home.</h2>
          <p>
            ProgramLoom keeps the operational details close enough to act on, and clear enough to
            trust.
          </p>
        </div>
        <div className="landing-features">
          <Feature
            icon={<FileText size={18} />}
            title="Collect"
            text="Conditional CFPs capture the context reviewers actually need."
          />
          <Feature
            icon={<BarChart3 size={18} />}
            title="Decide"
            text="Rubrics, conflicts, and human decisions stay visible in one queue."
          />
          <Feature
            icon={<Users size={18} />}
            title="Onboard"
            text="Speakers know what is next, while organizers see what is blocked."
          />
          <Feature
            icon={<CalendarDays size={18} />}
            title="Publish"
            text="A canonical agenda flows to the public program and calendar artifacts."
          />
        </div>
      </section>
      <footer className="landing-footer">
        <span>ProgramLoom · a resettable event program workspace</span>
        <span>
          <a href="/demo">Demo</a>
          <a href="/api/docs">API</a>
          <a href="/admin">Workspace</a>
        </span>
      </footer>
    </main>
  );
}

function Feature({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) {
  return (
    <div className="landing-feature">
      <span>{icon}</span>
      <h3>{title}</h3>
      <p>{text}</p>
    </div>
  );
}
