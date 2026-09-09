import { useState, type ReactNode } from "react";

type CollapsibleSectionProps = {
  title: string;
  children: ReactNode;
  className?: string;
};

export function CollapsibleSection({
  className,
  title,
  children,
}: CollapsibleSectionProps) {
  const [open, setOpen] = useState(true);

  function handleToggle() {
    setOpen(!open);
  }

  return (
    <div className="grid gap-y-3">
      <button
        type="button"
        onClick={handleToggle}
        aria-expanded={open}
        className={`flex cursor-pointer items-center gap-2 text-xs uppercase tracking-wide text-blue-400 ${className}`}
      >
        <span className="inline-block w-3">{open ? "−" : "+"}</span>
        {title}
      </button>

      {open ? children : null}
    </div>
  );
}
