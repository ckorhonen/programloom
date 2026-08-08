import type { CommunicationTemplate } from "./types";

const variablePattern = /\{\{\s*([a-zA-Z0-9_.-]+)\s*\}\}/g;

export interface RenderedTemplate {
  subject: string;
  body: string;
  variables: string[];
}

export function extractTemplateVariables(
  template: Pick<CommunicationTemplate, "subject" | "body">,
): string[] {
  const found = new Set<string>();
  for (const source of [template.subject, template.body]) {
    for (const match of source.matchAll(variablePattern)) {
      found.add(match[1]);
    }
  }
  return [...found].sort();
}

export function validateTemplateVariables(template: CommunicationTemplate): string[] {
  const allowed = new Set(template.allowedVariables);
  return extractTemplateVariables(template).filter((variable) => !allowed.has(variable));
}

export function renderTemplate(
  template: CommunicationTemplate,
  variables: Record<string, string>,
): RenderedTemplate {
  const unknown = validateTemplateVariables(template);
  if (unknown.length > 0) {
    throw new Error(`Unknown template variables: ${unknown.join(", ")}`);
  }
  const missing = template.allowedVariables.filter(
    (variable) => extractTemplateVariables(template).includes(variable) && !(variable in variables),
  );
  if (missing.length > 0) {
    throw new Error(`Missing template variables: ${missing.join(", ")}`);
  }
  const replace = (source: string) =>
    source.replace(variablePattern, (_, key: string) => variables[key]);
  return {
    subject: replace(template.subject),
    body: replace(template.body),
    variables: extractTemplateVariables(template),
  };
}
