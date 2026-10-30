"use client";

import { ArrowRight, Camera } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { ReklamationListe, ReklamationPanel } from "@/components/reklamation";
import { ButtonLink, Card, Kennzahl, PageHeader, Section } from "@/components/ui";
import { de } from "@/content/de";
import type { Reklamation } from "@/lib/demo-daten";
import { useReklamationen } from "@/lib/reklamationen";

const t = de.uebersicht;

export default function Uebersicht() {
  const liste = useReklamationen();
  const [offen, setOffen] = useState<Reklamation | null>(null);
  const zahlOffen = liste.filter((r) => r.status !== "erledigt").length;
  const zahlErledigt = liste.filter((r) => r.status === "erledigt").length;

  return (
    <>
      <PageHeader title={t.title} lead={t.lead}>
        <ButtonLink href="/neu" variante="primary" icon={Camera}>
          {t.neu}
        </ButtonLink>
      </PageHeader>

      <Section title={t.kennzahlen}>
        <div className="grid grid-cols-2 gap-(--gap) md:grid-cols-3">
          <Kennzahl label={t.offen} wert={zahlOffen} hinweis={de.allgemein.testdaten} />
          <Kennzahl label={t.erledigt} wert={zahlErledigt} hinweis={de.allgemein.testdaten} />
          <Kennzahl label={t.dauer} wert={t.dauerWert} hinweis={de.allgemein.testdaten} />
        </div>
      </Section>

      <Section title={t.soGehts}>
        <ol className="grid gap-(--gap) sm:grid-cols-3">
          {t.schritte.map((s, i) => (
            <li key={s.titel}>
              <Card className="flex h-full gap-3">
                <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-accent-soft text-small font-semibold text-accent tabular-nums">{i + 1}</span>
                <div className="flex flex-col gap-0.5">
                  <p className="font-medium">{s.titel}</p>
                  <p className="text-small text-muted">{s.text}</p>
                </div>
              </Card>
            </li>
          ))}
        </ol>
      </Section>

      <Section
        title={t.zuletzt}
        action={
          <Link href="/reklamationen" className="inline-flex min-h-11 items-center gap-1 text-small font-medium text-accent hover:underline">
            {t.alle} <ArrowRight className="size-4" aria-hidden />
          </Link>
        }
      >
        <ReklamationListe liste={liste.slice(0, 3)} oeffne={setOffen} />
      </Section>

      <ReklamationPanel r={offen} onClose={() => setOffen(null)} />
    </>
  );
}
