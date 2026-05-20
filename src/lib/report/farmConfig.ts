import fs from "node:fs";
import { SAMPLE_INPUT_FILES } from "@/lib/inputFiles";
import type { FarmConfig } from "@/lib/types";

export function loadFarmConfig(filePath = SAMPLE_INPUT_FILES.farmConfig): FarmConfig {
  return JSON.parse(fs.readFileSync(filePath, "utf8")) as FarmConfig;
}
