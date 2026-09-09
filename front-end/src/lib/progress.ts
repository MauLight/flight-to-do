import type { PlanStep, Subject } from "../data/plans";

/**
 * Which sub-actions and documents are checked, held as a flat set of composite
 * keys so a toggle is one insertion or deletion rather than a nested rebuild.
 * The leading segment keeps the two kinds apart: a sub-action and a document
 * can share an id within the same step.
 */
export type Progress = ReadonlySet<string>;

export const emptyProgress: Progress = new Set<string>();

export function subActionKey(
  subject: Subject,
  stepId: number,
  subActionId: number
): string {
  return `sub:${subject}:${stepId}:${subActionId}`;
}

export function documentKey(
  subject: Subject,
  stepId: number,
  documentId: number
): string {
  return `doc:${subject}:${stepId}:${documentId}`;
}

export function isSubActionChecked(
  progress: Progress,
  subject: Subject,
  stepId: number,
  subActionId: number
): boolean {
  return progress.has(subActionKey(subject, stepId, subActionId));
}

export function isDocumentChecked(
  progress: Progress,
  subject: Subject,
  stepId: number,
  documentId: number
): boolean {
  return progress.has(documentKey(subject, stepId, documentId));
}

function toggleKey(progress: Progress, key: string): Progress {
  const next = new Set(progress);

  if (next.has(key)) {
    next.delete(key);
  } else {
    next.add(key);
  }

  return next;
}

export function toggleSubAction(
  progress: Progress,
  subject: Subject,
  stepId: number,
  subActionId: number
): Progress {
  return toggleKey(progress, subActionKey(subject, stepId, subActionId));
}

export function toggleDocument(
  progress: Progress,
  subject: Subject,
  stepId: number,
  documentId: number
): Progress {
  return toggleKey(progress, documentKey(subject, stepId, documentId));
}

/**
 * A step is completed only when every one of its sub-actions is checked.
 * Documents are tracked but deliberately do not count toward this.
 */
export function isStepCompleted(
  progress: Progress,
  subject: Subject,
  step: PlanStep
): boolean {
  for (const subAction of step.sub_actions) {
    if (!progress.has(subActionKey(subject, step.id, subAction.id))) {
      return false;
    }
  }

  return true;
}
