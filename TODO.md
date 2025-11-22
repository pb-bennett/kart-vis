# KartVis — TODO (MVP & Next)

## ✅ Completed

- [x] Choose map library: Leaflet (chosen)
- [x] Branching preference: work on `main` (solo workflow)
- [x] Project: APP_PLAN.md & docs finalized
- [x] Add map dependency
  - [x] Add `leaflet` and `react-leaflet` to package.json
  - [x] Import Leaflet CSS in Map.jsx
- [x] Scaffold Map component
  - [x] Create `src/components/Map.jsx` (client component)
  - [x] Load `src/data/prv_punkt.geojson` and render markers
  - [x] Fit map to data bounds
- [x] Scaffold SidePanel
  - [x] Create `src/components/SidePanel.jsx`
  - [x] Click feature in list → pan & zoom map to feature (FlyTo implemented)
- [x] Marker interaction & popups
  - [x] Clicking marker shows formatted tooltip/popup
  - [x] SidePanel shows selected feature properties
  - [x] Two-way sync: map ↔ sidebar selection

---

## 🎯 MVP (v1) — Remaining must-haves

### 1. Tabbed dataset interface

- [ ] Add tab component to SidePanel header
- [ ] Tab options: `prv_punkt`, `ult_punkt`, `utl_ledning`
- [ ] Load selected dataset dynamically
- [ ] Update map markers/lines based on active tab
- **Acceptance**: user can switch between datasets; map updates accordingly

### 2. Search & filter functionality

- [ ] Add search input to SidePanel header
- [ ] Filter features by REF, PSID, LSID (case-insensitive)
- [ ] Update both sidebar list and map markers in real-time
- [ ] Clear filter button/icon
- **Acceptance**: typing filters visible features immediately

### 3. LineString support for utility network

- [ ] Add Polyline component to Map.jsx
- [ ] Render `utl_ledning.geojson` as line features
- [ ] Style lines differently from points
- [ ] Add click handler for line features
- [ ] Show line properties in popup (LSID, FCODE, LENGTH, MATERIAL)
- **Acceptance**: utility lines display and are interactive

### 4. Enhanced feature detail panel

- [ ] Expand selected feature detail view in sidebar
- [ ] Show all relevant properties (not just title + PSID)
- [ ] Format dates and numeric fields nicely
- [ ] Handle null/missing values gracefully
- **Acceptance**: full property list visible for selected feature

---

## 🎨 Polish (short-term)

### 5. Responsive layout improvements

- [ ] Sidebar collapses to hamburger menu on mobile (<768px)
- [ ] Map fills full viewport on mobile when sidebar collapsed
- [ ] Smooth transition animations
- **Acceptance**: app usable on mobile devices

### 6. Styling refinements

- [ ] Add icons to tabs and search input (lucide-react or heroicons)
- [ ] Consistent spacing and typography
- [ ] Dark mode support (if needed)
- [ ] Loading spinner while fetching GeoJSON
- **Acceptance**: polished, professional appearance

---

## ⚡ Performance & dataset handling

### 7. Layer toggle controls

- [ ] Add checkbox/toggle for each layer in sidebar
- [ ] Allow hiding/showing individual layers
- [ ] Remember toggle state
- **Acceptance**: can hide/show `utl_ledning` for better performance

### 8. Optimize large datasets

- [ ] Consider line simplification for `utl_ledning` (if slow)
- [ ] Lazy-load or paginate features if needed
- [ ] Debounce search input
- **Acceptance**: UI remains responsive with all layers visible

---

## 🧪 Tests & CI

### 9. Unit tests

- [ ] Test data loading utilities
- [ ] Test SidePanel filtering logic
- [ ] Test Map component rendering
- [ ] Add test script to package.json
- **Acceptance**: `npm test` runs and passes

### 10. CI workflow (optional)

- [ ] GitHub Actions workflow for lint + build
- [ ] Run on PRs and main branch pushes
- **Acceptance**: automated checks on every push

---

## 🚀 Stretch goals (post-MVP)

- [ ] Marker clustering for dense point datasets
- [ ] Export filtered features as GeoJSON
- [ ] Server-side API with pagination for huge datasets
- [ ] Basemap selection (OSM, Satellite, Terrain)
- [ ] Vector tile support (MapLibre GL JS migration)
- [ ] Date range picker for temporal filtering
- [ ] Draw tools for spatial queries

---

## 📦 Release

- [ ] Tag release `v0.1` when MVP complete
  - **Acceptance**: git tag `v0.1` created and pushed
- [ ] Update README with screenshots and usage instructions
- [ ] Deploy to Vercel or similar platform
  - **Acceptance**: live demo URL available

---

_Last updated: 2025-11-22_
