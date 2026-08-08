import type {
  AuditEntry,
  Session,
  Speaker,
  StatusTransition,
  Submission,
  SubmissionStatus,
} from "./types";

const allowedTransitions: Record<SubmissionStatus, SubmissionStatus[]> = {
  draft: ["submitted"],
  submitted: ["in_review", "accepted", "waitlisted", "declined"],
  in_review: ["accepted", "waitlisted", "declined"],
  accepted: ["waitlisted", "declined"],
  waitlisted: ["accepted", "declined"],
  declined: ["waitlisted"],
};

export interface StatusTransitionResult {
  submission: Submission;
  audit: AuditEntry;
  session?: Session;
  speakers: Speaker[];
}

export function transitionSubmissionStatus(
  submission: Submission,
  transition: StatusTransition,
  speakers: Speaker[],
): StatusTransitionResult {
  if (submission.status !== transition.from) {
    throw new Error(`Submission is ${submission.status}, not ${transition.from}`);
  }
  if (!allowedTransitions[transition.from].includes(transition.to)) {
    throw new Error(`Invalid submission transition ${transition.from} -> ${transition.to}`);
  }

  const updatedSubmission: Submission = {
    ...submission,
    status: transition.to,
    updatedAt: transition.at,
  };
  const audit: AuditEntry = {
    id: `audit_${submission.id}_${transition.to}_${transition.at}`,
    eventId: submission.eventId,
    actorId: transition.actorId,
    action: `submission.${transition.to}`,
    targetType: "submission",
    targetId: submission.id,
    at: transition.at,
    detail: { from: transition.from, to: transition.to, reason: transition.reason },
  };

  if (transition.to !== "accepted") {
    return { submission: updatedSubmission, audit, speakers };
  }

  const session: Session = {
    id: `session_${submission.id}`,
    eventId: submission.eventId,
    title: submission.title,
    description: String(submission.answers.abstract ?? submission.answers.description ?? ""),
    status: "accepted",
    submissionId: submission.id,
    speakerIds: submission.speakerIds,
    trackId: submission.trackCandidateId,
  };

  return { submission: updatedSubmission, audit, session, speakers };
}
