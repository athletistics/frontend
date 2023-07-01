import {describe, expect, it} from "vitest";
import {CHART_COLORS, color, COLORS, NAMED_COLORS, namedColor} from "./ChartUtils";

describe("ChartUtils", () => {
  describe("color", () => {
    it("should accept positive out of bounds indexes", () => {
      expect(color(0)).to.eq(color(COLORS.length))
    })
  })

  describe("namedColor", () => {
    it("should accept positive out of bounds indexes", () => {
      expect(namedColor(0)).to.eq(namedColor(NAMED_COLORS.length))
    })
  })
})