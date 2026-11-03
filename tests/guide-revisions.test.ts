import { expect, it } from "vitest";
import { reviewedReplacement } from "../lib/guide-revisions";

it("routes the observed inaccurate Asana snapshots to the checked fresh v8 run without a redirect loop", () => {
  const target = reviewedReplacement("asana-9ae545051a27");
  expect(target).toBe("asana-7aa2432c6752");
  expect(reviewedReplacement("asana-388e5a26d9e2")).toBe(target);
  expect(reviewedReplacement(target!)).toBeUndefined();
});

it("replaces only explicitly reviewed snapshots with an acyclic internal guide slug", () => {
  const target = reviewedReplacement("miro-845d31e5e55f");
  expect(target).toMatch(/^miro-reviewed-[a-f0-9]{12}$/);
  expect(reviewedReplacement(target!)).toBeUndefined();
  expect(reviewedReplacement("github")).toBeUndefined();
  expect(reviewedReplacement("__proto__")).toBeUndefined();
  expect(reviewedReplacement("constructor")).toBeUndefined();
});
