'use client';

import { useState } from 'react';
import SidePanel from '../components/SidePanel';
import dynamic from 'next/dynamic';

// Import GeoJSON data directly - no need to serve publicly
import prvPunktData from '../data/prv_punkt.json';
import ultPunktData from '../data/ult_punkt.json';
import utlLedningData from '../data/utl_ledning.json';

const Map = dynamic(() => import('../components/Map'), {
  ssr: false,
});

export default function Home() {
  const [selected, setSelected] = useState(null);
  const [activeLayer, setActiveLayer] = useState('prv_punkt');

  // Load layers directly from imports
  const allLayers = {
    prv_punkt: prvPunktData.features || [],
    ult_punkt: ultPunktData.features || [],
    utl_ledning: utlLedningData.features || [],
  };

  // Get features for the active layer (for sidebar display)
  const activeFeatures = allLayers[activeLayer] || [];

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="flex h-screen">
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
