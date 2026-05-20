import type { Review } from "@/lib/types";
import { firstNumber, firstString } from "@/lib/utils/stats";

type RawRecord = Record<string, unknown>;

function normalizeAddress(value: unknown): string | undefined {
  if (Array.isArray(value)) return value.filter((part) => typeof part === "string" && part.trim()).join(", ");
  return firstString(value);
}

export function parseGoogleReviews(records: unknown[]): Review[] {
  return records.filter((record): record is RawRecord => !!record && typeof record === "object").map((raw) => ({
    reviewId: firstString(raw.reviewId, raw.review_id),
    placeId: firstString(raw.placeId, raw.place_id),
    placeName: firstString(raw.placeName, raw.place_name),
    placeRating: firstNumber(raw.placeRating, raw.place_rating),
    placeReviewsCount: firstNumber(raw.placeReviewsCount, raw.place_reviews_count),
    rating: firstNumber(raw.rating),
    content: firstString(raw.content, raw.text),
    reviewedAt: firstString(raw.reviewedAt, raw.reviewed_at),
    reviewedAtDate: firstString(raw.reviewedAtDate, raw.reviewed_at_date),
    category: firstString(raw.category),
    address: normalizeAddress(raw.address),
    scrapedAt: firstString(raw.scrapedAt, raw.scraped_at)
  }));
}
