import type { FarmConfig, Listing, ListingAnalysis } from "@/lib/types";
import { countBy, median } from "@/lib/utils/stats";

function normalizedType(listing: Listing): string {
  return (listing.propertyType ?? "").toUpperCase();
}

function isExcludedType(listing: Listing, config: FarmConfig): boolean {
  const type = normalizedType(listing);
  return config.propertyFilters.excludePropertyTypes.some((excluded) => type.includes(excluded.toUpperCase()));
}

function isIncludedResidentialType(listing: Listing, config: FarmConfig): boolean {
  const type = normalizedType(listing);
  return config.propertyFilters.includePropertyTypes.some((included) => type.includes(included.toUpperCase()));
}

function isPriceOutlier(listing: Listing, config: FarmConfig): boolean {
  return (
    typeof listing.price === "number" &&
    (listing.price < config.propertyFilters.minPrice || listing.price > config.propertyFilters.maxPrice)
  );
}

function withReason(listing: Listing, analysisReason: string): Listing {
  return { ...listing, analysisReason };
}

export function analyzeListings(listings: Listing[], config: FarmConfig): ListingAnalysis {
  const farmZips = new Set(config.farmArea.zipCodes);
  const farmListings = listings.filter((listing) => !!listing.zip && farmZips.has(listing.zip));
  const landListings = farmListings.filter((listing) => isExcludedType(listing, config));
  const excludedOutliers = farmListings.filter((listing) => isPriceOutlier(listing, config));
  const residential = farmListings.filter(
    (listing) => isIncludedResidentialType(listing, config) && !isExcludedType(listing, config) && !isPriceOutlier(listing, config)
  );
  const pricePerSqftListings = residential.filter(
    (listing) => typeof listing.sqft === "number" && listing.sqft > 0 && typeof listing.pricePerSqft === "number"
  );
  const medianResidentialPrice = median(residential.map((listing) => listing.price));
  const medianPricePerSqft = median(pricePerSqftListings.map((listing) => listing.pricePerSqft));
  const medianDaysOnMarket = median(residential.map((listing) => listing.daysOnMarket));
  const freshListings = residential
    .filter((listing) => (listing.daysOnMarket ?? Infinity) <= 7)
    .sort((a, b) => (a.daysOnMarket ?? Infinity) - (b.daysOnMarket ?? Infinity) || (a.price ?? Infinity) - (b.price ?? Infinity))
    .map((listing) => withReason(listing, "New farm-area inventory gives buyers a timely reason to re-engage."));
  const staleListings = residential
    .filter((listing) => (listing.daysOnMarket ?? -Infinity) >= 60)
    .sort((a, b) => (b.daysOnMarket ?? -Infinity) - (a.daysOnMarket ?? -Infinity))
    .map((listing) => withReason(listing, "Longer market time creates a seller education and pricing-positioning example."));
  const pricingConversationStarters = residential
    .filter((listing) => {
      const highPpsf = medianPricePerSqft != null && typeof listing.pricePerSqft === "number" && listing.pricePerSqft >= medianPricePerSqft * 1.25;
      const lowPpsf = medianPricePerSqft != null && typeof listing.pricePerSqft === "number" && listing.pricePerSqft <= medianPricePerSqft * 0.75;
      const highPrice = medianResidentialPrice != null && typeof listing.price === "number" && listing.price >= medianResidentialPrice * 1.35;
      const lowPrice = medianResidentialPrice != null && typeof listing.price === "number" && listing.price <= medianResidentialPrice * 0.75;
      return highPpsf || lowPpsf || highPrice || lowPrice;
    })
    .map((listing) =>
      withReason(
        listing,
        "Price or price-per-square-foot sits away from the farm median, useful for a pricing expectations conversation."
      )
    )
    .slice(0, 8);

  return {
    totalRawListingsLoaded: listings.length,
    totalListings: listings.length,
    listingsInFarmZipCount: farmListings.length,
    residentialListingCount: residential.length,
    landListingCount: landListings.length,
    outliersExcludedCount: excludedOutliers.length,
    listingsByZip: countBy(listings, (listing) => listing.zip ?? "Unknown"),
    medianResidentialPrice,
    medianPricePerSqft,
    medianDaysOnMarket,
    freshListingCount: freshListings.length,
    staleListingCount: staleListings.length,
    freshListings,
    staleListings,
    pricingConversationStarters,
    listingsWorthWatching: freshListings,
    excludedOutliers
  };
}
