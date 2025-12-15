'use client';

import { useState, useMemo } from 'react';
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
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    vannprøve: false,
    sedimentprøve: false,
    bløtbunnsfauna: false,
    ownerFK: false,
    ownerTK: false,
    ownerTR: false,
  });

  // Load layers directly from imports
  const allLayers = {
    prv_punkt: prvPunktData.features || [],
    ult_punkt: ultPunktData.features || [],
    utl_ledning: utlLedningData.features || [],
  };

  // Get features for the active layer (for sidebar display)
  const activeFeatures = allLayers[activeLayer] || [];

  // Check if any filter is active
  const hasActiveFilters = Object.values(filters).some((v) => v);
  const hasTestTypeFilters =
    filters.vannprøve ||
    filters.sedimentprøve ||
    filters.bløtbunnsfauna;
  const hasOwnerFilters =
    filters.ownerFK || filters.ownerTK || filters.ownerTR;

  // Filter prv_punkt features based on search query and test type filters
  const filteredPrvPunkt = useMemo(() => {
    let result = allLayers.prv_punkt;

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      result = result.filter((f) => {
        const navn = (f.properties.navn || '').toLowerCase();
        const vannlok = (
          f.properties['vannlok-kode'] || ''
        ).toLowerCase();
        return navn.includes(query) || vannlok.includes(query);
      });
    }

    // Apply test type filters
    if (hasTestTypeFilters) {
      result = result.filter((f) => {
        if (filters.vannprøve && f.properties.vannprøve) return true;
        if (filters.sedimentprøve && f.properties.sedimentprøve)
          return true;
        if (filters.bløtbunnsfauna && f.properties.Bløtbunnsfauna)
          return true;
        return false;
      });
    }

    // Apply owner filters
    if (hasOwnerFilters) {
      result = result.filter((f) => {
        const owner = (f.properties.Eier || '').trim();
        if (filters.ownerFK && owner === 'FK') return true;
        if (filters.ownerTK && owner === 'TK') return true;
        if (filters.ownerTR && owner === 'TR') return true;
        return false;
      });
    }

    return result;
  }, [
    allLayers.prv_punkt,
    searchQuery,
    filters,
    hasActiveFilters,
    hasTestTypeFilters,
    hasOwnerFilters,
  ]);

  // Filtered layers for the map - only prv_punkt is filtered
  const filteredLayers = {
    prv_punkt: filteredPrvPunkt,
    ult_punkt: allLayers.ult_punkt,
    utl_ledning: allLayers.utl_ledning,
  };

  // Handle layer change - clear search and filters
  const handleLayerChange = (layerId) => {
    setSearchQuery('');
    setFilters({
      vannprøve: false,
      sedimentprøve: false,
      bløtbunnsfauna: false,
      ownerFK: false,
      ownerTK: false,
      ownerTR: false,
    });
    setActiveLayer(layerId);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="flex h-screen">
        <SidePanel
          features={
            activeLayer === 'prv_punkt'
              ? filteredPrvPunkt
              : activeFeatures
          }
          allFeatures={activeFeatures}
          selectedFeature={selected}
          onSelect={setSelected}
          activeLayer={activeLayer}
          onLayerChange={handleLayerChange}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          filters={filters}
          onFiltersChange={setFilters}
        />
        <div className="flex-1">
          <Map
            selectedFeature={selected}
            onSelect={setSelected}
            allLayers={filteredLayers}
            activeLayer={activeLayer}
          />
        </div>
      </div>
    </div>
  );
}
