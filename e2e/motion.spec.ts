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

test("scrolling drives section typography and artwork while content remains accessible", async ({
  page,
}) => {
  await page.goto("/");
  const scene = page.locator("#library");
  const top = await scene.evaluate(
    (element) => element.getBoundingClientRect().top + window.scrollY,
  );
  await page.evaluate(
    (y) =>
      window.scrollTo({ top: y - innerHeight * 0.86, behavior: "instant" }),
    top,
  );
  await expect
    .poll(() => scene.getAttribute("data-scroll-progress"))
    .not.toBeNull();
  const offset = () =>
    scene
      .locator(".scroll-word")
      .first()
      .evaluate((element) => getComputedStyle(element).transform);
  const initial = await offset();
  await page.evaluate(
    (y) => window.scrollTo({ top: y - innerHeight * 0.2, behavior: "instant" }),
    top,
  );
  await expect.poll(offset).not.toBe(initial);
  await expect(
    page.getByRole("heading", { name: "Find your next integration." }),
  ).toBeVisible();
  for (const selector of [
    ".ownership-art",
    ".library-section-art",
    ".journey-art",
    ".evidence-section-art",
    ".cta-section-art",
  ])
    await expect(page.locator(selector).locator("img")).toHaveCount(1);
});

test("provider marquee can be paused with the keyboard and has no duplicate tab stops", async ({
  page,
}) => {
  await page.goto("/");
  const control = page.getByRole("button", {
    name: "Pause moving provider list",
  });
  await control.focus();
  await page.keyboard.press("Space");
  await expect(control).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator(".marquee-track").first()).toHaveCSS(
    "animation-play-state",
    "paused",
  );
  await expect(page.locator(".marquee-copy a")).toHaveCount(8);
  for (const link of await page.locator(".marquee-copy a").all())
    await expect(link).toHaveAttribute("tabindex", "-1");
  await expect(
    page
      .getByRole("list", { name: "Researched provider guides" })
      .getByRole("link"),
  ).toHaveCount(8);
  await page.keyboard.press("Space");
  await expect(control).toHaveAttribute("aria-pressed", "false");
});

test("reduced motion keeps section text static and all provider links available", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await page.locator("#library").scrollIntoViewIfNeeded();
  await expect(page.locator("#library .scroll-word").first()).toHaveCSS(
    "transform",
    "none",
  );
  await expect(page.locator(".marquee-track").first()).toHaveCSS(
    "animation-name",
    "none",
  );
  await expect(
    page
      .getByRole("list", { name: "Researched provider guides" })
      .getByRole("link"),
  ).toHaveCount(8);
});

test("visible repeated marquee links open the same provider guide", async ({
  page,
}) => {
  await page.goto("/");
  await page.locator(".provider-marquee").scrollIntoViewIfNeeded();
  await page
    .locator(".marquee-track")
    .first()
    .evaluate((element) => {
      for (const animation of element.getAnimations()) {
        animation.currentTime = 36000;
        animation.pause();
      }
    });
  await page.locator('.marquee-copy a[href="/guide/github"]').click();
  await expect(page).toHaveURL(/\/guide\/github$/);
});
