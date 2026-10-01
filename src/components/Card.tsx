import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Card({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <div className={cn("rounded-card border border-border/75 bg-card p-6 shadow-sm shadow-background/10", className)}>{children}</div>
  );
}

export function CardTitle({ className, children }: { className?: string; children: ReactNode }) {
  return <h2 className={cn("type-card-title", className)}>{children}</h2>;
}

export function CardBody({ className, children }: { className?: string; children: ReactNode }) {
  return <p className={cn("type-secondary", className)}>{children}</p>;
}
