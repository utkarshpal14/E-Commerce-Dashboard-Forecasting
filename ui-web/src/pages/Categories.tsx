// src/pages/Categories.tsx
import { useEffect, useState } from "react";
import ReactECharts from "echarts-for-react";
import FilterBar from "../components/FilterBar";
import { getCategories } from "../lib/api";

export default function Categories() {
  const [filters, setFilters] = useState({ categories: [], states: [], cities: [] } as {
    categories: string[]; states: string[]; cities: string[];
  });
  const [items, setItems] = useState<{ Category?: string; name?: string; value: number }[]>([]);

  useEffect(() => {
    getCategories(filters).then((d) => setItems(d.items || [])).catch(() => setItems([]));
  }, [JSON.stringify(filters)]);

  const names = items.map((i) => (i.Category ?? i.name ?? ""));
  const values = items.map((i) => i.value ?? 0);

  const option = {
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
      data: names,
      axisLabel: { rotate: 30, overflow: 'truncate', color: '#6b7280', fontSize: 11 },
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
      data: values,
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
  };

  return (
    <div className="space-y-6 animate-slide-in">
          <FilterBar value={filters} onChange={setFilters} />
          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
            <div className="mb-4 font-semibold text-lg text-gray-900 flex items-center gap-2">
              <span className="w-1 h-6 bg-blue-600 rounded-full"></span>
              Revenue by Category
            </div>
            <div className="rounded-lg overflow-hidden">
              <ReactECharts option={option} style={{ height: 420 }} />
            </div>
          </div>
        </div>
   
  );
}