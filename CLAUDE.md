# CLAUDE.md – Regeln für Apps im Set „Digitale Produkte“

Dieses Repository ist eine App der **Lumora Systeme AG**, einer **erfundenen** Firma (Fenster-, Tür- und Fassadensysteme). Alles hier ist Demo mit Testdaten.
Gebaut wird nach einem **Bauauftrag** aus Kompass (steht im Issue). Lies zuerst den Bauauftrag, dann diese Datei und `STYLEGUIDE.md`.

## Dieses Set: Digitale Produkte

- **Für wen:** Software und Portale für Verarbeiter (Metall- und Fensterbauer), Architekten und Kunden
- **Ton der Texte:** kundennah, einfach und aktiv. Die Nutzer sind Profis im Handwerk, keine IT-Leute: kurze Sätze, Wörter aus ihrem Alltag (Auftrag, Profil, Beschlag, Baustelle), Nutzen zuerst. Anrede immer „du“.
- **Frontend:** Next.js (React) + TypeScript + Tailwind, statisch gebaut (`src/`)
- **Backend:** C# · .NET 8 Minimal API in `backend/` (Lumora.Api)
- **Betrieb (Zielbild):** AWS, Region Frankfurt: ECS Fargate (API), CloudFront + S3 (Frontend), Amazon RDS (Postgres), Anmeldung über das Kundenkonto (Cognito)
- **Code-Ablage:** GitHub (Organisation lumora-demo)

## Pflicht bei jeder Änderung

1. **Aussehen nur nach `STYLEGUIDE.md`.** Nur Tokens aus `src/app/globals.css` und Bausteine aus `src/components/` (`ui.tsx`, `app-shell.tsx`). Keine eigenen Farben, Schriften, Schatten, Radien oder Abstände außerhalb des 4er-Rasters. Fehlt ein Baustein, ergänze ihn in `src/components/ui.tsx` im selben Stil und beschreibe ihn in `STYLEGUIDE.md`, Abschnitt 9.
2. **Rechner und Handy.** Jede Seite funktioniert bei 390 px und bei 1280 px: Rahmen aus `app-shell.tsx` (Seitenleiste bzw. Leiste unten mit höchstens 4 Bereichen), Tippflächen mindestens 44 px, Datensätze am Handy als kompakte Karten, nichts scrollt seitwärts.
3. **Texte nur in `src/content/de.ts`**, Bereiche in `src/content/nav.ts`. App-Name und Beschreibung dort ersetzen.
4. **Nur erfundene Testdaten** in `src/lib/demo-daten.ts`, Zahlen sichtbar als „Testdaten“ kennzeichnen. Keine echten Firmen, Personen, Marken oder Inhalte.
5. **Statisch baubar.** Die Live-Vorschau läuft auf GitHub Pages ohne Server: keine API-Routen, keine Server Actions, keine Cookies; dynamische Seiten nur mit `generateStaticParams`. Die App arbeitet in der Vorschau mit den Testdaten (Zustand im Browser ist erlaubt).
6. **Backend als Zielbild.** Lege im Backend die Endpunkte an, die das Frontend später braucht, mit denselben Feldern wie `src/lib/demo-daten.ts`. Es läuft in der Vorschau nicht mit.
7. **Keine neuen Abhängigkeiten** ohne Not; wenn doch, im Pull Request begründen. Keine Zugangsdaten im Code, keine Aufrufe fremder Dienste.

## Ablauf

1. Eigener Branch, ein Pull Request mit Beschreibung auf Deutsch: was gebaut wurde, welche Seiten, was bewusst offen ist.
2. Vor dem Pull Request: `npm ci`, `npm run lint`, `npm run build` – alles grün.
3. Nach dem Übernehmen (Merge) baut der Workflow „Live-Vorschau“ die App und stellt sie auf GitHub Pages bereit.

## Wo steht was

- `STYLEGUIDE.md` – Lumora Design-System (gilt für alle Sets gleich)
- `src/app/globals.css` – Tokens, Grundregeln; `src/components/` – Bausteine und Rahmen
- `src/app/` – Seiten; `src/content/` – Texte und Bereiche; `src/lib/` – Testdaten, `cn`
- `backend/` – C#-API (.NET 8 Minimal API); `infra/README.md` – Betrieb im Zielbild
