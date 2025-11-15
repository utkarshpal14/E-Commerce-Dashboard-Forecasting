// src/lib/api.ts
import axios from "axios";

export const api = axios.create({
  // baseURL: "http://127.0.0.1:8000",
  baseURL: import.meta.env.VITE_API_BASE_URL ,
  timeout: 15000,
  // Serialize arrays as repeated keys so FastAPI parses them as List[str]
  paramsSerializer: {
    serialize: (params: Record<string, any>) => {
      const usp = new URLSearchParams();
      Object.entries(params || {}).forEach(([k, v]) => {
        if (v === undefined || v === null) return;
        if (Array.isArray(v)) {
          v.forEach((item) => usp.append(k, String(item)));
        } else {
          usp.append(k, String(v));
        }
      });
      return usp.toString();
    },
  },
});

export type Filters = {
  categories?: string[];
  cities?: string[];
  states?: string[];
  start_date?: string;
  end_date?: string;
};

export const getFilters = async () => (await api.get("/filters")).data;
export const getKpis = async (params: Filters) => (await api.get("/kpis", { params })).data;
export const getTimeseries = async (params: Filters & { granularity?: "day" | "month" }) =>
  (await api.get("/timeseries", { params })).data;
export const getCategories = async (params: Filters) => (await api.get("/categories", { params })).data;
export const getRegions = async (params: Filters & { level?: "state" | "city" }) =>
  (await api.get("/regions", { params })).data;
export const getForecast = async (params: Filters & { h?: number; model?: "linear" }) =>
  (await api.get("/forecast", { params })).data;