'use client';

import 'leaflet/dist/leaflet.css';
// import 'leaflet.markercluster/dist/MarkerCluster.css';
// import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import React, { useEffect, useState } from 'react';
import {
  MapContainer,
  TileLayer,
  CircleMarker,
  Polyline,
  Popup,
  useMap,
  Marker,
  Rectangle,
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

export default function Map({
  selectedFeature,
  onSelect,
  allLayers = {},
  activeLayer = 'prv_punkt',
}) {
  const [basemap, setBasemap] = useState('geonorgeGraatone');
  const [currentZoom, setCurrentZoom] = useState(11);

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
                        onSelect && onSelect(f);
                      },
                    }}
                  >
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
                    {/* Actual square point */}
                    <Marker
                      position={latlng}
                      icon={icon}
                      eventHandlers={{
                        click: (e) => {
                          if (e.originalEvent) {
                            e.originalEvent.stopPropagation();
                          }
                          onSelect && onSelect(f);
                        },
                      }}
                    >
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
                        onSelect && onSelect(f);
                      },
                    }}
                  >
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
                              {f.geometry.coordinates[1].toFixed(6)},{' '}
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
      </MapContainer>
    </div>
  );
}
