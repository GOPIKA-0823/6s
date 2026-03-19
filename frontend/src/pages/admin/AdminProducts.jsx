import { useState, useEffect } from 'react';

/**
 * Admin Products Management Page
 * 
 * Features:
 * - View all products from all manufacturers
 * - Approve or remove products
 * - Filter by status (active, pending, removed)
 * - Search functionality
 */
const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [filter, setFilter] = useState('active'); // active, pending, removed
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      // Mock data - replace with actual API call
      const mockProducts = [
        {
          _id: '1',
          name: 'Filter Coffee Powder',
          category: 'Beverages',
          manufacturerId: { companyName: 'Coffee Works' },
          price: 250,
          stock: 500,
          status: 'active'
        },
        {
          _id: '2',
          name: 'Sambar Powder',
          category: 'Spices',
          manufacturerId: { companyName: 'Spice House' },
          price: 180,
          stock: 300,
          status: 'active'
        },
        {
          _id: '3',
          name: 'Coconut Oil - 1L',
          category: 'Oils',
          manufacturerId: { companyName: 'Taste of Tamil Nadu' },
          price: 320,
          stock: 200,
          status: 'pending'
        },
        {
          _id: '4',
          name: 'Chikhalwali Rice',
          category: 'Rice',
          manufacturerId: { companyName: 'Rice Farmers Co-op' },
          price: 120,
          stock: 0,
          status: 'active'
        }
      ];
      setProducts(mockProducts);
      setFilteredProducts(mockProducts);
      setError(null);
    } catch (err) {
      console.error('Error fetching products:', err);
      setError('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const handleFilter = (filterType) => {
    setFilter(filterType);
    const filtered = products.filter(product => product.status === filterType);
    setFilteredProducts(filtered);
  };

  const handleSearch = (term) => {
    setSearchTerm(term);
    const filtered = products.filter(product =>
      product.status === filter &&
      (product.name.toLowerCase().includes(term.toLowerCase()) ||
        product.manufacturerId.companyName.toLowerCase().includes(term.toLowerCase()))
    );
    setFilteredProducts(filtered);
  };

  const handleApprove = (productId) => {
    setProducts(products.map(product =>
      product._id === productId
        ? { ...product, status: 'active' }
        : product
    ));
  };

  const handleRemove = (productId) => {
    setProducts(products.map(product =>
      product._id === productId
        ? { ...product, status: 'removed' }
        : product
    ));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 text-primary-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading products...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-500 to-primary-600 rounded-xl p-8 text-white shadow-lg">
        <h1 className="text-3xl font-bold mb-2">📦 Product Management</h1>
        <p className="text-primary-100">Approve, review, and manage all products on the platform</p>
      </div>

      {/* Error message */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
          <p className="text-red-700 font-medium">{error}</p>
        </div>
      )}

      {/* Search and Filter */}
      <div className="space-y-4">
        <input
          type="text"
          placeholder="Search products or manufacturers..."
          value={searchTerm}
          onChange={(e) => handleSearch(e.target.value)}
          className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        />

        <div className="flex space-x-3 flex-wrap">
          <button
            onClick={() => {
              setSearchTerm('');
              handleFilter('active');
            }}
            className={`px-6 py-2 rounded-lg font-semibold transition-colors ${
              filter === 'active'
                ? 'bg-green-500 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            ✅ Active ({products.filter(p => p.status === 'active').length})
          </button>
          <button
            onClick={() => {
              setSearchTerm('');
              handleFilter('pending');
            }}
            className={`px-6 py-2 rounded-lg font-semibold transition-colors ${
              filter === 'pending'
                ? 'bg-secondary-500 text-gray-900'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            ⏳ Pending ({products.filter(p => p.status === 'pending').length})
          </button>
          <button
            onClick={() => {
              setSearchTerm('');
              handleFilter('removed');
            }}
            className={`px-6 py-2 rounded-lg font-semibold transition-colors ${
              filter === 'removed'
                ? 'bg-red-500 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            ❌ Removed ({products.filter(p => p.status === 'removed').length})
          </button>
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProducts.length > 0 ? (
          filteredProducts.map((product) => (
            <div key={product._id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-all overflow-hidden border-l-4 border-primary-500">
              <div className="bg-gradient-to-r from-primary-50 to-secondary-50 p-4 border-b border-gray-200">
                <h3 className="text-lg font-bold text-gray-900">{product.name}</h3>
                <p className="text-sm text-gray-600">{product.category}</p>
              </div>

              <div className="p-4 space-y-3">
                <div>
                  <p className="text-xs text-gray-600 font-medium">Manufacturer</p>
                  <p className="font-semibold text-gray-900">{product.manufacturerId.companyName}</p>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-secondary-50 p-3 rounded">
                    <p className="text-xs text-gray-600">Price</p>
                    <p className="font-bold text-primary-600">₹{product.price}</p>
                  </div>
                  <div className="bg-accent-50 p-3 rounded">
                    <p className="text-xs text-gray-600">Stock</p>
                    <p className="font-bold text-accent-600">{product.stock}</p>
                  </div>
                </div>

                <div className="py-2 px-3 bg-gray-100 rounded">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                    product.status === 'active'
                      ? 'bg-green-100 text-green-800'
                      : product.status === 'pending'
                      ? 'bg-secondary-100 text-secondary-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {product.status.toUpperCase()}
                  </span>
                </div>

                {product.status === 'pending' && (
                  <div className="flex space-x-2 pt-2">
                    <button
                      onClick={() => handleApprove(product._id)}
                      className="flex-1 bg-green-500 hover:bg-green-600 text-white px-3 py-2 rounded font-semibold text-sm transition-colors"
                    >
                      ✅ Approve
                    </button>
                    <button
                      onClick={() => handleRemove(product._id)}
                      className="flex-1 bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded font-semibold text-sm transition-colors"
                    >
                      ❌ Reject
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full text-center py-12">
            <p className="text-gray-600 text-lg font-medium">No products found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminProducts;
