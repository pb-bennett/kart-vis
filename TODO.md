# KartVis — TODO (MVP & Next)

## Decisions (blockers)
- [x] Choose map library: Leaflet (chosen)
  - Acceptance: APP_PLAN.md notes Leaflet
- [x] Branching preference: work on `main` (solo workflow)
  - Acceptance: workflow recorded in README or this file

## MVP (v1) — must-haves
- [ ] Project: APP_PLAN.md & docs finalized
  - Acceptance: APP_PLAN.md contains data descriptions, Leaflet decision, UI items
- [ ] Add map dependency
  - Tasks:
    - [ ] Add `leaflet` and `react-leaflet` to package.json
    - [ ] Import Leaflet CSS in global client code (e.g., app/layout.js)
  - Acceptance: project builds locally with new deps; CSS loads without errors
- [ ] Scaffold Map component
  - Tasks:
    - [ ] Create `src/components/Map.jsx` (client component)
    - [ ] Load `src/data/prv_punkt.geojson` and render markers
    - [ ] Fit map to data bounds
  - Acceptance: markers display and map fits bounds
- [ ] Scaffold SidePanel + tabbed list
  - Tasks:
    - [ ] Create `src/components/SidePanel.jsx`
    - [ ] Implement tabs for `prv_punkt`, `ult_punkt`, `utl_ledning`
    - [ ] Click feature in list → pan & zoom map to feature
  - Acceptance: clicking list item focuses map and shows details
- [ ] Marker interaction & popups
  - Tasks:
    - [ ] Clicking marker shows formatted tooltip/popup
    - [ ] SidePanel shows selected feature properties
  - Acceptance: click a marker → popup + side panel show expected fields
- [ ] Filter / search
  - Tasks:
    - [ ] Add search input (search by REF, PSID, LSID)
    - [ ] Filter both list and map markers/lines
  - Acceptance: typing updates visible features immediately

## Polish (short)
- [ ] Responsive layout
  - Acceptance: side panel collapses on small screens; map fills view
- [ ] Styling: Tailwind tweaks & icons
  - Acceptance: header + settings modal present; consistent spacing/typography

## Performance & dataset handling
- [ ] Layer toggles for utl_ledning
  - Acceptance: can hide/show heavy line layer
- [ ] Consider line simplification or lazy-load for large datasets (later)
  - Acceptance: UI remains responsive with utl_ledning toggled on

## Tests & CI
- [ ] Add a minimal unit test for data loader
  - Acceptance: `npm test` runs and passes
- [ ] Add a simple CI workflow (optional)
  - Acceptance: PRs run a lint/build job

## Stretch (later)
- [ ] Marker clustering
- [ ] Export filtered features as GeoJSON
- [ ] Server API & paging for large datasets
- [ ] Basemap selection & vector styles

## Done / Archive
- [ ] Tag release v0.1 when MVP complete
  - Acceptance: git tag `v0.1` created and pushed