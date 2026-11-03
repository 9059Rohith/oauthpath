import { readFile } from "node:fs/promises";
import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test("keyboard search opens the cached GitHub guide", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "Every app.",
  );
  await page.keyboard.press("/");
  const search = page.getByRole("combobox", {
    name: "Search an app or paste its website",
  });
  await expect(search).toBeFocused();
  await page.keyboard.type("Git");
  await page.keyboard.press("ArrowDown");
  await expect(page.getByRole("option", { selected: true })).toContainText(
    "GitHub",
  );
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/\/guide\/github$/u);
  await expect(page.getByRole("heading", { level: 1 })).toContainText("GitHub");
  expect(errors).toEqual([]);
});

test("library difficulty and name filters change the results", async ({
  page,
}) => {
  await page.goto("/library");
  await expect(page.locator(".guide-card")).toHaveCount(8);
  await page.getByRole("button", { name: "Access gated", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "LinkedIn", exact: true }),
  ).toBeVisible();
  await expect(page.locator(".guide-card")).toHaveCount(1);
  await page.getByRole("button", { name: "All apps", exact: true }).click();
  await page.getByRole("textbox", { name: "Filter by app name" }).fill("Zoom");
  await expect(page.locator(".guide-card")).toHaveCount(1);
  await expect(
    page.getByRole("heading", { name: "Zoom", exact: true }),
  ).toBeVisible();
  await page
    .getByRole("textbox", { name: "Filter by app name" })
    .fill("MissingProvider");
  await expect(
    page.getByRole("heading", { name: "No guide here yet." }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Research this app" }),
  ).toHaveAttribute("href", /MissingProvider/u);
});

test("guide completion persists through a reload", async ({ page }) => {
  await page.goto("/guide/github");
  const checkbox = page
    .getByRole("checkbox", { name: "I have completed this step" })
    .first();
  await expect(checkbox).toBeEnabled();
  await checkbox.check();
  await expect(checkbox).toBeChecked();
  await page.reload();
  await expect(checkbox).toBeChecked();
  await checkbox.uncheck();
  await page.reload();
  await expect(checkbox).not.toBeChecked();
});

test("Markdown export includes actionable steps and source URLs", async ({
  page,
}) => {
  await page.goto("/guide/github");
  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "Export Markdown" }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toBe("github-oauth-guide.md");
  const pathname = await download.path();
  expect(pathname).not.toBeNull();
  const markdown = await readFile(pathname!, "utf8");
  expect(markdown).toContain("# GitHub: OAuth setup & approval");
  expect(markdown).toContain("Done when:");
  expect(markdown).toContain("https://docs.github.com/");
  expect(markdown).toContain("## What remains uncertain");
});

test("methodology explains evidence and authenticated-setup limitations", async ({
  page,
}) => {
  await page.goto("/");
  await page
    .getByRole("navigation", { name: "Main navigation" })
    .getByRole("link", { name: "How it works" })
    .click();
  await expect(page).toHaveURL(/\/methodology$/u);
  await expect(
    page.getByRole("heading", {
      name: "Three approvals that are easy to confuse",
    }),
  ).toBeVisible();
  await expect(
    page.getByText("No authenticated setup was performed for those guides.", {
      exact: false,
    }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "When full AI research is unavailable" }),
  ).toBeVisible();
});

test("390px pages fit the viewport without horizontal scrolling", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  for (const path of [
    "/",
    "/library",
    "/guide/github",
    "/generate",
    "/methodology",
  ]) {
    await test.step(path, async () => {
      await page.goto(path);
      await expect(page.locator("main")).toBeVisible();
      const dimensions = await page.evaluate(() => ({
        width: document.documentElement.clientWidth,
        scroll: document.documentElement.scrollWidth,
      }));
      expect(
        dimensions.scroll,
        `${path} must not overflow at 390px`,
      ).toBeLessThanOrEqual(dimensions.width + 1);
    });
  }
});

test("reduced-motion mode keeps the full hero and search visible", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "to launch.",
  );
  await expect(page.getByRole("combobox")).toBeVisible();
  await expect
    .poll(() =>
      page
        .locator(".headline-line")
        .evaluateAll((elements) =>
          elements.every(
            (element) => getComputedStyle(element).opacity === "1",
          ),
        ),
    )
    .toBe(true);
  await expect(page.locator(".hero-art")).toHaveCSS("transform", "none");
});

for (const path of ["/", "/library", "/guide/github", "/generate"]) {
  test(`accessibility: no serious or critical violations on ${path}`, async ({
    page,
  }) => {
    await page.goto(path);
    await expect(page.locator("main")).toBeVisible();
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
      .analyze();
    const violations = results.violations.filter((violation) =>
      ["serious", "critical"].includes(violation.impact ?? ""),
    );
    expect(
      violations.map((violation) => ({
        id: violation.id,
        impact: violation.impact,
        description: violation.description,
        nodes: violation.nodes.map((node) => ({
          target: node.target,
          summary: node.failureSummary,
        })),
      })),
    ).toEqual([]);
  });
}

test("mocked SSE: progress and saved-guide success render correctly", async ({
  page,
}) => {
  await page.route("**/api/generate", (route) =>
    route.fulfill({
      status: 200,
      contentType: "text/event-stream",
      body: 'event: progress\ndata: {"stage":"fetch","message":"Mocked documentation retrieval","url":"https://docs.github.com/","status":200}\n\nevent: complete\ndata: {"slug":"github","mode":"document-scan"}\n\n',
    }),
  );
  await page.goto("/generate");
  await page
    .getByRole("textbox", { name: "App name or public website" })
    .fill("Example provider");
  await page.getByRole("button", { name: "Start research" }).click();
  await expect(page.getByText("Mocked documentation retrieval")).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Your guide is ready." }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Open your guide" }),
  ).toHaveAttribute("href", "/guide/github");
});

test("mocked SSE: failure exposes a useful retry state", async ({ page }) => {
  await page.route("**/api/generate", (route) =>
    route.fulfill({
      status: 200,
      contentType: "text/event-stream",
      body: 'event: error\ndata: {"message":"The provider documentation did not respond. Try another public documentation URL."}\n\n',
    }),
  );
  await page.goto("/generate");
  await page
    .getByRole("textbox", { name: "App name or public website" })
    .fill("Example provider");
  await page.getByRole("button", { name: "Start research" }).click();
  await expect(
    page.getByRole("region", { name: "Research activity" }).getByRole("alert"),
  ).toContainText("provider documentation did not respond");
  await expect(page.getByRole("button", { name: "Try again" })).toBeEnabled();
  await expect(
    page.getByRole("button", { name: "Start research" }),
  ).toBeEnabled();
});
