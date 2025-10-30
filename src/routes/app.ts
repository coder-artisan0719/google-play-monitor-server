import { Router } from "express";
import prisma from "../lib/prisma.js";

const router = Router();

router.get("/", async (_req, res) => {
  try {
    const apps = await prisma.app.findMany({
      orderBy: { createdAt: "desc" },
    });
    res.json(apps);
  } catch (err) {
    console.error("❌ Failed to fetch apps:", err);
    res.status(500).json({ error: "Failed to fetch apps" });
  }
});

export default router;
