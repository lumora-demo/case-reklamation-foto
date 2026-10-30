"use client";

import { Camera, Inbox } from "lucide-react";
import { useState } from "react";
import { ReklamationListe, ReklamationPanel } from "@/components/reklamation";
import { ButtonLink, EmptyState, PageHeader, Segmented } from "@/components/ui";
import { de } from "@/content/de";
import type { Reklamation, Status } from "@/lib/demo-daten";
import { useReklamationen } from "@/lib/reklamationen";

const t = de.liste;
const s = de.allgemein.status;

export default function Reklamationen() {
  const alle = useReklamationen();
  const [filter, setFilter] = useState<Status | "alle">("alle");
  const [offen, setOffen] = useState<Reklamation | null>(null);
  const liste = alle.filter((r) => filter === "alle" || r.status === filter);

  return (
    <>
      <PageHeader title={t.title} lead={t.lead}>
        <ButtonLink href="/neu" variante="primary" icon={Camera}>
          {t.neu}
        </ButtonLink>
      </PageHeader>
      {/* Am Handy bleibt der Umschalter unter der Kopfzeile stehen */}
      <div className="sticky top-(--mobile-bar-h) z-30 -mx-4 -my-2 bg-bg/85 px-4 py-2 backdrop-blur-md sm:static sm:m-0 sm:bg-transparent sm:p-0 sm:backdrop-blur-none">
        <Segmented
          label={t.filter}
          wert={filter}
          setze={setFilter}
          werte={[
            { id: "alle", name: t.alle },
            { id: "eingegangen", name: s.eingegangen },
            { id: "pruefung", name: s.pruefung },
            { id: "erledigt", name: s.erledigt },
          ]}
        />
      </div>
      {liste.length === 0 ? <EmptyState icon={Inbox} title={t.leerTitel} text={t.leerText} /> : <ReklamationListe liste={liste} oeffne={setOffen} />}
      <ReklamationPanel r={offen} onClose={() => setOffen(null)} />
    </>
  );
}
