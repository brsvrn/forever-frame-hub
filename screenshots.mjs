import { chromium } from "playwright";

(async () => {
  const browser = await chromium.launch();
  const url = "http://localhost:8081";
  const destDir = "C:/Users/misafir/.gemini/antigravity/brain/560d4386-c6e5-491e-8d0b-a89560705604";

  const viewports = [
    { name: "desktop", width: 1920, height: 1080 },
    { name: "tablet", width: 768, height: 1024 },
    { name: "mobile", width: 390, height: 844 },
  ];

  for (const vp of viewports) {
    const context = await browser.newContext({ viewport: { width: vp.width, height: vp.height } });
    const page = await context.newPage();

    console.log(`Navigating to ${url} on ${vp.name}...`);
    try {
      await page.goto(url, { waitUntil: "networkidle", timeout: 30000 });
      await page.waitForTimeout(3000); // Wait for initial animations

      console.log(`Taking full page screenshot for ${vp.name}...`);
      await page.screenshot({ path: `${destDir}/${vp.name}-full.png`, fullPage: true });

      if (vp.name === "desktop") {
        const sections = [
          { name: "01-Hero", selector: "main > section:nth-child(1)" },
          { name: "02-InteractiveDemo", selector: "main > section:nth-child(2)" },
          { name: "03-Features", selector: "main > section:nth-child(3)" },
          { name: "04-ThemeGallery", selector: "main > section:nth-child(4)" },
          { name: "05-QRExperience", selector: "main > section:nth-child(5)" },
          { name: "06-Dashboard", selector: "main > section:nth-child(6)" },
          { name: "07-Comparison", selector: "main > section:nth-child(7)" },
          { name: "08-Pricing", selector: "main > section:nth-child(8)" },
          { name: "09-Testimonials", selector: "main > section:nth-child(9)" },
          { name: "10-FAQ", selector: "main > section:nth-child(10)" },
          { name: "11-PremiumCTA", selector: "main > section:nth-child(12)" },
          { name: "12-Footer", selector: "footer" },
        ];

        for (const section of sections) {
          console.log(`Taking screenshot of ${section.name}...`);
          try {
            const locator = page.locator(section.selector);
            await locator.scrollIntoViewIfNeeded();
            await page.waitForTimeout(1000);
            await locator.screenshot({ path: `${destDir}/desktop-${section.name}.png` });
          } catch (e) {
            console.log(`Failed to capture ${section.name}:`, e.message);
          }
        }
      }
    } catch (e) {
      console.log(`Error on ${vp.name}: ${e.message}`);
    } finally {
      await context.close();
    }
  }

  await browser.close();
  console.log("Screenshots generated successfully.");
})();
