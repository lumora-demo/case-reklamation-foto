import { ETIKETTEN, type Etikett } from "./demo-daten";

// Zugang zur KI-Schicht (platform-ai) mit Dokumenten-Auslese (platform-documents). KI-Aufrufe nur hierüber.
// Zielbild: POST /api/reklamationen/auslese → Lumora.Api → KI-Schicht (Datenschutz-Filter aktiv).
// Live-Vorschau: kein Server, keine fremden Dienste – die Auslese wird mit einem Beispiel-Etikett nachgestellt.

export type Quelle = { art: "beispiel"; id: string } | { art: "foto"; groesse: number };

export async function liesEtikett(quelle: Quelle): Promise<Etikett> {
  await new Promise((fertig) => setTimeout(fertig, 1200));
  if (quelle.art === "beispiel") return ETIKETTEN.find((e) => e.id === quelle.id) ?? ETIKETTEN[0];
  // Eigenes Foto: gleich bleibendes Beispiel je Bild, damit der Ablauf nachvollziehbar ist
  return ETIKETTEN[quelle.groesse % ETIKETTEN.length];
}
