import { useId } from "react";
import type { SubAction } from "../data/plans";
import { SendButton } from "./send-button";

type SubActionRowProps = {
  subAction: SubAction;
  checked: boolean;
  reminder: string;
  onToggle: (subActionId: number) => void;
};

export function SubActionRow({
  subAction,
  checked,
  reminder,
  onToggle,
}: SubActionRowProps) {
  const inputId = useId();

  function handleChange() {
    onToggle(subAction.id);
  }

  return (
    <li className="flex gap-3 text-sm border border-border-active p-2 bg-[#1e1e1e] rounded-lg">
      <input
        id={inputId}
        type="checkbox"
        checked={checked}
        onChange={handleChange}
        className="mt-1 size-4 shrink-0 cursor-pointer accent-green-600"
      />

      <SendButton text={reminder} />

      <label
        htmlFor={inputId}
        className={`flex-1 cursor-pointer ${checked ? "opacity-50" : ""}`}
      >
        <span className="font-medium">{subAction.actor}</span> —{" "}
        {subAction.action}
      </label>
    </li>
  );
}
