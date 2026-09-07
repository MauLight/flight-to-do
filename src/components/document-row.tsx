import { Send } from "lucide-react";
import { useState } from "react";
import type { PlanDocument } from "../data/plans";

type DocumentRowProps = {
  document: PlanDocument;
  checked: boolean;
  onToggle: (documentId: number) => void;
};

export function DocumentRow({ document, checked, onToggle }: DocumentRowProps) {
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

        <button type="button" className="mt-1 size-4 shrink-0 bg-transparent">
          <Send className="w-3 h-3 text-cyan-500" />
        </button>

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
        <dl className="mt-2 mb-1 ml-10 space-y-2 border-l border-inherit pl-4 text-xs">
          <div>
            <dt className="uppercase tracking-wide opacity-60">Who issues</dt>
            <dd className="opacity-90">{document.who_issues}</dd>
          </div>
          <div>
            <dt className="uppercase tracking-wide opacity-60">Validity</dt>
            <dd className="opacity-90">{document.validity}</dd>
          </div>
          <div>
            <dt className="uppercase tracking-wide opacity-60">Description</dt>
            <dd className="leading-relaxed opacity-90">
              {document.description}
            </dd>
          </div>
        </dl>
      ) : null}
    </li>
  );
}
