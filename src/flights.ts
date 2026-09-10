export type FlightStatus = "BOARDING" | "DELAYED" | "DEPARTED" | "CANCELLED";

export interface Flight {
  flightNo: string;
  status: FlightStatus;
  gate: string;
  delayMinutes: number;
}

const AIRLINES = ["KE", "OZ", "LJ", "TW", "BX"];
const STATUS_TRANSITIONS: Record<FlightStatus, FlightStatus[]> = {
  BOARDING: ["DELAYED", "DEPARTED"],
  DELAYED: ["BOARDING", "DEPARTED", "CANCELLED"],
  DEPARTED: [],
  CANCELLED: [],
};

let nextSeq = 1;
const liveFlights = new Map<string, Flight>();

function randomFrom<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}

export function createFlight(): Flight {
  const airline = randomFrom(AIRLINES);
  const flightNo = `${airline}${100 + nextSeq++}`;
  const flight: Flight = {
    flightNo,
    status: "BOARDING",
    gate: String(Math.floor(Math.random() * 40) + 1),
    delayMinutes: 0,
  };
  liveFlights.set(flightNo, flight);
  return flight;
}

/** Advances a random in-flight (non-terminal) flight's status, or returns null if none are live. */
export function advanceRandomFlight(): Flight | null {
  const candidates = [...liveFlights.values()].filter(
    (f) => STATUS_TRANSITIONS[f.status].length > 0,
  );
  if (candidates.length === 0) {
    return null;
  }
  const flight = randomFrom(candidates);
  const nextStatus = randomFrom(STATUS_TRANSITIONS[flight.status]);
  flight.status = nextStatus;
  flight.delayMinutes = nextStatus === "DELAYED" ? (Math.floor(Math.random() * 6) + 1) * 5 : flight.delayMinutes;
  if (nextStatus === "DEPARTED" || nextStatus === "CANCELLED") {
    liveFlights.delete(flight.flightNo);
  }
  return flight;
}

export function liveFlightCount(): number {
  return liveFlights.size;
}
