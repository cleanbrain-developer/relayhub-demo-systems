# Claude Code Project Adapter

This file routes Claude Code to this repository's context. It is not itself the source of design truth.

## Required context

Read `PROJECT.yaml` first, then `docs/status/current-state.md` for current phase and next work. This is a small satellite service (a simulator, not a product in its own right) — it deliberately does not carry a full `.ai/constitution/`; its design authority is [relayhub-java](https://github.com/cleanbrain-developer/relayhub-java), the service it exists to demonstrate.

## Working contract

- This service simulates *external* Source/Target systems only. It must never contain RelayHub's own domain logic (retry/DLQ/replay/mapping) — that belongs in relayhub-java.
- Traffic generation and Target failure behavior must be continuous/automatic (no manual trigger required) and must originate from this service's own internal logic, not a shell script.
- Keep it simple: this is a demo/observability aid, not a production system. Don't add persistence, auth, or scaling concerns unless relayhub-java's own demo requirements grow to need them.
