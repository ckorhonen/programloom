import { calculateDueDate, localTimeToUtc } from "./time";
import type {
  EventConfig,
  ReminderRule,
  ScheduledMessage,
  Speaker,
  TaskAssignment,
  PortalTask,
} from "./types";

export function buildScheduledMessages(params: {
  event: EventConfig;
  rule: ReminderRule;
  tasks: PortalTask[];
  assignments: TaskAssignment[];
  speakers: Speaker[];
  now: string;
}): ScheduledMessage[] {
  if (params.rule.status === "cancelled") return [];
  const targetSpeakerIds = resolveReminderTargetSpeakerIds(
    params.rule,
    params.assignments,
    params.speakers,
  );
  const scheduledFor = resolveScheduledFor(params.event, params.rule, params.tasks);
  return targetSpeakerIds.map((speakerId) => ({
    id: `scheduled_${params.rule.id}_${speakerId}`,
    eventId: params.event.id,
    reminderRuleId: params.rule.id,
    templateId: params.rule.templateId,
    targetType: "speaker",
    targetId: speakerId,
    scheduledFor: scheduledFor ?? params.now,
    status: "pending",
    idempotencyKey: `${params.event.id}:${params.rule.id}:${speakerId}:${scheduledFor ?? params.now}`,
  }));
}

export function cancelScheduledMessages(
  messages: ScheduledMessage[],
  reminderRuleId: string,
): ScheduledMessage[] {
  return messages.map((message) =>
    message.reminderRuleId === reminderRuleId && message.status === "pending"
      ? { ...message, status: "cancelled" }
      : message,
  );
}

function resolveReminderTargetSpeakerIds(
  rule: ReminderRule,
  assignments: TaskAssignment[],
  speakers: Speaker[],
): string[] {
  if (rule.target === "selected_speakers") return [...new Set(rule.targetIds ?? [])].sort();
  const incompleteRequired = new Set(
    assignments
      .filter((assignment) => !assignment.completedAt)
      .map((assignment) => assignment.speakerId),
  );
  return speakers
    .map((speaker) => speaker.id)
    .filter((speakerId) => incompleteRequired.has(speakerId))
    .sort();
}

function resolveScheduledFor(
  event: EventConfig,
  rule: ReminderRule,
  tasks: PortalTask[],
): string | undefined {
  const schedule = rule.schedule;
  if (schedule.kind === "send_now") return undefined;
  if (schedule.kind === "once") return localTimeToUtc(schedule.localDateTime, event.timezone);
  const task = tasks.find((item) => item.id === schedule.taskId);
  if (!task) throw new Error(`Reminder task not found: ${schedule.taskId}`);
  const due = new Date(calculateDueDate(task.due, event));
  due.setUTCDate(due.getUTCDate() - schedule.daysBefore);
  return localTimeToUtc(
    `${due.toISOString().slice(0, 10)}T${String(schedule.hour).padStart(2, "0")}:${String(schedule.minute).padStart(2, "0")}`,
    event.timezone,
  );
}
