import { Router } from "express";

const router = Router();
const clients: any[] = [];

router.get("/", (req, res) => {
  res.set({
    "Cache-Control": "no-cache",
    "Content-Type": "text/event-stream",
    "Connection": "keep-alive",
    "Access-Control-Allow-Origin": "http://localhost:5173",
  });
  res.flushHeaders();

  clients.push(res);
  console.log(`👂 Client connected (${clients.length} total)`);

  req.on("close", () => {
    clients.splice(clients.indexOf(res), 1);
    console.log(`❌ Client disconnected (${clients.length} left)`);
  });
});

export function broadcastNewScreenshot(screenshot: any) {
  clients.forEach((client) => {
    client.write(`data: ${JSON.stringify(screenshot)}\n\n`);
  });
}

export default router;
