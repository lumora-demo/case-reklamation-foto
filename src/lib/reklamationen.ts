"use client";

import { useSyncExternalStore } from "react";
import { REKLAMATIONEN, type Reklamation } from "./demo-daten";

// Zustand im Browser (Live-Vorschau ohne Server): Testdaten plus selbst gemeldete Fälle aus localStorage.
// Im Zielbild ersetzt durch GET/POST /api/reklamationen (backend/Lumora.Api).
const SCHLUESSEL = "lumora-reklamationen";
const hoerer = new Set<() => void>();
let cache: Reklamation[] | null = null;

function eigene(): Reklamation[] {
  try {
    const roh = window.localStorage.getItem(SCHLUESSEL);
    return roh ? (JSON.parse(roh) as Reklamation[]) : [];
  } catch {
    return [];
  }
}

function lesen() {
  if (!cache) cache = [...eigene(), ...REKLAMATIONEN];
  return cache;
}

function abonnieren(fn: () => void) {
  hoerer.add(fn);
  return () => hoerer.delete(fn);
}

export function useReklamationen() {
  return useSyncExternalStore(abonnieren, lesen, () => REKLAMATIONEN);
}

export function naechsteNummer() {
  const hoechste = Math.max(...lesen().map((r) => Number(r.nummer.split("-")[2])));
  return `RK-2026-${String(hoechste + 1).padStart(4, "0")}`;
}

export function anlegen(r: Reklamation) {
  const neu = [r, ...eigene()];
  try {
    window.localStorage.setItem(SCHLUESSEL, JSON.stringify(neu));
  } catch {
    // Speicher voll oder gesperrt: Fall bleibt bis zum Neuladen sichtbar
  }
  cache = [r, ...lesen()];
  hoerer.forEach((fn) => fn());
}
