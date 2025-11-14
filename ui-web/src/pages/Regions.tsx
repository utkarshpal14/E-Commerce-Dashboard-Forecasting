// src/pages/Regions.tsx
import { useEffect, useMemo, useState } from "react";
import ReactECharts from "echarts-for-react";
import FilterBar from "../components/FilterBar";
import { getRegions } from "../lib/api";

export default function Regions() {
  const [filters, setFilters] = useState({ categories: [], states: [], cities: [] } as {
    categories: string[]; states: string[]; cities: string[];
  });
  const [level, setLevel] = useState<"state" | "city">("state");
  const [items, setItems] = useState<{ name: string; value: number }[]>([]);

  useEffect(() => {
    getRegions({ ...filters, level }).then((d) => setItems(d.items || [])).catch(() => setItems([]));
  }, [JSON.stringify(filters), level]);

  const option = useMemo(() => ({
    backgroundColor: 'transparent',
    color: ['#2563eb'],
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      borderColor: '#e5e7eb',
      borderWidth: 1,
      borderRadius: 8,
      textStyle: { color: '#1f2937', fontSize: 12 },
      axisPointer: { type: 'shadow', shadowStyle: { color: 'rgba(37, 99, 235, 0.1)' } },
      padding: [8, 12]
    },
    xAxis: {
      type: 'category',
      data: items.map((i) => i.name),
      axisLabel: { rotate: 30, color: '#6b7280', fontSize: 11 },
      axisLine: { lineStyle: { color: '#e5e7eb', width: 1 } },
      splitLine: { show: false }
    },
    yAxis: {
      type: 'value',
      axisLabel: { color: '#6b7280', fontSize: 11 },
      axisLine: { lineStyle: { color: '#e5e7eb', width: 1 } },
      splitLine: { show: true, lineStyle: { color: '#e5e7eb', type: 'dashed', width: 1 } }
    },
    series: [{
      type: 'bar',
      data: items.map((i) => i.value),
      itemStyle: {
        color: {
          type: 'linear', x: 0, y: 0, x2: 0, y2: 1,
          colorStops: [
            { offset: 0, color: 'rgba(37, 99, 235, 0.9)' },
            { offset: 1, color: 'rgba(29, 78, 216, 0.7)' }
          ]
        },
        borderRadius: [8, 8, 0, 0],
        shadowBlur: 10,
        shadowColor: 'rgba(37, 99, 235, 0.2)'
      },
      barCategoryGap: '30%',
      barGap: '15%',
      emphasis: { 
        itemStyle: { 
          color: {
            type: 'linear', x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: '#1d4ed8' },
              { offset: 1, color: '#2563eb' }
            ]
          },
          shadowBlur: 15,
          shadowColor: 'rgba(37, 99, 235, 0.3)'
        } 
      }
    }],
    grid: { left: 50, right: 20, top: 30, bottom: 100 },
  }), [items]);

  return (
    <div className="space-y-6 animate-slide-in">
          <FilterBar value={filters} onChange={setFilters} />
          <div className="flex gap-3">
            <button
              className={`px-5 py-2.5 rounded-lg font-medium transition-all duration-200 ${
                level === "state" 
                  ? "bg-blue-600 text-white shadow-md scale-105" 
                  : "bg-white text-gray-700 hover:bg-blue-50 hover:text-blue-600 border border-gray-200 hover:border-blue-200"
              }`}
              onClick={() => setLevel("state")}
            >By State</button>
            <button
              className={`px-5 py-2.5 rounded-lg font-medium transition-all duration-200 ${
                level === "city" 
                  ? "bg-blue-600 text-white shadow-md scale-105" 
                  : "bg-white text-gray-700 hover:bg-blue-50 hover:text-blue-600 border border-gray-200 hover:border-blue-200"
              }`}
              onClick={() => setLevel("city")}
            >By City</button>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
            <div className="mb-4 font-semibold text-lg text-gray-900 flex items-center gap-2">
              <span className="w-1 h-6 bg-blue-600 rounded-full"></span>
              Revenue by {level === "state" ? "State" : "City"}
            </div>
            <div className="rounded-lg overflow-hidden">
              <ReactECharts option={option} style={{ height: 420 }} />
            </div>
          </div>
        </div>
    
  );
}