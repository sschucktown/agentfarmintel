import type { Ad, AdAnalysis } from "@/lib/types";
import { countBy } from "@/lib/utils/stats";

const THEME_RULES: Array<[string, RegExp]> = [
  ["local event giveaway", /(event|festival|community|giveaway)/i],
  ["sports/game ticket giveaway", /(ticket|game|riverdogs|sports)/i],
  ["price drop", /(price drop|reduced|new price)/i],
  ["listing promotion", /(listing|open house|home for sale|just listed)/i],
  ["dynamic product/listing ad", /(dynamic|catalog|homes near|available homes)/i],
  ["generic brand awareness", /(team|realtor|real estate|trusted|local expert)/i]
];

function classify(title = ""): string {
  return THEME_RULES.find(([, pattern]) => pattern.test(title))?.[0] ?? "generic brand awareness";
}

export function analyzeAds(ads: Ad[]): AdAnalysis {
  const activeAds = ads.filter((ad) => ad.isActive).length;
  const campaignThemes = countBy(ads, (ad) => classify(ad.title));
  const hasSpendOrReach = ads.some((ad) => ad.spend != null || ad.reachEstimate != null);

  return {
    totalAds: ads.length,
    activeAds,
    inactiveAds: ads.length - activeAds,
    adTitles: ads.map((ad) => ad.title).filter((title): title is string => !!title),
    displayFormats: countBy(ads, (ad) => ad.displayFormat ?? "Unknown"),
    platformPlacements: countBy(ads.flatMap((ad) => ad.publisherPlatform), (platform) => platform),
    campaignThemes,
    spendReachNote: hasSpendOrReach
      ? "Some ads include spend or reach estimates; treat them as directional because scraper coverage can vary."
      : "Spend and reach were unavailable in this export, so this section reflects ad presence and messaging themes only."
  };
}
