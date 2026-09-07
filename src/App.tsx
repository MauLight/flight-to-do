import { useState } from "react";
import { PlanList } from "./components/plan-list";
import { catPlan, humanPlan } from "./data/plans";
import { emptyProgress, toggleDocument, toggleSubAction } from "./lib/progress";

function App() {
  const [humanActive, setHumanActive] = useState(false);
  const [catActive, setCatActive] = useState(false);
  const [progress, setProgress] = useState(emptyProgress);
  const [humanStepId, setHumanStepId] = useState(humanPlan[0].id);
  const [catStepId, setCatStepId] = useState(catPlan[0].id);

  function handleActivateHuman() {
    setHumanActive(true);
  }

  function handleActivateCat() {
    setCatActive(true);
  }

  function handleBackgroundClick() {
    setHumanActive(false);
    setCatActive(false);
  }

  function handleSelectHumanStep(stepId: number) {
    setHumanStepId(stepId);
  }

  function handleSelectCatStep(stepId: number) {
    setCatStepId(stepId);
  }

  function handleToggleHumanSubAction(stepId: number, subActionId: number) {
    setProgress(toggleSubAction(progress, "human", stepId, subActionId));
  }

  function handleToggleHumanDocument(stepId: number, documentId: number) {
    setProgress(toggleDocument(progress, "human", stepId, documentId));
  }

  function handleToggleCatSubAction(stepId: number, subActionId: number) {
    setProgress(toggleSubAction(progress, "cat", stepId, subActionId));
  }

  function handleToggleCatDocument(stepId: number, documentId: number) {
    setProgress(toggleDocument(progress, "cat", stepId, documentId));
  }

  return (
    <div onClick={handleBackgroundClick} className="min-h-svh w-full p-8">
      <div className="mx-auto flex max-w-6xl items-start gap-6">
        <PlanList
          title="Human plan"
          subject="human"
          steps={humanPlan}
          active={humanActive}
          progress={progress}
          currentStepId={humanStepId}
          onActivate={handleActivateHuman}
          onSelectStep={handleSelectHumanStep}
          onToggleSubAction={handleToggleHumanSubAction}
          onToggleDocument={handleToggleHumanDocument}
        />
        <PlanList
          title="Cat plan"
          subject="cat"
          steps={catPlan}
          active={catActive}
          progress={progress}
          currentStepId={catStepId}
          onActivate={handleActivateCat}
          onSelectStep={handleSelectCatStep}
          onToggleSubAction={handleToggleCatSubAction}
          onToggleDocument={handleToggleCatDocument}
        />
      </div>
    </div>
  );
}

export default App;
