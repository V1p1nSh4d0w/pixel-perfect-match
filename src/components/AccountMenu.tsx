import { Link, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { toast } from "sonner";
import { Button } from "@/components/Button";
import { signOut } from "@/lib/supabase";
import { deleteMyAccount } from "@/lib/account.functions";

const itemClass =
  "block w-full rounded-md px-3 py-2 text-left text-sm text-foreground transition-colors hover:bg-surface-raised focus:bg-surface-raised focus:outline-none";

export function AccountMenu({ initial, email, isPro }: { initial: string; email: string; isPro: boolean }) {
  const [open, setOpen] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const deleteFn = useServerFn(deleteMyAccount);

  const items = () => Array.from(menuRef.current?.querySelectorAll<HTMLElement>('[role="menuitem"]') ?? []);

  useEffect(() => {
    if (!open) return;
    items()[0]?.focus();
    const onDown = (e: MouseEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  function onMenuKey(e: KeyboardEvent) {
    const list = items();
    const i = list.indexOf(document.activeElement as HTMLElement);
    if (e.key === "Escape") {
      setOpen(false);
      buttonRef.current?.focus();
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      list[(i + 1) % list.length]?.focus();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      list[(i - 1 + list.length) % list.length]?.focus();
    } else if (e.key === "Home") {
      e.preventDefault();
      list[0]?.focus();
    } else if (e.key === "End") {
      e.preventDefault();
      list[list.length - 1]?.focus();
    } else if (e.key === "Tab") setOpen(false);
  }

  async function leave() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await signOut();
    await navigate({ to: "/", replace: true });
  }

  async function confirmDelete() {
    setDeleting(true);
    try {
      await deleteFn();
      await leave();
      toast.success("Your account has been deleted");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not delete account");
      setDeleting(false);
    }
  }

  return (
    <div ref={wrapRef} className="relative">
      <button
        ref={buttonRef}
        type="button"
        aria-label="Account menu"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        onKeyDown={(e) => {
          if (e.key === "ArrowDown") {
            e.preventDefault();
            setOpen(true);
          }
        }}
        className="flex h-8 w-8 items-center justify-center rounded-full bg-surface-raised text-xs font-medium text-foreground transition-colors hover:bg-border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        {initial}
      </button>

      {open ? (
        <div
          ref={menuRef}
          role="menu"
          aria-label="Account"
          onKeyDown={onMenuKey}
          className="absolute right-0 top-full z-50 mt-2 w-60 rounded-card border border-border bg-card p-1.5 shadow-lg"
        >
          <div className="px-3 py-2">
            <p className="truncate text-xs text-muted-foreground">{email}</p>
            <p className="mt-1 flex items-center gap-2 text-sm text-foreground">
              {isPro ? "Starter Kit" : "Free plan"}
              {isPro ? (
                <span className="rounded-full border border-primary px-1.5 py-0.5 text-[10px] font-semibold tracking-wide text-primary">PAID</span>
              ) : null}
            </p>
          </div>
          <div className="my-1 h-px bg-border" role="separator" />
          <Link role="menuitem" tabIndex={-1} to="/app/settings" search={{ tab: "billing" }} onClick={() => setOpen(false)} className={itemClass}>
            Billing
          </Link>
          <Link role="menuitem" tabIndex={-1} to="/app/settings" search={{}} onClick={() => setOpen(false)} className={itemClass}>
            Settings
          </Link>
          <div className="my-1 h-px bg-border" role="separator" />
          <button role="menuitem" tabIndex={-1} type="button" onClick={() => { setOpen(false); void leave(); }} className={itemClass}>
            Sign out
          </button>
          <button
            role="menuitem"
            tabIndex={-1}
            type="button"
            onClick={() => { setOpen(false); setConfirming(true); }}
            className={`${itemClass} text-danger`}
          >
            Delete account
          </button>
        </div>
      ) : null}

      {confirming ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 px-4"
          onKeyDown={(e) => { if (e.key === "Escape" && !deleting) setConfirming(false); }}
        >
          <div role="alertdialog" aria-modal="true" aria-labelledby="del-title" className="w-full max-w-sm rounded-card border border-border bg-card p-6">
            <h2 id="del-title" className="text-base font-semibold text-foreground">Delete your account?</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              This will permanently remove your assessments, findings, and action plan. This cannot be undone.
            </p>
            <div className="mt-6 flex justify-end gap-2">
              <Button variant="secondary" autoFocus disabled={deleting} onClick={() => setConfirming(false)}>Cancel</Button>
              <Button variant="danger" loading={deleting} onClick={confirmDelete}>Delete account</Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
