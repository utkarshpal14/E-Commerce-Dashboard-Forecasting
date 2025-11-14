// src/components/DashboardLayout.tsx
import { NavLink, Outlet } from "react-router-dom";

export default function DashboardLayout() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Dashboard Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
          <p className="text-gray-600">Analytics and insights for your e-commerce business</p>
        </div>

        {/* Sub Navigation Tabs */}
        <div className="mb-6 border-b border-gray-200">
          <nav className="flex space-x-1" aria-label="Dashboard Tabs">
            <NavLink
              to="/dashboard"
              end
              className={({ isActive }) =>
                `px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  isActive
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300"
                }`
              }
            >
              Overview
            </NavLink>
            <NavLink
              to="/dashboard/categories"
              className={({ isActive }) =>
                `px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  isActive
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300"
                }`
              }
            >
              Categories
            </NavLink>
            <NavLink
              to="/dashboard/regions"
              className={({ isActive }) =>
                `px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  isActive
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300"
                }`
              }
            >
              Regions
            </NavLink>
            <NavLink
              to="/dashboard/forecast"
              className={({ isActive }) =>
                `px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  isActive
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300"
                }`
              }
            >
              Forecast
            </NavLink>
          </nav>
        </div>

        {/* Dashboard Content */}
        <div>
          <Outlet />
        </div>
      </div>
    </div>
  );
}

