"use client";

import { X } from "lucide-react";
import { useEffect, useId, useRef } from "react";
import { cn } from "@/lib/utils";
import { Button } from "./ui";

// Seitenpanel für Details (STYLEGUIDE.md, Abschnitt 11, Regel 4): am Rechner rechts 420 px, am Handy Fenster von unten.
// Natives <dialog>: Esc schließt, Fokus bleibt im Panel. Klick auf die abgedunkelte Fläche schließt auch.
export function Panel({ offen, title, schliessen, onClose, children }: { offen: boolean; title: string; schliessen: string; onClose: () => void; children: React.ReactNode }) {
  const ref = useRef<HTMLDialogElement>(null);
  const titelId = useId();

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (offen && !d.open) d.showModal();
    if (!offen && d.open) d.close();
  }, [offen]);

  return (
    <dialog
      ref={ref}
      aria-labelledby={titelId}
      onClose={onClose}
      onClick={(e) => e.target === e.currentTarget && onClose()}
      className={cn(
        "inset-x-0 top-auto bottom-0 m-0 max-h-[85dvh] w-full max-w-none rounded-t-card bg-surface p-0 text-text shadow-pop backdrop:bg-(--scrim)",
        "sm:inset-y-0 sm:right-0 sm:left-auto sm:h-dvh sm:max-h-none sm:w-[420px] sm:rounded-none sm:rounded-l-card",
        "open:animate-enter",
      )}
    >
      <div className="flex h-full flex-col">
        <div className="flex items-center justify-between gap-3 border-b border-line py-2 pr-2 pl-(--pad-card)">
          <h2 id={titelId} className="text-h3 font-semibold">
            {title}
          </h2>
          <Button variante="ghost" groesse="m" onClick={onClose} aria-label={schliessen} title={schliessen} className="px-2.5">
            <X className="size-[18px]" strokeWidth={1.75} aria-hidden />
          </Button>
        </div>
        <div className="flex flex-1 flex-col gap-4 overflow-y-auto p-(--pad-card) pb-[max(16px,env(safe-area-inset-bottom))]">{children}</div>
      </div>
    </dialog>
  );
}
