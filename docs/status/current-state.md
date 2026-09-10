# Current State

Last updated: 2026-09-11

## Current phase

`phase-0-bootstrap` — initial scaffold of the flight-status simulator: continuous event generation into RelayHub's Ingress API plus the two Target endpoints (`demo-airport-display`, `demo-travelapp-vendor`) it seeds in `relayhub-java`.

## Completed

- Scaffolded as a Node.js/TypeScript Express service (`src/index.ts`, `src/scheduler.ts`, `src/flights.ts`, `src/targets.ts`, `src/relayhubClient.ts`).
- Scenario matches `relayhub-java`'s `DemoDataSeeder`: Source `demo-flightstatus` (`flight-created` CREATED, `flight-status-updated` PATCHED), Targets `demo-airport-display` (always 200) and `demo-travelapp-vendor` (randomly 503 immediately or 504 after a bounded delay, per `TRAVELAPP_VENDOR_FAILURE_RATE`/`TRAVELAPP_VENDOR_TIMEOUT_MS`).
- Scheduler (`startScheduler`) ticks on a fixed interval (`EVENT_INTERVAL_MS`, default 5s) with no external trigger: creates a new flight or advances an existing one's status, capped at `MAX_LIVE_FLIGHTS` concurrently live flights.

## Next

- Verify end to end against a real running `relayhub-java` (demo profile) instance: confirm ingress calls succeed, Deliveries appear for both Targets, and `demo-travelapp-vendor`'s random failures actually produce `DEAD` deliveries in RelayHub.
- Add a `Dockerfile` and wire this service into `relayhub-java`'s `docker-compose.yml` once verified standalone.
- Point `relayhub-java`'s seeded Target `baseUrl` (currently `http://localhost:9500` via `relayhub.demo.simulator-base-url`) at wherever this service actually runs, once that's decided (local process vs docker-compose service).

## Known constraints

- No persistence — flight state lives in memory and resets on restart. Fine for a demo generator; not meant to survive restarts.
- No automated tests yet — this is a small demo aid verified manually against a live RelayHub instance, consistent with `relayhub-java`'s own "real integration over mock-only code" principle.
