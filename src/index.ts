import "dotenv/config";
import express from "express";
import { targetsRouter } from "./targets.js";
import { adminRouter } from "./admin.js";
import { startScheduler } from "./scheduler.js";

const PORT = Number(process.env.PORT ?? "9500");

const app = express();
app.use("/targets", targetsRouter);
app.use("/admin", adminRouter);
app.get("/health", (_req, res) => res.json({ status: "ok" }));

app.listen(PORT, () => {
  console.log(`relayhub-demo-systems listening on :${PORT}`);
  startScheduler();
});
