# KartVis — App Plan

## 🎯 Purpose

KartVis is a simple, focused web app for visualizing and exploring geospatial point data (e.g., the provided GeoJSON `prv_punkt.geojson`). The goal of this plan is to outline features, architecture, data handling, and an implementation roadmap so you can move from idea to a working app in small, testable steps.

---

## 🧭 High-level requirements

- Display a responsive map with geospatial features (points) using the provided GeoJSON.
- Provide a minimal, clean UI: header bar with `KartVis`, map in the main area, and a simple side panel for feature details.
- Let users click a point to see details and filter by attributes.
- Keep the UI lightweight and fast — prefer client-side rendering for initial prototypes.

---

## 🧩 Tech stack

- Next.js (app router) — project scaffold is already in place
- JavScript
- React + Tailwind CSS — visual styling
- Map library suggestions:
  - Leaflet (lightweight; many plugins) or
  - MapLibre GL JS (WebGL-based; vector tiles & higher performance)
- GeoJSON source: `src/data/prv_punkt.geojson`, `src/data/utl_punkt.geojson`, `src/data/utl_ledning.geojson`

---

## 🗂 Data & data handling

- Use GeoJSON directly during development (store it in `src/data/`).
- For larger datasets, move data to a server API or convert to vector tiles.
- Transformations:
  - Normalize property names if needed.
  - Compute derived fields (e.g., group, date ranges) on the client/server.


---
## 🛠 App architecture

- `app/layout.js` — site-wide layout and global styling, header.
- `app/page.js` (already minimal) — initial page to display the map & layout.
- `src/components/` — reusable components:
  - `Header.jsx` — header bar with app name, settings icon, etc.
  - `Map.jsx` — map wrapper that loads GeoJSON features
  - `SidePanel.jsx` — details and filters
- `src/data/prv_punkt.geojson` — sample dataset

---

## 📐 UI design & components

- Header bar across the top with `KartVis` branding (complete).
- Left or right collapsible `SidePanel` for details & filters.
- Main map area fills the viewport: `Map.jsx` loads `prv_punkt.geojson` and renders points.
- Feature popup or `SidePanel` details show feature properties (e.g., `REF`, `PSID`, `DATEREG`).
- Tabbed sidebar for different geoJSON layers listing features
- Clicking on feature in sidebar pans and zooms to feature
- Features filterable and searchable
- Tooltip shown when feature clicked on in map - should be well formatted and easy to read

---

## ✅ MVP features (v1)

- Map with point markers for `prv_punkt.geojson`.
- On-click popup or panel for point properties.
- Search/filter by attribute (e.g., `REFNO`, `PSID`).
- Basic Tailwind-based styling and responsive layout.
- 


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

- Which map library do you prefer (Leaflet or MapLibre)?
- Do you plan to host large datasets or just this small GeoJSON?
- Any extra attributes or UI elements you want in v1 (search, date picker)?

---

## Next steps

- Pick a map library and I’ll scaffold `src/components/Map.jsx` and wire up `prv_punkt.geojson`.
- Or, if you prefer, the next step is a written task-by-task breakdown I can convert to `issue` cards in GitHub.

---

_Created: 2025-11-21._
