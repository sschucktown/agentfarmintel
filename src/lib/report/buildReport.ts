import type { Ad, AgentFarmIntelReport, Competitor, FarmConfig, Listing, RecommendedAction, ReportSection, Review } from "@/lib/types";
import { analyzeAds } from "@/lib/report/analyzeAds";
import { analyzeCompetitors } from "@/lib/report/analyzeCompetitors";
import { analyzeListings } from "@/lib/report/analyzeListings";
import { analyzeReviews } from "@/lib/report/analyzeReviews";
import { loadFarmConfig } from "@/lib/report/farmConfig";
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

function contentIdeas(config: FarmConfig, report: Pick<AgentFarmIntelReport, "listings" | "competitors" | "ads">) {
  const medianPrice = formatCurrency(report.listings.medianResidentialPrice);
  return {
    socialPosts: [
      `Market pulse: explain what a ${medianPrice} median residential price means for homeowners in ${config.farmArea.label}.`,
      `Fresh-listing watch: spotlight common traits in the ${report.listings.freshListings.length} newest listings without naming private clients.`,
      `Seller reality check: use stale inventory to show why pricing and launch presentation matter this week.`
    ],
    newsletterBlurb: `This week's ${config.farmArea.label} brief shows ${report.listings.residentialListingCount} residential listings, ${report.listings.freshListings.length} fresh opportunities, and ${report.listings.staleListings.length} stale listings that may pressure pricing conversations.`,
    sellerFollowUpAngle: "Use stale listings and median days on market to frame a pricing-health conversation.",
    buyerFollowUpAngle: "Use fresh listings and ZIP-level inventory to restart conversations with buyers who paused."
  };
}

function recommendedActions(input: BuildReportInput, config: FarmConfig, report: Pick<AgentFarmIntelReport, "listings" | "competitors" | "reviews" | "ads">): RecommendedAction[] {
  const competitorLeader = report.competitors.topByReviewCount[0];
  return [
    {
      title: `Send a fresh-listing buyer note for ${config.farmArea.zipCodes.join(", ")}`,
      whyItMatters: `${report.listings.freshListings.length} farm-area listing(s) are seven days old or newer, which gives buyers a timely reason to re-engage.`,
      script: `A few new options hit ${config.farmArea.label} this week. Want me to send the best-fit ones before the weekend showing rush?`
    },
    {
      title: "Use stale inventory as seller education",
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
      script: `Use a short post explaining one ${config.farmArea.label} market signal and one practical move for buyers or sellers.`
    }
  ].slice(0, input.ads.length > 0 ? 4 : 3);
}

function listingRow(listing: Listing) {
  return {
    Address: listingLabel(listing),
    Price: formatCurrency(listing.price),
    DOM: listing.daysOnMarket ?? "N/A",
    Type: listing.propertyType ?? "N/A",
    "Reason it matters": listing.analysisReason ?? ""
  };
}

export function buildReport(input: BuildReportInput, config: FarmConfig = loadFarmConfig()): AgentFarmIntelReport {
  const listings = analyzeListings(input.listings, config);
  const competitors = analyzeCompetitors(input.competitors);
  const reviews = analyzeReviews(input.reviews);
  const ads = analyzeAds(input.ads);
  const ideas = contentIdeas(config, { listings, competitors, ads });
  const actions = recommendedActions(input, config, { listings, competitors, reviews, ads });

  const sections: ReportSection[] = [
    {
      title: "Executive Summary",
      bullets: [
        `Market signal: ${listings.residentialListingCount} residential ${config.farmArea.label} listings with median price ${formatCurrency(listings.medianResidentialPrice)} and median DOM ${formatNumber(listings.medianDaysOnMarket)}.`,
        `Data scope: ${listings.totalRawListingsLoaded} raw listings loaded; ${listings.listingsInFarmZipCount} matched the configured farm ZIP; ${listings.landListingCount} land listing(s) and ${listings.outliersExcludedCount} price outlier(s) were excluded from residential stats.`,
        `Competitor signal: ${competitors.summary}`,
        `Review signal: ${reviews.reputationNote}`,
        `Ad signal: ${ads.totalAds > 0 ? `${ads.activeAds} active ad(s) found. ${ads.spendReachNote}` : "No competitor ads were found in the export."}`,
        ...actions.slice(0, 3).map((action) => `Recommended: ${action.title}.`)
      ]
    },
    {
      title: "Market Movement",
      summary: `Why this matters: these medians are scoped to ${config.farmArea.label}, not the full raw export, so agents can talk about the farm area instead of the broader scraped dataset.`,
      rows: [
        { Metric: "Total raw listings loaded", Value: listings.totalRawListingsLoaded },
        { Metric: "Listings in farm ZIP", Value: listings.listingsInFarmZipCount },
        { Metric: "Residential listings in farm ZIP", Value: listings.residentialListingCount },
        { Metric: "Land listings excluded", Value: listings.landListingCount },
        { Metric: "Outliers excluded", Value: listings.outliersExcludedCount },
        { Metric: "Median residential price", Value: formatCurrency(listings.medianResidentialPrice) },
        { Metric: "Median price per sqft", Value: listings.medianPricePerSqft ? `$${formatNumber(listings.medianPricePerSqft)}` : "Not available" },
        { Metric: "Median days on market", Value: formatNumber(listings.medianDaysOnMarket) },
        { Metric: "Fresh listings <= 7 DOM", Value: listings.freshListingCount },
        { Metric: "Stale listings >= 60 DOM", Value: listings.staleListingCount }
      ]
    },
    {
      title: "Fresh Listings to Watch",
      summary: "Why this matters: new listings create a timely buyer touchpoint before weekend showing plans harden.",
      rows: listings.freshListings.slice(0, 8).map(listingRow)
    },
    {
      title: "Stale Listings / Seller Education",
      summary: "Why this matters: stale inventory helps sellers understand why launch price, condition, and presentation matter.",
      rows: listings.staleListings.slice(0, 8).map(listingRow)
    },
    {
      title: "Pricing Conversation Starters",
      summary: "Why this matters: notable price or price-per-square-foot gaps give agents concrete examples for expectation-setting conversations.",
      rows: listings.pricingConversationStarters.map(listingRow)
    },
    {
      title: "Local Competitor Visibility",
      summary: `Competitor data is based on Google Maps visibility for the configured local search set: ${config.competitorSearchLabel}. ${competitors.summary}`,
      rows: competitors.topByReviewCount.map((competitor) => ({
        Competitor: competitor.name,
        Rating: competitor.rating ?? "N/A",
        Reviews: competitor.reviewsCount ?? 0,
        Category: competitor.categoryName,
        Website: competitor.website ?? "N/A"
      }))
    },
    {
      title: "Review Reputation Watch",
      summary: `${reviews.reputationNote} Do not overstate rental-heavy reviews as direct buyer/seller agent reputation.`,
      rows: reviews.places.map((place) => ({
        Competitor: place.placeName,
        "Scraped reviews": place.reviewsCount,
        "Avg rating": place.averageRating ? formatNumber(place.averageRating) : "N/A",
        "Newest review": place.newestReviewDate?.slice(0, 10) ?? "N/A",
        "Review signal": place.interpretation,
        Note: place.rentalOrPropertyManagementHeavy ? "Rental/property-management heavy; avoid treating as direct buyer/seller proof" : "Buyer/seller signal may be usable"
      }))
    },
    {
      title: "Facebook Ad Watch",
      summary: ads.spendReachNote,
      rows: [
        { Metric: "Active ads", Value: ads.activeAds },
        { Metric: "Inactive ads", Value: ads.inactiveAds },
        ...Object.entries(ads.campaignThemes).map(([theme, count]) => ({ Metric: `Theme: ${theme}`, Value: count })),
        ...ads.adTitles.slice(0, 5).map((title) => ({ Metric: "Example ad title", Value: title })),
        ...Object.entries(ads.platformPlacements).map(([platform, count]) => ({ Metric: `Placement: ${platform}`, Value: count }))
      ]
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
    config,
    generatedAt: new Date().toISOString(),
    listings,
    competitors,
    reviews,
    ads,
    contentIdeas: ideas,
    clientFollowUps: sections[9].bullets ?? [],
    recommendedActions: actions,
    sections
  };
}
