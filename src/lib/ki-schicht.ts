import { ETIKETTEN, LESBAR_AB, type Etikett } from "./demo-daten";

// Zugang zur KI-Schicht (platform-ai) mit Dokumenten-Auslese (platform-documents). KI-Aufrufe nur hierüber.
// Zielbild: POST /api/reklamationen/auslese → Lumora.Api → KI-Schicht (Datenschutz-Filter aktiv).
// Live-Vorschau: kein Server, keine fremden Dienste – die Auslese wird mit einem Beispiel-Etikett nachgestellt.

export type Quelle = { art: "beispiel"; id: string } | { art: "foto"; groesse: number };

// Gibt null zurück, wenn das Etikett nicht lesbar ist (dann trägt der Verarbeiter von Hand ein)
export async function liesEtikett(quelle: Quelle): Promise<Etikett | null> {
  await new Promise((fertig) => setTimeout(fertig, 1200));
  const lesbare = ETIKETTEN.filter((e) => e.sicherheit >= LESBAR_AB);
  // Eigenes Foto: gleich bleibendes lesbares Beispiel je Bild, damit der Ablauf nachvollziehbar ist
  const e = quelle.art === "beispiel" ? (ETIKETTEN.find((x) => x.id === quelle.id) ?? lesbare[0]) : lesbare[quelle.groesse % lesbare.length];
  return e.sicherheit >= LESBAR_AB ? e : null;
}
