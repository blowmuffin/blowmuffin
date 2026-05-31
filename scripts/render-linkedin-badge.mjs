import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";
import { createServer } from "node:http";

const VANITY = "ayushkasare";
const PROFILE_URL = `https://in.linkedin.com/in/${VANITY}?trk=profile-badge`;
const OUT_DIR = "dist-badges";
const THEMES = ["light", "dark"];

function badgeHtml(theme) {
  return `<!DOCTYPE html>
<html>
  <head><meta charset="utf-8" /></head>
  <body style="margin:0;padding:0;background:transparent;">
    <div class="badge-base LI-profile-badge" data-locale="en_US" data-size="medium"
         data-theme="${theme}" data-type="VERTICAL" data-vanity="${VANITY}" data-version="v1">
      <a class="badge-base__link LI-simple-link" href="${PROFILE_URL}">Ayush Kasare</a>
    </div>
    <script src="https://platform.linkedin.com/badges/js/profile.js" async defer type="text/javascript"></script>
  </body>
</html>`;
}

// LinkedIn's profile.js only runs from a real HTTP origin (not about:blank),
// so serve the badge HTML from a local server and navigate to it.
const server = createServer((req, res) => {
  const theme = new URL(req.url, "http://localhost").searchParams.get("theme") || "light";
  res.writeHead(200, { "Content-Type": "text/html" });
  res.end(badgeHtml(theme));
});

await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
const port = server.address().port;
const baseUrl = `http://127.0.0.1:${port}`;

async function render(browser, theme) {
  const page = await browser.newPage({ viewport: { width: 600, height: 600 } });
  try {
    await page.goto(`${baseUrl}/?theme=${theme}`, { waitUntil: "networkidle" });

    // profile.js replaces the div's contents with a LinkedIn-hosted iframe.
    // Prefer screenshotting the iframe; fall back to the badge container.
    let target;
    try {
      target = await page.waitForSelector(".badge-base iframe", { timeout: 30000, state: "visible" });
    } catch {
      console.warn(`[${theme}] iframe not found; falling back to .badge-base container`);
      target = await page.waitForSelector(".badge-base", { timeout: 5000, state: "visible" });
    }

    // Give the cross-origin iframe time to fetch and paint its content.
    await page.waitForTimeout(5000);

    const box = await target.boundingBox();
    if (!box || box.width < 10 || box.height < 10) {
      const html = await page.content();
      throw new Error(`[${theme}] badge did not render (box=${JSON.stringify(box)}). Page:\n${html.slice(0, 800)}`);
    }

    const out = `${OUT_DIR}/linkedin-${theme}.png`;
    await target.screenshot({ path: out, omitBackground: true });
    console.log(`Rendered ${theme} -> ${out} (${Math.round(box.width)}x${Math.round(box.height)})`);
  } finally {
    await page.close();
  }
}

await mkdir(OUT_DIR, { recursive: true });
const browser = await chromium.launch();
try {
  for (const theme of THEMES) {
    await render(browser, theme);
  }
} finally {
  await browser.close();
  server.close();
}
