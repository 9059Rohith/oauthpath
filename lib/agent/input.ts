import { z } from "zod";

const publicText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .refine(
      (value) => !/[\x00-\x1f<>]/.test(value),
      "Use plain text and public information only.",
    );
export const researchOptionsSchema = z.object({
  audience: z.enum(["public", "pilot", "internal"]).default("public"),
  capability: z
    .string()
    .max(240)
    .transform((value) => value.replace(/\s+/g, " ").trim())
    .pipe(publicText(240))
    .default(""),
});
export const generationInputSchema = researchOptionsSchema.extend({
  query: publicText(180).refine(
    (value) => value.length >= 2,
    "Enter an app name or public website.",
  ),
  refresh: z.boolean().optional(),
});
export type ResearchOptions = z.infer<typeof researchOptionsSchema>;
export function scenarioContext(options?: ResearchOptions) {
  const parsed = researchOptionsSchema.parse(options ?? {});
  const audience = {
    public:
      "External users from multiple customer organizations. Explain test setup AND legitimate public distribution; marketplace listing is a separate conditional path.",
    pilot:
      "A limited external customer pilot. Explain documented development/test limits, who can authorize during the pilot, and the later production transition. A pilot is not automatically exempt from review.",
    internal:
      "Users inside the developer's own organization only. Explain which internal-only path is actually documented and any organization-admin controls. Flag the separate requirements that would apply before expanding to external customers.",
  }[parsed.audience];
  return {
    audience,
    requestedCapability:
      parsed.capability ||
      "No feature specified. State a read-only assumption only if supported, and identify the feature decision needed before choosing scopes.",
  };
}
