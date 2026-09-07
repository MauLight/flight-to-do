import { motion } from "motion/react";
import type { MouseEvent } from "react";
import type { PlanStep, Subject } from "../data/plans";
import type { Progress } from "../lib/progress";
import { StepCard } from "./step-card";
import { StepIndex } from "./step-index";

type PlanListProps = {
  title: string;
  subject: Subject;
  steps: PlanStep[];
  active: boolean;
  progress: Progress;
  currentStepId: number;
  onActivate: () => void;
  onSelectStep: (stepId: number) => void;
  onToggleSubAction: (stepId: number, subActionId: number) => void;
};

export function PlanList({
  title,
  subject,
  steps,
  active,
  progress,
  currentStepId,
  onActivate,
  onSelectStep,
  onToggleSubAction,
}: PlanListProps) {
  function handleClick(event: MouseEvent<HTMLDivElement>) {
    event.stopPropagation();
    onActivate();
  }

  const stateClasses = active
    ? "bg-box-active text-text-active border-border-active"
    : "bg-box text-text border-border";

  const currentStep = steps.find((step) => step.id === currentStepId);

  return (
    <motion.div
      onClick={handleClick}
      animate={{ scale: active ? 1.01 : 1 }}
      className={`flex-1 cursor-pointer rounded-xl border p-6 transition-colors ${stateClasses}`}
    >
      <h2 className="mb-5 text-xl font-medium">{title}</h2>

      <div className="flex gap-6">
        <StepIndex
          steps={steps}
          subject={subject}
          progress={progress}
          currentStepId={currentStepId}
          onSelectStep={onSelectStep}
        />

        <div className="min-w-0 flex-1">
          {currentStep ? (
            <StepCard
              step={currentStep}
              subject={subject}
              progress={progress}
              onToggleSubAction={onToggleSubAction}
            />
          ) : null}
        </div>
      </div>
    </motion.div>
  );
}
