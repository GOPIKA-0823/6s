import { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { getMarketplaceProducts, createRequest } from '../../services/api';

/**
 * Retailer Send Request Page
 * 
 * Allows retailers to select a product and send a request to the manufacturer.
 * Robustly handles cases where product data might be missing or incomplete.
 */
const RetailerSendRequest = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const userData = localStorage.getItem('agaram_user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const initialProductId = searchParams.get('productId') || '';
  
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    productId: initialProductId,
    quantity: '',
    notes: '',
  });

  // Fetch products on mount
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await getMarketplaceProducts();
        
        // Ensure we handle different response formats safely
        const data = Array.isArray(response.data) ? response.data : [];
        setProducts(data);
        
        // If we have an initial productId, ensure it exists in the products list
        if (initialProductId && !data.find(p => p._id === initialProductId)) {
          console.warn(`Product ID ${initialProductId} not found in marketplace.`);
        }
      } catch (err) {
        console.error('Error fetching products:', err);
        setError('Failed to load products. Please try again.');
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [initialProductId]);

  // Derived state: Find the selected product from the current list and form state
  // useMemo ensures this only recalculates when relevant dependencies change
  const selectedProduct = useMemo(() => {
    if (!Array.isArray(products)) return null;
    return products.find(p => p._id === formData.productId) || null;
  }, [products, formData.productId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedProduct) {
      alert('Please select a valid product.');
      return;
    }

    if (!formData.quantity || parseInt(formData.quantity) < 1) {
      alert('Please enter a valid quantity (minimum 1).');
      return;
    }

    try {
      setIsSubmitting(true);
      const requestData = {
        productId: selectedProduct._id,
        manufacturerId: selectedProduct.manufacturerId?._id || selectedProduct.manufacturerId, // Handle both populated and unpopulated
        productName: selectedProduct.name,
        manufacturerName: selectedProduct.manufacturerId?.companyName || 'Unknown Manufacturer',
        retailerId: user?._id,
        retailerName: user?.companyName || 'Retail Store',
        quantity: parseInt(formData.quantity),
        unitPrice: selectedProduct.price,
        totalAmount: parseInt(formData.quantity) * selectedProduct.price,
        notes: formData.notes,
      };

      await createRequest(requestData);
      alert('Product request sent successfully!');
      navigate('/retailer/my-requests');
    } catch (err) {
      console.error('Error sending request:', err);
      alert(err.response?.data?.message || 'Error sending request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <div className="animate-spin h-10 w-10 text-primary-500 mb-4"></div>
        <p className="text-gray-600 font-medium">Loading marketplace products...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Send Product Request</h1>
          <p className="text-gray-600 font-medium">Create a new request for manufacturers</p>
        </div>
        <button 
          onClick={() => navigate('/retailer/marketplace')}
          className="text-primary-600 hover:text-primary-700 font-semibold flex items-center gap-2"
        >
          <span>← Back to Marketplace</span>
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg flex justify-between items-center shadow-sm">
          <p className="text-red-700 font-medium">{error}</p>
          <button onClick={() => window.location.reload()} className="text-red-700 underline font-bold">Retry</button>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-xl overflow-hidden animate-fade-in">
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Left Column: Product Selection */}
            <div className="space-y-6">
              <div>
                <label htmlFor="productId" className="block text-sm font-bold text-gray-700 mb-2">
                  Select Product *
                </label>
                <select
                  id="productId"
                  name="productId"
                  value={formData.productId}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all bg-gray-50"
                >
                  <option value="">Choose a product from marketplace...</option>
                  {products.map((product) => (
                    <option key={product._id} value={product._id}>
                      {product.name} - {product.manufacturerId?.companyName || 'Manufacturer'}
                    </option>
                  ))}
                </select>
              </div>

              {selectedProduct ? (
                <div className="bg-primary-50 border border-primary-100 rounded-xl p-6 space-y-4">
                  <h3 className="font-bold text-primary-900 border-b border-primary-200 pb-2 mb-2">Selected Product Details</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-primary-600 font-medium uppercase tracking-wider text-[10px]">Category</p>
                      <p className="font-bold text-gray-900">{selectedProduct.category}</p>
                    </div>
                    <div>
                      <p className="text-primary-600 font-medium uppercase tracking-wider text-[10px]">Unit Price</p>
                      <p className="font-bold text-gray-900 text-lg">₹{selectedProduct.price}</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-primary-600 font-medium uppercase tracking-wider text-[10px]">Manufacturer</p>
                      <p className="font-bold text-gray-900">{selectedProduct.manufacturerId?.companyName || 'Unknown'}</p>
                    </div>
                  </div>
                  {selectedProduct.description && (
                    <div className="pt-2">
                      <p className="text-primary-600 font-medium uppercase tracking-wider text-[10px]">Description</p>
                      <p className="text-gray-700 line-clamp-2">{selectedProduct.description}</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="border-2 border-dashed border-gray-200 rounded-xl p-12 text-center flex flex-col items-center justify-center">
                  <span className="text-4xl mb-2 opacity-50">📦</span>
                  <p className="text-gray-500 text-sm italic">Please select a product to see details and pricing</p>
                </div>
              )}
            </div>

            {/* Right Column: Request Details */}
            <div className="space-y-6">
              <div>
                <label htmlFor="quantity" className="block text-sm font-bold text-gray-700 mb-2">
                  Requested Quantity *
                </label>
                <div className="relative">
                  <input
                    type="number"
                    id="quantity"
                    name="quantity"
                    value={formData.quantity}
                    onChange={handleChange}
                    required
                    min="1"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all pl-12"
                    placeholder="Enter amount..."
                  />
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">#</span>
                </div>
                {selectedProduct && formData.quantity && (
                  <div className="mt-3 p-3 bg-orange-50 border border-orange-100 rounded-lg flex justify-between items-center text-sm">
                    <span className="text-orange-700 font-medium text-xs uppercase tracking-wider">Total Amount</span>
                    <div className="text-right">
                      <span className="text-xs text-gray-500 mr-2">({formData.quantity} × ₹{selectedProduct.price}) =</span>
                      <span className="text-xl font-black text-gray-900">₹{parseInt(formData.quantity) * selectedProduct.price}</span>
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label htmlFor="notes" className="block text-sm font-bold text-gray-700 mb-2">
                  Additional Notes (Optional)
                </label>
                <textarea
                  id="notes"
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  rows="4"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all resize-none"
                  placeholder="Special instructions, delivery preferences, etc..."
                />
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-gray-100 flex items-center justify-between">
            <p className="text-xs text-gray-500">* Required fields</p>
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => navigate('/retailer/marketplace')}
                className="px-8 py-3 rounded-lg text-gray-600 font-bold hover:bg-gray-50 transition-all active:scale-95"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !selectedProduct}
                className={`px-10 py-3 rounded-lg font-bold text-white shadow-lg transition-all active:scale-95 flex items-center gap-2 ${
                  isSubmitting || !selectedProduct
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-primary-600 hover:bg-primary-700 hover:shadow-primary-200'
                }`}
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                    <span>Sending...</span>
                  </>
                ) : (
                  <>
                    <span>🚀 Send Product Request</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RetailerSendRequest;