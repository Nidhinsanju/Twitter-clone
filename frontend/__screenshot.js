const { chromium } = require("playwright");

const pages = [
  { path: "/", name: "home" },
  { path: "/explore", name: "explore" },
  { path: "/notifications", name: "notifications" },
  { path: "/messages", name: "messages" },
  { path: "/profile/nidhinsanju", name: "profile" },
];

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(String(e)));
  page.on("console", (msg) => {
    if (msg.type() === "error") errors.push(msg.text());
  });

  for (const p of pages) {
    await page.goto(`http://localhost:3000${p.path}`, { waitUntil: "networkidle" });
    await page.waitForTimeout(300);
    await page.screenshot({
      path: `C:/Users/SANJU/AppData/Local/Temp/claude/e--Development-Projects-twitter/730bfdb6-b918-4bbe-adb8-db70b33d1686/scratchpad/${p.name}.png`,
    });
  }

  // mobile viewport for home
  await context.close();
  const mobileContext = await browser.newContext({ viewport: { width: 420, height: 900 } });
  const mobilePage = await mobileContext.newPage();
  await mobilePage.goto("http://localhost:3000/", { waitUntil: "networkidle" });
  await mobilePage.waitForTimeout(300);
  await mobilePage.screenshot({
    path: "C:/Users/SANJU/AppData/Local/Temp/claude/e--Development-Projects-twitter/730bfdb6-b918-4bbe-adb8-db70b33d1686/scratchpad/home-mobile.png",
  });

  await browser.close();

  if (errors.length) {
    console.log("CONSOLE ERRORS:\n" + errors.join("\n"));
  } else {
    console.log("No console errors.");
  }
})();
