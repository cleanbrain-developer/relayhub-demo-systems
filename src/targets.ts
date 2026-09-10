import express, { type Router } from "express";

const FAILURE_RATE = Number(process.env.TRAVELAPP_VENDOR_FAILURE_RATE ?? "0.4");
const TIMEOUT_MS = Number(process.env.TRAVELAPP_VENDOR_TIMEOUT_MS ?? "6000");

export const targetsRouter: Router = express.Router();
targetsRouter.use(express.json());

// Always succeeds — represents an internal-feeling, reliable receiving system.
targetsRouter.post("/airport-display", (req, res) => {
  console.log("[target:airport-display] received", req.body);
  res.status(200).json({ received: true });
});

// Simulates a flaky third-party vendor: sometimes rejects outright, sometimes stalls for a few
// seconds before erroring out (RelayHub currently has no client-side request timeout configured,
// so this endpoint bounds its own delay rather than risking hanging a delivery worker thread
// indefinitely), sometimes succeeds. This endpoint has no awareness of RelayHub's retry policy —
// it just behaves like an unreliable real system would, and RelayHub's own retry/DLQ logic reacts.
targetsRouter.post("/travelapp-vendor", (req, res) => {
  const roll = Math.random();
  if (roll < FAILURE_RATE / 2) {
    console.log("[target:travelapp-vendor] rejecting with 503", req.body);
    res.status(503).json({ error: "vendor temporarily unavailable" });
    return;
  }
  if (roll < FAILURE_RATE) {
    console.log("[target:travelapp-vendor] simulating timeout (no response)", req.body);
    setTimeout(() => {
      if (!res.headersSent) {
        res.status(504).json({ error: "vendor timeout" });
      }
    }, TIMEOUT_MS);
    return;
  }
  console.log("[target:travelapp-vendor] received", req.body);
  res.status(200).json({ received: true });
});
