// Testdaten der erfundenen Lumora Systeme AG. Keine echten Firmen, Personen oder Zahlen.
// Aufträge stehen im Zielbild in SAP S/4HANA, Verarbeiter im CRM, Reklamationen als Service-Tickets.

export type Kategorie = "profil" | "beschlag" | "oberflaeche";
export type Status = "eingegangen" | "pruefung" | "erledigt";
export type Mangel = "beschaedigt" | "masse" | "farbe" | "funktion" | "fehlt";

export interface Verarbeiter {
  id: string;
  firma: string;
  ort: string;
  kundennummer: string;
}

export interface Position {
  artikel: string;
  bezeichnung: string;
  kategorie: Kategorie;
  charge: string;
  menge: number;
  einheit: string;
}

export interface Auftrag {
  nummer: string;
  verarbeiterId: string;
  projekt: string;
  geliefert: string;
  positionen: Position[];
}

export interface Reklamation {
  id: string;
  nummer: string;
  auftrag: string;
  verarbeiterId: string;
  artikel: string;
  bezeichnung: string;
  kategorie: Kategorie;
  charge: string;
  mangel: Mangel;
  menge: number;
  beschreibung: string;
  status: Status;
  erstellt: string;
  // Welche Felder die KI aus dem Foto vorgeschlagen hat (Rest hat der Verarbeiter eingetragen)
  kiFelder: ("auftrag" | "artikel" | "charge" | "kategorie")[];
  foto: boolean;
}

// Etikett bzw. Typenschild, wie es die Dokumenten-Auslese zurückgibt
export interface Etikett {
  id: string;
  name: string;
  auftrag: string;
  artikel: string;
  charge: string;
  // Sicherheit der Auslese je Feld (0–1)
  sicherheit: number;
}

export const VERARBEITER: Verarbeiter[] = [
  { id: "v1", firma: "Metallbau Kranich GmbH", ort: "Talheim", kundennummer: "K-204711" },
  { id: "v2", firma: "Fensterwerk Sommerau", ort: "Neuberg", kundennummer: "K-208350" },
];

// Angemeldet ist in der Vorschau immer dieser Verarbeiter (im Zielbild aus dem Kundenkonto)
export const ANGEMELDET = VERARBEITER[0];

export const AUFTRAEGE: Auftrag[] = [
  {
    nummer: "4500 1182",
    verarbeiterId: "v1",
    projekt: "Wohnanlage Lindenhof, Haus B",
    geliefert: "2026-10-14",
    positionen: [
      { artikel: "LP-70-210", bezeichnung: "Profilserie 70, Blendrahmen 2,10 m", kategorie: "profil", charge: "CH-26-0418", menge: 64, einheit: "Stück" },
      { artikel: "BS-12-DK", bezeichnung: "Beschlag B-12 Dreh-Kipp", kategorie: "beschlag", charge: "CH-26-0377", menge: 32, einheit: "Satz" },
    ],
  },
  {
    nummer: "4500 1209",
    verarbeiterId: "v1",
    projekt: "Bürohaus Am Kanal",
    geliefert: "2026-10-21",
    positionen: [
      { artikel: "FS-50-PF", bezeichnung: "Fassade F50, Pfostenprofil", kategorie: "profil", charge: "CH-26-0451", menge: 40, einheit: "Stück" },
      { artikel: "OB-7016-M", bezeichnung: "Pulverbeschichtung Anthrazit matt", kategorie: "oberflaeche", charge: "CH-26-0462", menge: 40, einheit: "Stück" },
    ],
  },
  {
    nummer: "4500 1233",
    verarbeiterId: "v1",
    projekt: "Schule Feldweg, Anbau",
    geliefert: "2026-10-27",
    positionen: [
      { artikel: "TT-60-SW", bezeichnung: "Tür T60, Schwellenprofil", kategorie: "profil", charge: "CH-26-0480", menge: 12, einheit: "Stück" },
      { artikel: "BS-30-TB", bezeichnung: "Türband B-30, 3-teilig", kategorie: "beschlag", charge: "CH-26-0486", menge: 36, einheit: "Stück" },
    ],
  },
];

// Beispiel-Etiketten für die Vorschau: so liest die Dokumenten-Auslese ein Foto aus
export const ETIKETTEN: Etikett[] = [
  { id: "et1", name: "Etikett Blendrahmen", auftrag: "4500 1182", artikel: "LP-70-210", charge: "CH-26-0418", sicherheit: 0.96 },
  { id: "et2", name: "Typenschild Türband", auftrag: "4500 1233", artikel: "BS-30-TB", charge: "CH-26-0486", sicherheit: 0.91 },
  { id: "et3", name: "Etikett Pulverbeschichtung", auftrag: "4500 1209", artikel: "OB-7016-M", charge: "CH-26-0462", sicherheit: 0.88 },
];

export const REKLAMATIONEN: Reklamation[] = [
  {
    id: "r1",
    nummer: "RK-2026-0142",
    auftrag: "4500 1209",
    verarbeiterId: "v1",
    artikel: "OB-7016-M",
    bezeichnung: "Pulverbeschichtung Anthrazit matt",
    kategorie: "oberflaeche",
    charge: "CH-26-0462",
    mangel: "farbe",
    menge: 6,
    beschreibung: "Farbton an sechs Pfosten deutlich heller als der Rest der Lieferung.",
    status: "pruefung",
    erstellt: "2026-10-28",
    kiFelder: ["auftrag", "artikel", "charge", "kategorie"],
    foto: true,
  },
  {
    id: "r2",
    nummer: "RK-2026-0137",
    auftrag: "4500 1182",
    verarbeiterId: "v1",
    artikel: "BS-12-DK",
    bezeichnung: "Beschlag B-12 Dreh-Kipp",
    kategorie: "beschlag",
    charge: "CH-26-0377",
    mangel: "fehlt",
    menge: 2,
    beschreibung: "Zwei Sätze ohne Schließblech geliefert.",
    status: "eingegangen",
    erstellt: "2026-10-24",
    kiFelder: ["auftrag", "artikel", "charge", "kategorie"],
    foto: true,
  },
  {
    id: "r3",
    nummer: "RK-2026-0121",
    auftrag: "4500 1182",
    verarbeiterId: "v1",
    artikel: "LP-70-210",
    bezeichnung: "Profilserie 70, Blendrahmen 2,10 m",
    kategorie: "profil",
    charge: "CH-26-0418",
    mangel: "beschaedigt",
    menge: 3,
    beschreibung: "Drei Profile mit Kratzern an der Sichtseite, Verpackung war eingedrückt.",
    status: "erledigt",
    erstellt: "2026-10-16",
    kiFelder: ["auftrag", "artikel", "charge"],
    foto: true,
  },
];

export function findeAuftrag(nummer: string) {
  const n = nummer.replace(/\s/g, "");
  return AUFTRAEGE.find((a) => a.nummer.replace(/\s/g, "") === n);
}

export function findePosition(auftrag: string, artikel: string) {
  return findeAuftrag(auftrag)?.positionen.find((p) => p.artikel === artikel.trim().toUpperCase());
}

export function findeVerarbeiter(id: string) {
  return VERARBEITER.find((v) => v.id === id);
}
