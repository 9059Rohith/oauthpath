import { expect, test } from "@playwright/test";

for (const width of [390, 1440]) {
  test(`hero stays level with visible vertical parallax at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 1000 });
    await page.goto("/");
    await expect(page.locator(".hero-cinematic")).toHaveAttribute(
      "data-motion",
      "enabled",
    );
    const artwork = page.locator(".hero-art-visual");
    const matrix = () =>
      artwork.evaluate((element) => {
        const m = new DOMMatrix(getComputedStyle(element).transform);
        return {
          x: m.m41,
          y: m.m42,
          a: m.m11,
          b: m.m12,
          c: m.m21,
          d: m.m22,
          perspective: m.m34,
        };
      });
    await page.mouse.move(20, 180);
    const initial = await matrix();
    await page.mouse.move(width - 20, 380);
    await expect.poll(matrix).toEqual(initial);
    await page.evaluate(() =>
      window.scrollTo({ top: 320, behavior: "instant" }),
    );
    await expect
      .poll(async () => (await matrix()).y)
      .toBeGreaterThan(width < 760 ? 20 : 50);
    expect(await matrix()).toMatchObject({
      x: 0,
      a: 1,
      b: 0,
      c: 0,
      d: 1,
      perspective: 0,
    });
    expect((await matrix()).y).toBeLessThanOrEqual(width < 760 ? 25 : 60);
    await expect(page.locator(".headline-glow").first()).toHaveCSS(
      "animation-name",
      /oauth-text-sweep/,
    );
  });
}

test("page stays inside every supported viewport throughout scrolling", async ({
  page,
}) => {
  await page.goto("/");
  for (const width of [320, 360, 390, 768, 1024, 1280, 1440, 1920]) {
    await page.setViewportSize({ width, height: 1000 });
    for (const position of [0, 0.5, 1]) {
      await page.evaluate(
        (fraction) =>
          window.scrollTo({
            top:
              (document.documentElement.scrollHeight - innerHeight) * fraction,
            behavior: "instant",
          }),
        position,
      );
      await expect
        .poll(() =>
          page.evaluate(() =>
            Math.max(
              document.documentElement.scrollWidth,
              document.body.scrollWidth,
            ),
          ),
        )
        .toBe(width);
      expect(await page.evaluate(() => window.scrollX)).toBe(0);
    }
  }
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
  const art = scene.locator(".section-parallax img").first();
  const initialArt = await art.evaluate(
    (element) => getComputedStyle(element).transform,
  );
  await page.evaluate(
    (y) => window.scrollTo({ top: y - innerHeight * 0.2, behavior: "instant" }),
    top,
  );
  await expect.poll(offset).not.toBe(initial);
  await expect
    .poll(() => art.evaluate((element) => getComputedStyle(element).transform))
    .not.toBe(initialArt);
  await expect(scene.locator(".scroll-word").first()).toHaveCSS("opacity", "1");
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
  await expect(page.locator("#library .section-parallax img")).toHaveCSS(
    "transform",
    "none",
  );
  await expect(
    page.locator("#library .scroll-type-accent .scroll-word").first(),
  ).toHaveCSS("animation-name", "none");
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
