// src/pages/Forecast.tsx
import { useEffect, useMemo, useState } from "react";
import ReactECharts from "echarts-for-react";
import FilterBar from "../components/FilterBar";
import { getForecast } from "../lib/api";

export default function Forecast() {
  const [filters, setFilters] = useState({ categories: [], states: [], cities: [] } as {
    categories: string[]; states: string[]; cities: string[];
  });
  const [h, setH] = useState(3);
  const [data, setData] = useState<{ history: { date: string; value: number }[]; forecast: { date: string; value: number }[] }>({ history: [], forecast: [] });

  useEffect(() => {
    getForecast({ ...filters, h, model: "linear" })
      .then(setData)
      .catch(() => setData({ history: [], forecast: [] }));
  }, [JSON.stringify(filters), h]);

  const option = useMemo(() => {
    const hist = data.history ?? [];
    const fc = data.forecast ?? [];
    const x = [...hist.map(p => p.date), ...fc.map(p => p.date)];
    return {
      backgroundColor: 'transparent',
      color: ['#2563eb', '#3b82f6'],
      tooltip: {
        trigger: 'axis',
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderColor: '#e5e7eb',
        borderWidth: 1,
        borderRadius: 8,
        textStyle: { color: '#1f2937', fontSize: 12 },
        axisPointer: { 
          type: 'line', 
          lineStyle: { color: '#2563eb', width: 2 },
          shadowStyle: { color: 'rgba(37, 99, 235, 0.1)' }
        },
        padding: [8, 12]
      },
      legend: { 
        top: 8, 
        textStyle: { color: '#374151', fontSize: 12 },
        itemGap: 20
      },
      xAxis: {
        type: 'category',
        data: x,
        axisLabel: { color: '#6b7280', fontSize: 11 },
        axisLine: { lineStyle: { color: '#e5e7eb', width: 1 } },
        splitLine: { show: false }
      },
      yAxis: {
        type: 'value',
        axisLabel: { color: '#6b7280', fontSize: 11 },
        axisLine: { lineStyle: { color: '#e5e7eb', width: 1 } },
        splitLine: { show: true, lineStyle: { color: '#e5e7eb', type: 'dashed', width: 1 } }
      },
      series: [
        {
          name: 'History',
          type: 'line',
          data: hist.map(p => p.value),
          smooth: true,
          lineStyle: { width: 3, color: '#2563eb' },
          symbol: 'circle',
          symbolSize: 6,
          itemStyle: { color: '#2563eb', borderWidth: 2, borderColor: '#ffffff' },
          areaStyle: {
            color: { type: 'linear', x: 0, y: 0, x2: 0, y2: 1, colorStops: [
              { offset: 0, color: 'rgba(37, 99, 235, 0.25)' },
              { offset: 1, color: 'rgba(37, 99, 235, 0.05)' }
            ] }
          },
          emphasis: {
            focus: 'series',
            itemStyle: { color: '#1d4ed8', symbolSize: 10 }
          }
        },
        {
          name: 'Forecast',
          type: 'line',
          data: [...new Array(hist.length).fill(null), ...fc.map(p => p.value)],
          smooth: true,
          lineStyle: { type: 'dashed', width: 3, color: '#3b82f6' },
          symbol: 'circle',
          symbolSize: 6,
          itemStyle: { color: '#3b82f6', borderWidth: 2, borderColor: '#ffffff' },
          areaStyle: {
            color: { type: 'linear', x: 0, y: 0, x2: 0, y2: 1, colorStops: [
              { offset: 0, color: 'rgba(59, 130, 246, 0.2)' },
              { offset: 1, color: 'rgba(59, 130, 246, 0.05)' }
            ] }
          },
          emphasis: {
            focus: 'series',
            itemStyle: { color: '#2563eb', symbolSize: 10 }
          }
        },
      ],
      grid: { left: 50, right: 20, top: 50, bottom: 50 },
    };
  }, [data]);

  return (
    <div className="space-y-6 animate-slide-in">
          <FilterBar value={filters} onChange={setFilters} />
          <div className="flex items-center gap-4">
            <label className="text-sm font-medium text-gray-700">Horizon (months):</label>
            <input 
              type="number" 
              min={1} 
              max={12} 
              value={h} 
              onChange={(e) => setH(Math.max(1, Math.min(12, Number(e.target.value))))}
              className="bg-white border-2 border-gray-200 rounded-lg px-4 py-2 w-28 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:border-blue-300 font-medium" 
            />
          </div>
          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
            <div className="mb-4 font-semibold text-lg text-gray-900 flex items-center gap-2">
              <span className="w-1 h-6 bg-blue-600 rounded-full"></span>
              History vs Forecast
            </div>
            <div className="rounded-lg overflow-hidden">
              <ReactECharts option={option} style={{ height: 420 }} />
            </div>
          </div>
    </div>
  );
}