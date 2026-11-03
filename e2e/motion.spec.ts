import { expect, test } from "@playwright/test";

test("hero visibly responds to pointer movement and scrolling", async ({
  page,
}) => {
  await page.goto("/");
  const artwork = page.locator(".hero-art-visual");
  const transform = () =>
    artwork.evaluate((element) => getComputedStyle(element).transform);
  await page.mouse.move(100, 180);
  const initial = await transform();
  await page.mouse.move(1200, 380);
  await expect.poll(transform).not.toBe(initial);
  const pointed = await transform();
  await page.evaluate(() => window.scrollTo({ top: 280, behavior: "instant" }));
  await expect.poll(transform).not.toBe(pointed);
  await expect(page.locator(".headline-glow").first()).toHaveCSS(
    "animation-name",
    /oauth-text-sweep/,
  );
});

test("reduced motion disables hero parallax and text animation", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  const artwork = page.locator(".hero-art-visual");
  await expect(artwork).toHaveCSS("transform", "none");
  await page.mouse.move(1200, 380);
  await page.evaluate(() => window.scrollTo({ top: 280, behavior: "instant" }));
  await expect(artwork).toHaveCSS("transform", "none");
  await expect(page.locator(".headline-glow").first()).toHaveCSS(
    "animation-name",
    "none",
  );
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
});
