import type { Ad } from "@/lib/types";
import { firstNumber, firstString } from "@/lib/utils/stats";

type RawRecord = Record<string, unknown>;

function platforms(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === "string" && item.trim().length > 0);
}

export function parseFacebookAds(records: unknown[]): Ad[] {
  return records.filter((record): record is RawRecord => !!record && typeof record === "object").map((raw) => ({
    pageName: firstString(raw.pageName, raw["pageInfo.page.name"]),
    title: firstString(raw.title, raw["snapshot.title"]),
    displayFormat: firstString(raw.displayFormat, raw["snapshot.displayFormat"]),
    isActive: Boolean(raw.isActive),
    spend: raw.spend == null ? null : firstNumber(raw.spend),
    reachEstimate: raw.reachEstimate == null ? null : firstNumber(raw.reachEstimate),
    publisherPlatform: platforms(raw.publisherPlatform),
    startDate: firstString(raw.startDate, raw.startDateFormatted),
    endDate: firstString(raw.endDate, raw.endDateFormatted)
  }));
}
