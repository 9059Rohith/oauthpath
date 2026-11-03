/** Reviewed replacements for known inaccurate demonstration snapshots.
 * The private immutable originals remain intact; shared URLs lead to corrected guidance.
 */
const replacements: Readonly<Record<string, string>> = {
  "asana-9ae545051a27": "asana-7aa2432c6752",
  "asana-388e5a26d9e2": "asana-7aa2432c6752",
  "miro-reviewed-bc68000654f8": "miro-reviewed-ea26bc366b64",
  "miro-9b56d78f42ee": "miro-reviewed-ea26bc366b64",
  "miro-19a67bedf8e3": "miro-reviewed-ea26bc366b64",
  "miro-1dfdb6a2cfc4": "miro-reviewed-ea26bc366b64",
  "miro-845d31e5e55f": "miro-reviewed-ea26bc366b64",
  "miro-adee6b37cdb2": "miro-reviewed-ea26bc366b64",
};
export function reviewedReplacement(slug: string): string | undefined {
  return Object.hasOwn(replacements, slug) ? replacements[slug] : undefined;
}
