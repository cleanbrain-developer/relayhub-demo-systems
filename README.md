# relayhub-demo-systems

Simulated Source and Target systems for [relayhub-java](https://github.com/cleanbrain-developer/relayhub-java) — an event-driven data integration platform. This service exists purely to give RelayHub's reliability features (retry, DLQ, replay) and observability stack (metrics, dashboards, tracing) something real and continuous to demonstrate.

## Scenario

A simulated airline flight-status system generates flights, then randomly advances their status (`BOARDING` → `DELAYED`/`DEPARTED`/`CANCELLED`) on a timer, without any manual trigger. Each change is POSTed/PATCHed straight into RelayHub's Ingress API:

- `POST /ingress/v1/demo-flightstatus/flight-created` — a new flight appears
- `PATCH /ingress/v1/demo-flightstatus/flight-status-updated` — an existing flight's status changes

RelayHub fans each event out to two Targets it has been seeded to know about (see `relayhub-java`'s `DemoDataSeeder`), both served by this same process:

| Target | Endpoint | Behavior |
|---|---|---|
| `demo-airport-display` | `POST /targets/airport-display` | Always succeeds — a reliable internal-feeling system. |
| `demo-travelapp-vendor` | `POST /targets/travelapp-vendor` | Randomly rejects (503) or stalls then errors (504) — a flaky third-party vendor. This is what feeds RelayHub's DLQ. |

Nothing about the random failure lives in RelayHub or in a script — it's this simulated vendor's own behavior, same as a real unreliable third party.

## Running locally

```bash
npm install
cp .env.example .env   # point RELAYHUB_BASE_URL at your running relayhub-java instance
npm run dev
```

Requires a running `relayhub-java` instance (with its `demo` Spring profile active, so the Source/Targets/Subscriptions this simulator depends on already exist) — see that repo's README for `docker compose up -d` + `./gradlew bootRun --args='--spring.profiles.active=demo'`.

## Configuration

See `.env.example` for every environment variable (RelayHub base URL, event interval, vendor failure rate, etc).
