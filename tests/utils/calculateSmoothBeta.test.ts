// src/utils/calculateSmoothBeta.test.ts
import { calculateSmoothedBeta } from "@/utils/calculateSmoothBeta";

describe("calculateSmoothedBeta", () => {
  it("returns 0 when passed an empty array", () => {
    expect(calculateSmoothedBeta([])).toBe(0);
  });

  it("returns the value itself when passed an array with a single number", () => {
    expect(calculateSmoothedBeta([5])).toBe(5);
  });

  it("calculates the average correctly for multiple values", () => {
    expect(calculateSmoothedBeta([1, 2, 3, 4, 5])).toBe(3);
  });

  it("handles negative values correctly", () => {
    expect(calculateSmoothedBeta([-1, -2, -3, -4, -5])).toBe(-3);
  });

  it("handles mixed positive and negative values correctly", () => {
    expect(calculateSmoothedBeta([-1, 2, -3, 4, -5])).toBeCloseTo(-0.6, 5);
  });

  it("handles decimal values correctly", () => {
    expect(calculateSmoothedBeta([1.5, 2.5, 3.5])).toBe(2.5);
  });
});
