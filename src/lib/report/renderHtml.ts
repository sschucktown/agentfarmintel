import type { AgentFarmIntelReport, ReportSection } from "@/lib/types";

function escapeHtml(value: unknown): string {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function renderTable(rows: NonNullable<ReportSection["rows"]>): string {
  if (rows.length === 0) return "<p><em>No matching records in this export.</em></p>";
  const headers = Object.keys(rows[0]);
  return `<table><thead><tr>${headers.map((header) => `<th>${escapeHtml(header)}</th>`).join("")}</tr></thead><tbody>${rows
    .map((row) => `<tr>${headers.map((header) => `<td>${escapeHtml(row[header])}</td>`).join("")}</tr>`)
    .join("")}</tbody></table>`;
}

export function renderHtml(report: AgentFarmIntelReport): string {
  const sections = report.sections
    .map(
      (section) => `<section>
        <h2>${escapeHtml(section.title)}</h2>
        ${section.summary ? `<p>${escapeHtml(section.summary)}</p>` : ""}
        ${section.bullets ? `<ul>${section.bullets.map((bullet) => `<li>${escapeHtml(bullet)}</li>`).join("")}</ul>` : ""}
        ${section.rows ? renderTable(section.rows) : ""}
      </section>`
    )
    .join("\n");

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Agent Farm Intel Report</title>
  <style>
    body { margin: 0; font-family: Arial, sans-serif; color: #172033; background: #f6f7f9; line-height: 1.55; }
    main { max-width: 1080px; margin: 0 auto; padding: 48px 20px; }
    h1 { font-size: 40px; margin: 0 0 8px; letter-spacing: 0; }
    h2 { font-size: 24px; margin: 0 0 12px; }
    section { background: #fff; border: 1px solid #d9dee8; border-radius: 8px; padding: 24px; margin: 18px 0; }
    table { border-collapse: collapse; width: 100%; font-size: 14px; }
    th, td { border-bottom: 1px solid #e6e9ef; padding: 10px; text-align: left; vertical-align: top; }
    th { color: #526071; font-weight: 700; background: #f9fafb; }
    .intro { color: #526071; max-width: 760px; }
  </style>
</head>
<body>
  <main>
    <h1>Agent Farm Intel Report</h1>
    <p class="intro">Agent Farm Intel monitors your farm area and turns listings, competitor visibility, reviews, and ads into weekly actions.</p>
    <p class="intro">Generated: ${escapeHtml(report.generatedAt)}</p>
    ${sections}
  </main>
</body>
</html>
`;
}
