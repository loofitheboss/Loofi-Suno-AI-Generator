# Next Steps Plan

This plan defines what to build next so the app evolves from a working MVP into a reliable, controllable, and production-ready product.

## Guiding Priorities

1. Reliability first
2. Output quality second
3. User workflow speed third
4. Production guardrails and observability

## Sprint 1: Reliability + Test Coverage (1 week)

### Objectives

- Add backend route and service test coverage.
- Make provider failures predictable and user-friendly.
- Ensure CI blocks regressions.

### Tasks

- Create backend test suite for:
  - `GET /api/health`
  - `GET /api/song/providers`
  - `POST /api/song/generate`
  - `POST /api/song/extend`
- Add provider fallback tests for `provider=auto`.
- Normalize provider errors into standard categories:
  - auth/invalid key
  - quota/credits exhausted
  - rate limited
  - timeout/network failure
  - unknown provider error
- Add request IDs and structured logs (without API keys or secrets).
- Add GitHub Actions workflow for backend tests on PRs.

### Definition of Done

- Core API endpoints are covered by automated tests.
- Fallback behavior works and is verified in CI.
- Error messages are actionable for users and developers.

## Sprint 2: Prompt Intelligence Upgrade (1-2 weeks)

### Objectives

- Improve prompt quality consistency and multilingual output behavior.
- Expose advanced controls already present in backend schemas.

### Tasks

- Upgrade producer logic in prompt builder:
  - strict top-loaded style ordering
  - style prompt hard length cap
  - stronger structure-specific prompting
- Improve lyric extension behavior and language consistency.
- Add retry strategy for malformed model output.
- Expose advanced controls in UI:
  - `weirdness`
  - `styleInfluence`

### Definition of Done

- Prompt outputs are more consistent across genres.
- Users can tune generation entropy/style adherence from UI.

## Sprint 3: User Workflow Speed (1 week)

### Objectives

- Improve iteration speed and reduce repetitive manual work.

### Tasks

- Add generation history (local persistence first):
  - input settings snapshot
  - provider/model used
  - generated title/style/lyrics
- Add "Regenerate Variants" (2-3 alternative packs).
- Add "Copy All" and export bundle support.
- Improve long-running loading/error states in the UI.

### Definition of Done

- Users can compare, reuse, and export multiple generated packs quickly.

## Sprint 4: Production Hardening (1-2 weeks)

### Objectives

- Prepare for safer public deployment with cost and reliability controls.

### Tasks

- Add optional auth and basic rate limiting for hosted deployments.
- Add provider policy controls per environment:
  - preferred provider order
  - model tier overrides
  - fallback toggles
- Add lightweight operational metrics:
  - success/failure rate per provider
  - latency per endpoint/provider
  - top error categories

### Definition of Done

- Deployment has basic security, observability, and cost guardrails.

## Cross-Sprint Backlog (Nice-to-Have)

- Preset library for common styles and languages.
- Batch generation mode.
- Team/project save and sharing.
- Optional remix/stem workflows (future advanced track).

## Versioning Milestones

- `v1.2.0`: Sprint 1 complete (stability baseline)
- `v1.3.0`: Sprint 2 complete (quality controls)
- `v1.4.0`: Sprint 3 complete (workflow boost)
- `v1.5.0`: Sprint 4 complete (production readiness)

## Execution Checklist

- [ ] Add backend tests and CI workflow
- [ ] Add standardized provider error mapping
- [ ] Add request ID + structured logging
- [ ] Expose `weirdness` and `styleInfluence` in UI
- [ ] Implement history + variants + export
- [ ] Add rate limiting/auth and metrics
