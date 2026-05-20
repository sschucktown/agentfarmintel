# Agent Farm Intel

Agent Farm Intel is a real estate farm-area intelligence MVP for agents and small teams. It turns local Apify JSON exports into a weekly action brief covering market movement, competitor visibility, reviews, ads, content ideas, client follow-ups, and recommended actions.

This first version is manual and static. It reads JSON files already committed under `data/sample`; it does not call the Apify API, OpenAI, Stripe, Supabase, or any other external service.

## Required Sample Inputs

- `data/sample/dataset_us-realestate-multisource_2026-05-20_16-55-23-766.json`
- `data/sample/dataset_google-maps-extractor_2026-05-20_17-13-13-526.json`
- `data/sample/dataset_google-reviews-scraper_2026-05-20_17-18-50-265.json`
- `data/sample/dataset_facebook-ads-scraper_2026-05-20_17-28-16-976.json`

## Setup

```bash
npm install
```

## Generate Static Report Files

```bash
npm run generate
```

This writes:

- `output/agent-farm-intel-report.md`
- `output/agent-farm-intel-report.html`

## Run Tests

```bash
npm test
```

## View the Web Preview

```bash
npm run dev
```

Open `http://localhost:3000/report`.

## Notes

- The MVP uses deterministic parsing and keyword matching only.
- Missing fields are handled defensively so partial Apify records do not crash report generation.
- The code is structured so local JSON loading can later be replaced with Apify task or dataset API output.
