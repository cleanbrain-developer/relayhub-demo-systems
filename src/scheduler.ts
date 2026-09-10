import { advanceRandomFlight, createFlight, liveFlightCount } from "./flights.js";
import { publishFlightCreated, publishFlightStatusUpdated } from "./relayhubClient.js";

const EVENT_INTERVAL_MS = Number(process.env.EVENT_INTERVAL_MS ?? "5000");
const MAX_LIVE_FLIGHTS = Number(process.env.MAX_LIVE_FLIGHTS ?? "8");

/**
 * Ticks forever, generating one flight event at a time without any external trigger, so RelayHub
 * always has fresh traffic (including eventual DLQ activity) to show on the observability
 * dashboard. Prefers advancing an existing flight's status over creating a new one once
 * MAX_LIVE_FLIGHTS is reached, so the flight population doesn't grow unbounded.
 */
export function startScheduler(): void {
  setInterval(() => {
    void tick();
  }, EVENT_INTERVAL_MS);
  console.log(`[scheduler] started, one event every ${EVENT_INTERVAL_MS}ms`);
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
