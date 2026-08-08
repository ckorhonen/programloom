import { calculateDueDate, isOverdue } from "./time";
import type { EventConfig, PortalFormResponse, PortalTask, Speaker, TaskAssignment } from "./types";

export interface OnboardingSummary {
  speakerId: string;
  requiredTotal: number;
  requiredComplete: number;
  optionalTotal: number;
  optionalComplete: number;
  overdueRequired: string[];
  complete: boolean;
}

export function completeTaskAssignment(
  assignment: TaskAssignment,
  completedAt: string,
): TaskAssignment {
  return { ...assignment, completedAt };
}

export function completeLinkedTaskFromFormResponse(
  assignments: TaskAssignment[],
  response: PortalFormResponse,
  submittedAt: string = response.submittedAt,
): TaskAssignment[] {
  if (!response.linkedTaskId) return assignments;
  return assignments.map((assignment) =>
    assignment.taskId === response.linkedTaskId && assignment.speakerId === response.speakerId
      ? completeTaskAssignment(assignment, submittedAt)
      : assignment,
  );
}

export function summarizeOnboarding(params: {
  event: EventConfig;
  speaker: Speaker;
  tasks: PortalTask[];
  assignments: TaskAssignment[];
  now: string;
  acceptedAt?: string;
}): OnboardingSummary {
  const speakerAssignments = params.assignments.filter(
    (assignment) => assignment.speakerId === params.speaker.id,
  );
  const assignedTasks = speakerAssignments
    .map((assignment) => ({
      assignment,
      task: params.tasks.find((task) => task.id === assignment.taskId),
    }))
    .filter((item): item is { assignment: TaskAssignment; task: PortalTask } => Boolean(item.task));

  const required = assignedTasks.filter((item) => item.task.required);
  const optional = assignedTasks.filter((item) => !item.task.required);
  const overdueRequired = required
    .filter((item) => !item.assignment.completedAt)
    .filter((item) =>
      isOverdue(calculateDueDate(item.task.due, params.event, params.acceptedAt), params.now),
    )
    .map((item) => item.task.id)
    .sort();

  const requiredComplete = required.filter((item) => item.assignment.completedAt).length;
  return {
    speakerId: params.speaker.id,
    requiredTotal: required.length,
    requiredComplete,
    optionalTotal: optional.length,
    optionalComplete: optional.filter((item) => item.assignment.completedAt).length,
    overdueRequired,
    complete: required.length > 0 && requiredComplete === required.length,
  };
}
