"use client";

import { useState } from "react";
import { PALETTE_PRESETS } from "./presets";
import { getContrastColor } from "./contrast";
import type { TemplatePalette } from "./types";

export function PaletteSelector({ onChange }: { onChange: (p: TemplatePalette) => void }) {
  const [palette, setPalette] = useState<TemplatePalette>(PALETTE_PRESETS.dark);

  function update(key: keyof TemplatePalette, value: string) {
    const updated = { ...palette, [key]: value };
    updated.text = getContrastColor(updated.bg);
    setPalette(updated);
    onChange(updated);
  }

  return (
    <div className="space-y-4 text-white">
      <div className="grid grid-cols-3 gap-3">
        {Object.entries(PALETTE_PRESETS).map(([name, pal]) => (
          <button
            key={name}
            onClick={() => {
              setPalette(pal);
              onChange(pal);
            }}
            className="rounded-xl p-3 border border-white/20"
            style={{ background: pal.bg, color: pal.text }}
            type="button"
          >
            {name}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-5 gap-4">
        {(Object.keys(palette) as (keyof TemplatePalette)[]).map((key) => (
          <div key={key} className="flex flex-col items-center space-y-2">
            <label className="text-xs capitalize">{key}</label>
            <input
              type="color"
              value={palette[key]}
              onChange={(e) => update(key, e.target.value)}
              className="w-10 h-10 rounded"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
