import type { PlanStep, Subject } from "../data/plans";
import { isStepCompleted, type Progress } from "../lib/progress";
import { StepIndexItem } from "./step-index-item";

type StepIndexProps = {
  steps: PlanStep[];
  subject: Subject;
  progress: Progress;
  currentStepId: number;
  onSelectStep: (stepId: number) => void;
};

export function StepIndex({
  steps,
  subject,
  progress,
  currentStepId,
  onSelectStep,
}: StepIndexProps) {
  return (
    <nav aria-label="Steps">
      <ul className="flex flex-col gap-2">
        {steps.map((step) => (
          <StepIndexItem
            key={step.id}
            step={step}
            current={step.id === currentStepId}
            completed={isStepCompleted(progress, subject, step)}
            onSelect={onSelectStep}
          />
        ))}
      </ul>
    </nav>
  );
}
