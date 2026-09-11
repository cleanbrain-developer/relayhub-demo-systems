import express, { type Router } from "express";
import { isSchedulerRunning, pauseScheduler, resumeScheduler, schedulerConfig } from "./scheduler.js";

/**
 * Control surface for the event-generation scheduler, so RelayHub's admin console can offer an
 * on/off switch for demo traffic instead of requiring a redeploy to change EVENT_INTERVAL_MS.
 * Not part of the simulated external systems (unlike ./targets.ts) — this is this service's own
 * operational control, which is fine per CLAUDE.md's "no RelayHub domain logic" rule.
 *
 * No auth here: this Service has no public Kubernetes Route (see cleanbrain-me-infra's
 * kubernetes/apps/relayhub-java/demo-systems/service.yaml), it's only reachable in-cluster from
 * RelayHub's own "api" pod, which is itself the thing gating this behind admin HTTP Basic auth
 * (see relayhub-java's SimulatorController / SecurityConfig).
 */
export const adminRouter: Router = express.Router();
adminRouter.use(express.json());

adminRouter.get("/scheduler", (_req, res) => {
  res.json({ running: isSchedulerRunning(), ...schedulerConfig() });
});

adminRouter.post("/scheduler/pause", (_req, res) => {
  pauseScheduler();
  res.json({ running: isSchedulerRunning() });
});

adminRouter.post("/scheduler/resume", (_req, res) => {
  resumeScheduler();
  res.json({ running: isSchedulerRunning() });
});
