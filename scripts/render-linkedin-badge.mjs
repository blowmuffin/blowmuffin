import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";

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

async function render(browser, theme) {
  const page = await browser.newPage({ viewport: { width: 600, height: 600 } });
  try {
    await page.setContent(badgeHtml(theme), { waitUntil: "networkidle" });
    // The loader script replaces the div with a LinkedIn-hosted iframe.
    const frame = await page.waitForSelector(".badge-base iframe", { timeout: 30000 });
    // Give the cross-origin iframe time to fetch and paint its content.
    await page.waitForTimeout(4000);
    const out = `${OUT_DIR}/linkedin-${theme}.png`;
    await frame.screenshot({ path: out, omitBackground: true });
    console.log(`Rendered ${theme} -> ${out}`);
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
}
