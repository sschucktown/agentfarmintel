import { describe, expect, it } from "vitest";
import { buildReport } from "@/lib/report/buildReport";
import { renderMarkdown } from "@/lib/report/renderMarkdown";

describe("report generation", () => {
  it("builds practical sections from normalized sample-shaped data", () => {
    const report = buildReport({
      listings: [
        {
          id: "1",
          address: "4 Mulroy Ct",
          city: "Charleston",
          state: "SC",
          zip: "29414",
          price: 675000,
          beds: 3,
          baths: 3,
          sqft: 2197,
          pricePerSqft: 307,
          daysOnMarket: 3,
          propertyType: "SINGLE_FAMILY",
          status: "FOR_SALE",
          source: "zillow"
        },
        {
          id: "2",
          address: "Lot 1",
          city: "Charleston",
          state: "SC",
          zip: "29414",
          price: 250000,
          propertyType: "LAND",
          status: "FOR_SALE"
        }
      ],
      competitors: [
        {
          name: "Competitor Realty",
          rating: 4.9,
          reviewsCount: 120,
          city: "Charleston",
          categoryName: "Real estate agency",
          competitorType: "core"
        }
      ],
      reviews: [
        {
          reviewId: "r1",
          placeId: "p1",
          placeName: "Competitor Realty",
          placeRating: 4.9,
          placeReviewsCount: 120,
          rating: 5,
          content: "Excellent buyer agent with strong communication.",
          reviewedAtDate: "2026-05-01T00:00:00.000Z",
          category: "Real estate agency"
        }
      ],
      ads: [
        {
          pageName: "Competitor Realty",
          title: "Riverdogs Game Tickets On Us!",
          displayFormat: "IMAGE",
          isActive: true,
          spend: null,
          reachEstimate: null,
          publisherPlatform: ["FACEBOOK"]
        }
      ]
    });

    const markdown = renderMarkdown(report);

    expect(report.sections.map((section) => section.title)).toContain("Executive Summary");
    expect(report.listings.landListingCount).toBe(1);
    expect(report.ads.activeAds).toBe(1);
    expect(markdown).toContain("Recommended Actions This Week");
    expect(markdown).toContain("Agent Farm Intel");
  });
});
