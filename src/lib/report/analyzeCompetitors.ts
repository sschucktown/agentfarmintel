import type { Competitor, CompetitorAnalysis } from "@/lib/types";
import { topN } from "@/lib/utils/stats";

export function analyzeCompetitors(competitors: Competitor[]): CompetitorAnalysis {
  const coreCompetitors = competitors.filter((competitor) => competitor.competitorType === "core");
  const adjacentCompetitors = competitors.filter((competitor) => competitor.competitorType === "adjacent");
  const topByReviewCount = topN(coreCompetitors, 5, (competitor) => competitor.reviewsCount);
  const topByRating = topN(
    coreCompetitors.filter((competitor) => (competitor.reviewsCount ?? 0) >= 10),
    5,
    (competitor) => competitor.rating
  );
  const missingWebsites = coreCompetitors.filter((competitor) => !competitor.website).slice(0, 5);
  const lowReviewCounts = coreCompetitors.filter((competitor) => (competitor.reviewsCount ?? 0) < 10).slice(0, 5);
  const leader = topByReviewCount[0];

  return {
    coreCompetitors,
    adjacentCompetitors,
    topByReviewCount,
    topByRating,
    missingWebsites,
    lowReviewCounts,
    summary: leader
      ? `${leader.name ?? "The leading visible competitor"} is the local visibility benchmark with ${leader.reviewsCount ?? 0} Google reviews. Agents with lower review counts should prioritize steady review generation.`
      : "No core real estate competitor with review data was found in the Google Maps export."
  };
}
