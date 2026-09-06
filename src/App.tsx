import { useState } from "react";
import { PlanList } from "./components/plan-list";
import { catPlan, humanPlan } from "./data/plans";

function App() {
  const [humanActive, setHumanActive] = useState(false);
  const [catActive, setCatActive] = useState(false);

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

  return (
    <div onClick={handleBackgroundClick} className="min-h-svh w-full p-8">
      <div className="mx-auto flex max-w-6xl items-start gap-6">
        <PlanList
          title="Human plan"
          steps={humanPlan}
          active={humanActive}
          onActivate={handleActivateHuman}
        />
        <PlanList
          title="Cat plan"
          steps={catPlan}
          active={catActive}
          onActivate={handleActivateCat}
        />
      </div>
    </div>
  );
}

export default App;
