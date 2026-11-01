import type { Prospect } from "./types";

/** Admin-only, client-side filtering; never mutates CRM records or calls providers. */
export type IndustryOrder = "score" | "industry" | "business";
export type ProspectViewFilters = {
  industry: string;
  text: string;
  order: IndustryOrder;
};

const normal = (value: unknown): string =>
  typeof value === "string"
    ? value.normalize("NFKD").replace(/[\u0300-\u036f]/g, "").trim().toLocaleLowerCase("en")
    : "";

const presets: Record<string, RegExp> = {
  "preset:electricians": /\belectric(?:ian|ians|al|ity|ianship|s)?\b|\belectrical\b/i,
  "preset:accommodation": /\baccomm?odation(?:s)?\b|\bhotels?\b|\bresorts?\b|\bguest[\s-]?houses?\b|\blodg(?:e|ing|es)\b|\binns?\b|\bvillas?\b/i,
  "preset:law-firms": /\blaw(?:yer|yers)?\b|\blegal\b|\battorneys?\b|\bsolicitors?\b|\badvocates?\b/i
};

function industryLabel(prospect: Prospect): string {
  const industry = (prospect.industry || "").trim();
  const category = (prospect.category || "").trim();
  // Imported directory entries frequently use category rather than industry.
  return industry && normal(industry) !== "general industry" ? industry : category || "Uncategorised";
}

export function industryChoices(prospects: readonly Prospect[]): { value: string; label: string; count: number }[] {
  const values = new Map<string, { label: string; count: number }>();
  for (const prospect of prospects) {
    const seen = new Set<string>();
    for (const raw of [prospect.category, prospect.industry]) {
      const label = (raw || "").trim();
      const key = normal(label);
      if (!key || key === "general industry" || seen.has(key)) continue;
      seen.add(key);
      const prior = values.get(key);
      values.set(key, { label: prior?.label || label, count: (prior?.count || 0) + 1 });
    }
  }
  return Array.from(values, ([key, data]) => ({ value: "industry:" + key, ...data }))
    .sort((a, b) => a.label.localeCompare(b.label, "en", { sensitivity: "base" }));
}

export function filterAndSortProspects(prospects: readonly Prospect[], filters: ProspectViewFilters): Prospect[] {
  const matchIndustry = normal(filters.industry);
  const words = normal(filters.text).slice(0, 120);
  const output = prospects.filter(p => {
    const category = normal(p.category), industry = normal(p.industry);
    // Specific profession shortcuts look at explicit labels/name/description,
    // not at broad sectors such as "Construction" or generic "Hospitality".
    const evidence = normal([p.category, p.industry, p.businessName, p.description].join(" "));
    if (matchIndustry && matchIndustry !== "all") {
      const preset = presets[matchIndustry];
      if (preset) {
        if (!preset.test(evidence)) return false;
      } else if (matchIndustry.startsWith("industry:")) {
        const value = matchIndustry.slice("industry:".length);
        if (category !== value && industry !== value) return false;
      } else return false;
    }
    if (words) {
      const haystack = normal([p.businessName, p.category, p.industry, p.description, p.location].join(" "));
      if (!haystack.includes(words)) return false;
    }
    return true;
  });
  const byName = (a: Prospect, b: Prospect) => a.businessName.localeCompare(b.businessName, "en", { sensitivity: "base" });
  return output.sort((a, b) => filters.order === "business"
    ? byName(a, b)
    : filters.order === "industry"
      ? industryLabel(a).localeCompare(industryLabel(b), "en", { sensitivity: "base" }) || byName(a, b)
      : b.leadScore - a.leadScore || byName(a, b));
}
