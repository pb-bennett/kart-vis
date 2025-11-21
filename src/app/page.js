"use client";

import { useState, useEffect } from "react";
import SidePanel from "../components/SidePanel";
import dynamic from "next/dynamic";
const Map = dynamic(() => import("../components/Map"), { ssr: false });

export default function Home() {
  const [selected, setSelected] = useState(null);
  const [features, setFeatures] = useState([]);

  useEffect(() => {
    fetch("/data/prv_punkt.geojson")
      .then((res) => res.json())
      .then((data) => setFeatures(data.features || []));
  }, []);

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-blue-600 text-white py-4 px-8">
        <h1 className="text-2xl font-bold">KartVis</h1>
      </header>

      <div className="flex h-[calc(100vh-64px)]">
        <SidePanel
          features={features}
          selectedFeature={selected}
          onSelect={setSelected}
        />
        <div className="flex-1">
          <Map
            selectedFeature={selected}
            onSelect={setSelected}
            features={features}
          />
        </div>
      </div>
    </div>
  );
}
