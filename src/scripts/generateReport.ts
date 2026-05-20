import fs from "node:fs";
import path from "node:path";
import { OUTPUT_FILES } from "@/lib/inputFiles";
import { loadSampleReport } from "@/lib/report/loadReport";
import { renderHtml } from "@/lib/report/renderHtml";
import { renderMarkdown } from "@/lib/report/renderMarkdown";

const report = loadSampleReport();

fs.mkdirSync(path.dirname(OUTPUT_FILES.markdown), { recursive: true });
fs.writeFileSync(OUTPUT_FILES.markdown, renderMarkdown(report), "utf8");
fs.writeFileSync(OUTPUT_FILES.html, renderHtml(report), "utf8");

console.log("Agent Farm Intel report generated.");
console.log(`Markdown: ${OUTPUT_FILES.markdown}`);
console.log(`HTML: ${OUTPUT_FILES.html}`);
