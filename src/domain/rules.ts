import type { ConditionalRule, FormField, RuleCondition } from "./types";

export interface FieldEvaluation {
  field: FormField;
  visible: boolean;
  required: boolean;
}

export interface ConditionalEvaluation {
  fields: FieldEvaluation[];
  sanitizedAnswers: Record<string, unknown>;
}

export function evaluateCondition(
  condition: RuleCondition,
  answers: Record<string, unknown>,
): boolean {
  const actual = answers[condition.fieldKey];
  switch (condition.operator) {
    case "equals":
      return actual === condition.value;
    case "notEquals":
      return actual !== condition.value;
    case "contains":
      return Array.isArray(actual)
        ? actual.includes(condition.value)
        : String(actual ?? "").includes(String(condition.value ?? ""));
    case "in":
      return Array.isArray(condition.value) && condition.value.includes(actual);
    case "exists":
      return actual !== undefined && actual !== null && actual !== "";
    case "gt":
      return Number(actual) > Number(condition.value);
    case "gte":
      return Number(actual) >= Number(condition.value);
    case "lt":
      return Number(actual) < Number(condition.value);
    case "lte":
      return Number(actual) <= Number(condition.value);
  }
}

export function conditionsMatch(
  conditions: RuleCondition[],
  answers: Record<string, unknown>,
): boolean {
  return conditions.every((condition) => evaluateCondition(condition, answers));
}

export function evaluateConditionalRules(
  fields: FormField[],
  rules: ConditionalRule[],
  answers: Record<string, unknown>,
): ConditionalEvaluation {
  const evaluations = new Map<string, FieldEvaluation>();
  for (const field of fields) {
    evaluations.set(field.key, { field, visible: true, required: field.required });
  }

  const sortedRules = [...rules].sort(
    (a, b) => (a.priority ?? 0) - (b.priority ?? 0) || a.id.localeCompare(b.id),
  );
  for (const rule of sortedRules) {
    if (!conditionsMatch(rule.conditions, answers)) continue;
    const current = evaluations.get(rule.targetFieldKey);
    if (!current) continue;
    evaluations.set(rule.targetFieldKey, {
      ...current,
      visible: rule.action.visible ?? current.visible,
      required: rule.action.required ?? current.required,
    });
  }

  const sanitizedAnswers: Record<string, unknown> = {};
  for (const evaluation of evaluations.values()) {
    if (evaluation.visible && Object.prototype.hasOwnProperty.call(answers, evaluation.field.key)) {
      sanitizedAnswers[evaluation.field.key] = answers[evaluation.field.key];
    }
  }

  return { fields: [...evaluations.values()], sanitizedAnswers };
}
