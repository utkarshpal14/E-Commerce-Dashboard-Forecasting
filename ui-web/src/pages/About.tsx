// src/pages/About.tsx
export default function About() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="text-center mb-12 animate-slide-in">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">About Us</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Empowering businesses with intelligent analytics and data-driven insights
          </p>
        </div>

        {/* Mission Section */}
        <div className="bg-white rounded-xl p-8 shadow-lg border border-gray-100 mb-8 animate-slide-in" style={{ animationDelay: '0.1s' }}>
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">Our Mission</h2>
              <p className="text-gray-600 leading-relaxed">
                We believe that every business deserves access to powerful analytics tools that help them understand their data, 
                identify trends, and make informed decisions. Our platform transforms complex e-commerce data into clear, 
                actionable insights that drive growth and success.
              </p>
            </div>
          </div>
        </div>

        {/* What We Do Section */}
        <div className="bg-white rounded-xl p-8 shadow-lg border border-gray-100 mb-8 animate-slide-in" style={{ animationDelay: '0.2s' }}>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">What We Do</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="p-6 rounded-lg bg-blue-50 border border-blue-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Data Analytics</h3>
              <p className="text-gray-600">
                Comprehensive analysis of your sales data, revenue trends, and customer behavior patterns to help you understand your business better.
              </p>
            </div>
            <div className="p-6 rounded-lg bg-blue-50 border border-blue-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">AI Forecasting</h3>
              <p className="text-gray-600">
                Advanced machine learning models predict future sales trends, enabling you to plan ahead and optimize your inventory and marketing strategies.
              </p>
            </div>
            <div className="p-6 rounded-lg bg-blue-50 border border-blue-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Regional Insights</h3>
              <p className="text-gray-600">
                Geographic analysis helps you understand which regions perform best and identify opportunities for expansion or targeted marketing.
              </p>
            </div>
            <div className="p-6 rounded-lg bg-blue-50 border border-blue-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Category Performance</h3>
              <p className="text-gray-600">
                Track and compare performance across different product categories to optimize your product mix and focus on high-performing areas.
              </p>
            </div>
          </div>
        </div>

        {/* Technology Section */}
        <div className="bg-white rounded-xl p-8 shadow-lg border border-gray-100 mb-8 animate-slide-in" style={{ animationDelay: '0.3s' }}>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Our Technology</h2>
          <p className="text-gray-600 mb-6 leading-relaxed">
            Built with cutting-edge technologies and best practices, our platform leverages:
          </p>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="text-center p-4 rounded-lg bg-gray-50">
              <div className="text-2xl font-bold text-blue-600 mb-2">AI/ML</div>
              <p className="text-sm text-gray-600">Machine Learning Models</p>
            </div>
            <div className="text-center p-4 rounded-lg bg-gray-50">
              <div className="text-2xl font-bold text-blue-600 mb-2">Real-time</div>
              <p className="text-sm text-gray-600">Live Data Processing</p>
            </div>
            <div className="text-center p-4 rounded-lg bg-gray-50">
              <div className="text-2xl font-bold text-blue-600 mb-2">Secure</div>
              <p className="text-sm text-gray-600">Enterprise-grade Security</p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-8 text-center text-white animate-slide-in" style={{ animationDelay: '0.4s' }}>
          <h2 className="text-2xl font-bold mb-3">Ready to Get Started?</h2>
          <p className="text-blue-100 mb-6">
            Join thousands of businesses using our platform to make data-driven decisions
          </p>
          <a
            href="/login"
            className="inline-block px-8 py-3 bg-white text-blue-600 font-semibold rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
          >
            Start Free Trial
          </a>
        </div>
      </div>
    </div>
  );
}

