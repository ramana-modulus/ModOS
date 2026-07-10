import { describe, expect, it } from "vitest";
import { fmtC, fmtCompact, fmtQ, fmtR, fmtRupee } from "@/lib/format";

describe("fmtQ", () => {
  it("groups with the Indian numbering system", () => {
    expect(fmtQ(38000)).toBe("38,000");
    expect(fmtQ(1234567)).toBe("12,34,567");
  });
  it("renders nullish as an em-dash", () => {
    expect(fmtQ(null)).toBe("—");
    expect(fmtQ(undefined)).toBe("—");
  });
});

describe("fmtCompact", () => {
  it("uses crore / lakh / thousand suffixes", () => {
    expect(fmtCompact(10000000)).toBe("1Cr");
    expect(fmtCompact(2546000)).toBe("25.5L");
    expect(fmtCompact(2300)).toBe("2.3k");
    expect(fmtCompact(950)).toBe("950");
  });
  it("coerces nullish to 0", () => {
    expect(fmtCompact(null)).toBe("0");
  });
});

describe("fmtC / fmtR", () => {
  it("formats integer and 2-decimal currency", () => {
    expect(fmtC(2691)).toBe("2,691");
    expect(fmtR(11.5)).toBe("11.50");
  });
  it("keeps zero but dashes nullish", () => {
    expect(fmtC(0)).toBe("0");
    expect(fmtC(null)).toBe("—");
  });
});

describe("fmtRupee", () => {
  it("prefixes ₹ to an integer amount", () => {
    expect(fmtRupee(2546000)).toBe("₹25,46,000");
  });
});
