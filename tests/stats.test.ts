import { describe, expect, it } from "vitest";
import { formatCurrency, groupBy, median, safeNumber, topN } from "@/lib/utils/stats";

describe("stats helpers", () => {
  it("calculates medians from valid numbers only", () => {
    expect(median([10, undefined, Number.NaN, 2, 6])).toBe(6);
    expect(median([10, 2])).toBe(6);
    expect(median([])).toBeNull();
  });

  it("parses safe numbers and formats currency", () => {
    expect(safeNumber("$1,250.50")).toBe(1250.5);
    expect(safeNumber("n/a")).toBeNull();
    expect(formatCurrency(675000)).toBe("$675,000");
  });

  it("groups values and returns sorted top N records", () => {
    expect(groupBy(["29414", "29414", "29412"], (zip) => zip)).toEqual({
      "29414": ["29414", "29414"],
      "29412": ["29412"]
    });
    expect(topN([{ score: 2 }, { score: 10 }, { score: 5 }], 2, (item) => item.score)).toEqual([
      { score: 10 },
      { score: 5 }
    ]);
  });
});
