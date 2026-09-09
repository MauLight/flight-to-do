import { useState } from "react";
import type { PlanDocument } from "../data/plans";
import { SendButton } from "./send-button";

type DocumentRowProps = {
  document: PlanDocument;
  checked: boolean;
  reminder: string;
  onToggle: (documentId: number) => void;
};

export function DocumentRow({
  document,
  checked,
  reminder,
  onToggle,
}: DocumentRowProps) {
  const [expanded, setExpanded] = useState(false);

  function handleChange() {
    onToggle(document.id);
  }

  function handleToggleExpand() {
    setExpanded(!expanded);
  }

  return (
    <li>
      <div className="flex gap-3 text-sm">
        <input
          type="checkbox"
          checked={checked}
          onChange={handleChange}
          aria-label={`Have ${document.name}`}
          className="mt-1 size-4 shrink-0 cursor-pointer accent-green-600"
        />

        <SendButton text={reminder} />

        <button
          type="button"
          onClick={handleToggleExpand}
          aria-expanded={expanded}
          className={`flex-1 cursor-pointer text-left ${checked ? "opacity-50" : ""}`}
        >
          <span className="mr-2 inline-block w-3 opacity-60">
            {expanded ? "−" : "+"}
          </span>
          {document.name}
        </button>
      </div>

      {expanded ? (
        <dl className="mt-2 mb-6 ml-10 space-y-4 border-l border-inherit pl-4 p-3 rounded-r-xl bg-[#232323] text-[0.85rem]">
          <div>
            <dt className="text-xs tracking-wide text-blue-300">Who issues</dt>
            <dd className="opacity-90">{document.who_issues}</dd>
          </div>
          <div>
            <dt className="text-xs tracking-wide text-blue-300">Validity</dt>
            <dd className="opacity-90">{document.validity}</dd>
          </div>
          <div>
            <dt className="text-xs tracking-wide text-blue-300">Description</dt>
            <dd className="leading-relaxed opacity-90">
              {document.description}
            </dd>
          </div>
        </dl>
      ) : null}
    </li>
  );
}
