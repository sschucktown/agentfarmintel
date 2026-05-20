export type Nullable<T> = T | null | undefined;

export interface Listing {
  id?: string;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  price?: number | null;
  beds?: number | null;
  baths?: number | null;
  sqft?: number | null;
  pricePerSqft?: number | null;
  daysOnMarket?: number | null;
  propertyType?: string;
  status?: string;
  listingUrl?: string;
  source?: string;
  agentName?: string;
  brokerName?: string;
  latitude?: number | null;
  longitude?: number | null;
}

export type CompetitorType = "core" | "adjacent";

export interface Competitor {
  name?: string;
  rating?: number | null;
  reviewsCount?: number | null;
  street?: string;
  city?: string;
  state?: string;
  website?: string;
  phone?: string;
  categoryName?: string;
  googleMapsUrl?: string;
  imageUrl?: string;
  competitorType: CompetitorType;
}

export type ReviewTopic =
  | "vacation rentals"
  | "property management"
  | "traditional buyer/seller real estate"
  | "mortgage/lending"
  | "irrelevant/other";

export interface Review {
  reviewId?: string;
  placeId?: string;
  placeName?: string;
  placeRating?: number | null;
  placeReviewsCount?: number | null;
  rating?: number | null;
  content?: string;
  reviewedAt?: string;
  reviewedAtDate?: string;
  category?: string;
  address?: string;
  scrapedAt?: string;
}

export interface Ad {
  pageName?: string;
  title?: string;
  displayFormat?: string;
  isActive?: boolean;
  spend?: number | string | null;
  reachEstimate?: number | string | null;
  publisherPlatform: string[];
  startDate?: string;
  endDate?: string;
}

export interface ReportSection {
  title: string;
  summary?: string;
  bullets?: string[];
  rows?: Array<Record<string, string | number | null | undefined>>;
}

export interface RecommendedAction {
  title: string;
  whyItMatters: string;
  script?: string;
}

export interface ListingAnalysis {
  totalListings: number;
  residentialListingCount: number;
  landListingCount: number;
  listingsByZip: Record<string, number>;
  medianResidentialPrice: number | null;
  medianPricePerSqft: number | null;
  medianDaysOnMarket: number | null;
  freshListings: Listing[];
  staleListings: Listing[];
  listingsWorthWatching: Listing[];
  excludedOutliers: Listing[];
}

export interface CompetitorAnalysis {
  coreCompetitors: Competitor[];
  adjacentCompetitors: Competitor[];
  topByReviewCount: Competitor[];
  topByRating: Competitor[];
  missingWebsites: Competitor[];
  lowReviewCounts: Competitor[];
  summary: string;
}

export interface ReviewPlaceSummary {
  placeName: string;
  placeId?: string;
  reviewsCount: number;
  averageRating: number | null;
  newestReviewDate: string | null;
  positiveThemes: string[];
  negativeThemes: string[];
  topicCounts: Record<ReviewTopic, number>;
  rentalOrPropertyManagementHeavy: boolean;
}

export interface ReviewAnalysis {
  places: ReviewPlaceSummary[];
  positiveThemes: string[];
  negativeThemes: string[];
  reputationNote: string;
}

export interface AdAnalysis {
  totalAds: number;
  activeAds: number;
  inactiveAds: number;
  adTitles: string[];
  displayFormats: Record<string, number>;
  platformPlacements: Record<string, number>;
  campaignThemes: Record<string, number>;
  spendReachNote: string;
}

export interface AgentFarmIntelReport {
  generatedAt: string;
  listings: ListingAnalysis;
  competitors: CompetitorAnalysis;
  reviews: ReviewAnalysis;
  ads: AdAnalysis;
  contentIdeas: {
    socialPosts: string[];
    newsletterBlurb: string;
    sellerFollowUpAngle: string;
    buyerFollowUpAngle: string;
  };
  clientFollowUps: string[];
  recommendedActions: RecommendedAction[];
  sections: ReportSection[];
}
