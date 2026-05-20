import { describe, expect, it } from "vitest";
import { parseFacebookAds } from "@/lib/parsers/facebookAds";
import { parseGoogleMapsCompetitors } from "@/lib/parsers/googleMapsCompetitors";
import { parseGoogleReviews } from "@/lib/parsers/googleReviews";
import { parseListings } from "@/lib/parsers/listings";

describe("listing parser", () => {
  it("normalizes listing records and handles missing fields", () => {
    const listings = parseListings([
      {
        id: "zillow-1",
        address: "4 Mulroy Ct, Charleston, SC 29414",
        city: "Charleston",
        state: "SC",
        zipcode: "29414",
        price: 675000,
        bedrooms: 3,
        bathrooms: 2.5,
        sqft: 2197,
        propertyType: "SINGLE_FAMILY",
        listingStatus: "FOR_SALE",
        daysOnMarket: 11,
        listingUrls: { zillow: "https://example.com" },
        foundOnSources: ["zillow"],
        agent: { name: "Agent Name" }
      },
      { id: "missing" }
    ]);

    expect(listings[0]).toMatchObject({
      id: "zillow-1",
      zip: "29414",
      beds: 3,
      baths: 2.5,
      listingUrl: "https://example.com",
      source: "zillow",
      agentName: "Agent Name"
    });
    expect(listings[1].id).toBe("missing");
  });
});

describe("Google Maps competitor parser", () => {
  it("normalizes core and adjacent competitors", () => {
    const competitors = parseGoogleMapsCompetitors([
      {
        title: "Harbor Creek",
        totalScore: 5,
        reviewsCount: 3,
        street: "601 Harbor Creek Pl",
        city: "Charleston",
        state: "South Carolina",
        categoryName: "Real estate agency",
        url: "https://maps.example"
      },
      { title: "Mortgage Shop", categoryName: "Mortgage lender", reviewsCount: 100 }
    ]);

    expect(competitors[0]).toMatchObject({
      name: "Harbor Creek",
      rating: 5,
      googleMapsUrl: "https://maps.example",
      competitorType: "core"
    });
    expect(competitors[1].competitorType).toBe("adjacent");
  });
});

describe("Google reviews parser", () => {
  it("normalizes reviews without reviewer data", () => {
    const reviews = parseGoogleReviews([
      {
        review_id: "review-1",
        place_id: "place-1",
        place_name: "Carolina One",
        place_rating: 4.7,
        place_reviews_count: 215,
        rating: 5,
        content: "Great rental property management response.",
        reviewed_at: "3 years ago",
        reviewed_at_date: "2023-04-22T11:59:43.155000Z",
        category: "Real estate agency",
        address: ["717 Folly Rd", "Charleston, SC 29412"],
        scraped_at: "2026-05-20 17:18:40.406000+00:00",
        reviewer_id: null
      }
    ]);

    expect(reviews[0]).toMatchObject({
      reviewId: "review-1",
      placeId: "place-1",
      placeName: "Carolina One",
      rating: 5,
      address: "717 Folly Rd, Charleston, SC 29412"
    });
  });
});

describe("Facebook ads parser", () => {
  it("normalizes dotted Apify keys and null spend fields", () => {
    const ads = parseFacebookAds([
      {
        "pageInfo.page.name": "Dave Friedman Team",
        "snapshot.title": "Riverdogs Game Tickets On Us!",
        "snapshot.displayFormat": "IMAGE",
        isActive: true,
        spend: null,
        reachEstimate: null,
        publisherPlatform: ["FACEBOOK", "INSTAGRAM"],
        startDateFormatted: "2026-03-20T07:00:00.000Z",
        endDateFormatted: "2026-05-20T07:00:00.000Z"
      }
    ]);

    expect(ads[0]).toMatchObject({
      pageName: "Dave Friedman Team",
      title: "Riverdogs Game Tickets On Us!",
      displayFormat: "IMAGE",
      isActive: true,
      spend: null,
      reachEstimate: null
    });
  });
});
