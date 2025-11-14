// src/pages/Home.tsx
import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-blue-50 pt-20 pb-32">
        {/* Top-right Sign Up button (shown on home because Navbar is hidden before login) */}
        <Link
          to="/signup"
          className="absolute top-6 right-6 z-20 px-5 py-2.5 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 hover:shadow-lg transition-all duration-200"
        >
          Sign Up
        </Link>
        <div className="absolute inset-0 bg-grid-pattern opacity-5 pointer-events-none"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 animate-slide-in">
              E-Commerce Analytics
              <span className="block text-blue-600 mt-2">Powered by AI</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto animate-slide-in" style={{ animationDelay: '0.1s' }}>
              Transform your sales data into actionable insights. Track revenue, analyze trends, and forecast future performance with our intelligent dashboard.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-slide-in" style={{ animationDelay: '0.2s' }}>
              <Link
                to="/signup"
                className="px-8 py-4 bg-blue-600 text-white font-semibold rounded-lg shadow-lg hover:bg-blue-700 hover:shadow-xl transform hover:scale-105 transition-all duration-200"
              >
                Get Started Free
              </Link>
              <Link
                to="/login"
                className="px-8 py-4 bg-white text-blue-600 font-semibold rounded-lg border-2 border-blue-600 hover:bg-blue-50 transform hover:scale-105 transition-all duration-200"
              >
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Powerful Analytics Features
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Everything you need to understand and grow your e-commerce business
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-6 rounded-xl bg-gradient-to-br from-blue-50 to-white border border-blue-100 hover:shadow-lg transition-all duration-200 hover:-translate-y-1">
              <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Revenue Analytics</h3>
              <p className="text-gray-600">
                Track total revenue, average order value, and identify your top-performing categories and products.
              </p>
            </div>

            <div className="p-6 rounded-xl bg-gradient-to-br from-blue-50 to-white border border-blue-100 hover:shadow-lg transition-all duration-200 hover:-translate-y-1">
              <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Regional Insights</h3>
              <p className="text-gray-600">
                Analyze sales performance by state and city to understand your geographic market distribution.
              </p>
            </div>

            <div className="p-6 rounded-xl bg-gradient-to-br from-blue-50 to-white border border-blue-100 hover:shadow-lg transition-all duration-200 hover:-translate-y-1">
              <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">AI Forecasting</h3>
              <p className="text-gray-600">
                Predict future sales trends using advanced machine learning models for better business planning.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-blue-700">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to unlock your data's potential?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join thousands of businesses using our analytics platform to drive growth.
          </p>
          <Link
            to="/login"
            className="inline-block px-8 py-4 bg-white text-blue-600 font-semibold rounded-lg shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-200"
          >
            Start Your Free Trial
          </Link>
        </div>
      </section>
    </div>
  );
}

