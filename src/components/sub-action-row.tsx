import type { SubAction } from "../data/plans";

type SubActionRowProps = {
  subAction: SubAction;
  checked: boolean;
  onToggle: (subActionId: number) => void;
};

export function SubActionRow({ subAction, checked, onToggle }: SubActionRowProps) {
  function handleChange() {
    onToggle(subAction.id);
  }

  return (
    <li>
      <label className="flex cursor-pointer gap-3 text-sm">
        <input
          type="checkbox"
          checked={checked}
          onChange={handleChange}
          className="mt-1 size-4 shrink-0 accent-green-600"
        />

        <span className={checked ? "opacity-50" : undefined}>
          <span className="font-medium">{subAction.actor}</span> — {subAction.action}
        </span>
      </label>
    </li>
  );
}
