// src/pages/Overview.tsx
import { useEffect, useMemo, useState } from "react";
import ReactECharts from "echarts-for-react";
import { getKpis, getTimeseries } from "../lib/api";
import FilterBar from "../components/FilterBar";
import { useSearchParams } from "react-router-dom";

export default function Overview() {
  const [filters, setFilters] = useState({ categories: [], states: [], cities: [] } as {
    categories: string[];
    states: string[];
    cities: string[];
  });
  const [kpis, setKpis] = useState<any>(null);
  const [ts, setTs] = useState<{ date: string; value: number }[]>([]);
  const [kpisLoading, setKpisLoading] = useState(true);
  const [tsLoading, setTsLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();

  // Restore filters from URL on first mount
  useEffect(() => {
    const readArr = (key: string) => {
      const v = searchParams.get(key);
      return v ? v.split(",").filter(Boolean) : [];
    };
    const initial = {
      categories: readArr("categories"),
      states: readArr("states"),
      cities: readArr("cities"),
    };
    if (initial.categories.length || initial.states.length || initial.cities.length) {
      setFilters(initial as any);
    }
    // run once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fetch data when filters change
  useEffect(() => {
    const f = { ...filters };
    setKpisLoading(true);
    setTsLoading(true);
    getKpis(f)
      .then(setKpis)
      .catch(() => setKpis(null))
      .finally(() => setKpisLoading(false));
    getTimeseries({ ...f, granularity: "month" })
      .then((d) => setTs(d.points || []))
      .catch(() => setTs([]))
      .finally(() => setTsLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(filters)]);

  // Sync filters to URL
  useEffect(() => {
    const params: Record<string, string> = {};
    if (filters.categories.length) params.categories = filters.categories.join(",");
    if (filters.states.length) params.states = filters.states.join(",");
    if (filters.cities.length) params.cities = filters.cities.join(",");
    setSearchParams(params, { replace: true });
  }, [filters, setSearchParams]);

  const chartOption = useMemo(
    () => ({
      backgroundColor: 'transparent',
      color: ['#2563eb'],
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
      xAxis: {
        type: 'category',
        data: ts.map((p) => p.date),
        axisLabel: { color: '#6b7280', fontSize: 11 },
        axisLine: { lineStyle: { color: '#e5e7eb', width: 1 } },
        splitLine: { show: false }
      },
      yAxis: {
        type: 'value',
        axisLabel: { color: '#6b7280', fontSize: 11 },
        axisLine: { lineStyle: { color: '#e5e7eb', width: 1 } },
        splitLine: { 
          show: true, 
          lineStyle: { color: '#e5e7eb', type: 'dashed', width: 1 } 
        }
      },
      series: [{
        type: 'line',
        data: ts.map((p) => p.value),
        smooth: true,
        lineStyle: { width: 3, color: '#2563eb' },
        symbol: 'circle',
        symbolSize: 6,
        itemStyle: { color: '#2563eb', borderWidth: 2, borderColor: '#ffffff' },
        areaStyle: {
          color: {
            type: 'linear', x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(37, 99, 235, 0.25)' },
              { offset: 1, color: 'rgba(37, 99, 235, 0.05)' }
            ]
          }
        },
        emphasis: {
          focus: 'series',
          itemStyle: { color: '#1d4ed8', symbolSize: 10 }
        }
      }],
      grid: { left: 50, right: 20, top: 30, bottom: 50 },
    }),
    [ts]
  );

  return (
    <div className="space-y-6 animate-slide-in">
          <FilterBar value={filters} onChange={setFilters} />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {kpisLoading ? (
              <>
                <KpiSkeleton />
                <KpiSkeleton />
                <KpiSkeleton />
                <KpiSkeleton />
              </>
            ) : (
              <>
                <Kpi title="Total Revenue" value={fmtCurrency(kpis?.total_revenue)} delay="0s" />
                <Kpi title="Total Orders" value={fmtNumber(kpis?.total_orders)} delay="0.1s" />
                <Kpi title="Avg Order Value" value={fmtCurrency(kpis?.avg_order_value)} delay="0.2s" />
                <Kpi title="Total Quantity" value={fmtNumber(kpis?.total_quantity)} delay="0.3s" />
              </>
            )}
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
            <div className="mb-4 font-semibold text-lg text-gray-900 flex items-center gap-2">
              <span className="w-1 h-6 bg-blue-600 rounded-full"></span>
              Monthly Revenue
            </div>
            {tsLoading ? (
              <div className="h-[400px] rounded-lg border border-gray-200 animate-pulse bg-gray-100" />
            ) : (
              <div className="rounded-lg overflow-hidden">
                <ReactECharts option={chartOption} style={{ height: 400 }} />
              </div>
            )}
          </div>
    </div>
  );
}

function Kpi({ title, value, delay }: { title: string; value: string; delay?: string }) {
  return (
    <div 
      className="p-6 rounded-xl bg-white border border-gray-200 shadow-md hover:shadow-lg hover:-translate-y-1 relative overflow-hidden group animate-slide-in transition-all duration-200"
      style={{ animationDelay: delay }}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      <div className="relative">
        <div className="text-sm font-medium text-gray-600 mb-2">{title}</div>
        <div className="text-3xl font-bold text-gray-900">
          {value}
        </div>
      </div>
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-blue-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
    </div>
  );
}

function KpiSkeleton() {
  return (
    <div className="p-6 rounded-xl bg-white border border-gray-200 shadow-md animate-pulse">
      <div className="h-4 w-32 bg-gray-200 rounded mb-4" />
      <div className="h-8 w-36 bg-gray-200 rounded" />
    </div>
  );
}

function fmtNumber(v: any) {
  if (v === null || v === undefined || Number.isNaN(v)) return "-";
  const n = typeof v === "number" ? v : Number(v);
  if (!Number.isFinite(n)) return "-";
  return new Intl.NumberFormat(undefined, { notation: "compact", maximumFractionDigits: 1 }).format(n);
}

function fmtCurrency(v: any) {
  if (v === null || v === undefined || Number.isNaN(v)) return "-";
  const n = typeof v === "number" ? v : Number(v);
  if (!Number.isFinite(n)) return "-";
  try {
    return new Intl.NumberFormat(undefined, { style: "currency", currency: "INR", notation: "compact", maximumFractionDigits: 1 }).format(n);
  } catch {
    return new Intl.NumberFormat(undefined, { notation: "compact", maximumFractionDigits: 1 }).format(n);
  }
}