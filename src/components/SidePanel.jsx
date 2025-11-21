"use client";

export default function SidePanel({ features, selectedFeature, onSelect }) {
  return (
    <aside className="w-80 bg-white border-r dark:bg-gray-900 h-screen overflow-y-auto">
      <div className="p-4">
        <h2 className="text-lg font-semibold">Points ({features.length})</h2>
      </div>
      <ul className="p-2">
        {features.map((f) => {
          const key = f.properties.fid;
          const title = f.properties.REF || `PSID ${f.properties.PSID}`;
          const isSelected =
            selectedFeature &&
            selectedFeature.properties &&
            selectedFeature.properties.fid === key;
          return (
            <li
              key={key}
              className={`cursor-pointer p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 ${
                isSelected ? "bg-gray-200 dark:bg-gray-800" : ""
              }`}
              onClick={() => onSelect && onSelect(f)}
              title={title}
            >
              <div className="text-sm font-medium">{title}</div>
              <div className="text-xs text-gray-500">
                PSID: {f.properties.PSID}
              </div>
            </li>
          );
        })}
      </ul>
    </aside>
  );
}
