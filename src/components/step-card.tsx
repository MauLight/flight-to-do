import type { Blocker, PlanStep, Subject } from "../data/plans";
import { isDocumentChecked, isSubActionChecked, type Progress } from "../lib/progress";
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

export function StepCard({
  step,
  subject,
  progress,
  onToggleSubAction,
  onToggleDocument,
}: StepCardProps) {
  function handleToggleSubAction(subActionId: number) {
    onToggleSubAction(step.id, subActionId);
  }

  function handleToggleDocument(documentId: number) {
    onToggleDocument(step.id, documentId);
  }

  return (
    <div>
      <div className="mb-1 text-xs uppercase tracking-wide opacity-70">
        Step {step.step} — {step.actor}
      </div>

      <h3 className="mb-2 text-base font-medium">{step.action}</h3>

      <p className="mb-3 text-sm leading-relaxed opacity-80">
        {step.context.description}
      </p>

      <CollapsibleSection title="Blockers">
        <ul className="list-disc space-y-1 pl-5 text-sm">
          {step.context.blockers.map(renderBlocker)}
        </ul>
      </CollapsibleSection>

      {step.documents.length > 0 ? (
        <CollapsibleSection title="Documents">
          <ul className="space-y-2">
            {step.documents.map((document) => (
              <DocumentRow
                key={document.id}
                document={document}
                checked={isDocumentChecked(progress, subject, step.id, document.id)}
                onToggle={handleToggleDocument}
              />
            ))}
          </ul>
        </CollapsibleSection>
      ) : null}

      <CollapsibleSection title="Actions">
        <ul className="space-y-2">
          {step.sub_actions.map((subAction) => (
            <SubActionRow
              key={subAction.id}
              subAction={subAction}
              checked={isSubActionChecked(progress, subject, step.id, subAction.id)}
              onToggle={handleToggleSubAction}
            />
          ))}
        </ul>
      </CollapsibleSection>
    </div>
  );
}
