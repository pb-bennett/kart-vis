"use client";

import "leaflet/dist/leaflet.css";
import { useEffect, useState } from "react";
import {
  MapContainer,
  TileLayer,
  CircleMarker,
  Popup,
  useMap,
} from "react-leaflet";

function FlyTo({ coords, zoom = 14 }) {
  const map = useMap();
  useEffect(() => {
    if (!coords) return;
    map.flyTo([coords[1], coords[0]], zoom, { duration: 0.8 });
  }, [coords, zoom, map]);
  return null;
}

export default function Map({ selectedFeature, onSelect, features = [] }) {
  const [mapFeatures, setMapFeatures] = useState(features);

  useEffect(() => {
    if (!features || !features.length) {
      fetch("/data/prv_punkt.geojson")
        .then((res) => res.json())
        .then((data) => setMapFeatures(data.features || []));
    } else {
      setMapFeatures(features);
    }
  }, [features]);

  const featuresToRender = mapFeatures || [];

  // Compute initial center and zoom to fit bounds
  const latlngs = featuresToRender.map((f) => [
    f.geometry.coordinates[1],
    f.geometry.coordinates[0],
  ]);
  const center = latlngs.length ? latlngs[0] : [59.2, 10.4];

  return (
    <div className="h-full">
      <MapContainer
        center={center}
        zoom={10}
        style={{ height: "100%", minHeight: "500px" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {featuresToRender.map((f) => {
          const { coordinates } = f.geometry;
          const latlng = [coordinates[1], coordinates[0]];
          const isSelected =
            selectedFeature &&
            selectedFeature.properties &&
            selectedFeature.properties.fid === f.properties.fid;
          return (
            <CircleMarker
              key={f.properties.fid}
              center={latlng}
              radius={isSelected ? 10 : 6}
              pathOptions={{
                color: isSelected ? "#e3342f" : "#2563eb",
                weight: isSelected ? 3 : 2,
              }}
              eventHandlers={{
                click: () => onSelect && onSelect(f),
              }}
            >
              <Popup>
                <div className="text-sm">
                  <div className="font-semibold">
                    {f.properties.REF || `PSID ${f.properties.PSID}`}
                  </div>
                  <div className="text-xs text-gray-600">
                    REFNO: {f.properties.REFNO}
                  </div>
                  <div className="text-xs text-gray-600">
                    DATEREG: {f.properties.DATEREG}
                  </div>
                </div>
              </Popup>
            </CircleMarker>
          );
        })}

        {/* Fly to selected feature when it changes */}
        {selectedFeature && (
          <FlyTo coords={selectedFeature.geometry.coordinates} zoom={14} />
        )}
      </MapContainer>
    </div>
  );
}
