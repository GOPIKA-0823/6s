import { useNavigate } from 'react-router-dom';

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-600 to-primary-800 text-white py-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-4">Agaram Agency</h1>
          <p className="text-2xl md:text-3xl mb-8 text-primary-100">Connecting Manufacturers and Retailers</p>
          <p className="text-lg md:text-xl max-w-3xl mx-auto mb-12 text-primary-50">
            Agaram Agency is a leading dealership company that bridges the gap between manufacturers and retail shops, 
            creating seamless wholesale trade experiences through our innovative digital platform.
          </p>
        </div>
      </section>

      {/* Intro Section */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Your Trusted Wholesale Partner</h2>
          <p className="text-lg text-gray-700 leading-relaxed">
            At Agaram Agency, we specialize in connecting manufacturers with retail shops across the region. 
            Our platform facilitates efficient procurement, order management, and transparent transactions, 
            empowering businesses to grow and thrive in today's competitive market.
          </p>
        </div>
      </section>

      {/* Main Action Cards */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">Get Started</h2>
          <div className="grid md:grid-cols-2 gap-8">
            {/* Manufacturer Card */}
            <div
              onClick={() => navigate('/login/manufacturer')}
              className="bg-white rounded-xl shadow-lg p-8 hover:shadow-2xl transition-shadow cursor-pointer border-2 border-transparent hover:border-primary-500"
            >
              <div className="text-center">
                <div className="bg-primary-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-10 h-10 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Manufacturer</h3>
                <p className="text-gray-600 mb-6">
                  Join as a manufacturer to list your products, manage inventory, and connect with retail shops 
                  looking for your products. Expand your reach and streamline your wholesale operations.
                </p>
                <button className="bg-primary-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors">
                  Login / Register as Manufacturer
                </button>
              </div>
            </div>

            {/* Retail Shop Card */}
            <div
              onClick={() => navigate('/login/retailer')}
              className="bg-white rounded-xl shadow-lg p-8 hover:shadow-2xl transition-shadow cursor-pointer border-2 border-transparent hover:border-primary-500"
            >
              <div className="text-center">
                <div className="bg-green-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Retail Shop</h3>
                <p className="text-gray-600 mb-6">
                  Join as a retail shop to browse products from multiple manufacturers, send product requests, 
                  manage orders, and access digital invoices. Simplify your procurement process.
                </p>
                <button className="bg-green-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors">
                  Login / Register as Retail Shop
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">Why Choose Agaram Agency?</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">🚀</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Fast & Efficient</h3>
              <p className="text-gray-600">Streamlined processes for quick order fulfillment</p>
            </div>
            <div className="text-center">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">🔒</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Transparent</h3>
              <p className="text-gray-600">Clear pricing and digital record keeping</p>
            </div>
            <div className="text-center">
              <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">📱</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Digital First</h3>
              <p className="text-gray-600">Modern platform for modern businesses</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;