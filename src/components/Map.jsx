'use client';

import 'leaflet/dist/leaflet.css';
// import 'leaflet.markercluster/dist/MarkerCluster.css';
// import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import React, { useEffect, useState, useRef } from 'react';
import {
  MapContainer,
  TileLayer,
  CircleMarker,
  Polyline,
  Popup,
  useMap,
  Marker,
  Rectangle,
  useMapEvents,
} from 'react-leaflet';
import L from 'leaflet';
// import MarkerClusterGroup from 'react-leaflet-cluster';

function FlyTo({ coords, zoom = 16 }) {
  const map = useMap();
  useEffect(() => {
    if (!coords) return;
    map.flyTo([coords[1], coords[0]], zoom, { duration: 0.8 });
  }, [coords, zoom, map]);
  return null;
}

function MapClickHandler({ onMapClick }) {
  const map = useMap();
  useEffect(() => {
    const handleClick = () => {
      onMapClick && onMapClick();
    };
    map.on('click', handleClick);
    return () => {
      map.off('click', handleClick);
    };
  }, [map, onMapClick]);
  return null;
}

function ZoomLevelDisplay({ onZoomChange }) {
  const map = useMap();

  useEffect(() => {
    const handleZoom = () => {
      onZoomChange(map.getZoom());
    };
    // Set initial zoom
    onZoomChange(map.getZoom());
    map.on('zoomend', handleZoom);
    return () => {
      map.off('zoomend', handleZoom);
    };
  }, [map, onZoomChange]);

  return null;
}

// Component to auto-open popup when feature is selected from sidebar
function AutoOpenPopup({ selectedFeature }) {
  const map = useMap();
  const lastOpenedFid = useRef(null);

  useEffect(() => {
    if (!selectedFeature) {
      lastOpenedFid.current = null;
      return;
    }

    // Only works for Point geometries (prv_punkt, ult_punkt)
    if (selectedFeature.geometry?.type !== 'Point') return;

    const fid = selectedFeature.properties?.fid;
    // Only trigger for new selections (avoid re-opening on same feature)
    if (fid === lastOpenedFid.current) return;
    lastOpenedFid.current = fid;

    const targetCoords = selectedFeature.geometry.coordinates;
    const targetLat = targetCoords[1];
    const targetLng = targetCoords[0];

    // Wait for map to finish flying
    const timer = setTimeout(() => {
      // Find the layer that matches our selected feature's coordinates
      map.eachLayer((layer) => {
        if (layer.getPopup && layer.getPopup() && layer.getLatLng) {
          const layerLatLng = layer.getLatLng();
          // Check if coordinates match (within small tolerance for floating point)
          if (
            Math.abs(layerLatLng.lat - targetLat) < 0.0000001 &&
            Math.abs(layerLatLng.lng - targetLng) < 0.0000001
          ) {
            layer.openPopup();
          }
        }
      });
    }, 900);

    return () => clearTimeout(timer);
  }, [selectedFeature, map]);

  return null;
}

// Calculate distance between two points using Haversine formula
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371000; // Earth's radius in meters
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in meters
}

// Format distance for display
function formatDistance(meters) {
  if (meters < 1000) {
    return `${meters.toFixed(1)} m`;
  }
  return `${(meters / 1000).toFixed(2)} km`;
}

// Measure tool component
function MeasureTool({
  isActive,
  onMeasurement,
  onCancel,
  addPointRef,
}) {
  const [points, setPoints] = useState([]);
  const [mousePosition, setMousePosition] = useState(null);
  const map = useMap();

  // Function to add a measurement point (can be called externally via ref)
  const addPoint = (latlng) => {
    if (!isActive) return;

    if (points.length === 0) {
      setPoints([latlng]);
      onMeasurement({ points: [latlng], distance: null });
    } else if (points.length === 1) {
      const distance = calculateDistance(
        points[0].lat,
        points[0].lng,
        latlng.lat,
        latlng.lng
      );
      setPoints([points[0], latlng]);
      onMeasurement({ points: [points[0], latlng], distance });
      setMousePosition(null);
    } else {
      // Reset and start new measurement
      setPoints([latlng]);
      onMeasurement({ points: [latlng], distance: null });
    }
  };

  // Expose addPoint function via ref
  useEffect(() => {
    if (addPointRef) {
      addPointRef.current = addPoint;
    }
    return () => {
      if (addPointRef) {
        addPointRef.current = null;
      }
    };
  });

  // Change cursor when measure mode is active
  useEffect(() => {
    const container = map.getContainer();
    if (isActive) {
      container.style.cursor = 'crosshair';
    } else {
      container.style.cursor = '';
    }
    return () => {
      container.style.cursor = '';
    };
  }, [isActive, map]);

  // Handle Escape key to cancel measurement
  useEffect(() => {
    if (!isActive) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onCancel && onCancel();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isActive, onCancel]);

  useMapEvents({
    click: (e) => {
      if (!isActive) return;
      addPoint(e.latlng);
    },
    contextmenu: (e) => {
      // Right-click cancels measurement
      if (isActive) {
        e.originalEvent.preventDefault();
        onCancel && onCancel();
      }
    },
    mousemove: (e) => {
      // Only track mouse when we have one point (waiting for second click)
      if (isActive && points.length === 1) {
        setMousePosition(e.latlng);
      }
    },
  });

  // Calculate live distance while mouse is moving
  const liveDistance =
    points.length === 1 && mousePosition
      ? calculateDistance(
          points[0].lat,
          points[0].lng,
          mousePosition.lat,
          mousePosition.lng
        )
      : null;

  // Update measurement with live distance (must be in useEffect to avoid updating parent during render)
  useEffect(() => {
    if (liveDistance !== null) {
      onMeasurement({
        points: [points[0]],
        distance: liveDistance,
        isLive: true,
      });
    }
  }, [liveDistance, points, onMeasurement]);

  if (!isActive || points.length === 0) return null;

  return (
    <>
      {/* First point marker */}
      <CircleMarker
        center={points[0]}
        radius={6}
        pathOptions={{
          color: '#4782cb',
          fillColor: '#4782cb',
          fillOpacity: 1,
          weight: 2,
        }}
      />

      {/* Dynamic line following mouse (when waiting for second point) */}
      {points.length === 1 && mousePosition && (
        <Polyline
          positions={[points[0], mousePosition]}
          pathOptions={{
            color: '#4782cb',
            weight: 2,
            dashArray: '5, 5',
            opacity: 0.7,
          }}
        />
      )}

      {/* Second point and final line */}
      {points.length === 2 && (
        <>
          <CircleMarker
            center={points[1]}
            radius={6}
            pathOptions={{
              color: '#4782cb',
              fillColor: '#4782cb',
              fillOpacity: 1,
              weight: 2,
            }}
          />
          <Polyline
            positions={[points[0], points[1]]}
            pathOptions={{
              color: '#4782cb',
              weight: 3,
              dashArray: '10, 5',
            }}
          />
        </>
      )}
    </>
  );
}

export default function Map({
  selectedFeature,
  onSelect,
  allLayers = {},
  activeLayer = 'prv_punkt',
}) {
  const [basemap, setBasemap] = useState('geonorgeGraatone');
  const [currentZoom, setCurrentZoom] = useState(11);
  const [isMeasuring, setIsMeasuring] = useState(false);
  const [measureKey, setMeasureKey] = useState(0);
  const [measurement, setMeasurement] = useState(null);

  // Ref to hold the addMeasurePoint function from MeasureTool
  const addMeasurePointRef = useRef(null);

  // Toggle measure mode
  const toggleMeasure = () => {
    if (isMeasuring) {
      setIsMeasuring(false);
      setMeasurement(null);
      setMeasureKey((k) => k + 1); // Reset the MeasureTool component
    } else {
      setIsMeasuring(true);
      onSelect && onSelect(null); // Deselect any feature
    }
  };

  // Handler for when a feature is clicked during measuring
  const handleMeasureClick = (latlng) => {
    if (addMeasurePointRef.current) {
      addMeasurePointRef.current(latlng);
    }
  };

  // Combine all layers for rendering on the map, adding layer source to each feature
  // Order matters: lines first, then ult_punkt, then prv_punkt (so prv_punkt is on top)
  const allFeatures = [
    ...(allLayers.utl_ledning || []).map((f, idx) => ({
      ...f,
      _layer: 'utl_ledning',
      _index: idx,
    })),
    ...(allLayers.ult_punkt || []).map((f, idx) => ({
      ...f,
      _layer: 'ult_punkt',
      _index: idx,
    })),
    ...(allLayers.prv_punkt || []).map((f, idx) => ({
      ...f,
      _layer: 'prv_punkt',
      _index: idx,
    })),
  ];

  // Compute initial center and zoom to fit bounds
  const pointFeatures = allFeatures.filter(
    (f) => f.geometry.type === 'Point'
  );
  const latlngs = pointFeatures.map((f) => [
    f.geometry.coordinates[1],
    f.geometry.coordinates[0],
  ]);
  const center = latlngs.length ? latlngs[0] : [59.2, 10.4];

  // Basemap configurations
  const basemaps = {
    geonorge: {
      url: 'https://cache.kartverket.no/v1/wmts/1.0.0/topo/default/webmercator/{z}/{y}/{x}.png',
      attribution:
        '&copy; <a href="https://www.kartverket.no/">Kartverket</a>',
      maxNativeZoom: 18, // Kartverket tiles available up to zoom 18
    },
    geonorgeGraatone: {
      url: 'https://cache.kartverket.no/v1/wmts/1.0.0/topograatone/default/webmercator/{z}/{y}/{x}.png',
      attribution:
        '&copy; <a href="https://www.kartverket.no/">Kartverket</a>',
      maxNativeZoom: 18,
    },
    osm: {
      url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxNativeZoom: 19,
    },
  };

  return (
    <div className="h-full relative">
      {/* TEMP: Zoom Level Display - REMOVE WHEN DONE */}
      <div className="absolute top-4 left-4 z-1000 bg-pink-500 text-white font-bold rounded-lg shadow-lg p-3 text-2xl">
        ZOOM: {currentZoom.toFixed(1)}
      </div>

      {/* Basemap selector */}
      <div
        className="absolute top-4 right-4 z-1000 bg-white rounded-lg shadow-lg p-3 border"
        style={{ borderColor: '#e5e7eb' }}
      >
        <label
          className="text-xs font-semibold block mb-2"
          style={{ color: '#656263' }}
        >
          Bakgrunnskart
        </label>
        <select
          value={basemap}
          onChange={(e) => setBasemap(e.target.value)}
          className="text-sm rounded px-2 py-1.5 bg-white cursor-pointer w-full border"
          style={{ borderColor: '#4782cb', color: '#656263' }}
        >
          <option value="geonorge">Geonorge Topo (Farge)</option>
          <option value="geonorgeGraatone">
            Geonorge Topo (Gråtone)
          </option>
          <option value="osm">OpenStreetMap</option>
        </select>
      </div>

      {/* Verktøy (Tools) menu */}
      <div className="absolute bottom-8 left-4 z-1000 flex flex-col gap-2">
        <div className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
          <div
            className="text-xs font-semibold px-3 py-2 border-b border-gray-200 flex items-center gap-2"
            style={{ color: '#656263' }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            Verktøy
          </div>
          <button
            onClick={toggleMeasure}
            className={`w-full px-3 py-2 text-left text-xs flex items-center gap-2 transition-colors ${
              isMeasuring ? 'text-white' : 'hover:bg-gray-50'
            }`}
            style={
              isMeasuring
                ? { backgroundColor: '#4782cb', color: 'white' }
                : { color: '#656263' }
            }
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              {/* Ruler/measure icon */}
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 6h18M3 6v12a2 2 0 002 2h14a2 2 0 002-2V6M3 6l3 0m0 0v4m0-4l3 0m0 0v2m0-2l3 0m0 0v4m0-4l3 0m0 0v2m0-2l3 0m0 0v4"
              />
            </svg>
            {isMeasuring ? 'Avslutt måling' : 'Mål avstand'}
          </button>
        </div>

        {/* Measurement result display */}
        {isMeasuring && (
          <div
            className="bg-white rounded-lg shadow-lg p-3 border min-w-[140px]"
            style={{ borderColor: '#4782cb' }}
          >
            <div
              className="text-xs font-semibold mb-1"
              style={{ color: '#4782cb' }}
            >
              Avstandsmåling
            </div>
            {measurement?.distance ? (
              <div
                className="text-lg font-bold"
                style={{ color: '#656263' }}
              >
                {formatDistance(measurement.distance)}
              </div>
            ) : (
              <div className="text-xs" style={{ color: '#656263' }}>
                {measurement?.points?.length === 1
                  ? 'Klikk på sluttpunkt'
                  : 'Klikk på startpunkt'}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Legend */}
      <div
        className="absolute bottom-8 right-4 z-1000 bg-white rounded-lg shadow-lg p-3 border"
        style={{ borderColor: '#e5e7eb' }}
      >
        <div
          className="text-xs font-semibold mb-2"
          style={{ color: '#656263' }}
        >
          Tegnforklaring
        </div>
        <div className="space-y-1.5 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-fuchsia-400 border-2 border-fuchsia-600"></div>
            <span style={{ color: '#656263' }}>
              Prøvetakingspunkt
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-orange-400 border-2 border-orange-600"></div>
            <span style={{ color: '#656263' }}>Overløpspunkt</span>
          </div>
          <div className="flex items-center gap-2">
            <div
              className="w-6 h-0.5 bg-green-500"
              style={{ borderTop: '2px dashed #22c55e' }}
            ></div>
            <span style={{ color: '#656263' }}>SPO ledning</span>
          </div>
          <div className="flex items-center gap-2">
            <div
              className="w-6 h-0.5 bg-red-500"
              style={{ borderTop: '2px dashed #ef4444' }}
            ></div>
            <span style={{ color: '#656263' }}>AFO ledning</span>
          </div>
        </div>
      </div>

      <MapContainer
        center={center}
        zoom={11}
        maxZoom={19}
        style={{ height: '100%', minHeight: '500px' }}
      >
        <MapClickHandler
          onMapClick={() => onSelect && onSelect(null)}
        />
        <ZoomLevelDisplay onZoomChange={setCurrentZoom} />
        <TileLayer
          key={basemap}
          attribution={basemaps[basemap].attribution}
          url={basemaps[basemap].url}
          maxZoom={19}
          maxNativeZoom={basemaps[basemap].maxNativeZoom}
        />

        {/* Render lines (not clustered) - hide at zoom 12 or further out */}
        {currentZoom >= 13 &&
          allFeatures
            .filter(
              (f) =>
                f.geometry.type === 'LineString' ||
                f.geometry.type === 'MultiLineString'
            )
            .map((f) => {
              const isSelected =
                selectedFeature &&
                selectedFeature.properties &&
                selectedFeature.properties.fid === f.properties.fid;

              // Create unique key using layer and index
              const uniqueKey = `${f._layer}-${f._index}`;

              // Render lines (MultiLineString or LineString)
              let positions;
              if (f.geometry.type === 'MultiLineString') {
                // MultiLineString has nested arrays
                positions = f.geometry.coordinates.map((lineCoords) =>
                  lineCoords.map((coord) => [coord[1], coord[0]])
                );
              } else {
                // LineString is a single array of coordinates
                positions = f.geometry.coordinates.map((coord) => [
                  coord[1],
                  coord[0],
                ]);
              }

              // Line styling based on FCODE
              const fcode = f.properties.FCODE;
              let lineColor, lineDash;
              if (fcode === 'SPO') {
                lineColor = '#22c55e'; // Green
                lineDash = '10, 10';
              } else if (fcode === 'AFO') {
                lineColor = '#ef4444'; // Red
                lineDash = '10, 10';
              } else {
                lineColor = '#3b82f6'; // Blue (default)
                lineDash = '10, 10';
              }

              return (
                <React.Fragment key={uniqueKey}>
                  {/* Glow effect for selected line */}
                  {isSelected && (
                    <Polyline
                      positions={positions}
                      pathOptions={{
                        color: '#fbbf24',
                        weight: 8,
                        opacity: 0.4,
                        dashArray: lineDash,
                      }}
                    />
                  )}
                  {/* Actual line */}
                  <Polyline
                    positions={positions}
                    pathOptions={{
                      color: lineColor,
                      weight: 4,
                      opacity: 0.8,
                      dashArray: lineDash,
                    }}
                    eventHandlers={{
                      click: (e) => {
                        if (e.originalEvent) {
                          e.originalEvent.stopPropagation();
                        }
                        if (!isMeasuring) {
                          onSelect && onSelect(f);
                        }
                      },
                    }}
                  >
                    {!isMeasuring && (
                      <Popup>
                        <div className="min-w-48">
                          <div
                            className="font-semibold text-sm pb-2 mb-2 border-b border-gray-200"
                            style={{ color: '#4782cb' }}
                          >
                            {f.properties.FCODE || 'Ledning'}
                          </div>
                          <table className="text-xs w-full">
                            <tbody className="text-gray-600">
                              <tr>
                                <td className="py-0.5 pr-3 font-medium">
                                  LSID
                                </td>
                                <td className="py-0.5">
                                  {f.properties.LSID}
                                </td>
                              </tr>
                              <tr>
                                <td className="py-0.5 pr-3 font-medium">
                                  Lengde
                                </td>
                                <td className="py-0.5">
                                  {f.properties.LENGTH?.toFixed(0) ||
                                    '?'}{' '}
                                  m
                                </td>
                              </tr>
                              <tr>
                                <td className="py-0.5 pr-3 font-medium">
                                  Materiale
                                </td>
                                <td className="py-0.5">
                                  {f.properties.MATERIAL || 'Ukjent'}
                                </td>
                              </tr>
                              <tr>
                                <td className="py-0.5 pr-3 font-medium">
                                  Dimensjon
                                </td>
                                <td className="py-0.5">
                                  {f.properties.DIM || '?'} mm
                                </td>
                              </tr>
                            </tbody>
                          </table>
                          <div className="mt-2 pt-2 border-t border-gray-200 text-[10px] text-gray-400">
                            Overløpsledning
                          </div>
                        </div>
                      </Popup>
                    )}
                  </Polyline>
                </React.Fragment>
              );
            })}

        {/* Render points (clustering temporarily disabled) */}
        {/* <MarkerClusterGroup
          chunkedLoading
          maxClusterRadius={80}
          disableClusteringAtZoom={16}
          spiderfyOnMaxZoom={true}
          showCoverageOnHover={false}
          iconCreateFunction={(cluster) => {
            const count = cluster.getChildCount();
            // Scale size based on count, but keep it reasonable
            const size = Math.min(40 + Math.sqrt(count) * 4, 80);
            return L.divIcon({
              html: `<div style="background-color: #22c55e; color: white; border-radius: 50%; width: ${size}px; height: ${size}px; display: flex; align-items: center; justify-content: center; font-weight: bold; border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3);">${count}</div>`,
              className: 'custom-cluster-icon',
              iconSize: [size, size],
            });
          }}
        > */}
        <>
          {allFeatures
            .filter((f) => f.geometry.type === 'Point')
            .filter(
              (f) => f._layer === 'prv_punkt' || currentZoom >= 13
            ) // Hide ult_punkt at zoom 12 or further
            .map((f) => {
              const isSelected =
                selectedFeature &&
                selectedFeature.properties &&
                selectedFeature.properties.fid === f.properties.fid;

              // Create unique key using layer and index
              const uniqueKey = `${f._layer}-${f._index}`;

              // Render points with different styles based on layer
              const { coordinates } = f.geometry;
              const latlng = [coordinates[1], coordinates[0]];

              // Determine point type and styling
              let pointColor, pointFillColor, pointRadius, pointLabel;
              const fcode = f.properties.FCODE;
              const isOverflow = fcode === 'OVL' || f.properties.FUNC;

              // Check if it's from prv_punkt (has REFNO) or ult_punkt (has OVL FCODE)
              if (isOverflow) {
                // Overløpspunkt (ult_punkt) - Orange/Yellow SQUARE
                pointColor = '#f97316';
                pointFillColor = '#fb923c';
                pointRadius = 7;
                pointLabel = '□'; // Square symbol for overflow
              } else {
                // Prøvetakingspunkt (prv_punkt) - Magenta CIRCLE
                pointColor = '#c026d3';
                pointFillColor = '#e879f9';
                pointRadius = 6;
                pointLabel = '●'; // Filled circle for sampling
              }

              // For overflow points, use a square marker (DivIcon)
              if (isOverflow) {
                const size = pointRadius * 2.1; // Convert radius to pixel size
                const glowSize = size + 14;
                const icon = L.divIcon({
                  html: `<div style="background-color: ${pointFillColor}; border: 2px solid ${pointColor}; width: ${size}px; height: ${size}px;"></div>`,
                  className: 'square-marker',
                  iconSize: [size, size],
                  iconAnchor: [size / 2, size / 2],
                });

                // Label text - use STATION if available, otherwise REF
                const labelText =
                  f.properties.STATION || f.properties.REF || '';
                const showLabel = currentZoom >= 14 && labelText;

                // Label offset from the point (pixels)
                const labelOffsetX = 12;
                const labelOffsetY = -12;

                return (
                  <React.Fragment key={uniqueKey}>
                    {/* Glow effect for selected square point */}
                    {isSelected && (
                      <Marker
                        position={latlng}
                        icon={L.divIcon({
                          html: `<div style="background-color: #fbbf24; opacity: 0.2; border: 3px solid #fbbf24; width: ${glowSize}px; height: ${glowSize}px;"></div>`,
                          className: 'square-marker-glow',
                          iconSize: [glowSize, glowSize],
                          iconAnchor: [glowSize / 2, glowSize / 2],
                        })}
                      />
                    )}
                    {/* Label with connecting line for overflow points at zoom >= 14 */}
                    {showLabel && (
                      <Marker
                        position={latlng}
                        icon={L.divIcon({
                          html: `
                            <div style="position: relative; pointer-events: none;">
                              <svg style="position: absolute; left: 0; top: 0; overflow: visible;" width="1" height="1">
                                <line x1="0" y1="0" x2="${labelOffsetX}" y2="${labelOffsetY}" 
                                  stroke="#f97316" stroke-width="1.5" stroke-opacity="0.7"/>
                              </svg>
                              <div style="
                                position: absolute;
                                left: ${labelOffsetX}px;
                                top: ${labelOffsetY - 8}px;
                                white-space: nowrap;
                                font-size: 11px;
                                font-weight: 600;
                                color: #7c2d12;
                                text-shadow: 
                                  -1px -1px 0 #fff,
                                  1px -1px 0 #fff,
                                  -1px 1px 0 #fff,
                                  1px 1px 0 #fff,
                                  0 -1px 0 #fff,
                                  0 1px 0 #fff,
                                  -1px 0 0 #fff,
                                  1px 0 0 #fff,
                                  -2px 0 3px rgba(255,255,255,0.8),
                                  2px 0 3px rgba(255,255,255,0.8),
                                  0 -2px 3px rgba(255,255,255,0.8),
                                  0 2px 3px rgba(255,255,255,0.8);
                              ">${labelText}</div>
                            </div>
                          `,
                          className: 'overflow-label',
                          iconSize: [0, 0],
                          iconAnchor: [0, 0],
                        })}
                        interactive={false}
                      />
                    )}
                    {/* Actual square point */}
                    <Marker
                      position={latlng}
                      icon={icon}
                      eventHandlers={{
                        click: (e) => {
                          if (e.originalEvent) {
                            e.originalEvent.stopPropagation();
                          }
                          if (isMeasuring) {
                            // When measuring, add this point to measurement
                            // Use the marker's actual position, not the click event position
                            handleMeasureClick(
                              L.latLng(latlng[0], latlng[1])
                            );
                          } else {
                            onSelect && onSelect(f);
                          }
                        },
                      }}
                    >
                      {!isMeasuring && (
                        <Popup>
                          <div className="min-w-52">
                            <div
                              className="font-semibold text-sm pb-2 mb-2 border-b border-gray-200"
                              style={{ color: '#4782cb' }}
                            >
                              {f.properties.navn ||
                                f.properties.REF ||
                                'Overløpspunkt'}
                            </div>
                            <table className="text-xs w-full">
                              <tbody className="text-gray-600">
                                {f.properties.PSID && (
                                  <tr>
                                    <td className="py-0.5 pr-3 font-medium">
                                      PSID
                                    </td>
                                    <td className="py-0.5">
                                      {f.properties.PSID}
                                    </td>
                                  </tr>
                                )}
                                {f.properties.STATION && (
                                  <tr>
                                    <td className="py-0.5 pr-3 font-medium">
                                      Stasjon
                                    </td>
                                    <td className="py-0.5">
                                      {f.properties.STATION}
                                    </td>
                                  </tr>
                                )}
                                {f.properties.FUNC && (
                                  <tr>
                                    <td className="py-0.5 pr-3 font-medium">
                                      Funksjon
                                    </td>
                                    <td className="py-0.5">
                                      {f.properties.FUNC}
                                    </td>
                                  </tr>
                                )}
                                {f.properties.DATEREG && (
                                  <tr>
                                    <td className="py-0.5 pr-3 font-medium">
                                      Registrert
                                    </td>
                                    <td className="py-0.5">
                                      {f.properties.DATEREG}
                                    </td>
                                  </tr>
                                )}
                              </tbody>
                            </table>
                            {(f.properties.utm_x ||
                              f.geometry.coordinates) && (
                              <div className="mt-2 pt-2 border-t border-gray-200">
                                <div className="text-[10px] text-gray-500 font-medium mb-1">
                                  Koordinater
                                </div>
                                <div className="grid grid-cols-[auto_1fr] gap-x-2 text-[10px] text-gray-500 font-mono">
                                  <span>WGS84:</span>
                                  <span>
                                    {f.geometry.coordinates[1].toFixed(
                                      6
                                    )}
                                    ,{' '}
                                    {f.geometry.coordinates[0].toFixed(
                                      6
                                    )}
                                  </span>
                                  {f.properties.utm_x &&
                                    f.properties.utm_y && (
                                      <>
                                        <span>UTM32N:</span>
                                        <span>
                                          {f.properties.utm_x.toFixed(
                                            2
                                          )}
                                          ,{' '}
                                          {f.properties.utm_y.toFixed(
                                            2
                                          )}
                                        </span>
                                      </>
                                    )}
                                </div>
                              </div>
                            )}
                            <div className="mt-2 pt-2 border-t border-gray-200 text-[10px] text-gray-400">
                              Overløpspunkt
                            </div>
                          </div>
                        </Popup>
                      )}
                    </Marker>
                  </React.Fragment>
                );
              }

              // For sampling points, use circle markers
              return (
                <React.Fragment key={uniqueKey}>
                  {/* Glow effect for selected point */}
                  {isSelected && (
                    <CircleMarker
                      center={latlng}
                      radius={pointRadius + 7}
                      pathOptions={{
                        color: '#fbbf24',
                        fillColor: '#fbbf24',
                        weight: 3,
                        opacity: 0.5,
                        fillOpacity: 0.2,
                      }}
                    />
                  )}
                  {/* Actual point */}
                  <CircleMarker
                    center={latlng}
                    radius={pointRadius}
                    pathOptions={{
                      color: pointColor,
                      fillColor: pointFillColor,
                      weight: 2,
                      opacity: 1,
                      fillOpacity: 0.8,
                    }}
                    eventHandlers={{
                      click: (e) => {
                        if (e.originalEvent) {
                          e.originalEvent.stopPropagation();
                        }
                        if (isMeasuring) {
                          // When measuring, add this point to measurement
                          handleMeasureClick(
                            L.latLng(latlng[0], latlng[1])
                          );
                        } else {
                          onSelect && onSelect(f);
                        }
                      },
                    }}
                  >
                    {!isMeasuring && (
                      <Popup>
                        <div className="min-w-56">
                          <div
                            className="font-semibold text-sm pb-2 mb-2 border-b border-gray-200"
                            style={{ color: '#4782cb' }}
                          >
                            {f.properties.navn || 'Prøvetakingspunkt'}
                          </div>
                          <table className="text-xs w-full">
                            <tbody className="text-gray-600">
                              {f.properties['vannlok-kode'] && (
                                <tr>
                                  <td className="py-0.5 pr-3 font-medium">
                                    Vannlok
                                  </td>
                                  <td className="py-0.5">
                                    {f.properties[
                                      'vannlok-kode'
                                    ].trim()}
                                  </td>
                                </tr>
                              )}
                              {f.properties.PSID && (
                                <tr>
                                  <td className="py-0.5 pr-3 font-medium">
                                    PSID
                                  </td>
                                  <td className="py-0.5">
                                    {f.properties.PSID}
                                  </td>
                                </tr>
                              )}
                              <tr>
                                <td className="py-0.5 pr-3 font-medium align-top">
                                  Prøvetyper
                                </td>
                                <td className="py-0.5 whitespace-normal">
                                  {[
                                    f.properties.vannprøve && 'Vann',
                                    f.properties.sedimentprøve &&
                                      'Sediment',
                                    f.properties.Bløtbunnsfauna &&
                                      'Bløtbunn',
                                  ]
                                    .filter(Boolean)
                                    .join(', ') || (
                                    <span className="italic">
                                      Ingen registrert
                                    </span>
                                  )}
                                </td>
                              </tr>
                              {f.properties.DATEREG && (
                                <tr>
                                  <td className="py-0.5 pr-3 font-medium">
                                    Registrert
                                  </td>
                                  <td className="py-0.5">
                                    {f.properties.DATEREG}
                                  </td>
                                </tr>
                              )}
                            </tbody>
                          </table>
                          <div className="mt-2 pt-2 border-t border-gray-200">
                            <div className="text-[10px] text-gray-500 font-medium mb-1">
                              Koordinater
                            </div>
                            <div className="grid grid-cols-[auto_1fr] gap-x-2 text-[10px] text-gray-500 font-mono">
                              <span>WGS84:</span>
                              <span>
                                {f.geometry.coordinates[1].toFixed(6)}
                                ,{' '}
                                {f.geometry.coordinates[0].toFixed(6)}
                              </span>
                              {f.properties.utm_x &&
                                f.properties.utm_y && (
                                  <>
                                    <span>UTM32N:</span>
                                    <span>
                                      {f.properties.utm_x.toFixed(2)},{' '}
                                      {f.properties.utm_y.toFixed(2)}
                                    </span>
                                  </>
                                )}
                            </div>
                          </div>
                          <div className="mt-2 pt-2 border-t border-gray-200 text-[10px] text-gray-400">
                            Prøvetakingspunkt
                          </div>
                        </div>
                      </Popup>
                    )}
                  </CircleMarker>
                </React.Fragment>
              );
            })}
        </>
        {/* </MarkerClusterGroup> */}

        {/* Fly to selected feature when it changes */}
        {selectedFeature && selectedFeature.geometry.coordinates && (
          <FlyTo
            coords={
              selectedFeature.geometry.type === 'Point'
                ? selectedFeature.geometry.coordinates
                : selectedFeature.geometry.coordinates[0][0]
            }
            zoom={16}
          />
        )}

        {/* Auto-open popup when feature is selected from sidebar */}
        <AutoOpenPopup selectedFeature={selectedFeature} />

        {/* Measure tool */}
        {isMeasuring && (
          <MeasureTool
            key={measureKey}
            isActive={isMeasuring}
            onMeasurement={setMeasurement}
            onCancel={toggleMeasure}
            addPointRef={addMeasurePointRef}
          />
        )}
      </MapContainer>
    </div>
  );
}
