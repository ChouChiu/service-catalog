import * as simpleIcons from "simple-icons";
import { ICONS } from "../config/meta.ts";

interface SimpleIcon {
  slug: string;
  title: string;
  svg: string;
}

const norm = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]/g, "");

/** Simple Icons (CC0-1.0) by slug and by normalised title */
const index = new Map<string, string>();
const bySlug = new Map<string, string>();
for (const icon of Object.values(simpleIcons) as SimpleIcon[]) {
  if (typeof icon?.slug !== "string") continue;
  bySlug.set(icon.slug, icon.svg);
  index.set(icon.slug, icon.svg);
  if (!index.has(norm(icon.title))) index.set(norm(icon.title), icon.svg);
}

for (const [dir, slug] of Object.entries(ICONS)) {
  if (!bySlug.has(slug))
    throw new Error(`config/meta.ts: ${dir} names unknown Simple Icons slug ${slug}`);
}

/** The configured slug first, then the directory name, then the ID; empty when nothing matches */
export function iconFor(dir: string, id: string): string {
  const slug = ICONS[dir];
  if (slug) return bySlug.get(slug) ?? "";
  return index.get(norm(dir)) ?? index.get(id) ?? "";
}
