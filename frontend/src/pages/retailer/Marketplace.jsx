import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMarketplaceProducts } from '../../services/api';

const RetailerMarketplace = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getMarketplaceProducts();
      setProducts(response.data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
      setError(error.response?.data?.message || 'Failed to load marketplace products. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter((product) => {
    const manufacturerName = product.manufacturerId?.companyName || 'Unknown';
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         manufacturerName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = ['all', ...new Set(products.map(p => p.category))];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Marketplace</h1>
        <p className="text-gray-600">Browse products from manufacturers</p>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg flex justify-between items-center">
          <span>{error}</span>
          <button 
            onClick={fetchProducts}
            className="text-red-700 font-semibold underline hover:text-red-900"
          >
            Retry
          </button>
        </div>
      )}

      {/* Search and Filter */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <input
              type="text"
              placeholder="Search products or manufacturers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          <div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat === 'all' ? 'All Categories' : cat.charAt(0).toUpperCase() + cat.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block">
            <div className="animate-spin h-8 w-8 text-primary-500"></div>
          </div>
          <p className="text-gray-600 mt-2">Loading marketplace products...</p>
        </div>
      ) : filteredProducts.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product) => (
            <div key={product._id} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
              <div className="mb-4">
                <h3 className="text-xl font-bold text-gray-900 mb-2">{product.name}</h3>
                <div className="flex items-center space-x-1">
                  <p className="text-primary-600 font-medium text-sm">{product.manufacturerId?.companyName || 'Unknown Manufacturer'}</p>
                  {product.manufacturerId?.isVerified && (
                    <span className="text-blue-500" title="Verified Manufacturer">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.64.3 1.248.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" />
                      </svg>
                    </span>
                  )}
                </div>
                <p className="text-gray-500 text-xs mt-1">{product.category}</p>
              </div>
              <p className="text-gray-700 mb-4 text-sm">{product.description}</p>
              <div className="flex justify-between items-center mb-4">
                <div>
                  <p className="text-sm text-gray-600">Price</p>
                  <p className="text-xl font-bold text-gray-900">₹{product.price}/unit</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">Stock Available</p>
                  <p className={`text-xl font-bold ${
                    (product.stock || 0) <= 10 ? 'text-red-500' :
                    (product.stock || 0) <= 50 ? 'text-orange-500' :
                    'text-green-500'
                  }`}>
                    {product.stock || 0} units
                  </p>
                </div>
              </div>
              <button
                onClick={() => navigate(`/retailer/send-request?productId=${product._id}`)}
                className="w-full bg-primary-600 text-white px-4 py-3 rounded-lg hover:bg-primary-700 transition-colors font-medium"
              >
                Send Request
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-lg p-12 text-center">
          <p className="text-gray-600 text-lg font-medium">No products found</p>
          <p className="text-gray-500 text-sm mt-2">Try adjusting your search or filter settings</p>
        </div>
      )}
    </div>
  );
};

export default RetailerMarketplace;