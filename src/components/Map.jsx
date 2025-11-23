'use client';

import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import React, { useEffect, useState } from 'react';
import {
  MapContainer,
  TileLayer,
  CircleMarker,
  Polyline,
  Popup,
  useMap,
} from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';

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

  // Combine all layers for rendering on the map
  const allFeatures = [
    ...(allLayers.prv_punkt || []),
    ...(allLayers.ult_punkt || []),
    ...(allLayers.utl_ledning || []),
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
            <div className="w-3 h-3 rounded-full bg-blue-500 border-2 border-blue-600"></div>
            <span style={{ color: '#656263' }}>
              Prøvetakingspunkt
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-orange-400 border-2 border-orange-600"></div>
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

        {/* Render lines (not clustered) */}
        {allFeatures
          .filter(
            (f) =>
              f.geometry.type === 'LineString' ||
              f.geometry.type === 'MultiLineString'
          )
          .map((f, index) => {
            const isSelected =
              selectedFeature &&
              selectedFeature.properties &&
              selectedFeature.properties.fid === f.properties.fid;

            // Create unique key combining type and fid
            const uniqueKey = `line-${f.properties.fid || index}`;

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
                    <div className="text-sm">
                      <div className="font-semibold">
                        {f.properties.FCODE || 'Ledning'} - LSID{' '}
                        {f.properties.LSID}
                      </div>
                      <div className="text-xs text-gray-600">
                        Lengde:{' '}
                        {f.properties.LENGTH?.toFixed(0) || '?'} m
                      </div>
                      <div className="text-xs text-gray-600">
                        Materiale: {f.properties.MATERIAL || 'Ukjent'}
                      </div>
                      <div className="text-xs text-gray-600">
                        Dimensjon: {f.properties.DIM || '?'} mm
                      </div>
                    </div>
                  </Popup>
                </Polyline>
              </React.Fragment>
            );
          })}

        {/* Render points with clustering */}
        <MarkerClusterGroup
          chunkedLoading
          maxClusterRadius={80}
          disableClusteringAtZoom={16}
          spiderfyOnMaxZoom={true}
          showCoverageOnHover={false}
        >
          {allFeatures
            .filter((f) => f.geometry.type === 'Point')
            .map((f, index) => {
              const isSelected =
                selectedFeature &&
                selectedFeature.properties &&
                selectedFeature.properties.fid === f.properties.fid;

              // Create unique key combining type and fid
              const uniqueKey = `point-${f.properties.fid || index}`;

              // Render points with different styles based on layer
              const { coordinates } = f.geometry;
              const latlng = [coordinates[1], coordinates[0]];

              // Determine point type and styling
              let pointColor, pointFillColor, pointRadius, pointLabel;
              const fcode = f.properties.FCODE;

              // Check if it's from prv_punkt (has REFNO) or ult_punkt (has OVL FCODE)
              if (fcode === 'OVL' || f.properties.FUNC) {
                // Overløpspunkt (ult_punkt) - Orange/Yellow
                pointColor = '#f97316';
                pointFillColor = '#fb923c';
                pointRadius = 7;
                pointLabel = '○'; // Circle symbol for overflow
              } else {
                // Prøvetakingspunkt (prv_punkt) - Blue
                pointColor = '#2563eb';
                pointFillColor = '#3b82f6';
                pointRadius = 6;
                pointLabel = '●'; // Filled circle for sampling
              }

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
                      <div className="text-sm">
                        <div className="font-semibold">
                          {f.properties.REF ||
                            `PSID ${f.properties.PSID}`}
                        </div>
                        <div className="text-xs text-gray-600">
                          PSID: {f.properties.PSID}
                        </div>
                        <div className="text-xs text-gray-600">
                          Stasjon: {f.properties.STATION || 'Ukjent'}
                        </div>
                        <div className="text-xs text-gray-600">
                          Dato reg: {f.properties.DATEREG || 'Ukjent'}
                        </div>
                      </div>
                    </Popup>
                  </CircleMarker>
                </React.Fragment>
              );
            })}
        </MarkerClusterGroup>

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
