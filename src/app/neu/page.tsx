import type { Metadata } from "next";
import { de } from "@/content/de";
import { Erfassung } from "./erfassung";

export const metadata: Metadata = { title: de.neu.title };

export default function Neu() {
  return <Erfassung />;
}
