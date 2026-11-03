import { expect, test } from "@playwright/test";

test("earlier Asana demonstration links lead to fresh research with the review gate before external rollout", async ({
  page,
}) => {
  test.skip(
    !process.env.PLAYWRIGHT_BASE_URL,
    "Requires the deployed demonstration guide store.",
  );
  await page.goto("/guide/asana-388e5a26d9e2");
  await expect(page).toHaveURL(/\/guide\/asana-7aa2432c6752$/);
  await expect(
    page.getByText("AI researched · review sources", { exact: true }),
  ).toBeVisible();
  const titles = await page.locator("#steps .step-title").allTextContents();
  expect(
    titles.indexOf("Resolve the external-distribution review requirement"),
  ).toBeLessThan(
    titles.indexOf(
      "Switch distribution setting to Any workspace for external rollout",
    ),
  );
  await expect(page.locator("#evidence")).toContainText("Source conflict:");
  await expect(page.locator("main")).not.toContainText(
    "cannot enable 'Any workspace'",
  );
});

test("reviewed demonstration links open the corrected source-reviewed guide", async ({
  page,
}) => {
  test.skip(
    !process.env.PLAYWRIGHT_BASE_URL,
    "Requires the deployed demonstration guide store.",
  );
  await page.goto("/guide/miro-845d31e5e55f");
  await expect(page).toHaveURL(/\/guide\/miro-reviewed-ea26bc366b64$/);
  await expect(
    page.getByText("AI draft · source-reviewed revision", { exact: true }),
  ).toBeVisible();
  await expect(page.locator("#evidence")).toContainText("403");
});

// These tests exercise transport/UI behavior with mocked responses. They are
// deliberately not evidence of a live provider lookup or OAuth setup.
for (const [name, body] of [
  [
    "progress followed by EOF",
    'event: progress\ndata: {"stage":"discover","message":"Searching official sources"}\n\n',
  ],
  ["truncated completion", 'event: complete\ndata: {"slug":"github"}'],
]) {
  test(`mocked research: ${name} exposes a retry state`, async ({ page }) => {
    await page.route("**/api/generate", (route) =>
      route.fulfill({ status: 200, contentType: "text/event-stream", body }),
    );
    await page.goto("/generate");
    await page
      .getByRole("textbox", { name: "App name or public website" })
      .fill("Example provider");
    await page.getByRole("button", { name: "Start research" }).click();
    await expect(
      page
        .getByRole("region", { name: "Research activity" })
        .getByRole("alert"),
    ).toContainText("ended before a guide was saved");
    await expect(
      page.getByText("Research stopped", { exact: true }),
    ).toBeVisible();
    await expect(page.getByRole("button", { name: "Try again" })).toBeEnabled();
    await expect(
      page.getByRole("button", { name: "Start research" }),
    ).toBeEnabled();
    await expect(
      page.getByRole("link", { name: "Open your guide" }),
    ).toHaveCount(0);
  });
}

for (const [name, body] of [
  [
    "unsafe navigation slug",
    'event: complete\ndata: {"slug":"../admin","mode":"live"}\n\n',
  ],
  [
    "unsafe activity URL",
    'event: progress\ndata: {"stage":"fetch","message":"Reading source","url":"javascript:alert(1)"}\n\n',
  ],
]) {
  test(`mocked research: rejects ${name}`, async ({ page }) => {
    await page.route("**/api/generate", (route) =>
      route.fulfill({ status: 200, contentType: "text/event-stream", body }),
    );
    await page.goto("/generate");
    await page
      .getByRole("textbox", { name: "App name or public website" })
      .fill("Example provider");
    await page.getByRole("button", { name: "Start research" }).click();
    await expect(
      page
        .getByRole("region", { name: "Research activity" })
        .getByRole("alert"),
    ).toContainText("incomplete or invalid");
    await expect(page).toHaveURL(/\/generate$/);
    await expect(page.locator('a[href^="javascript:"]')).toHaveCount(0);
    await expect(
      page.getByRole("link", { name: "Open your guide" }),
    ).toHaveCount(0);
  });
}

test("mocked research: pilot audience and capability reach the request and completion remains usable", async ({
  page,
}) => {
  let payload: unknown;
  await page.route("**/api/generate", (route) => {
    payload = route.request().postDataJSON();
    return route.fulfill({
      status: 200,
      contentType: "text/event-stream",
      body: 'event: complete\ndata: {"slug":"github","mode":"live"}\n\n',
    });
  });
  await page.goto("/generate");
  await page.getByText("Tailor this guide", { exact: true }).click();
  await page.getByLabel("Who will connect the app?").selectOption("pilot");
  await page
    .getByLabel("What should your integration do?", { exact: false })
    .fill("Read tasks and create comments");
  await page
    .getByRole("textbox", { name: "App name or public website" })
    .fill("Example provider");
  await page.getByRole("button", { name: "Start research" }).click();
  await expect(
    page.getByRole("heading", { name: "Your guide is ready." }),
  ).toBeVisible();
  expect(payload).toMatchObject({
    query: "Example provider",
    audience: "pilot",
    capability: "Read tasks and create comments",
  });
  await expect(
    page.getByRole("link", { name: "Open your guide" }),
  ).toHaveAttribute("href", "/guide/github");
});
