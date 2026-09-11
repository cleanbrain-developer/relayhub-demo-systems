import { advanceRandomFlight, createFlight, liveFlightCount } from "./flights.js";
import { publishFlightCreated, publishFlightStatusUpdated } from "./relayhubClient.js";

const EVENT_INTERVAL_MS = Number(process.env.EVENT_INTERVAL_MS ?? "5000");
const MAX_LIVE_FLIGHTS = Number(process.env.MAX_LIVE_FLIGHTS ?? "8");

let timer: NodeJS.Timeout | null = null;

/**
 * Ticks forever, generating one flight event at a time without any external trigger, so RelayHub
 * always has fresh traffic (including eventual DLQ activity) to show on the observability
 * dashboard. Prefers advancing an existing flight's status over creating a new one once
 * MAX_LIVE_FLIGHTS is reached, so the flight population doesn't grow unbounded.
 *
 * Starts running immediately — pauseScheduler()/resumeScheduler() (exposed over ./admin.ts,
 * proxied by RelayHub's admin console) are the only way to stop/restart it afterwards.
 */
export function startScheduler(): void {
  resumeScheduler();
}

/** Stops generating events. Idempotent — calling it while already paused is a no-op. */
export function pauseScheduler(): void {
  if (timer) {
    clearInterval(timer);
    timer = null;
    console.log("[scheduler] paused");
  }
}

/** (Re)starts generating events. Idempotent — calling it while already running is a no-op. */
export function resumeScheduler(): void {
  if (timer) {
    return;
  }
  timer = setInterval(() => {
    void tick();
  }, EVENT_INTERVAL_MS);
  console.log(`[scheduler] running, one event every ${EVENT_INTERVAL_MS}ms`);
}

export function isSchedulerRunning(): boolean {
  return timer !== null;
}

export function schedulerConfig(): { intervalMs: number; maxLiveFlights: number } {
  return { intervalMs: EVENT_INTERVAL_MS, maxLiveFlights: MAX_LIVE_FLIGHTS };
}

async function tick(): Promise<void> {
  const shouldCreate = liveFlightCount() < MAX_LIVE_FLIGHTS && Math.random() < 0.5;
  if (shouldCreate) {
    const flight = createFlight();
    await publishFlightCreated(flight);
    return;
  }
  const flight = advanceRandomFlight();
  if (flight) {
    await publishFlightStatusUpdated(flight);
  } else {
    const created = createFlight();
    await publishFlightCreated(created);
  }
}
