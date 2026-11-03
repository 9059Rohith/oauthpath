import { expect, it } from "vitest";
import { reviewedReplacement } from "../lib/guide-revisions";

it("replaces only explicitly reviewed snapshots with an acyclic internal guide slug", () => {
  const target = reviewedReplacement("miro-845d31e5e55f");
  expect(target).toMatch(/^miro-reviewed-[a-f0-9]{12}$/);
  expect(reviewedReplacement(target!)).toBeUndefined();
  expect(reviewedReplacement("github")).toBeUndefined();
  expect(reviewedReplacement("__proto__")).toBeUndefined();
  expect(reviewedReplacement("constructor")).toBeUndefined();
});
