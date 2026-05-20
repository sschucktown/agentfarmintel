import path from "node:path";

export const SAMPLE_INPUT_FILES = {
  listings: path.join(
    process.cwd(),
    "data/sample/dataset_us-realestate-multisource_2026-05-20_16-55-23-766.json"
  ),
  competitors: path.join(
    process.cwd(),
    "data/sample/dataset_google-maps-extractor_2026-05-20_17-13-13-526.json"
  ),
  reviews: path.join(
    process.cwd(),
    "data/sample/dataset_google-reviews-scraper_2026-05-20_17-18-50-265.json"
  ),
  ads: path.join(
    process.cwd(),
    "data/sample/dataset_facebook-ads-scraper_2026-05-20_17-28-16-976.json"
  )
} as const;

export const OUTPUT_FILES = {
  markdown: path.join(process.cwd(), "output/agent-farm-intel-report.md"),
  html: path.join(process.cwd(), "output/agent-farm-intel-report.html")
} as const;
