import { conditionsMatch } from "./rules";
import type { RoutingAssignment, RoutingRule } from "./types";

export interface RoutingResult {
  assignment: RoutingAssignment;
  matchedRuleIds: string[];
  conflictRuleIds: string[];
  policy: "fallback" | "single" | "highest-priority";
}

const emptyAssignment = (): RoutingAssignment => ({ tags: [] });

export function resolveRouting(
  rules: RoutingRule[],
  answers: Record<string, unknown>,
  fallback: RoutingAssignment = emptyAssignment(),
): RoutingResult {
  const matches = rules.filter((rule) => conditionsMatch(rule.conditions, answers));
  if (matches.length === 0) {
    return {
      assignment: normalizeAssignment(fallback),
      matchedRuleIds: [],
      conflictRuleIds: [],
      policy: "fallback",
    };
  }

  const sorted = matches.sort((a, b) => b.priority - a.priority || a.id.localeCompare(b.id));
  const winner = sorted[0];
  const samePriority = sorted.filter((rule) => rule.priority === winner.priority);
  const conflictRuleIds = samePriority
    .filter(
      (rule) => rule.id !== winner.id && assignmentsDiffer(rule.assignment, winner.assignment),
    )
    .map((rule) => rule.id);

  return {
    assignment: normalizeAssignment({
      ...winner.assignment,
      tags: unique([...(fallback.tags ?? []), ...(winner.assignment.tags ?? [])]),
    }),
    matchedRuleIds: sorted.map((rule) => rule.id),
    conflictRuleIds,
    policy: matches.length === 1 ? "single" : "highest-priority",
  };
}

function normalizeAssignment(assignment: RoutingAssignment): RoutingAssignment {
  return { ...assignment, tags: unique(assignment.tags ?? []) };
}

function assignmentsDiffer(left: RoutingAssignment, right: RoutingAssignment): boolean {
  return JSON.stringify(normalizeAssignment(left)) !== JSON.stringify(normalizeAssignment(right));
}

function unique(values: string[]): string[] {
  return [...new Set(values)].sort();
}
