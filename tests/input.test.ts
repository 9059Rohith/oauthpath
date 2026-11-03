import { describe, expect, it } from "vitest";
import { generationInputSchema, scenarioContext } from "../lib/agent/input";

describe("research scenario input", () => {
  it("normalizes ordinary multiline feature descriptions", () => {
    expect(
      generationInputSchema.parse({
        query: "Miro",
        capability: "Read boards\nCreate tasks",
      }).capability,
    ).toBe("Read boards Create tasks");
  });
  it("keeps existing clients on an explicit public-user scenario", () => {
    expect(generationInputSchema.parse({ query: "  Miro " })).toEqual({
      query: "Miro",
      audience: "public",
      capability: "",
    });
    expect(scenarioContext().audience).toContain("public distribution");
  });
  it("keeps pilot limits and external transition explicit", () => {
    expect(
      scenarioContext({ audience: "pilot", capability: "Read boards" }),
    ).toEqual(
      expect.objectContaining({
        audience: expect.stringContaining("not automatically exempt"),
        requestedCapability: "Read boards",
      }),
    );
  });
  it("does not equate internal use with external eligibility", () => {
    expect(
      scenarioContext({ audience: "internal", capability: "" }).audience,
    ).toContain("before expanding");
  });
  it.each([
    { query: "Mi".repeat(91) },
    { query: "Miro", capability: "x".repeat(241) },
    { query: "Miro", capability: "<script>" },
    { query: "Miro", audience: "anyone-without-approval" },
    { query: "Miro", capability: "line\u0000break" },
  ])("rejects out-of-contract input %#", (input) => {
    expect(generationInputSchema.safeParse(input).success).toBe(false);
  });
});
