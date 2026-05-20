import { describe, expect, it } from "vitest";
import { analyzeListings } from "@/lib/report/analyzeListings";
import type { FarmConfig, Listing } from "@/lib/types";

const farmConfig: FarmConfig = {
  productName: "Agent Farm Intel",
  reportName: "James Island Farm Area Brief",
  agentAudience: "real estate agents farming James Island and nearby Charleston neighborhoods",
  farmArea: {
    label: "James Island / 29412",
    city: "Charleston",
    state: "SC",
    zipCodes: ["29412"]
  },
  propertyFilters: {
    includePropertyTypes: ["SINGLE_FAMILY", "CONDO", "TOWNHOUSE", "MULTI_FAMILY"],
    excludePropertyTypes: ["LAND"],
    minPrice: 100000,
    maxPrice: 10000000
  },
  competitorSearchLabel: "James Island / Folly Road competitor set",
  reportCadence: "Weekly"
};

function listing(overrides: Listing): Listing {
  return {
    id: overrides.id,
    address: overrides.address ?? overrides.id,
    city: "Charleston",
    state: "SC",
    zip: "29412",
    price: 500000,
    sqft: 2000,
    pricePerSqft: 250,
    daysOnMarket: 20,
    propertyType: "SINGLE_FAMILY",
    ...overrides
  };
}

describe("listing analysis", () => {
  it("filters market stats to the configured ZIP and residential property types", () => {
    const analysis = analyzeListings(
      [
        listing({ id: "fresh", price: 450000, sqft: 1800, pricePerSqft: 250, daysOnMarket: 3 }),
        listing({ id: "stale", price: 650000, sqft: 2600, pricePerSqft: 250, daysOnMarket: 80 }),
        listing({ id: "land", propertyType: "LAND", price: 200000, daysOnMarket: 8 }),
        listing({ id: "outside", zip: "29414", price: 900000, daysOnMarket: 1 }),
        listing({ id: "outlier", price: 25_000_000, pricePerSqft: 2500, daysOnMarket: 5 })
      ],
      farmConfig
    );

    expect(analysis.totalRawListingsLoaded).toBe(5);
    expect(analysis.listingsInFarmZipCount).toBe(4);
    expect(analysis.residentialListingCount).toBe(2);
    expect(analysis.landListingCount).toBe(1);
    expect(analysis.outliersExcludedCount).toBe(1);
    expect(analysis.medianResidentialPrice).toBe(550000);
    expect(analysis.medianPricePerSqft).toBe(250);
    expect(analysis.medianDaysOnMarket).toBe(41.5);
  });

  it("detects fresh and stale farm-area listings with ordered action reasons", () => {
    const analysis = analyzeListings(
      [
        listing({ id: "fresh-expensive", address: "Fresh B", price: 700000, daysOnMarket: 1 }),
        listing({ id: "fresh-cheap", address: "Fresh A", price: 400000, daysOnMarket: 1 }),
        listing({ id: "stale-long", address: "Stale B", daysOnMarket: 110 }),
        listing({ id: "stale-short", address: "Stale A", daysOnMarket: 65 })
      ],
      farmConfig
    );

    expect(analysis.freshListings.map((item) => item.id)).toEqual(["fresh-cheap", "fresh-expensive"]);
    expect(analysis.staleListings.map((item) => item.id)).toEqual(["stale-long", "stale-short"]);
    expect(analysis.freshListingCount).toBe(2);
    expect(analysis.staleListingCount).toBe(2);
    expect(analysis.freshListings[0].analysisReason).toContain("New farm-area inventory");
    expect(analysis.staleListings[0].analysisReason).toContain("seller education");
  });
});
