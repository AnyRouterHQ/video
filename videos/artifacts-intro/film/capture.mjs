// capture.mjs : signed-out captures of the unlisted demo artifacts (made-up data) into captures/.
// Needs playwright-core: PLAYWRIGHT=<path to playwright-core> node capture.mjs
// d = desktop 1600x900 @2x, m = phone 390x844 @3x. Each page also gets a full-page shot for scrolling.
import { createRequire } from "node:module";
import { execSync } from "node:child_process";
import { mkdirSync } from "node:fs";
const { chromium } = createRequire(import.meta.url)(process.env.PLAYWRIGHT ?? "playwright-core");
const exe = execSync("ls ~/.cache/hyperframes/chrome/chrome-headless-shell/*/*/chrome-headless-shell | head -1").toString().trim();
const out = new URL("./captures/", import.meta.url).pathname; mkdirSync(out, { recursive: true });
const ALL = { report: "HS4tCzrfNwHpMG4l", doc: "he4TQFDkS45HTbxz", slides: "DHtj9neEceOHkRLW", diagram: "2wt9uR3bJ70yJLe6", react: "xoAsDaiSHDszjpdo" };
const PAGES = process.env.ONLY ? Object.fromEntries(Object.entries(ALL).filter(([k]) => process.env.ONLY.split(",").includes(k))) : ALL;
const FORMS = { d: { viewport: { width: 1600, height: 900 }, deviceScaleFactor: 2 }, m: { viewport: { width: 390, height: 844 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true } };
const browser = await chromium.launch({ executablePath: exe, args: ["--no-sandbox", "--hide-scrollbars"] });
for (const [form, opts] of Object.entries(FORMS)) {
  const ctx = await browser.newContext({ ...opts, colorScheme: "light" });
  for (const [name, id] of Object.entries(PAGES)) {
    const page = await ctx.newPage();
    await page.goto(`https://anyrouter.dev/a/${id}`, { waitUntil: "networkidle" });
    await page.waitForTimeout(3000);
    await page.screenshot({ path: `${out}${name}-${form}.png` });
    await page.screenshot({ path: `${out}${name}-${form}-full.png`, fullPage: true });
    const frame = page.frames().find((f) => f !== page.mainFrame()) ?? page.mainFrame();
    if (name === "slides") {
      const vp = page.viewportSize();
      for (const n of [2, 3]) { await page.mouse.click(vp.width * 0.6, vp.height * 0.45); await page.waitForTimeout(900); await page.screenshot({ path: `${out}slides-${form}-${n}.png` }); }
    }
    if (name === "react") {
      const add = frame.getByText("+ 1 cup");
      for (const n of [1, 2, 3]) { await add.click(); await page.waitForTimeout(700); await page.screenshot({ path: `${out}react-${form}-click${n}.png` }); }
    }
    console.log("captured", name, form);
    await page.close();
  }
  await ctx.close();
}
await browser.close();
