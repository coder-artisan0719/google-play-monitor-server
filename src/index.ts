import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import cors from "cors";
import cron from "node-cron";
import prisma from "./lib/prisma.js";
import { capturePlayStorePage } from "./services/playwright.js";
import screenshotRouter from "./routes/screenshot.js";
import screenshotsRouter from "./routes/screenshots.js";
import eventsRouter from "./routes/events.js";
import { broadcastNewScreenshot } from "./routes/events.js";
import appsRouter from "./routes/app.js";


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(
  cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true,
  })
);

app.use(express.json());

app.use("/public", express.static(path.join(__dirname, "../public")));
app.use("/api/screenshot", screenshotRouter);
app.use("/api/screenshots", screenshotsRouter);
app.use("/api/events", eventsRouter);
app.use("/api/apps", appsRouter);

app.get("/", (_req, res) => res.send("✅ Server is running"));

cron.schedule("0 */12 * * *", async () => {
  console.log("🕒 Cron job started: capturing screenshots for all apps");

  try {
    const apps = await prisma.app.findMany();

    if (!apps.length) {
      console.log("ℹ️ No apps found in database yet.");
      return;
    }

    for (const app of apps) {
        console.log(`📸 Capturing ${app.appName}...`);
        try {
            const result = await capturePlayStorePage(app.playStoreUrl, app.appId, app.appName);
            
            broadcastNewScreenshot({
            appId: app.appId,
            appName: app.appName,
            imageUrl: result.imageUrl,
            capturedAt: result.capturedAt,
            });
        } catch (err) {
            console.error(`❌ Failed to capture ${app.appName}:`, err);
        }
    }

    console.log("✅ Finished capturing all apps");
  } catch (err) {
    console.error("❌ Cron job failed:", err);
  }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
