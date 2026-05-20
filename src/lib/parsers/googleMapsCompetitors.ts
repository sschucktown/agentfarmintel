import type { Competitor, CompetitorType } from "@/lib/types";
import { firstNumber, firstString } from "@/lib/utils/stats";

type RawRecord = Record<string, unknown>;

const CORE_CATEGORIES = new Set(["real estate agent", "real estate agency", "real estate consultant"]);
const ADJACENT_TERMS = ["mortgage", "property management", "commercial real estate", "apartment", "rental", "title company"];

function classify(category?: string): CompetitorType | null {
  const normalized = category?.toLowerCase() ?? "";
  if (CORE_CATEGORIES.has(normalized)) return "core";
  if (ADJACENT_TERMS.some((term) => normalized.includes(term))) return "adjacent";
  if (normalized.includes("real estate")) return "adjacent";
  return null;
}

export function parseGoogleMapsCompetitors(records: unknown[]): Competitor[] {
  const competitors: Competitor[] = [];
  for (const raw of records.filter((record): record is RawRecord => !!record && typeof record === "object")) {
    const categoryName = firstString(raw.categoryName, raw.category);
    const competitorType = classify(categoryName);
    if (!competitorType) continue;
    competitors.push({
      name: firstString(raw.name, raw.title),
      rating: firstNumber(raw.rating, raw.totalScore),
      reviewsCount: firstNumber(raw.reviewsCount, raw.reviewCount),
      street: firstString(raw.street),
      city: firstString(raw.city),
      state: firstString(raw.state),
      website: firstString(raw.website, raw.websiteUrl),
      phone: firstString(raw.phone),
      categoryName,
      googleMapsUrl: firstString(raw.googleMapsUrl, raw.url),
      imageUrl: firstString(raw.imageUrl),
      competitorType
    });
  }
  return competitors;
}
