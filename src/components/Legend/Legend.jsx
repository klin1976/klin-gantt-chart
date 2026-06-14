import React from 'react';

export default function Legend({ categories }) {
  return (
    <div className="bg-[#1f2937] border-t border-gray-700 px-6 py-3 flex gap-6 text-sm overflow-x-auto" data-html2canvas-ignore="true">
      {categories.map((cat) => (
        <div key={cat.id} className="flex items-center gap-2 flex-shrink-0">
          <span className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: cat.color }}></span>
          <span className="text-gray-400">{cat.label}</span>
        </div>
      ))}
    </div>
  );
}
