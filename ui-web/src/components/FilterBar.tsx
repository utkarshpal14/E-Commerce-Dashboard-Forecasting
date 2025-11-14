// src/components/FilterBar.tsx
import { useEffect, useMemo, useState } from "react";
import { getFilters } from "../lib/api";

type Props = {
  value: { categories: string[]; states: string[]; cities: string[] };
  onChange: (v: { categories: string[]; states: string[]; cities: string[] }) => void;
};

export default function FilterBar({ value, onChange }: Props) {
  const [opts, setOpts] = useState<{ categories: string[]; states: string[]; cities: string[]; cities_by_state: Record<string, string[]> } | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    getFilters()
      .then((d) => {
        setErr(null);
        setOpts({
          categories: d?.categories ?? [],
          states: d?.states ?? [],
          cities: d?.cities ?? [],
          cities_by_state: d?.cities_by_state ?? {},
        });
      })
      .catch((e) => {
        setErr("Failed to load filters");
        setOpts({ categories: [], states: [], cities: [], cities_by_state: {} });
        console.error(e);
      });
  }, []);

  const reset = () => onChange({ categories: [], states: [], cities: [] });

  const cityOptions = useMemo(() => {
    if (!opts) return [] as string[];
    if (!value.states.length) return [] as string[];
    const u = new Set<string>();
    value.states.forEach((s) => (opts.cities_by_state[s] || []).forEach((c: string) => u.add(c)));
    return Array.from(u).sort();
  }, [opts, value.states]);

  useEffect(() => {
    if (!opts) return;
    const allowed = new Set(cityOptions);
    const filtered = value.cities.filter((c) => allowed.has(c));
    if (filtered.length !== value.cities.length) {
      onChange({ ...value, cities: filtered });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cityOptions.join(",")]);

  if (!opts) return (
    <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100 animate-pulse">
      <div className="h-6 w-24 bg-gray-200 rounded mb-4"></div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="h-48 bg-gray-100 rounded-lg"></div>
        <div className="h-48 bg-gray-100 rounded-lg"></div>
        <div className="h-48 bg-gray-100 rounded-lg"></div>
      </div>
    </div>
  );

  return (
    <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100 animate-slide-in">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="text-base font-semibold text-gray-900 flex items-center gap-2">
          <span className="w-1 h-5 bg-blue-600 rounded-full"></span>
          Filters
        </div>
        <button 
          onClick={reset} 
          className="px-4 py-2 text-sm font-medium rounded-lg bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg hover:scale-105 active:scale-95 transition-all duration-200"
        >
          Reset
        </button>
      </div>

      {err ? (
        <div className="text-sm text-red-600 mb-4 px-4 py-2 rounded-lg border border-red-300 bg-red-50 animate-slide-in">{err}</div>
      ) : null}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <SelectMulti
          label="Categories"
          options={opts.categories}
          selected={value.categories}
          onChange={(sel) => onChange({ ...value, categories: sel })}
        />

        <SelectMulti
          label="States"
          options={opts.states}
          selected={value.states}
          onChange={(sel) => onChange({ ...value, states: sel })}
        />

        <div>
          <SelectMulti
            label="Cities"
            options={cityOptions}
            selected={value.cities}
            onChange={(sel) => onChange({ ...value, cities: sel })}
          />
          {cityOptions.length === 0 ? (
            <div className="mt-2 text-xs text-gray-500">Select a state first</div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function SelectMulti({
  label,
  options,
  selected,
  onChange,
}: {
  label: string;
  options: string[];
  selected: string[];
  onChange: (v: string[]) => void;
}) {
  const allSelected = options.length > 0 && selected.length === options.length;
  return (
    <label className="text-sm">
      <div className="mb-2 flex items-center justify-between gap-2">
        <span className="text-gray-700 font-medium">{label}</span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="text-xs px-3 py-1.5 rounded-lg border-2 border-blue-200 bg-blue-50 text-blue-700 hover:border-blue-400 hover:bg-blue-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium"
            onClick={() => onChange(options)}
            disabled={allSelected}
            title={allSelected ? "All selected" : "Select all"}
          >
            Select all
          </button>
          <button
            type="button"
            className="text-xs px-3 py-1.5 rounded-lg border-2 border-gray-200 bg-white text-gray-700 hover:border-gray-400 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium"
            onClick={() => onChange([])}
            disabled={selected.length === 0}
            title={selected.length === 0 ? "Nothing to clear" : "Clear selection"}
          >
            Clear
          </button>
        </div>
      </div>
      <select
        multiple
        size={8}
        className="w-full border-2 border-gray-200 bg-white rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:border-blue-300 text-sm"
        value={selected}
        onChange={(e) => onChange(Array.from(e.target.selectedOptions).map((o) => o.value))}
      >
        {options.map((o) => (
          <option key={o} value={o} className="py-1">
            {o}
          </option>
        ))}
      </select>
    </label>
  );
}