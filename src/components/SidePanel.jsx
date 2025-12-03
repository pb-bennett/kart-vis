'use client';

import Image from 'next/image';

export default function SidePanel({
  features,
  selectedFeature,
  onSelect,
  activeLayer,
  onLayerChange,
}) {
  const layers = [
    { id: 'prv_punkt', name: 'Prøvetakingspunkt', type: 'point' },
    { id: 'ult_punkt', name: 'Overløpspunkt', type: 'point' },
    { id: 'utl_ledning', name: 'Overløpsledning', type: 'line' },
  ];

  const currentLayer = layers.find((l) => l.id === activeLayer);
  const title =
    currentLayer?.type === 'line'
      ? `Ledninger (${features.length})`
      : `Punkter (${features.length})`;

  return (
    <aside
      className="w-80 bg-white border-r h-screen overflow-y-auto flex flex-col"
      style={{ borderColor: '#e5e7eb' }}
    >
      {/* Logo */}
      <div
        className="p-4 border-b"
        style={{ backgroundColor: '#ffffff', borderColor: '#656263' }}
      >
        <Image
          src="/FK_logo.svg"
          alt="Færder Kommune"
          width={300}
          height={100}
          className="w-full h-auto"
          priority
        />
      </div>

      {/* Layer tabs */}
      <div className="border-b" style={{ borderColor: '#e5e7eb' }}>
        <div className="flex">
          {layers.map((layer) => (
            <button
              key={layer.id}
              onClick={() => onLayerChange(layer.id)}
              className={`flex-1 px-2 py-2.5 text-xs font-medium border-b-2 transition-colors ${
                activeLayer === layer.id
                  ? 'text-white'
                  : 'border-transparent hover:bg-gray-50'
              }`}
              style={
                activeLayer === layer.id
                  ? {
                      borderColor: '#4782cb',
                      backgroundColor: '#4782cb',
                    }
                  : { color: '#656263' }
              }
            >
              {layer.name}
            </button>
          ))}
        </div>
      </div>

      {/* Header */}
      <div
        className="px-4 py-3 border-b"
        style={{ borderColor: '#e5e7eb', backgroundColor: '#f9fafb' }}
      >
        <h2
          className="text-base font-semibold"
          style={{ color: '#656263' }}
        >
          {title}
        </h2>
      </div>
      {/* Feature list */}
      <ul className="p-2 flex-1 overflow-y-auto">
        {features.map((f) => {
          const key = f.properties.fid;
          let title, subtitle;

          if (activeLayer === 'utl_ledning') {
            // Line features
            title = f.properties.FCODE
              ? `${f.properties.FCODE} - LSID ${f.properties.LSID}`
              : `LSID ${f.properties.LSID}`;
            subtitle = `${f.properties.LENGTH?.toFixed(0) || '?'} m`;
          } else if (activeLayer === 'prv_punkt') {
            // Prøvetakingspunkt - use navn
            title = f.properties.navn || `PSID ${f.properties.PSID}`;
            subtitle =
              f.properties['vannlok-kode']?.trim() ||
              (f.properties.PSID ? `PSID: ${f.properties.PSID}` : '');
          } else {
            // Overløpspunkt (ult_punkt)
            title =
              f.properties.navn ||
              f.properties.REF ||
              `PSID ${f.properties.PSID}`;
            subtitle = f.properties.PSID
              ? `PSID: ${f.properties.PSID}`
              : '';
          }

          const isSelected =
            selectedFeature &&
            selectedFeature.properties &&
            selectedFeature.properties.fid === key;

          return (
            <li
              key={key}
              className="cursor-pointer p-2 rounded-md transition-colors"
              style={{
                backgroundColor: isSelected
                  ? '#e8f1fc'
                  : 'transparent',
                borderLeft: isSelected
                  ? '3px solid #4782cb'
                  : '3px solid transparent',
              }}
              onMouseEnter={(e) => {
                if (!isSelected)
                  e.currentTarget.style.backgroundColor = '#f3f4f6';
              }}
              onMouseLeave={(e) => {
                if (!isSelected)
                  e.currentTarget.style.backgroundColor =
                    'transparent';
              }}
              onClick={() => onSelect && onSelect(f)}
              title={title}
            >
              <div
                className="text-sm font-medium"
                style={{ color: '#656263' }}
              >
                {title}
              </div>
              <div className="text-xs" style={{ color: '#9ca3af' }}>
                {subtitle}
              </div>
            </li>
          );
        })}
      </ul>
    </aside>
  );
}
