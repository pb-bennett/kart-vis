'use client';

import { useState, useEffect } from 'react';
import SidePanel from '../components/SidePanel';
import dynamic from 'next/dynamic';
const Map = dynamic(() => import('../components/Map'), {
  ssr: false,
});

export default function Home() {
  const [selected, setSelected] = useState(null);
  const [activeLayer, setActiveLayer] = useState('prv_punkt');
  const [allLayers, setAllLayers] = useState({
    prv_punkt: [],
    ult_punkt: [],
    utl_ledning: [],
  });

  // Load all layers on mount
  useEffect(() => {
    const layerFiles = ['prv_punkt', 'ult_punkt', 'utl_ledning'];
    Promise.all(
      layerFiles.map((layer) =>
        fetch(`/data/${layer}.geojson`)
          .then((res) => res.json())
          .then((data) => ({ layer, features: data.features || [] }))
      )
    ).then((results) => {
      const layers = {};
      results.forEach(({ layer, features }) => {
        layers[layer] = features;
      });
      setAllLayers(layers);
    });
  }, []);

  // Get features for the active layer (for sidebar display)
  const activeFeatures = allLayers[activeLayer] || [];

  return (
    <div className="min-h-screen bg-gray-100">
      <header
        className="text-white py-2 px-8"
        style={{ backgroundColor: '#4782cb' }}
      >
        <h1 className="text-xl font-semibold">KartVis</h1>
      </header>

      <div className="flex h-[calc(100vh-52px)]">
        <SidePanel
          features={activeFeatures}
          selectedFeature={selected}
          onSelect={setSelected}
          activeLayer={activeLayer}
          onLayerChange={setActiveLayer}
        />
        <div className="flex-1">
          <Map
            selectedFeature={selected}
            onSelect={setSelected}
            allLayers={allLayers}
            activeLayer={activeLayer}
          />
        </div>
      </div>
    </div>
  );
}
