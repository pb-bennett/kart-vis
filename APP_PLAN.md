# KartVis — App Plan

## 🎯 Purpose

KartVis is a simple, focused web app for visualizing and exploring geospatial point data (e.g., the provided GeoJSON `prv_punkt.geojson`). The goal of this plan is to outline features, architecture, data notes, and next steps for a small, fast MVP implementation.

---

## 🧭 High-level requirements

- Display a responsive map with geospatial features (points) using the provided GeoJSON.
- Provide a minimal, clean UI: header bar with `KartVis`, map in the main area, and a simple side panel for feature details.
- Let users click a point to see details and filter by attributes.
- Keep the UI lightweight and fast — prefer client-side rendering for initial prototypes.
- **Language: Norwegian (Bokmål)** — all UI text, labels, and messages must be in Norwegian. Instructions and technical documentation can remain in English.

---

## 🧩 Tech stack

- **Next.js 16** (app router) — project scaffold complete
- **JavaScript** (no TypeScript)
- **React 19** + **Tailwind CSS v4** — visual styling
- **Map library: Leaflet** via **react-leaflet** — chosen for lightweight, plugin-rich ecosystem
- **GeoJSON source**: `src/data/prv_punkt.geojson`, `src/data/ult_punkt.geojson`, `src/data/utl_ledning.geojson`

---

## 🗂 Data & data handling

- Use GeoJSON directly during development (store it in `src/data/`).
- For larger datasets, move data to a server API or convert to vector tiles.
- Transformations:
  - Normalize property names if needed.
  - Compute derived fields (e.g., group, date ranges) on the client/server.

### Data file descriptions (summary)

1. src/data/prv_punkt.geojson

- Short name: prv_punkt
- CRS: CRS84 (lon/lat)
- Geometry: Point
- Feature count: 15
- Key properties: fid, PSID, REF, REFNO, STATION, FCODE, TYPE, DATEREG, DATECHANGE, MPNT_GUID, utm_x, utm_y
- Intended use: small sample / preview point layer — display as markers; use PSID or MPNT_GUID as stable unique id
- Default UI fields suggested: REF (or REFNO), PSID, DATEREG, DATECHANGE, TYPE/FCODE
- Notes: small dataset, some REF/STATION values are null — UI should handle missing values gracefully; utm_x/utm_y are available as attributes if projected coords are required later

2. src/data/ult_punkt.geojson

- Short name: ult_punkt
- CRS: CRS84 (lon/lat) — re-exported to CRS84 and confirmed
- Geometry: Point
- Feature count: moderate (tens → low hundreds in current file)
- Key properties: fid, PSID, REF, STATION, FCODE (e.g., "OVL"), FUNC, YEAR, Z (elevation), LOCATION, DATEREG, DATECHANGE, etc.
- Intended use: main/stable control or benchmark points — display markers with richer metadata available in side panel/popups
- Default UI fields suggested: REF, PSID, STATION, YEAR, Z, DATEREG
- Notes: now CRS-aligned with the other layers so no client-side reprojection is required; some numeric fields (YEAR, Z) may be 0 or null and should be displayed carefully

3. src/data/utl_ledning.geojson

- Short name: utl_ledning
- CRS: CRS84 (lon/lat)
- Geometry: LineString / MultiLineString
- Feature count: large (hundreds of line segments in the file)
- Key properties: fid, LSID, FCODE, FCODEGROUP, LENGTH, DATEREG, DATECHANGE, MATERIAL, DIM, YEAR, etc.
- Intended use: utility network layer — draw as polylines for context and attribute-driven analysis
- Default UI fields suggested: LSID, FCODE/FCODEGROUP, LENGTH, MATERIAL, DIM, DATEREG
- Notes: larger dataset — consider performance optimizations (layer toggle, simplification, lazy-loading) if rendering many segments at once

---

## 🛠 App architecture

- `app/layout.js` — site-wide layout and global styling, header.
- `app/page.js` (already minimal) — initial page to display the map & layout.
- `src/components/` — reusable components:
  - `Header.jsx` — header bar with app name, settings icon, etc.
  - `Map.jsx` — map wrapper that loads GeoJSON features
  - `SidePanel.jsx` — details and filters
- `src/data/prv_punkt.geojson`, `src/data/ult_punkt.geojson`, `src/data/utl_ledning.geojson` — datasets

---

## 📐 UI design & components

- Header bar across the top with `KartVis` branding (complete).
- Left or right collapsible `SidePanel` for details & filters.
- Main map area fills the viewport: `Map.jsx` loads `prv_punkt.geojson` and renders points.
- Feature popup or `SidePanel` details show feature properties (e.g., `REF`, `PSID`, `DATEREG`).
- Tabbed sidebar for different GeoJSON layers listing features.
- Clicking on a feature in the sidebar pans and zooms to the feature on the map.
- Features filterable and searchable (search box in the sidebar or header).
- Tooltip shown when a feature is clicked on the map — should be well formatted and easy to read.

---

## ✅ MVP features (v1)

**Implemented:**

- ✅ Map with point markers for `prv_punkt.geojson`
- ✅ Interactive CircleMarkers with click handlers
- ✅ Popup on marker click showing REF, REFNO, DATEREG
- ✅ SidePanel listing all features with click-to-select
- ✅ Two-way selection sync (map ↔ sidebar)
- ✅ FlyTo animation when feature selected
- ✅ Basic Tailwind styling with responsive layout

**Remaining for MVP:**

- 🔲 Tabs for switching between datasets (`prv_punkt`, `ult_punkt`, `utl_ledning`)
- 🔲 Search/filter by attribute (REF, PSID, LSID)
- 🔲 Enhanced feature details panel (more properties displayed)
- 🔲 LineString rendering for `utl_ledning.geojson`
- 🔲 Responsive sidebar collapse on mobile
- 🔲 Layer toggle for performance with large datasets

---

## 🧪 Testing & QA

- Manual: run dev server and validate markers and property detail displays.
- Unit tests: small tests for data loaders and simple components using React Testing Library.
- End to end: Cypress or Playwright tests for map interaction (optional).

---

## 🔧 Helpful commands

- Dev server

```powershell
npm run dev
```

- Lint (if enabled)

```powershell
npm run lint
```

- Build

```powershell
npm run build
```

---

## 📅 Milestones & time estimate

**Completed:**

- ✅ MVP (map + popup + basic sidebar) — complete
- ✅ Core interaction (click marker/list item) — complete

**Remaining:**

- Tabs & multi-dataset support — 0.5 day
- Filtering & search — 0.5 day
- Styling & responsive polish — 0.5 day
- LineString rendering & layer toggles — 0.5 day
- Testing & QA — 0.5 day

**Total remaining: ~2.5 days**

---

## 🎯 Current status (as of 2025-11-22)

**Working:**

- Map renders with CircleMarkers from `prv_punkt.geojson`
- Click marker → shows popup and highlights in sidebar
- Click sidebar item → pans/zooms map to feature
- Selection state synced between map and sidebar
- Clean header + sidebar layout

**Next priorities:**

1. Add tabbed interface for switching datasets
2. Implement search/filter functionality
3. Add LineString support for utility network layer
4. Responsive sidebar (collapse on mobile)
5. Enhanced detail view with more properties

---

## 🚀 Next steps

1. **Add tabs** to sidebar for `prv_punkt`, `ult_punkt`, `utl_ledning`
2. **Implement search** input filtering features by REF/PSID/LSID
3. **Render LineStrings** for `utl_ledning.geojson` with Polyline component
4. **Layer toggle** UI for performance with large line dataset
5. **Responsive improvements** — collapsible sidebar on small screens
6. **Testing** — basic unit tests for data loading and component rendering

---

_Created: 2025-11-21 | Updated: 2025-11-22_
