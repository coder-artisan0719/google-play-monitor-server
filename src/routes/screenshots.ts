import { Router } from "express";
import prisma from "../lib/prisma.js";

const router = Router();

router.get("/:appId", async (req, res) => {
  const { appId } = req.params;

  if (!appId) {
    return res.status(400).json({ error: "appId is required" });
  }

  try {
    const screenshots = await prisma.screenshot.findMany({
      where: { appId },
      orderBy: { capturedAt: "desc" },
    });

    if (screenshots.length === 0) {
      return res
        .status(404)
        .json({ error: "No screenshots found for this appId" });
    }

    res.json(screenshots);
  } catch (err) {
    console.error("❌ Failed to fetch screenshots:", err);
    res.status(500).json({ error: "Failed to fetch screenshots" });
  }
});

export default router;
