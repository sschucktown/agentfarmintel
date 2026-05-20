import type { Review, ReviewAnalysis, ReviewPlaceSummary, ReviewTopic } from "@/lib/types";
import { groupBy, median, parseDate, topN } from "@/lib/utils/stats";

const POSITIVE = ["responsive", "professional", "helpful", "knowledgeable", "easy", "excellent", "great", "recommend"];
const NEGATIVE = ["slow", "unresponsive", "dirty", "problem", "issue", "bad", "poor", "rude", "complaint"];

function includesAny(content: string, words: string[]): string[] {
  const lower = content.toLowerCase();
  return words.filter((word) => lower.includes(word));
}

function classifyTopic(review: Review): ReviewTopic {
  const text = `${review.content ?? ""} ${review.category ?? ""}`.toLowerCase();
  if (/(vacation|beach|airbnb|vrbo|rental house|short.?term)/.test(text)) return "vacation rentals";
  if (/(property management|tenant|maintenance|lease|rent)/.test(text)) return "property management";
  if (/(mortgage|loan|lender|financing|refinance)/.test(text)) return "mortgage/lending";
  if (/(buyer|seller|sold|listing agent|realtor|home purchase|closing)/.test(text)) return "traditional buyer/seller real estate";
  return "irrelevant/other";
}

export function analyzeReviews(reviews: Review[]): ReviewAnalysis {
  const grouped = groupBy(reviews, (review) => review.placeId ?? review.placeName ?? "Unknown competitor");
  const places: ReviewPlaceSummary[] = Object.values(grouped).map((placeReviews) => {
    const first = placeReviews[0];
    const topicCounts = {
      "vacation rentals": 0,
      "property management": 0,
      "traditional buyer/seller real estate": 0,
      "mortgage/lending": 0,
      "irrelevant/other": 0
    } satisfies Record<ReviewTopic, number>;
    const positiveThemes = new Set<string>();
    const negativeThemes = new Set<string>();
    const newest = topN(placeReviews, 1, (review) => parseDate(review.reviewedAtDate)?.getTime() ?? 0)[0];

    for (const review of placeReviews) {
      for (const theme of includesAny(review.content ?? "", POSITIVE)) positiveThemes.add(theme);
      for (const theme of includesAny(review.content ?? "", NEGATIVE)) negativeThemes.add(theme);
      topicCounts[classifyTopic(review)] += 1;
    }

    const rentalOrPm = topicCounts["vacation rentals"] + topicCounts["property management"];
    return {
      placeName: first.placeName ?? "Unknown competitor",
      placeId: first.placeId,
      reviewsCount: placeReviews.length,
      averageRating: median(placeReviews.map((review) => review.rating)),
      newestReviewDate: newest?.reviewedAtDate ?? null,
      positiveThemes: [...positiveThemes].slice(0, 5),
      negativeThemes: [...negativeThemes].slice(0, 5),
      topicCounts,
      rentalOrPropertyManagementHeavy: placeReviews.length > 0 && rentalOrPm / placeReviews.length >= 0.5
    };
  });

  const allPositive = [...new Set(places.flatMap((place) => place.positiveThemes))].slice(0, 6);
  const allNegative = [...new Set(places.flatMap((place) => place.negativeThemes))].slice(0, 6);
  const rentalHeavy = places.filter((place) => place.rentalOrPropertyManagementHeavy).length;

  return {
    places: topN(places, 8, (place) => place.reviewsCount),
    positiveThemes: allPositive,
    negativeThemes: allNegative,
    reputationNote:
      rentalHeavy > 0
        ? `${rentalHeavy} competitor review set(s) skew toward rentals or property management, so buyer/seller reputation should not be overstated from those reviews alone.`
        : "Scraped reviews appear usable for buyer/seller reputation monitoring, subject to the limited review sample."
  };
}
