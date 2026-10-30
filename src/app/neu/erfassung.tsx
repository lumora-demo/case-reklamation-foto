"use client";

import { CircleCheck, ImagePlus, PencilLine, ScanLine, ShieldCheck, Sparkles, Tag } from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { KategorieName } from "@/components/reklamation";
import { Badge, Button, ButtonLink, Card, Field, Hinweis, Input, PageHeader, Section, Select, Textarea, knopfKlasse } from "@/components/ui";
import { de } from "@/content/de";
import { ANGEMELDET, ETIKETTEN, findeAuftrag, findePosition, type Etikett, type Mangel, type Reklamation } from "@/lib/demo-daten";
import { liesEtikett, type Quelle } from "@/lib/ki-schicht";
import { anlegen, naechsteNummer } from "@/lib/reklamationen";
import { cn } from "@/lib/utils";

const t = de.neu;
const f = t.felder;

type Phase = "start" | "liest" | "form" | "gesendet";
type Werte = { auftrag: string; artikel: string; charge: string; mangel: Mangel | ""; menge: string; beschreibung: string };
type Feld = keyof Werte;

const LEER: Werte = { auftrag: "", artikel: "", charge: "", mangel: "", menge: "", beschreibung: "" };
const REIHENFOLGE: Feld[] = ["auftrag", "artikel", "charge", "mangel", "menge", "beschreibung"];
const KI_FELDER = ["auftrag", "artikel", "charge"] as const;

function pruefe(feld: Feld, w: Werte): string | undefined {
  switch (feld) {
    case "auftrag":
      if (!w.auftrag.trim()) return t.fehler.auftrag;
      if (!findeAuftrag(w.auftrag)) return t.fehler.auftragUnbekannt;
      return;
    case "artikel":
      return findePosition(w.auftrag, w.artikel) ? undefined : t.fehler.artikel;
    case "charge":
      return w.charge.trim() ? undefined : t.fehler.charge;
    case "mangel":
      return w.mangel ? undefined : t.fehler.mangel;
    case "menge":
      return Number(w.menge) >= 1 ? undefined : t.fehler.menge;
    case "beschreibung":
      return w.beschreibung.trim().length >= 5 ? undefined : t.fehler.beschreibung;
  }
}

export function Erfassung() {
  const [phase, setPhase] = useState<Phase>("start");
  const [fotoUrl, setFotoUrl] = useState<string | null>(null);
  const [etikett, setEtikett] = useState<Etikett | null>(null);
  const [werte, setWerte] = useState<Werte>(LEER);
  const [fehler, setFehler] = useState<Partial<Record<Feld, string>>>({});
  const [sendet, setSendet] = useState(false);
  const [gesendet, setGesendet] = useState<Reklamation | null>(null);
  const [zuVersuch, setZuVersuch] = useState(false);
  const lauf = useRef(0);

  // Vorschaubild wieder freigeben
  useEffect(() => () => void (fotoUrl && URL.revokeObjectURL(fotoUrl)), [fotoUrl]);

  const auftrag = findeAuftrag(werte.auftrag);
  const position = findePosition(werte.auftrag, werte.artikel);
  const vonKi = (feld: (typeof KI_FELDER)[number]) => !!etikett && etikett[feld] === werte[feld];

  async function lies(quelle: Quelle) {
    const nr = ++lauf.current;
    setPhase("liest");
    setFehler({});
    setZuVersuch(false);
    const e = await liesEtikett(quelle);
    if (nr !== lauf.current) return;
    setEtikett(e);
    setWerte((w) => ({ ...w, auftrag: e.auftrag, artikel: e.artikel, charge: e.charge }));
    setPhase("form");
  }

  function fotoGewaehlt(datei: File | undefined) {
    if (!datei) return;
    setFotoUrl(URL.createObjectURL(datei));
    lies({ art: "foto", groesse: datei.size });
  }

  function beispiel(id: string) {
    setFotoUrl(null);
    lies({ art: "beispiel", id });
  }

  function ohneFoto() {
    lauf.current++;
    setFotoUrl(null);
    setEtikett(null);
    setPhase("form");
  }

  function setze(feld: Feld, wert: string) {
    setWerte((w) => {
      const neu = { ...w, [feld]: wert };
      // Artikel gewählt: Charge aus dem Auftrag übernehmen, wenn noch keine eingetragen ist
      if (feld === "artikel" && !w.charge.trim()) neu.charge = findePosition(w.auftrag, wert)?.charge ?? "";
      if (feld === "auftrag" && !findePosition(wert, w.artikel)) neu.artikel = "";
      return neu;
    });
    // Fehler verschwindet, sobald das Feld stimmt; neue Fehler erst beim Verlassen
    if (fehler[feld]) setFehler((fe) => ({ ...fe, [feld]: pruefe(feld, { ...werte, [feld]: wert }) }));
  }

  const verlassen = (feld: Feld) => () => setFehler((fe) => ({ ...fe, [feld]: pruefe(feld, werte) }));

  async function absenden(ev: React.FormEvent) {
    ev.preventDefault();
    const neu = Object.fromEntries(REIHENFOLGE.map((feld) => [feld, pruefe(feld, werte)])) as Partial<Record<Feld, string>>;
    setFehler(neu);
    const erster = REIHENFOLGE.find((feld) => neu[feld]);
    if (erster) {
      setZuVersuch(true);
      document.getElementById(`feld-${erster}`)?.focus();
      return;
    }
    setZuVersuch(false);
    setSendet(true);
    // Zielbild: POST /api/reklamationen → Service-Ticket, Auftrag und Charge aus SAP, Verarbeiter aus dem CRM
    await new Promise((fertig) => setTimeout(fertig, 600));
    const pos = findePosition(werte.auftrag, werte.artikel)!;
    const r: Reklamation = {
      id: `r${Date.now()}`,
      nummer: naechsteNummer(),
      auftrag: findeAuftrag(werte.auftrag)!.nummer,
      verarbeiterId: ANGEMELDET.id,
      artikel: pos.artikel,
      bezeichnung: pos.bezeichnung,
      kategorie: pos.kategorie,
      charge: werte.charge.trim().toUpperCase(),
      mangel: werte.mangel as Mangel,
      menge: Number(werte.menge),
      beschreibung: werte.beschreibung.trim(),
      status: "eingegangen",
      erstellt: new Date().toISOString().slice(0, 10),
      kiFelder: [...KI_FELDER.filter(vonKi), ...(etikett && pos.artikel === etikett.artikel ? (["kategorie"] as const) : [])],
      foto: !!etikett,
    };
    anlegen(r);
    setSendet(false);
    setGesendet(r);
    setPhase("gesendet");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function neuStarten() {
    lauf.current++;
    setPhase("start");
    setFotoUrl(null);
    setEtikett(null);
    setWerte(LEER);
    setFehler({});
    setGesendet(null);
  }

  if (phase === "gesendet" && gesendet) {
    return (
      <>
        <PageHeader title={t.title} />
        <div className="flex w-full max-w-[560px] flex-col gap-4" aria-live="polite">
          <Card className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <span className="flex size-11 items-center justify-center rounded-full bg-ok-soft text-ok">
                <CircleCheck className="size-[22px]" strokeWidth={1.75} aria-hidden />
              </span>
              <div className="flex flex-col">
                <p className="text-h3 font-semibold">{t.erfolgTitel}</p>
                <p className="text-small text-muted">
                  {t.ticket} <span className="font-mono text-text">{gesendet.nummer}</span>
                </p>
              </div>
            </div>
            <p className="text-text-2">{t.erfolgText}</p>
            <dl className="grid grid-cols-2 gap-3 text-small">
              <div className="flex flex-col">
                <dt className="text-muted">{de.detail.auftrag}</dt>
                <dd className="font-mono">{gesendet.auftrag}</dd>
              </div>
              <div className="flex flex-col">
                <dt className="text-muted">{de.detail.charge}</dt>
                <dd className="font-mono">{gesendet.charge}</dd>
              </div>
              <div className="col-span-2 flex flex-col">
                <dt className="text-muted">{de.detail.artikel}</dt>
                <dd>{gesendet.bezeichnung}</dd>
              </div>
            </dl>
            <div className="flex flex-wrap gap-2">
              <Button variante="primary" icon={ImagePlus} onClick={neuStarten}>
                {t.weitere}
              </Button>
              <ButtonLink href="/reklamationen" variante="secondary">
                {t.zuDenFaellen}
              </ButtonLink>
            </div>
          </Card>
          <p className="text-caption text-muted">{de.allgemein.testdaten}</p>
        </div>
      </>
    );
  }

  return (
    <>
      <PageHeader title={t.title} lead={t.lead} />
      <div className="flex w-full max-w-[560px] flex-col gap-8">
        <Section title={t.schrittFoto}>
          <Card className="flex flex-col gap-4">
            {phase === "start" ? (
              <>
                <label
                  className={cn(
                    knopfKlasse({ variante: "primary", groesse: "l" }),
                    "w-full cursor-pointer has-[:focus-visible]:shadow-[0_0_0_3px_var(--ring)] sm:w-fit",
                  )}
                >
                  <input type="file" accept="image/*" capture="environment" className="sr-only" onChange={(e) => fotoGewaehlt(e.target.files?.[0])} />
                  <ImagePlus className="size-[18px]" strokeWidth={1.75} aria-hidden />
                  {t.fotoAufnehmen}
                </label>
                <p className="text-small text-muted">{t.fotoHinweis}</p>
                <div className="flex flex-col gap-2 border-t border-line pt-4">
                  <p className="text-small text-text-2">{t.beispiel}</p>
                  <div className="flex flex-wrap gap-2">
                    {ETIKETTEN.map((e) => (
                      <Button key={e.id} variante="outline" groesse="s" icon={Tag} onClick={() => beispiel(e.id)}>
                        {e.name}
                      </Button>
                    ))}
                  </div>
                  <Button variante="ghost" groesse="s" icon={PencilLine} onClick={ohneFoto} className="w-fit">
                    {t.ohneFoto}
                  </Button>
                </div>
              </>
            ) : (
              <>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
                  {fotoUrl ? (
                    <div className="relative aspect-[4/3] w-full overflow-hidden rounded-control bg-fill sm:w-48">
                      <Image src={fotoUrl} alt={t.fotoAlt} fill unoptimized className="object-cover" />
                    </div>
                  ) : etikett || phase === "liest" ? (
                    <EtikettBild etikett={etikett} />
                  ) : null}
                  <div className="flex min-w-0 flex-1 flex-col gap-2" aria-live="polite">
                    {phase === "liest" ? (
                      <p className="flex items-center gap-2 font-medium">
                        <ScanLine className="size-[18px] text-accent" strokeWidth={1.75} aria-hidden />
                        {t.liest}
                      </p>
                    ) : etikett ? (
                      <>
                        <Badge ton="ok">
                          <CircleCheck className="size-3.5" strokeWidth={2} aria-hidden />
                          {t.erkannt}
                        </Badge>
                        <p className="text-small text-text-2">
                          {t.sicherheit} <span className="font-mono tabular-nums">{Math.round(etikett.sicherheit * 100)} %</span>
                        </p>
                      </>
                    ) : (
                      <p className="text-small text-text-2">{t.ohneFoto}</p>
                    )}
                    <p className="flex items-start gap-2 text-small text-muted">
                      <ShieldCheck className="mt-0.5 size-4 shrink-0" strokeWidth={1.75} aria-hidden />
                      {t.datenschutz}
                    </p>
                  </div>
                </div>
                <Button variante="ghost" groesse="s" icon={ImagePlus} onClick={neuStarten} className="w-fit">
                  {t.anderesFoto}
                </Button>
              </>
            )}
          </Card>
          {fotoUrl && phase !== "start" ? <Hinweis title={t.vorschauTitel}>{t.vorschauText}</Hinweis> : null}
        </Section>

        {phase === "liest" ? (
          <Section title={t.schrittAngaben}>
            <div className="skeleton-delay flex flex-col gap-4" aria-hidden>
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="flex flex-col gap-1.5">
                  <span className="h-4 w-28 rounded-control bg-fill" />
                  <span className="h-(--ctl-h) w-full rounded-control bg-fill" />
                </div>
              ))}
            </div>
          </Section>
        ) : null}

        {phase === "form" ? (
          <Section title={t.schrittAngaben}>
            <form noValidate onSubmit={absenden} className="flex flex-col gap-4">
              {zuVersuch && Object.values(fehler).some(Boolean) ? (
                <div role="alert">
                  <Hinweis title={t.fehlerTitel} ton="danger">
                    {t.fehlerText}
                  </Hinweis>
                </div>
              ) : null}

              <Field label={f.auftrag} hinweis={vonKi("auftrag") ? t.kiHinweis : f.auftragHinweis} fehler={fehler.auftrag}>
                <KiRahmen ki={vonKi("auftrag")}>
                  <Input
                    id="feld-auftrag"
                    inputMode="numeric"
                    autoComplete="off"
                    value={werte.auftrag}
                    onChange={(e) => setze("auftrag", e.target.value)}
                    onBlur={verlassen("auftrag")}
                    aria-invalid={!!fehler.auftrag}
                    className="font-mono"
                  />
                </KiRahmen>
              </Field>

              {auftrag ? (
                <div className="flex flex-col gap-1 rounded-control bg-fill px-3 py-2 text-small">
                  <span className="font-medium">{t.auftragGefunden}</span>
                  <span className="text-text-2">
                    {t.projekt}: {auftrag.projekt} · {t.geliefert} <span className="tabular-nums">{new Date(auftrag.geliefert).toLocaleDateString("de-DE")}</span>
                  </span>
                </div>
              ) : null}

              <Field label={f.artikel} hinweis={vonKi("artikel") ? t.kiHinweis : f.artikelHinweis} fehler={fehler.artikel}>
                <KiRahmen ki={vonKi("artikel")}>
                  <Select id="feld-artikel" value={werte.artikel} onChange={(e) => setze("artikel", e.target.value)} onBlur={verlassen("artikel")} aria-invalid={!!fehler.artikel}>
                    <option value="">{f.artikelWaehlen}</option>
                    {auftrag?.positionen.map((p) => (
                      <option key={p.artikel} value={p.artikel}>
                        {p.bezeichnung} ({p.artikel})
                      </option>
                    ))}
                  </Select>
                </KiRahmen>
              </Field>
              {position ? (
                <p className="-mt-2 text-small text-text-2">
                  <KategorieName kategorie={position.kategorie} />
                </p>
              ) : null}

              <Field label={f.charge} hinweis={vonKi("charge") ? t.kiHinweis : f.chargeHinweis} fehler={fehler.charge}>
                <KiRahmen ki={vonKi("charge")}>
                  <Input
                    id="feld-charge"
                    autoComplete="off"
                    autoCapitalize="characters"
                    value={werte.charge}
                    onChange={(e) => setze("charge", e.target.value)}
                    onBlur={verlassen("charge")}
                    aria-invalid={!!fehler.charge}
                    className="font-mono"
                  />
                </KiRahmen>
              </Field>

              <Field label={f.mangel} fehler={fehler.mangel}>
                <Select id="feld-mangel" value={werte.mangel} onChange={(e) => setze("mangel", e.target.value)} onBlur={verlassen("mangel")} aria-invalid={!!fehler.mangel}>
                  <option value="">{f.mangelWaehlen}</option>
                  {(Object.keys(de.allgemein.mangel) as Mangel[]).map((m) => (
                    <option key={m} value={m}>
                      {de.allgemein.mangel[m]}
                    </option>
                  ))}
                </Select>
              </Field>

              <Field label={f.menge} hinweis={position ? `${position.einheit}` : undefined} fehler={fehler.menge}>
                <Input
                  id="feld-menge"
                  type="number"
                  inputMode="numeric"
                  min={1}
                  value={werte.menge}
                  onChange={(e) => setze("menge", e.target.value)}
                  onBlur={verlassen("menge")}
                  aria-invalid={!!fehler.menge}
                  className="w-32 tabular-nums"
                />
              </Field>

              <Field label={f.beschreibung} hinweis={f.beschreibungHinweis} fehler={fehler.beschreibung}>
                <Textarea
                  id="feld-beschreibung"
                  value={werte.beschreibung}
                  onChange={(e) => setze("beschreibung", e.target.value)}
                  onBlur={verlassen("beschreibung")}
                  aria-invalid={!!fehler.beschreibung}
                />
              </Field>

              <Button type="submit" variante="primary" groesse="l" disabled={sendet} className="w-full sm:w-fit">
                {sendet ? t.sendet : t.senden}
              </Button>
            </form>
          </Section>
        ) : null}
      </div>
    </>
  );
}

// Feld, das die KI vorgeschlagen hat: kleines Symbol rechts im Feld
function KiRahmen({ ki, children }: { ki: boolean; children: React.ReactNode }) {
  return (
    <span className="relative block">
      {children}
      {ki ? (
        <Sparkles className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-accent" strokeWidth={1.75} aria-hidden />
      ) : null}
    </span>
  );
}

// Beispiel-Etikett, wie es auf der Verpackung klebt (in Endgröße, auch während der Auslese)
function EtikettBild({ etikett }: { etikett: Etikett | null }) {
  return (
    <div className="flex w-full flex-col gap-1 rounded-control bg-surface-2 p-3 font-mono text-small shadow-[inset_0_0_0_1px_var(--line-2)] sm:w-48">
      <span className="text-caption font-semibold tracking-[.07em] text-muted uppercase">{t.etikettFirma}</span>
      {etikett ? (
        <>
          <span>{etikett.auftrag}</span>
          <span>{etikett.artikel}</span>
          <span>{etikett.charge}</span>
        </>
      ) : (
        [0, 1, 2].map((i) => <span key={i} className="h-[18px] w-3/4 rounded-control bg-fill" />)
      )}
    </div>
  );
}
