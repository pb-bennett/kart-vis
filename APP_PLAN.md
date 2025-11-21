# KartVis — App Plan

## 🎯 Purpose

KartVis is a simple, focused web app for visualizing and exploring geospatial point data (e.g., the provided GeoJSON `prv_punkt.geojson`). The goal of this plan is to outline features, architecture, data notes, and next steps for a small, fast MVP implementation.

---

## 🧭 High-level requirements

- Display a responsive map with geospatial features (points) using the provided GeoJSON.
- Provide a minimal, clean UI: header bar with `KartVis`, map in the main area, and a simple side panel for feature details.
- Let users click a point to see details and filter by attributes.
- Keep the UI lightweight and fast — prefer client-side rendering for initial prototypes.

---

## 🧩 Tech stack

- Next.js (app router) — project scaffold is already in place
- JavaScript
- React + Tailwind CSS — visual styling
- Map library: **Leaflet** (lightweight; many plugins; chosen for this project)
- GeoJSON source: `src/data/prv_punkt.geojson`, `src/data/ult_punkt.geojson`, `src/data/utl_ledning.geojson`

---

## 🗂 Data & data handling

- Use GeoJSON directly during development (store it in `src/data/`).
- For larger datasets, move data to a server API or convert to vector tiles.
- Transformations:
  - Normalize property names if needed.
  - Compute derived fields (e.g., group, date ranges) on the client/server.

### Data file descriptions (summary)

1) src/data/prv_punkt.geojson
- Short name: prv_punkt
- CRS: CRS84 (lon/lat)
- Geometry: Point
- Feature count: 15
- Key properties: fid, PSID, REF, REFNO, STATION, FCODE, TYPE, DATEREG, DATECHANGE, MPNT_GUID, utm_x, utm_y
- Intended use: small sample / preview point layer — display as markers; use PSID or MPNT_GUID as stable unique id
- Default UI fields suggested: REF (or REFNO), PSID, DATEREG, DATECHANGE, TYPE/FCODE
- Notes: small dataset, some REF/STATION values are null — UI should handle missing values gracefully; utm_x/utm_y are available as attributes if projected coords are required later

2) src/data/ult_punkt.geojson
- Short name: ult_punkt
- CRS: CRS84 (lon/lat) — re-exported to CRS84 and confirmed
- Geometry: Point
- Feature count: moderate (tens → low hundreds in current file)
- Key properties: fid, PSID, REF, STATION, FCODE (e.g., "OVL"), FUNC, YEAR, Z (elevation), LOCATION, DATEREG, DATECHANGE, etc.
- Intended use: main/stable control or benchmark points — display markers with richer metadata available in side panel/popups
- Default UI fields suggested: REF, PSID, STATION, YEAR, Z, DATEREG
- Notes: now CRS-aligned with the other layers so no client-side reprojection is required; some numeric fields (YEAR, Z) may be 0 or null and should be displayed carefully

3) src/data/utl_ledning.geojson
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

- Map with point markers for `prv_punkt.geojson`.
- On-click popup or panel for point properties.
- Search/filter by attribute (e.g., `REFNO`, `PSID`).
- Basic Tailwind-based styling and responsive layout.

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

- MVP (map + popup) — 1 day
- Filtering & side panel — 1 day
- Styling & responsive polish — 0.5 day
- Cluster & large dataset support — 1 day

---

## ❓ Questions for you

- Do you plan to host large datasets or just these local GeoJSONs?
- Any extra attributes or UI elements you want in v1 (search, date picker)?

---

## Next steps

- Scaffold `src/components/Map.jsx` using Leaflet and wire up `prv_punkt.geojson`.
- Implement tabbed sidebar, search/filter, pan/zoom on sidebar click, and formatted tooltips.

---

_Created: 2025-11-21._