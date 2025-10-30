import { chromium } from "playwright";
import fs from "fs";
import path from "path";
import prisma from "../lib/prisma.js";

export async function capturePlayStorePage(
  url: string,
  appId: string,
  appName: string
): Promise<{ imageUrl: string; capturedAt: string }> {
  console.log(`📸 Capturing: ${url}`);

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  await page.setViewportSize({ width: 1280, height: 2000 });
  await page.goto(url, { waitUntil: "networkidle" });
  await page.waitForTimeout(5000);

  const dir = path.resolve(`public/screenshots/${appId}`);
  fs.mkdirSync(dir, { recursive: true });

  const timestamp = new Date().toISOString();
  const fileName = `${appId}_${Date.now()}.png`;
  const filePath = path.join(dir, fileName);
  const imageUrl = `/public/screenshots/${appId}/${fileName}`;

  await page.screenshot({ path: filePath, fullPage: true });
  await browser.close();

  console.log(`✅ Saved screenshot: ${filePath}`);

  await prisma.app.upsert({
    where: { appId },
    update: {},
    create: {
      appId,
      appName,
      playStoreUrl: url,
    },
  });

  await prisma.screenshot.create({
    data: {
      appId,
      imageUrl,
      fileName,
      capturedAt: new Date(timestamp),
    },
  });

  console.log("🗂️  Metadata stored in PostgreSQL.");

  return { imageUrl, capturedAt: timestamp };
}
