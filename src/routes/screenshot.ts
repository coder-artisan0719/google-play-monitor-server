import { Router } from "express";
import { capturePlayStorePage } from "../services/playwright.js";

const router = Router();

router.post("/", async (req, res) => {
  const { url, appName } = req.body;

  if (!url || !appName) {
    return res
      .status(400)
      .json({ error: "Both appName and url are required" });
  }

  const match = url.match(/id=([a-zA-Z0-9._]+)/);
  const appId = match ? match[1] : appName.replace(/\s+/g, "_").toLowerCase();

  try {
    const { imageUrl, capturedAt } = await capturePlayStorePage(
      url,
      appId,
      appName
    );

    res.json({
      appName,
      appId,
      url,
      imagePath: imageUrl,
      timestamp: capturedAt,
    });
  } catch (err) {
    console.error("❌ Screenshot capture failed:", err);
    res.status(500).json({ error: "Failed to capture screenshot" });
  }
});

export default router;
