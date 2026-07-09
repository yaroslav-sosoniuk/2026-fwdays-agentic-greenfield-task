## 1. Project Setup

- [ ] 1.1 Scaffold Next.js (App Router, TypeScript) project on a new branch
- [ ] 1.2 Add Prisma with SQLite datasource
- [ ] 1.3 Write `AGENTS.md` documenting stack, conventions, where domain logic lives, and how to run tests
- [ ] 1.4 Set up test runner (e.g. Vitest) and confirm a trivial test passes

## 2. Data Model (Prisma)

- [ ] 2.1 Define `Color`, `Material`, `HardwareItem`, `StandardSize` dictionary models
- [ ] 2.2 Define `ProductType` and `PartSpec` (partRole, allowsCustomSize, minCm, maxCm) models
- [ ] 2.3 Define `CatalogEntry` and `HardwareOption` models
- [ ] 2.4 Run initial migration and seed one product type ("Тумбочка") with part specs and a small set of dictionary values (including at least two visually-similar names to demonstrate the controlled-vocabulary fix, e.g. distinct "Кашемір" entry with no free-text duplicate possible)

## 3. Domain Logic (`lib/configurator/*`, pure functions)

- [ ] 3.1 Implement `validateSize(partSpec, requestedSize): ValidationResult` per spec `product-configuration`
- [ ] 3.2 Unit tests for `validateSize`: exact standard match, custom size in range, custom size below/above range, custom size disallowed
- [ ] 3.3 Implement `buildBOM(selection): BOMResult` that validates all parts and only returns a BOM when all pass
- [ ] 3.4 Unit tests for `buildBOM`: fully valid selection produces BOM, any invalid part blocks BOM and surfaces errors
- [ ] 3.5 Implement `findMatchingCatalogEntry(selection, catalogEntries): CatalogEntry | null` comparing by dictionary IDs
- [ ] 3.6 Unit tests for `findMatchingCatalogEntry`: exact ID match found, no match found, near-miss on name (not ID) does not falsely match

## 4. API Layer

- [ ] 4.1 Route handlers for dictionary CRUD (colors, materials, hardware, standard sizes, part specs)
- [ ] 4.2 Route handler for submitting a configuration → runs `buildBOM` + `findMatchingCatalogEntry`, returns BOM + validation errors + match status
- [ ] 4.3 Route handler for saving a new configuration as a `CatalogEntry` (per spec `catalog-matching`, reject if a match already exists)
- [ ] 4.4 Integration smoke test: POST a configuration through the API and assert a valid BOM is returned end-to-end

## 5. Auth Stub (`role-access`)

- [ ] 5.1 Hardcoded login screen with manager/admin accounts
- [ ] 5.2 Route/screen gating: manager → configurator, admin → dictionary management

## 6. UI

- [ ] 6.1 Manager configurator screen: part selection form, inline validation errors, BOM display, standard/individual flag, "save as catalog entry" action
- [ ] 6.2 Admin dictionary CRUD screens: colors, materials, hardware, standard sizes, part-size rules
- [ ] 6.3 Admin catalog entries list with deactivate action

## 7. Verification

- [ ] 7.1 Run full unit + integration test suite, confirm passing
- [ ] 7.2 Manual walkthrough: manager configures a standard combination (matches catalog), a custom-size combination (new entry), and an out-of-range size (blocked) — capture for the demo video
- [ ] 7.3 Manual walkthrough: admin adds a new color/material and confirms it immediately appears in the manager's configurator dropdown
- [ ] 7.4 Run `/code-review` (or a separate agent pass) on the implementation before considering it done, per maker ≠ checker practice

## 8. Wrap-up

- [ ] 8.1 Record 1-2 minute demo video covering the product and the agentic engineering practices applied
- [ ] 8.2 Fill out PR template with practices used, what the agent did vs. what the user decided
- [ ] 8.3 Archive this OpenSpec change once implementation and review are complete
