# Phase 4: Caching and Sanity

**Status:** OUTLINE (finalised at phase entry).
**Created:** 09-11-26
**Umbrella:** `tanstack-migration_UMBRELLA_PLAN_09-11-26.md`

## Scope

Sanity reads through createServerFn + TanStack Query (ensureQueryData in loaders); a response cache (Workers Cache API) for Sanity-backed routes with purge from the webhook and the hourly cron in src/server.ts (fetch + scheduled); draft-mode routes removed; runtime renders tested, not only prerenders.

## Gates

The exit gate in the umbrella table, plus the standard gates (typecheck, lint, unit tests, Next CI unchanged and green).
