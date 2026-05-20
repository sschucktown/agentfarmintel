import type { AgentFarmIntelReport, ReportSection } from "@/lib/types";

function renderTable(rows: NonNullable<ReportSection["rows"]>): string {
  if (rows.length === 0) return "_No matching records in this export._";
  const headers = Object.keys(rows[0]);
  const head = `| ${headers.join(" | ")} |`;
  const divider = `| ${headers.map(() => "---").join(" | ")} |`;
  const body = rows.map((row) => `| ${headers.map((header) => String(row[header] ?? "").replaceAll("|", "\\|")).join(" | ")} |`);
  return [head, divider, ...body].join("\n");
}

export function renderMarkdown(report: AgentFarmIntelReport): string {
  const parts = [
    "# Agent Farm Intel Report",
    "",
    "Agent Farm Intel monitors your farm area and turns listings, competitor visibility, reviews, and ads into weekly actions.",
    "",
    `Generated: ${report.generatedAt}`,
    ""
  ];

  for (const section of report.sections) {
    parts.push(`## ${section.title}`, "");
    if (section.summary) parts.push(section.summary, "");
    if (section.bullets) parts.push(...section.bullets.map((bullet) => `- ${bullet}`), "");
    if (section.rows) parts.push(renderTable(section.rows), "");
  }

  return `${parts.join("\n").trim()}\n`;
}
