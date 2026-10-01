import type { ReactNode } from "react";

export function PageHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description?: string | undefined;
  actions?: ReactNode | undefined;
}) {
  return (
    <header className="mb-8 flex flex-wrap items-start justify-between gap-4">
      <div>
        <h1 className="type-page-title">{title}</h1>
        {description ? <p className="mt-1.5 type-secondary">{description}</p> : null}
      </div>
      {actions ? <div className="shrink-0">{actions}</div> : null}
    </header>
  );
}
