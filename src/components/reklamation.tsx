"use client";

import { ChevronRight, Sparkles } from "lucide-react";
import { de } from "@/content/de";
import { findeAuftrag, findeVerarbeiter, type Kategorie, type Reklamation, type Status } from "@/lib/demo-daten";
import { cn } from "@/lib/utils";
import { Badge, Panel } from "./ui";

// Bausteine dieser App für Reklamationen, gebaut nur aus Tokens und Bausteinen von ui.tsx.
const a = de.allgemein;
const d = de.detail;

export const datum = (iso: string) => new Date(iso).toLocaleDateString("de-DE");

export function StatusBadge({ status }: { status: Status }) {
  const ton = status === "erledigt" ? "ok" : status === "pruefung" ? "accent" : "neutral";
  return <Badge ton={ton}>{a.status[status]}</Badge>;
}

const PUNKT: Record<Kategorie, string> = { profil: "bg-cat-1", beschlag: "bg-cat-2", oberflaeche: "bg-cat-3" };

export function KategorieName({ kategorie }: { kategorie: Kategorie }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className={cn("size-2 shrink-0 rounded-full", PUNKT[kategorie])} aria-hidden />
      {a.kategorie[kategorie]}
    </span>
  );
}

// Rechner: Zeilen in einer Fläche, durch Linien getrennt. Handy: dieselben Fälle als kompakte Karten.
export function ReklamationListe({ liste, oeffne }: { liste: Reklamation[]; oeffne: (r: Reklamation) => void }) {
  return (
    <ul className="flex flex-col gap-2 sm:gap-0 sm:overflow-hidden sm:rounded-card sm:bg-surface sm:shadow-card">
      {liste.map((r) => (
        <li key={r.id} className="sm:not-last:border-b sm:not-last:border-line">
          <button
            type="button"
            onClick={() => oeffne(r)}
            className="flex w-full flex-col gap-1 rounded-card bg-surface p-4 text-left shadow-card transition-colors duration-(--dur-fast) hover:bg-surface-2 sm:flex-row sm:items-center sm:gap-4 sm:rounded-none sm:px-(--pad-card) sm:py-3 sm:shadow-none"
          >
            <div className="flex items-center justify-between gap-3 sm:hidden">
              <span className="font-mono text-small text-muted">{r.nummer}</span>
              <StatusBadge status={r.status} />
            </div>
            <div className="flex min-w-0 flex-1 flex-col">
              <span className="font-medium">{r.bezeichnung}</span>
              <span className="truncate text-small text-muted">{r.beschreibung}</span>
            </div>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-small text-text-2">
              <KategorieName kategorie={r.kategorie} />
              <span className="font-mono tabular-nums">{r.auftrag}</span>
              <span className="hidden font-mono text-muted sm:inline">{r.nummer}</span>
              <span className="hidden sm:inline-flex">
                <StatusBadge status={r.status} />
              </span>
              <span className="font-mono text-muted tabular-nums">{datum(r.erstellt)}</span>
              <ChevronRight className="hidden size-4 text-muted sm:block" strokeWidth={1.75} aria-hidden />
            </div>
          </button>
        </li>
      ))}
    </ul>
  );
}

function Zeile({ label, children, ki }: { label: string; children: React.ReactNode; ki?: boolean }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2 not-last:border-b not-last:border-line">
      <dt className="text-small text-muted">{label}</dt>
      <dd className="flex items-center gap-1.5 text-right">
        {children}
        {ki ? <Sparkles className="size-4 shrink-0 text-accent" strokeWidth={1.75} aria-label={d.ki} /> : null}
      </dd>
    </div>
  );
}

export function ReklamationPanel({ r, onClose }: { r: Reklamation | null; onClose: () => void }) {
  const auftrag = r ? findeAuftrag(r.auftrag) : undefined;
  const ki = (f: Reklamation["kiFelder"][number]) => !!r?.kiFelder.includes(f);
  return (
    <Panel offen={!!r} title={r?.nummer ?? ""} schliessen={a.schliessen} onClose={onClose}>
      {r ? (
        <>
          <div className="flex flex-col gap-2">
            <StatusBadge status={r.status} />
            <p className="text-h3 font-semibold">{r.bezeichnung}</p>
            <p className="text-text-2">{r.beschreibung}</p>
          </div>
          <dl className="flex flex-col">
            <Zeile label={d.auftrag} ki={ki("auftrag")}>
              <span className="font-mono tabular-nums">{r.auftrag}</span>
            </Zeile>
            {auftrag ? <Zeile label={d.projekt}>{auftrag.projekt}</Zeile> : null}
            <Zeile label={d.artikel} ki={ki("artikel")}>
              <span className="font-mono">{r.artikel}</span>
            </Zeile>
            <Zeile label={d.charge} ki={ki("charge")}>
              <span className="font-mono">{r.charge}</span>
            </Zeile>
            <Zeile label={d.kategorie} ki={ki("kategorie")}>
              <KategorieName kategorie={r.kategorie} />
            </Zeile>
            <Zeile label={d.mangel}>{a.mangel[r.mangel]}</Zeile>
            <Zeile label={d.menge}>
              <span className="tabular-nums">{r.menge}</span>
            </Zeile>
            <Zeile label={d.gemeldet}>
              <span className="tabular-nums">{datum(r.erstellt)}</span>
            </Zeile>
            <Zeile label={d.gemeldetVon}>{findeVerarbeiter(r.verarbeiterId)?.firma}</Zeile>
          </dl>
          <p className="flex items-start gap-2 text-small text-muted">
            <Sparkles className="mt-0.5 size-4 shrink-0 text-accent" strokeWidth={1.75} aria-hidden />
            {r.kiFelder.length ? `${d.ki}: ${r.kiFelder.map((f) => d.kiFelder[f]).join(", ")}` : d.keineKi}
          </p>
          <p className="text-caption text-muted">{a.testdaten}</p>
        </>
      ) : null}
    </Panel>
  );
}
