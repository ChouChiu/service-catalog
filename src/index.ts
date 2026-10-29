import { mkdir, writeFile } from "node:fs/promises";
import {
  ADGUARD_URL,
  COMMUNITY_DIR,
  COMMUNITY_REPO,
  adguardCatalog,
  communityCatalog,
  communityDirs,
  serialize,
} from "./catalog.ts";

const OUT = new URL("../output/", import.meta.url);
const CONCURRENCY = 16;

/**
 * Builds both catalogs or neither: any failed download aborts the run, so the committed files
 * are never a partial catalog
 */
async function main() {
  const [adguard, community] = await Promise.all([
    fetchJson(ADGUARD_URL).then(adguardCatalog),
    fetchCommunity().then(communityCatalog),
  ]);
  await mkdir(OUT, { recursive: true });
  await writeFile(new URL("adguard.json", OUT), serialize(adguard));
  await writeFile(new URL("community.json", OUT), serialize(community));
  for (const [name, c] of [
    ["adguard", adguard],
    ["community", community],
  ] as const) {
    const rules = c.services.reduce((n, s) => n + s.rules.length, 0);
    console.log(`${name}: ${c.services.length} services, ${rules} rules`);
  }
}

async function fetchCommunity(): Promise<{ dir: string; text: string }[]> {
  const listing = await fetchJson(
    `https://api.github.com/repos/${COMMUNITY_REPO}/contents/${COMMUNITY_DIR}`,
    process.env.GITHUB_TOKEN ? { authorization: `Bearer ${process.env.GITHUB_TOKEN}` } : {},
  );
  if (!Array.isArray(listing)) throw new Error("community listing: unexpected shape");
  const names = (listing as { name?: unknown; type?: unknown }[])
    .filter((e) => e.type === "dir" && typeof e.name === "string")
    .map((e) => e.name as string);
  const dirs = communityDirs(names);
  return mapLimit(dirs, CONCURRENCY, async (dir) => {
    const path = encodeURIComponent(dir);
    const url = `https://raw.githubusercontent.com/${COMMUNITY_REPO}/master/${COMMUNITY_DIR}/${path}/${path}.list`;
    const res = await fetch(url);
    // A directory without a Clash .list (YAML-only sets) is simply not a service here
    if (res.status === 404) return { dir, text: "" };
    if (!res.ok) throw new Error(`${url}: HTTP ${res.status}`);
    return { dir, text: await res.text() };
  });
}

async function fetchJson(url: string, headers: Record<string, string> = {}): Promise<unknown> {
  const res = await fetch(url, { headers: { "user-agent": "service-catalog", ...headers } });
  if (!res.ok) throw new Error(`${url}: HTTP ${res.status}`);
  return res.json();
}

async function mapLimit<T, R>(
  items: T[],
  limit: number,
  fn: (item: T) => Promise<R>,
): Promise<R[]> {
  const out = new Array<R>(items.length);
  let next = 0;
  const worker = async () => {
    while (next < items.length) {
      const i = next++;
      out[i] = await fn(items[i] as T);
    }
  };
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker));
  return out;
}

await main();
