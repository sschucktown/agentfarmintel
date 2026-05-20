import type { Ad, AgentFarmIntelReport, Competitor, Listing, RecommendedAction, ReportSection, Review } from "@/lib/types";
import { analyzeAds } from "@/lib/report/analyzeAds";
import { analyzeCompetitors } from "@/lib/report/analyzeCompetitors";
import { analyzeListings } from "@/lib/report/analyzeListings";
import { analyzeReviews } from "@/lib/report/analyzeReviews";
import { formatCurrency, formatNumber } from "@/lib/utils/stats";

export interface BuildReportInput {
  listings: Listing[];
  competitors: Competitor[];
  reviews: Review[];
  ads: Ad[];
}

function listingLabel(listing: Listing): string {
  return listing.address || [listing.city, listing.state, listing.zip].filter(Boolean).join(", ") || listing.id || "Unknown listing";
}

function contentIdeas(report: Pick<AgentFarmIntelReport, "listings" | "competitors" | "ads">) {
  const medianPrice = formatCurrency(report.listings.medianResidentialPrice);
  return {
    socialPosts: [
      `Market pulse: explain what a ${medianPrice} median residential price means for homeowners in the farm area.`,
      `Fresh-listing watch: spotlight common traits in the ${report.listings.freshListings.length} newest listings without naming private clients.`,
      `Seller reality check: use stale inventory to show why pricing and launch presentation matter this week.`
    ],
    newsletterBlurb: `This week's farm-area brief shows ${report.listings.residentialListingCount} residential listings, ${report.listings.freshListings.length} fresh opportunities, and ${report.listings.staleListings.length} stale listings that may pressure pricing conversations.`,
    sellerFollowUpAngle: "Use stale listings and median days on market to frame a pricing-health conversation.",
    buyerFollowUpAngle: "Use fresh listings and ZIP-level inventory to restart conversations with buyers who paused."
  };
}

function recommendedActions(input: BuildReportInput, report: Pick<AgentFarmIntelReport, "listings" | "competitors" | "reviews" | "ads">): RecommendedAction[] {
  const competitorLeader = report.competitors.topByReviewCount[0];
  return [
    {
      title: "Send a fresh-listing buyer note",
      whyItMatters: `${report.listings.freshListings.length} listing(s) are seven days old or newer, which gives buyers a timely reason to re-engage.`,
      script: "A few new options hit the area this week. Want me to send the best-fit ones before the weekend showing rush?"
    },
    {
      title: "Call sellers around stale inventory",
      whyItMatters: `${report.listings.staleListings.length} residential listing(s) have been on market 60+ days, creating a pricing and positioning proof point.`,
      script: "Homes that sit are usually telling us something about price, presentation, or launch timing. Here is what I am seeing nearby."
    },
    {
      title: "Ask three past clients for Google reviews",
      whyItMatters: competitorLeader
        ? `${competitorLeader.name ?? "A visible competitor"} has ${competitorLeader.reviewsCount ?? 0} reviews, setting the local trust benchmark.`
        : "Competitor review counts are visible in search, and a steady review habit compounds over time.",
      script: "Your review would help local buyers and sellers understand what it is like to work with me. Would you be open to posting a quick Google review this week?"
    },
    {
      title: "Post one local-value content piece",
      whyItMatters: `Competitor ads show ${report.ads.totalAds} campaign(s), so organic local content should reinforce your area expertise.`,
      script: "Use a short post explaining one market shift and one practical move for buyers or sellers."
    }
  ].slice(0, input.ads.length > 0 ? 4 : 3);
}

export function buildReport(input: BuildReportInput): AgentFarmIntelReport {
  const listings = analyzeListings(input.listings);
  const competitors = analyzeCompetitors(input.competitors);
  const reviews = analyzeReviews(input.reviews);
  const ads = analyzeAds(input.ads);
  const ideas = contentIdeas({ listings, competitors, ads });
  const actions = recommendedActions(input, { listings, competitors, reviews, ads });

  const sections: ReportSection[] = [
    {
      title: "Executive Summary",
      bullets: [
        `Market signal: ${listings.residentialListingCount} residential listings with median price ${formatCurrency(listings.medianResidentialPrice)} and median DOM ${formatNumber(listings.medianDaysOnMarket)}.`,
        `Competitor signal: ${competitors.summary}`,
        `Review signal: ${reviews.reputationNote}`,
        `Ad signal: ${ads.totalAds > 0 ? `${ads.activeAds} active ad(s) found. ${ads.spendReachNote}` : "No competitor ads were found in the export."}`,
        ...actions.slice(0, 3).map((action) => `Recommended: ${action.title}.`)
      ]
    },
    {
      title: "Market Movement",
      summary: `Residential inventory is concentrated across ${Object.keys(listings.listingsByZip).length} ZIP code(s). Prefer medians over averages because scraped listings can include outliers and land.`,
      rows: [
        { Metric: "Total listings", Value: listings.totalListings },
        { Metric: "Residential listings", Value: listings.residentialListingCount },
        { Metric: "Land listings", Value: listings.landListingCount },
        { Metric: "Median residential price", Value: formatCurrency(listings.medianResidentialPrice) },
        { Metric: "Median price per sqft", Value: listings.medianPricePerSqft ? `$${formatNumber(listings.medianPricePerSqft)}` : "Not available" },
        { Metric: "Median days on market", Value: formatNumber(listings.medianDaysOnMarket) }
      ]
    },
    {
      title: "Listings Worth Watching",
      summary: "Use these properties as conversation starters for buyers, sellers, and pricing education.",
      rows: listings.listingsWorthWatching.map((listing) => ({
        Listing: listingLabel(listing),
        Price: formatCurrency(listing.price),
        DOM: listing.daysOnMarket ?? "N/A",
        Type: listing.propertyType ?? "N/A"
      }))
    },
    {
      title: "Stale Listings / Price-Drop Watch",
      summary: "Stale listings are useful seller education. They show where the market may be resisting price or presentation.",
      rows: listings.staleListings.slice(0, 8).map((listing) => ({
        Listing: listingLabel(listing),
        Price: formatCurrency(listing.price),
        DOM: listing.daysOnMarket ?? "N/A"
      }))
    },
    {
      title: "Local Competitor Visibility",
      summary: competitors.summary,
      rows: competitors.topByReviewCount.map((competitor) => ({
        Competitor: competitor.name,
        Rating: competitor.rating ?? "N/A",
        Reviews: competitor.reviewsCount ?? 0,
        Category: competitor.categoryName
      }))
    },
    {
      title: "Review Reputation Watch",
      summary: reviews.reputationNote,
      rows: reviews.places.map((place) => ({
        Competitor: place.placeName,
        "Scraped reviews": place.reviewsCount,
        "Avg rating": place.averageRating ? formatNumber(place.averageRating) : "N/A",
        "Newest review": place.newestReviewDate?.slice(0, 10) ?? "N/A",
        Note: place.rentalOrPropertyManagementHeavy ? "Rental/property-management heavy" : "Buyer/seller signal usable"
      }))
    },
    {
      title: "Competitor Ad Watch",
      summary: ads.spendReachNote,
      rows: Object.entries(ads.campaignThemes).map(([theme, count]) => ({ Theme: theme, Ads: count }))
    },
    {
      title: "Content Ideas for the Agent",
      bullets: [
        ...ideas.socialPosts.map((idea, index) => `Social ${index + 1}: ${idea}`),
        `Newsletter: ${ideas.newsletterBlurb}`,
        `Seller angle: ${ideas.sellerFollowUpAngle}`,
        `Buyer angle: ${ideas.buyerFollowUpAngle}`
      ]
    },
    {
      title: "Suggested Client Follow-Ups",
      bullets: [
        `Buyer follow-up: ${actions[0].script}`,
        `Seller follow-up: ${actions[1].script}`,
        `Past-client review request: ${actions[2].script}`
      ]
    },
    {
      title: "Recommended Actions This Week",
      rows: actions.map((action) => ({
        Action: action.title,
        "Why it matters": action.whyItMatters,
        "Script / talking point": action.script ?? ""
      }))
    }
  ];

  return {
    generatedAt: new Date().toISOString(),
    listings,
    competitors,
    reviews,
    ads,
    contentIdeas: ideas,
    clientFollowUps: sections[8].bullets ?? [],
    recommendedActions: actions,
    sections
  };
}
