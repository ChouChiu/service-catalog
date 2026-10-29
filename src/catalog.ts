import { EXCLUDED, OVERRIDES } from "../config/community.ts";

export const ADGUARD_URL = "https://adguardteam.github.io/HostlistsRegistry/assets/services.json";
export const COMMUNITY_REPO = "blackmatrix7/ios_rule_script";
export const COMMUNITY_DIR = "rule/Clash";

const ID = /^[a-z0-9_]{1,64}$/;

export interface Service {
  id: string;
  name: string;
  group: string;
  /** SVG markup; empty when the source has none */
  icon: string;
  /** AdGuard filter syntax */
  rules: string[];
}

/** One output file: every service of a single upstream, under that upstream's license */
export interface Catalog {
  source: string;
  license: string;
  services: Service[];
}

interface RegistryService {
  id?: unknown;
  name?: unknown;
  group?: unknown;
  icon_svg?: unknown;
  rules?: unknown;
}

/** AdGuard's blocked-services registry, kept as is apart from entries with unusable fields */
export function adguardCatalog(json: unknown): Catalog {
  const list = (json as { blocked_services?: unknown })?.blocked_services;
  if (!Array.isArray(list)) throw new Error("AdGuard registry: unexpected shape");
  const services: Service[] = [];
  for (const s of list as RegistryService[]) {
    if (typeof s.id !== "string" || !ID.test(s.id) || typeof s.name !== "string") continue;
    if (!Array.isArray(s.rules)) continue;
    const rules = s.rules.filter((r): r is string => typeof r === "string");
    if (rules.length === 0) continue;
    services.push({
      id: s.id,
      name: s.name,
      group: typeof s.group === "string" ? s.group : "other",
      icon: typeof s.icon_svg === "string" ? s.icon_svg : "",
      rules,
    });
  }
  if (services.length === 0) throw new Error("AdGuard registry: no services");
  return { source: ADGUARD_URL, license: "GPL-3.0", services };
}

/**
 * Clash rule lists: `DOMAIN,a.com` matches the name only and `DOMAIN-SUFFIX,a.com` its subdomains
 * too. Keyword, IP and process rules have no exact DNS equivalent and are skipped
 */
export function clashToAdblock(text: string): string[] {
  const out = new Set<string>();
  for (const line of text.split(/\r?\n/)) {
    const [kind, raw] = line.trim().split(",", 3);
    const value = raw?.trim().toLowerCase();
    if (!value || !/^[a-z0-9.*_-]+$/.test(value)) continue;
    if (kind === "DOMAIN") out.add(`|${value}^`);
    else if (kind === "DOMAIN-SUFFIX") out.add(`||${value}^`);
  }
  return [...out];
}

/** `TencentVideo` -> `tencentvideo`; IDs from OVERRIDES win */
export function communityId(dir: string): string {
  return OVERRIDES[dir]?.id ?? dir.toLowerCase().replace(/[^a-z0-9]+/g, "");
}

export function communityDirs(names: string[]): string[] {
  return names.filter((n) => !EXCLUDED.has(n) && ID.test(communityId(n))).sort();
}

/** Lists without a DOMAIN or DOMAIN-SUFFIX rule (IP-only sets) are left out */
export function communityCatalog(lists: { dir: string; text: string }[]): Catalog {
  const services: Service[] = [];
  const seen = new Map<string, string>();
  for (const { dir, text } of lists) {
    const rules = clashToAdblock(text);
    if (rules.length === 0) continue;
    const id = communityId(dir);
    const clash = seen.get(id);
    if (clash) throw new Error(`community lists ${clash} and ${dir} share the ID ${id}`);
    seen.set(id, dir);
    const override = OVERRIDES[dir];
    services.push({
      id,
      name: override?.name ?? dir,
      group: override?.group ?? "other",
      icon: "",
      rules,
    });
  }
  return {
    source: `https://github.com/${COMMUNITY_REPO}/tree/master/${COMMUNITY_DIR}`,
    license: "GPL-2.0",
    services,
  };
}

/** Stable output: diffs between runs show only real upstream changes */
export function serialize(catalog: Catalog): string {
  return `${JSON.stringify(catalog, null, 1)}\n`;
}
