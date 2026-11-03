// Real browser recording: no mocked responses, synthetic progress, or prebuilt result.
// One live research request is made. Run only when the public model quota is available.
import { chromium, expect } from "@playwright/test";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const base = process.env.DEMO_BASE_URL || "https://oauthpath-drab.vercel.app";
const output = path.resolve(
  process.env.DEMO_OUTPUT_DIR || ".local/demo-recording",
);
await mkdir(output, { recursive: true });
const browser = await chromium.launch();
const context = await browser.newContext({
  viewport: { width: 1440, height: 810 },
  deviceScaleFactor: 1,
  reducedMotion: "no-preference",
  permissions: ["clipboard-read", "clipboard-write"],
  recordVideo: { dir: output, size: { width: 1440, height: 810 } },
});
// Screen capture does not include the OS pointer. Show only a conventional cursor.
await context.addInitScript(() => {
  document.addEventListener("DOMContentLoaded", () => {
    const cursor = document.createElement("div");
    cursor.setAttribute("aria-hidden", "true");
    cursor.style.cssText =
      "position:fixed;left:0;top:0;width:19px;height:25px;z-index:2147483647;pointer-events:none;filter:drop-shadow(0 1px 2px #000);transform:translate(-40px,-40px)";
    cursor.innerHTML =
      '<svg viewBox="0 0 19 25" width="19" height="25"><path d="M2 1v20l5-5 4 8 4-2-4-8 7-1Z" fill="white" stroke="#10252b" stroke-width="1.2"/></svg>';
    document.body.append(cursor);
    document.addEventListener("pointermove", (event) => {
      cursor.style.transform = `translate3d(${event.clientX}px,${event.clientY}px,0)`;
    });
    document.addEventListener("pointerdown", (event) => {
      const ring = document.createElement("div");
      ring.style.cssText = `position:fixed;left:${event.clientX - 16}px;top:${event.clientY - 16}px;width:32px;height:32px;border:2px solid #77e7cf;border-radius:50%;z-index:2147483646;pointer-events:none`;
      document.body.append(ring);
      ring
        .animate(
          [
            { transform: "scale(.5)", opacity: 0.9 },
            { transform: "scale(1.6)", opacity: 0 },
          ],
          { duration: 420 },
        )
        .finished.then(() => ring.remove());
    });
  });
});
const page = await context.newPage();
const video = page.video();
const errors = [];
page.on("pageerror", (error) => errors.push(error.message));
const started = Date.now();
const chapters = [];
const chapter = (label) => {
  const value = { seconds: +((Date.now() - started) / 1000).toFixed(2), label };
  chapters.push(value);
  console.log(JSON.stringify(value));
};
const hold = (milliseconds) => page.waitForTimeout(milliseconds);
async function go(route) {
  await page.goto(base + route, { waitUntil: "networkidle" });
  await expect(page.locator("main")).toBeVisible();
}
async function click(locator) {
  await locator.scrollIntoViewIfNeeded();
  const box = await locator.boundingBox();
  if (box)
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2, {
      steps: 15,
    });
  await locator.click();
}
async function scrollTo(selector, duration = 1800, offset = 90) {
  await page
    .locator(selector)
    .first()
    .evaluate(
      (element, values) => {
        const from = window.scrollY;
        const to = Math.max(
          0,
          element.getBoundingClientRect().top + from - values.offset,
        );
        return new Promise((resolve) => {
          const start = performance.now();
          const tick = (now) => {
            const progress = Math.min(1, (now - start) / values.duration);
            const eased =
              progress < 0.5
                ? 4 * progress ** 3
                : 1 - (-2 * progress + 2) ** 3 / 2;
            window.scrollTo({
              top: from + (to - from) * eased,
              behavior: "instant",
            });
            if (progress < 1) requestAnimationFrame(tick);
            else resolve();
          };
          requestAnimationFrame(tick);
        });
      },
      { duration, offset },
    );
}
let result;
let firstFrameSeconds = 0;
try {
  chapter("Homepage: level layout, glowing typography and search");
  await go("/");
  firstFrameSeconds = (Date.now() - started) / 1000;
  await hold(1900);
  await page.mouse.move(1150, 330, { steps: 45 });
  await hold(2100);
  chapter("Scroll-linked type, provider marquee and section artwork");
  for (const selector of [
    ".provider-marquee",
    "#library",
    ".method-section",
    ".evidence-band",
  ]) {
    await scrollTo(selector, 1800);
    await hold(1700);
  }
  chapter("Choose managed or custom OAuth ownership");
  await go("/start");
  await hold(1600);
  await scrollTo(".route-planner", 1400);
  await click(page.getByRole("radio", { name: /Use my own OAuth app/ }));
  await hold(2300);
  chapter("Find a researched provider");
  await go("/library");
  await hold(1400);
  await click(
    page.getByRole("button", { name: "Straightforward", exact: true }),
  );
  await hold(1700);
  await click(page.getByRole("heading", { name: "GitHub", exact: true }));
  await hold(1500);
  chapter("Follow a guide, advance the checklist and prepare a handoff");
  await scrollTo(".fact-grid", 1300);
  await hold(2200);
  await click(
    page.getByRole("button", { name: "Open the first step", exact: true }),
  );
  await hold(1600);
  await click(page.locator("#steps .step-card").first().getByRole("checkbox"));
  await hold(1000);
  await scrollTo(".next-action", 1300);
  await hold(1000);
  await click(
    page.getByRole("button", { name: "Continue to step 2", exact: true }),
  );
  await hold(1600);
  await scrollTo("#handoff", 1300);
  await click(page.getByText("Prepare my handoff", { exact: true }));
  await hold(1000);
  await click(page.getByRole("button", { name: "Copy handoff", exact: true }));
  const handoff = await page.evaluate(() => navigator.clipboard.readText());
  if (!handoff.includes("SUPPORTING SOURCES"))
    throw Error("Handoff evidence missing");
  await scrollTo(".guide-actions", 1000);
  const download = page.waitForEvent("download");
  await click(
    page.getByRole("button", { name: "Export Markdown", exact: true }),
  );
  await (await download).saveAs(path.join(output, "github-guide.md"));
  await hold(1900);
  chapter("Compare Gmail effort, verification and provider waiting");
  await go("/guide/google");
  await scrollTo(".fact-grid", 1200);
  await hold(3500);
  chapter("Submit an app outside the library for real live research");
  await go("/generate?q=Asana&refresh=1");
  await click(page.getByText("Tailor this guide", { exact: true }));
  await page.getByLabel("Who will connect the app?").selectOption("public");
  await page
    .getByLabel("What should your integration do?")
    .pressSequentially("Read tasks for an AI assistant", { delay: 32 });
  await hold(1000);
  const generationStart = Date.now();
  await click(
    page.getByRole("button", { name: "Start research", exact: true }),
  );
  await scrollTo(".research-workspace", 1300, 65);
  const feed = page.locator(".feed-content");
  let outcome;
  for (let count = 0; count < 150; count++) {
    if (await page.locator(".research-error").isVisible())
      throw Error(await page.locator(".research-error").innerText());
    if (
      await page
        .getByRole("heading", { name: "Your guide is ready.", exact: true })
        .isVisible()
    ) {
      outcome = "complete";
      break;
    }
    await feed.evaluate((element) =>
      element.scrollTo({ top: element.scrollHeight, behavior: "smooth" }),
    );
    await hold(1000);
  }
  if (!outcome)
    throw Error("Real research did not complete within its bounded wait");
  const generationMs = Date.now() - generationStart;
  chapter("Live research completed; inspect the saved shareable guide");
  await feed.evaluate((element) =>
    element.scrollTo({ top: element.scrollHeight, behavior: "smooth" }),
  );
  await hold(1900);
  const link = page.getByRole("link", { name: "Open your guide", exact: true });
  const href = await link.getAttribute("href");
  await click(link);
  await expect(
    page.getByText("AI researched · review sources", { exact: true }),
  ).toBeVisible();
  await hold(1800);
  await scrollTo(".fact-grid", 1400);
  await hold(2100);
  await scrollTo("#requirements", 1600);
  await hold(2300);
  await scrollTo("#steps", 1300);
  await hold(1900);
  chapter("Inspect evidence, unknowns and the agent-to-human boundary");
  await scrollTo("#evidence", 1700);
  await hold(2900);
  await scrollTo("#sources", 1100);
  await hold(2200);
  await scrollTo("#overview", 1700);
  await click(page.getByRole("button", { name: "Share guide", exact: true }));
  await hold(1800);
  chapter("The result: a saved guide that can be followed and shared");
  await scrollTo(".fact-grid", 1100);
  await hold(2400);
  const remaining = Math.max(0, 150000 - (Date.now() - started));
  if (remaining > 0) await hold(remaining);
  if (errors.length) throw Error("Browser runtime errors occurred");
  result = {
    base,
    durationSeconds: +((Date.now() - started) / 1000).toFixed(2),
    generationMs,
    guide: base + href,
    mode: "live",
    runtimeErrors: errors,
    chapters,
    recording:
      "Actual browser UI; one real model-backed request; no mocked or replayed data",
    firstFrameSeconds,
  };
  await writeFile(
    path.join(output, "recording.json"),
    JSON.stringify(result, null, 2),
  );
} finally {
  await context.close();
  await browser.close();
}
await video.saveAs(path.join(output, "oauthpath-demo-raw.webm"));
console.log(
  JSON.stringify({
    ...result,
    video: path.join(output, "oauthpath-demo-raw.webm"),
  }),
);
