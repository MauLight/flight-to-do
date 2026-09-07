import { useState, type ReactNode } from "react";

type CollapsibleSectionProps = {
  title: string;
  children: ReactNode;
};

export function CollapsibleSection({ title, children }: CollapsibleSectionProps) {
  const [open, setOpen] = useState(true);

  function handleToggle() {
    setOpen(!open);
  }

  return (
    <div className="mb-3">
      <button
        type="button"
        onClick={handleToggle}
        aria-expanded={open}
        className="mb-2 flex cursor-pointer items-center gap-2 text-xs uppercase tracking-wide opacity-70"
      >
        <span className="inline-block w-3">{open ? "−" : "+"}</span>
        {title}
      </button>

      {open ? children : null}
    </div>
  );
}
