import type { PlanStep } from "../data/plans";

type StepIndexItemProps = {
  step: PlanStep;
  current: boolean;
  completed: boolean;
  onSelect: (stepId: number) => void;
};

export function StepIndexItem({
  step,
  current,
  completed,
  onSelect,
}: StepIndexItemProps) {
  function handleClick() {
    onSelect(step.id);
  }

  const stateClasses = completed
    ? "bg-green-600 border-green-600 text-white"
    : "border-border-active";

  const currentClasses = current ? "bg-cyan-600" : "";

  return (
    <li>
      <button
        type="button"
        onClick={handleClick}
        aria-current={current ? "step" : undefined}
        className={`size-9 cursor-pointer rounded-lg border text-sm transition-colors ${stateClasses} ${currentClasses}`}
      >
        {step.step}
      </button>
    </li>
  );
}
