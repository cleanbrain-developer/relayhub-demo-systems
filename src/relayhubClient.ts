import type { Flight } from "./flights.js";

const RELAYHUB_BASE_URL = process.env.RELAYHUB_BASE_URL ?? "http://localhost:8080";
const SOURCE_KEY = "demo-flightstatus";

let eventSeq = 1;

async function postFlightEvent(method: "POST" | "PATCH", eventKey: string, flight: Flight): Promise<void> {
  const url = `${RELAYHUB_BASE_URL}/ingress/v1/${SOURCE_KEY}/${eventKey}`;
  const body = {
    eventId: `sim-${Date.now()}-${eventSeq++}`,
    flightNo: flight.flightNo,
    status: flight.status,
    gate: flight.gate,
    delayMinutes: flight.delayMinutes,
  };
  try {
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      console.warn(`[relayhub] ${method} ${eventKey} for ${flight.flightNo} -> HTTP ${res.status}`);
      return;
    }
    console.log(`[relayhub] ${method} ${eventKey} for ${flight.flightNo} (${flight.status}) -> ${res.status}`);
  } catch (err) {
    console.warn(`[relayhub] ${method} ${eventKey} for ${flight.flightNo} failed: ${(err as Error).message}`);
  }
}

export function publishFlightCreated(flight: Flight): Promise<void> {
  return postFlightEvent("POST", "flight-created", flight);
}

export function publishFlightStatusUpdated(flight: Flight): Promise<void> {
  return postFlightEvent("PATCH", "flight-status-updated", flight);
}
