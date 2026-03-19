import { useState, useEffect } from 'react';
import { getManufacturerProducts, createProduct, updateProduct, deleteProduct } from '../../services/api';

/**
 * Manufacturer Products Page - South Indian Food Theme
 * 
 * Features:
 * - Grid display of South Indian food products
 * - Color scheme: Banana leaf green, turmeric yellow, spice orange
 * - Add, edit, delete products
 * - Real-time product management
 */
const ManufacturerProducts = () => {
  const [products, setProducts] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    description: '',
    price: '',
    stock: '',
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await getManufacturerProducts();
      setProducts(response.data);
    } catch (err) {
      console.error('Error fetching products:', err);
      setError('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const handleAddProduct = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      category: '',
      description: '',
      price: '',
      stock: '',
    });
    setShowAddModal(true);
  };

  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      category: product.category,
      description: product.description,
      price: product.price,
      stock: product.stock,
    });
    setShowAddModal(true);
  };

  const handleDeleteProduct = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await deleteProduct(id);
        setProducts(products.filter(p => p._id !== id));
      } catch (err) {
        console.error('Error deleting product:', err);
        setError('Failed to delete product');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form fields
    if (!formData.name.trim()) {
      setError('Product name is required');
      return;
    }
    if (!formData.category) {
      setError('Please select a category');
      return;
    }
    if (!formData.description.trim()) {
      setError('Product description is required');
      return;
    }
    if (!formData.price || formData.price <= 0) {
      setError('Price must be greater than 0');
      return;
    }
    if (!formData.stock || formData.stock < 0) {
      setError('Stock must be 0 or greater');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      
      if (editingProduct) {
        const response = await updateProduct(editingProduct._id, formData);
        setProducts(products.map(p => p._id === editingProduct._id ? response.data : p));
      } else {
        const response = await createProduct(formData);
        setProducts([response.data, ...products]);
      }
      setShowAddModal(false);
    } catch (err) {
      console.error('Error saving product:', err);
      const errorMessage = err.response?.data?.message || 'Failed to save product. Please try again.';
      setError(errorMessage);
      alert(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Get category-specific icon/emoji for South Indian products
  const getCategoryEmoji = (category) => {
    const categoryMap = {
      'Beverages': '☕',
      'Food Grains': '🌾',
      'Oils': '🫗',
      'Spices': '🌶️',
      'Sweeteners': '🍯',
      'Snacks': '🍌',
    };
    return categoryMap[category] || '🎁';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-500 to-primary-600 rounded-xl p-8 text-white shadow-lg">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold mb-2">My Products</h1>
            <p className="text-primary-100">Manage your South Indian food catalog</p>
          </div>
          <button
            onClick={handleAddProduct}
            className="bg-secondary-400 hover:bg-secondary-500 text-gray-900 px-6 py-3 rounded-lg font-bold transition-colors shadow-lg"
          >
            + Add Product
          </button>
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
          <p className="text-red-700 font-medium">{error}</p>
        </div>
      )}

      {/* Products Grid */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block">
            <div className="animate-spin h-8 w-8 text-primary-500"></div>
          </div>
          <p className="text-gray-600 mt-2">Loading your products...</p>
        </div>
      ) : products.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <div key={product._id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden border-l-4 border-primary-500">
              {/* Product Header with Category */}
              <div className="bg-gradient-to-r from-primary-50 to-secondary-50 p-4 border-b-2 border-secondary-200">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-3xl mb-2">{getCategoryEmoji(product.category)}</p>
                    <h3 className="text-xl font-bold text-gray-900">{product.name}</h3>
                    <p className="text-primary-600 font-semibold text-sm">{product.category}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                    product.status === 'active' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {product.status.toUpperCase()}
                  </span>
                </div>
              </div>

              {/* Product Details */}
              <div className="p-4 space-y-3">
                <p className="text-gray-700 text-sm">{product.description}</p>
                
                <div className="grid grid-cols-2 gap-4 py-2 border-y border-gray-200">
                  <div className="bg-secondary-50 p-3 rounded">
                    <p className="text-xs text-gray-600 font-medium">Price per Unit</p>
                    <p className="text-xl font-bold text-secondary-600">₹{product.price}</p>
                  </div>
                  <div className="bg-accent-50 p-3 rounded">
                    <p className="text-xs text-gray-600 font-medium">Stock Available</p>
                    <p className="text-xl font-bold text-accent-600">{product.stock} units</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2">
                  <button 
                    onClick={() => handleEditProduct(product)}
                    className="bg-primary-100 hover:bg-primary-200 text-primary-700 px-3 py-2 rounded font-semibold text-sm transition-colors"
                  >
                    ✏️ Edit
                  </button>
                  <button 
                    onClick={() => handleDeleteProduct(product._id)}
                    className="bg-red-100 hover:bg-red-200 text-red-700 px-3 py-2 rounded font-semibold text-sm transition-colors"
                  >
                    🗑️ Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <p className="text-gray-600 text-lg font-medium">No products yet</p>
          <p className="text-gray-500 text-sm mt-2">Start adding your South Indian food products</p>
          <button
            onClick={handleAddProduct}
            className="mt-6 bg-primary-500 hover:bg-primary-600 text-white px-6 py-2 rounded-lg font-semibold transition-colors"
          >
            Add Your First Product
          </button>
        </div>
      )}

      {/* Add/Edit Product Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-8 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-primary-700 mb-6">
              {editingProduct ? '✏️ Edit Product' : '➕ Add New Product'}
            </h2>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded mb-4 text-sm">
                {error}
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Product Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g., Filter Coffee Powder"
                  required
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Category</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="">Select Category</option>
                  <option value="Beverages">☕ Beverages</option>
                  <option value="Food Grains">🌾 Food Grains</option>
                  <option value="Oils">🫗 Oils</option>
                  <option value="Spices">🌶️ Spices</option>
                  <option value="Sweeteners">🍯 Sweeteners</option>
                  <option value="Snacks">🍌 Snacks</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Describe your product..."
                  required
                  rows={3}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Price (₹)</label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    required
                    step="0.01"
                    placeholder="100"
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-secondary-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Stock</label>
                  <input
                    type="number"
                    name="stock"
                    value={formData.stock}
                    onChange={handleChange}
                    required
                    placeholder="50"
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-secondary-500 focus:border-transparent"
                  />
                </div>
              </div>
              <div className="flex space-x-4 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  disabled={submitting}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-3 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 bg-primary-500 hover:bg-primary-600 text-white px-4 py-3 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting 
                    ? (editingProduct ? '💾 Updating...' : '💾 Adding...') 
                    : (editingProduct ? 'Update Product' : 'Add Product')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManufacturerProducts;