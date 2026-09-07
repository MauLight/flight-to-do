import type { Blocker, PlanStep, Subject } from "../data/plans";
import { isSubActionChecked, type Progress } from "../lib/progress";
import { SubActionRow } from "./sub-action-row";

type StepCardProps = {
  step: PlanStep;
  subject: Subject;
  progress: Progress;
  onToggleSubAction: (stepId: number, subActionId: number) => void;
};

function renderBlocker(blocker: Blocker) {
  return <li key={blocker.id}>{blocker.desc}</li>;
}

export function StepCard({ step, subject, progress, onToggleSubAction }: StepCardProps) {
  function handleToggle(subActionId: number) {
    onToggleSubAction(step.id, subActionId);
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

      <div className="mb-3">
        <div className="mb-1 text-xs uppercase tracking-wide opacity-70">Blockers</div>
        <ul className="list-disc space-y-1 pl-5 text-sm">
          {step.context.blockers.map(renderBlocker)}
        </ul>
      </div>

      <div>
        <div className="mb-2 text-xs uppercase tracking-wide opacity-70">Sub-actions</div>
        <ul className="space-y-2">
          {step.sub_actions.map((subAction) => (
            <SubActionRow
              key={subAction.id}
              subAction={subAction}
              checked={isSubActionChecked(progress, subject, step.id, subAction.id)}
              onToggle={handleToggle}
            />
          ))}
        </ul>
      </div>
    </div>
  );
}
