import type { Listing, ListingAnalysis } from "@/lib/types";
import { countBy, median, topN } from "@/lib/utils/stats";

function isLand(listing: Listing): boolean {
  return (listing.propertyType ?? "").toUpperCase().includes("LAND");
}

function isPriceOutlier(listing: Listing): boolean {
  return typeof listing.price === "number" && (listing.price <= 0 || listing.price > 10_000_000);
}

function validResidential(listing: Listing): boolean {
  return !isLand(listing) && !isPriceOutlier(listing);
}

export function analyzeListings(listings: Listing[]): ListingAnalysis {
  const excludedOutliers = listings.filter(isPriceOutlier);
  const landListings = listings.filter(isLand);
  const residential = listings.filter(validResidential);
  const pricePerSqftListings = residential.filter(
    (listing) => typeof listing.sqft === "number" && listing.sqft > 0 && typeof listing.pricePerSqft === "number"
  );
  const freshListings = residential.filter((listing) => (listing.daysOnMarket ?? Infinity) <= 7);
  const staleListings = residential.filter((listing) => (listing.daysOnMarket ?? -Infinity) >= 60);
  const listingsWorthWatching = topN(
    [...freshListings, ...staleListings].filter((listing, index, all) => all.findIndex((item) => item.id === listing.id) === index),
    8,
    (listing) => (listing.daysOnMarket ?? 0) + (listing.pricePerSqft ?? 0) / 100
  );

  return {
    totalListings: listings.length,
    residentialListingCount: residential.length,
    landListingCount: landListings.length,
    listingsByZip: countBy(listings, (listing) => listing.zip ?? "Unknown"),
    medianResidentialPrice: median(residential.map((listing) => listing.price)),
    medianPricePerSqft: median(pricePerSqftListings.map((listing) => listing.pricePerSqft)),
    medianDaysOnMarket: median(residential.map((listing) => listing.daysOnMarket)),
    freshListings,
    staleListings,
    listingsWorthWatching,
    excludedOutliers
  };
}
