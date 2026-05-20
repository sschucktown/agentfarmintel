import fs from "node:fs";
import { SAMPLE_INPUT_FILES } from "@/lib/inputFiles";
import { parseFacebookAds } from "@/lib/parsers/facebookAds";
import { parseGoogleMapsCompetitors } from "@/lib/parsers/googleMapsCompetitors";
import { parseGoogleReviews } from "@/lib/parsers/googleReviews";
import { parseListings } from "@/lib/parsers/listings";
import { buildReport } from "@/lib/report/buildReport";
import { loadFarmConfig } from "@/lib/report/farmConfig";

function readJsonArray(filePath: string): unknown[] {
  const parsed = JSON.parse(fs.readFileSync(filePath, "utf8"));
  return Array.isArray(parsed) ? parsed : [];
}

export function loadSampleReport() {
  return buildReport({
    listings: parseListings(readJsonArray(SAMPLE_INPUT_FILES.listings)),
    competitors: parseGoogleMapsCompetitors(readJsonArray(SAMPLE_INPUT_FILES.competitors)),
    reviews: parseGoogleReviews(readJsonArray(SAMPLE_INPUT_FILES.reviews)),
    ads: parseFacebookAds(readJsonArray(SAMPLE_INPUT_FILES.ads))
  }, loadFarmConfig());
}
