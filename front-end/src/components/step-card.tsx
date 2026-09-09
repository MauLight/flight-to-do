import { useState } from "react";
import type { Actor, Blocker, PlanStep, Subject } from "../data/plans";
import { desktopBridge } from "../lib/desktop";
import {
  isDocumentChecked,
  isSubActionChecked,
  type Progress,
} from "../lib/progress";
import { CollapsibleSection } from "./collapsible-section";
import { DocumentRow } from "./document-row";
import { SubActionRow } from "./sub-action-row";

type StepCardProps = {
  step: PlanStep;
  subject: Subject;
  progress: Progress;
  onToggleSubAction: (stepId: number, subActionId: number) => void;
  onToggleDocument: (stepId: number, documentId: number) => void;
};

function renderBlocker(blocker: Blocker) {
  return <li key={blocker.id}>{blocker.desc}</li>;
}

const PLAN_LABEL: Record<Subject, string> = {
  human: "human plan",
  cat: "cat plan",
};

/**
 * The message is sent with parse_mode HTML, so every piece of plan text has to
 * be escaped before it goes in. Telegram rejects the whole message on a stray
 * tag, and the data does contain ampersands — "Check-in & Security at KZN".
 */
function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

/**
 * What a reminder reads like in the chat.
 *
 * Built here rather than in the row because the row knows only its own line —
 * which plan and which step it belongs to lives at this level, and a reminder
 * without that context is unreadable out of the app.
 *
 * `actor` is passed in rather than derived from the subject. The subject says
 * which plan a step belongs to, not who does the work: every step of the cat
 * plan is somebody's job too, and within a single step the actors differ — human
 * step 1 is Mau's except for its last sub-action, which is Elvira's.
 */
function reminderFor(
  step: PlanStep,
  subject: Subject,
  actor: Actor,
  line: string,
  completed = false,
): string {
  const header = `STEP - ${step.step} ${actor} (${PLAN_LABEL[subject]})`;

  return [
    completed ? `✅ COMPLETED — ${header}` : header,
    `<b>${escapeHtml(step.action)}</b>`,
    "",
    escapeHtml(line),
  ].join("\n");
}

export function StepCard({
  step,
  subject,
  progress,
  onToggleSubAction,
  onToggleDocument,
}: StepCardProps) {
  const [notice, setNotice] = useState<string | null>(null);

  /**
   * Checking an action announces it; unchecking says nothing.
   *
   * The toggle is applied first and never waits on the send. Telegram is not
   * reachable offline, and a checklist that refuses to record a done step
   * because a message failed would be worse than useless at an airport — so the
   * send is fire-and-forget and only its failure is reported.
   */
  function handleToggleSubAction(subActionId: number) {
    const wasChecked = isSubActionChecked(
      progress,
      subject,
      step.id,
      subActionId,
    );

    onToggleSubAction(step.id, subActionId);

    if (wasChecked) {
      return;
    }

    const subAction = step.sub_actions.find(
      (candidate) => candidate.id === subActionId,
    );
    const bridge = desktopBridge();

    if (subAction === undefined || bridge === null) {
      return;
    }

    setNotice(null);

    bridge.telegram
      .send(reminderFor(step, subject, subAction.actor, subAction.action, true))
      .catch((caught: unknown) => {
        setNotice(
          caught instanceof Error
            ? `Checked, but Telegram wasn't told: ${caught.message}`
            : "Checked, but the Telegram message failed.",
        );
      });
  }

  /** Same rules as an action: only on checking, and never gating the toggle. */
  function handleToggleDocument(documentId: number) {
    const wasChecked = isDocumentChecked(
      progress,
      subject,
      step.id,
      documentId,
    );

    onToggleDocument(step.id, documentId);

    if (wasChecked) {
      return;
    }

    const document = step.documents.find(
      (candidate) => candidate.id === documentId,
    );
    const bridge = desktopBridge();

    if (document === undefined || bridge === null) {
      return;
    }

    setNotice(null);

    bridge.telegram
      .send(
        reminderFor(
          step,
          subject,
          step.actor,
          `Got: ${document.name} (${document.who_issues})`,
          true,
        ),
      )
      .catch((caught: unknown) => {
        setNotice(
          caught instanceof Error
            ? `Checked, but Telegram wasn't told: ${caught.message}`
            : "Checked, but the Telegram message failed.",
        );
      });
  }

  return (
    <div className="grid gap-y-8">
      <div className="grid gap-y-1">
        <div className="text-xl uppercase tracking-wide text-blue-300">
          Step {step.step}
        </div>

        <h3 className="text-lg font-medium">
          {step.actor} — {step.action}
        </h3>

        <p className="text-sm leading-relaxed text-[#dedede] mt-3">
          {step.context.description}
        </p>
      </div>

      {notice === null ? null : (
        <p className="mb-2 text-xs text-red-500">{notice}</p>
      )}

      <CollapsibleSection className="text-yellow-400" title="Blockers">
        <ul className="list-disc space-y-1 pl-5 text-[0.85rem]">
          {step.context.blockers.map(renderBlocker)}
        </ul>
      </CollapsibleSection>

      {step.documents.length > 0 ? (
        <CollapsibleSection title="Documents">
          <ul className="space-y-3">
            {step.documents.map((document) => (
              <DocumentRow
                key={document.id}
                document={document}
                checked={isDocumentChecked(
                  progress,
                  subject,
                  step.id,
                  document.id,
                )}
                reminder={reminderFor(
                  step,
                  subject,
                  step.actor,
                  `Bring: ${document.name} (${document.who_issues})`,
                )}
                onToggle={handleToggleDocument}
              />
            ))}
          </ul>
        </CollapsibleSection>
      ) : null}

      <CollapsibleSection title="Actions">
        <ul className="space-y-3">
          {step.sub_actions.map((subAction) => (
            <SubActionRow
              key={subAction.id}
              subAction={subAction}
              checked={isSubActionChecked(
                progress,
                subject,
                step.id,
                subAction.id,
              )}
              reminder={reminderFor(
                step,
                subject,
                subAction.actor,
                subAction.action,
              )}
              onToggle={handleToggleSubAction}
            />
          ))}
        </ul>
      </CollapsibleSection>
    </div>
  );
}
