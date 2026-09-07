import type { PlanStep, Subject } from "../data/plans";

/**
 * Which sub-actions are checked, held as a flat set of composite keys so a
 * toggle is one insertion or deletion rather than a nested rebuild.
 */
export type Progress = ReadonlySet<string>;

export const emptyProgress: Progress = new Set<string>();

export function subActionKey(
  subject: Subject,
  stepId: number,
  subActionId: number
): string {
  return `${subject}:${stepId}:${subActionId}`;
}

export function isSubActionChecked(
  progress: Progress,
  subject: Subject,
  stepId: number,
  subActionId: number
): boolean {
  return progress.has(subActionKey(subject, stepId, subActionId));
}

export function toggleSubAction(
  progress: Progress,
  subject: Subject,
  stepId: number,
  subActionId: number
): Progress {
  const key = subActionKey(subject, stepId, subActionId);
  const next = new Set(progress);

  if (next.has(key)) {
    next.delete(key);
  } else {
    next.add(key);
  }

  return next;
}

/** A step is completed only when every one of its sub-actions is checked. */
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
