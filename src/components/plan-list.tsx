import { motion } from "motion/react";
import type { MouseEvent } from "react";
import type { Blocker, PlanStep, SubAction } from "../data/plans";

type PlanListProps = {
  title: string;
  steps: PlanStep[];
  active: boolean;
  onActivate: () => void;
};

function renderBlocker(blocker: Blocker) {
  return (
    <li key={blocker.id}>
      {blocker.desc}
    </li>
  );
}

function renderSubAction(subAction: SubAction) {
  return (
    <li key={subAction.id}>
      <span className="font-medium">{subAction.actor}</span> — {subAction.action}
    </li>
  );
}

function renderStep(step: PlanStep) {
  return (
    <li key={step.id} className="border-t border-inherit pt-5 first:border-t-0 first:pt-0">
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
        <div className="mb-1 text-xs uppercase tracking-wide opacity-70">Sub-actions</div>
        <ol className="list-decimal space-y-1 pl-5 text-sm">
          {step.sub_actions.map(renderSubAction)}
        </ol>
      </div>
    </li>
  );
}

export function PlanList({ title, steps, active, onActivate }: PlanListProps) {
  function handleClick(event: MouseEvent<HTMLDivElement>) {
    event.stopPropagation();
    onActivate();
  }

  const stateClasses = active
    ? "bg-box-active text-text-active border-border-active"
    : "bg-box text-text border-border";

  return (
    <motion.div
      onClick={handleClick}
      animate={{ scale: active ? 1.01 : 1 }}
      className={`flex-1 cursor-pointer rounded-xl border p-6 transition-colors ${stateClasses}`}
    >
      <h2 className="mb-5 text-xl font-medium">{title}</h2>

      <ul className="space-y-5">{steps.map(renderStep)}</ul>
    </motion.div>
  );
}
