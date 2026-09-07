import { Send } from "lucide-react";
import { useId } from "react";
import type { SubAction } from "../data/plans";

type SubActionRowProps = {
  subAction: SubAction;
  checked: boolean;
  onToggle: (subActionId: number) => void;
};

export function SubActionRow({
  subAction,
  checked,
  onToggle,
}: SubActionRowProps) {
  const inputId = useId();

  function handleChange() {
    onToggle(subAction.id);
  }

  return (
    <li className="flex gap-3 text-sm">
      <input
        id={inputId}
        type="checkbox"
        checked={checked}
        onChange={handleChange}
        className="mt-1 size-4 shrink-0 cursor-pointer accent-green-600"
      />

      <button type="button" className="mt-1 size-4 shrink-0 bg-transparent">
        <Send className="w-3 h-3 text-cyan-500" />
      </button>

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
