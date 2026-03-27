import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getRetailerOrders } from '../../services/api';

/**
 * Retailer Orders Page - South Indian Theme
 * 
 * Features:
 * - Display all orders placed by retailer
 * - Track order status (processing, shipped, delivered)
 * - Real-time data fetching from API
 * - Error handling and loading states
 */
const RetailerOrders = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Review Modal State
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewOrder, setReviewOrder] = useState(null);
  const [reviewRating, setReviewRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [reviewedOrders, setReviewedOrders] = useState({}); // { orderId: rating }

  useEffect(() => {
    // Fetch orders from API on component mount
    const fetchOrders = async () => {
      try {
        const response = await getRetailerOrders();
        
        // Mock a delivered order if list is empty or for demonstration
        const mockDelivered = {
          _id: 'mock_del_123',
          status: 'delivered',
          createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          manufacturerName: 'Healthy Harvests',
          items: [
            { name: 'Organic Honey', quantity: 2, price: 250 },
            { name: 'Cold Pressed Coconut Oil', quantity: 1, price: 350 }
          ],
          totalAmount: 850,
          paymentMethod: 'UPI',
          paymentStatus: 'paid'
        };

        setOrders([mockDelivered, ...response.data]);
        setError(null);
      } catch (err) {
        console.error('Error fetching orders:', err);
        setError('Failed to load orders. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const handleOpenReview = (order) => {
    setReviewOrder(order);
    setReviewRating(reviewedOrders[order._id] || 0);
    setReviewText('');
    setShowReviewModal(true);
  };

  const handleSubmitReview = () => {
    if (reviewRating === 0) {
      alert("Please select a star rating first.");
      return;
    }
    
    // In a real app, this would be an API call
    setReviewedOrders(prev => ({
      ...prev,
      [reviewOrder._id]: reviewRating
    }));
    
    setShowReviewModal(false);
    
    // Show a success message
    setTimeout(() => {
      alert("Review submitted successfully! Thank you for your feedback.");
    }, 100);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block mb-4">
            <div className="animate-spin h-12 w-12 text-primary-500"></div>
          </div>
          <p className="text-gray-600 text-lg font-medium">Loading your orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-500 to-primary-600 rounded-xl p-8 text-white shadow-lg">
        <h1 className="text-3xl font-bold mb-2">🛒 My Orders</h1>
        <p className="text-primary-100">Track and manage all your product orders</p>
      </div>

      {/* Error message */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
          <p className="text-red-700 font-medium">{error}</p>
        </div>
      )}

      {/* Empty state */}
      {orders.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <p className="text-gray-600 text-lg font-medium">No orders yet</p>
          <p className="text-gray-500 text-sm mt-2">Your orders will appear here once placed</p>
        </div>
      ) : (
        /* Orders Grid - Marketplace Style */
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {orders.map((order) => (
            <div key={order._id} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 flex flex-col border border-gray-100">
              {order.status === 'cancelled' ? (
                /* Cancelled Order View (Previously Implemented) */
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 text-xs">✕</div>
                    <div>
                       <h3 className="font-bold text-gray-900 leading-tight">Cancelled</h3>
                       <p className="text-[10px] text-gray-500 font-medium">
                         on {new Date(order.updatedAt || order.createdAt).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })} as per your request
                       </p>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50/50 rounded-lg p-3 flex justify-between items-center border border-gray-100/50">
                    <div className="flex items-center gap-3 overflow-hidden">
                       <div className="w-12 h-12 bg-gray-200 rounded flex-shrink-0 flex items-center justify-center text-lg">📦</div>
                       <div className="truncate">
                          <p className="text-xs font-bold text-gray-700 truncate">{order.items?.[0]?.name || order.items?.[0]?.productName}</p>
                          <p className="text-[10px] text-gray-400">Qty: {order.items?.[0]?.quantity}</p>
                       </div>
                    </div>
                    <span className="text-gray-400 text-sm">›</span>
                  </div>

                  <div className="pt-2 flex justify-between items-end">
                    <div>
                      <p className="text-[9px] text-gray-400 font-black uppercase">Refund Amount</p>
                      <p className="text-xl font-black text-gray-400">₹{order.totalAmount?.toFixed(2)}</p>
                    </div>
                    <span className="text-[10px] font-bold text-gray-300 italic">Order Terminated</span>
                  </div>
                </div>
              ) : order.status === 'delivered' ? (
                /* Delivered Order View (New) */
                <div className="space-y-6">
                  {/* Status Header */}
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gray-900 border-2 border-white shadow-md flex items-center justify-center relative">
                      <span className="text-xl">📦</span>
                      <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white flex items-center justify-center text-[10px] text-white font-bold">✓</div>
                    </div>
                    <div>
                       <h3 className="font-bold text-green-600 leading-tight">Delivered</h3>
                       <p className="text-xs text-gray-500 font-medium">
                         On {new Date(order.updatedAt || order.createdAt).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}
                       </p>
                    </div>
                  </div>

                  {/* Product Details Wrapper */}
                  <div className="bg-gray-50 border border-gray-100 rounded-xl p-4">
                    <div className="flex gap-4 mb-4">
                       <div className="w-16 h-16 bg-white rounded-lg shadow-sm flex items-center justify-center text-3xl">📦</div>
                       <div className="flex-grow">
                          <div className="flex items-center space-x-1">
                            <h4 className="font-bold text-gray-800 text-sm">{order.manufacturerName || order.manufacturerId?.companyName}</h4>
                            {order.manufacturerId?.isVerified && (
                              <span className="text-blue-500" title="Verified Manufacturer">
                                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                                  <path d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.64.3 1.248.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" />
                                </svg>
                              </span>
                            )}
                          </div>
                          <p className="text-gray-500 text-xs mt-1 truncate max-w-[150px]">{order.items?.[0]?.name}</p>
                          <p className="text-[10px] text-gray-400 font-bold mt-1 uppercase tracking-tight">Quantity: {order.items?.[0]?.quantity}</p>
                       </div>
                       <div className="text-gray-400">›</div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-wrap gap-2 pt-2">
                       <button 
                         onClick={() => navigate(`/retailer/return-order/${order._id}`, { state: { order } })}
                         className="flex-1 bg-white border border-gray-200 py-2.5 px-2 rounded-lg text-[10px] font-black text-gray-700 flex items-center justify-center gap-1 shadow-sm hover:bg-gray-50 transition-colors"
                       >
                         <span>↩</span> Return
                       </button>
                       <button 
                        onClick={() => navigate('/retailer/bills', { state: { order } })}
                        className="flex-1 bg-blue-50 border border-blue-100 py-2.5 px-2 rounded-lg text-[10px] font-black text-blue-700 flex items-center justify-center gap-1 shadow-sm hover:bg-blue-100 transition-colors"
                       >
                         <span>📄</span> Bill
                       </button>
                    </div>
                  </div>

                  {/* Eligibility Notice */}
                  <div className="flex items-center gap-2 px-1">
                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                    <p className="text-[11px] text-gray-500 font-medium">
                      Replacement / Refund available till {new Date(new Date(order.updatedAt || order.createdAt).getTime() + 4 * 24 * 60 * 60 * 1000).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                    </p>
                  </div>

                  {/* Rating Section */}
                  <div className="bg-white rounded-xl border border-gray-100 p-4 space-y-3">
                     <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-yellow-50 rounded-full flex items-center justify-center text-xl shadow-inner">🏆</div>
                        <div className="flex-grow">
                          <div className="flex gap-1">
                            {[1, 2, 3, 4, 5].map(star => {
                              const isFilled = reviewedOrders[order._id] ? star <= reviewedOrders[order._id] : false;
                              return (
                                <span 
                                  key={star} 
                                  onClick={() => handleOpenReview(order)}
                                  className={`text-xl cursor-pointer transition-colors ${isFilled ? 'text-yellow-400' : 'text-gray-200 hover:text-yellow-400'}`}
                                >
                                  {isFilled ? '★' : '☆'}
                                </span>
                              );
                            })}
                          </div>
                          <p className="text-xs mt-1 text-gray-600 font-medium">Rate & Review</p>
                        </div>
                     </div>
                  </div>
                </div>
              ) : (
                /* Standard Order View (Placed, Shipped, etc.) */
                <>
                  {/* Card Header: Order ID & Status */}
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 leading-tight">Order #{order._id?.substring(0, 8).toUpperCase()}</h3>
                      <p className="text-gray-400 text-[10px] uppercase tracking-widest mt-1">
                        {new Date(order.createdAt).toLocaleDateString('en-IN')}
                      </p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black tracking-tighter ${
                      order.status === 'delivered'
                        ? 'bg-green-100 text-green-700'
                        : order.status === 'shipped'
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {order.status?.toUpperCase() || 'PLACED'}
                    </span>
                  </div>

                  {/* Manufacturer Info */}
                  <div className="mb-4">
                    <div className="flex items-center space-x-1">
                      <p className="text-primary-600 font-bold text-sm">🏭 {order.manufacturerId?.companyName || 'Unknown Manufacturer'}</p>
                      {order.manufacturerId?.isVerified && (
                        <span className="text-blue-500" title="Verified Manufacturer">
                          <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.64.3 1.248.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" />
                          </svg>
                        </span>
                      )}
                    </div>
                    <div className="flex gap-2 mt-2">
                      <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded font-bold uppercase">{order.paymentMethod || 'COD'}</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${order.paymentStatus === 'paid' ? 'bg-green-50 text-green-600' : 'bg-orange-50 text-orange-600'}`}>
                          {order.paymentStatus || 'PENDING'}
                      </span>
                    </div>
                  </div>

                  {/* Item List Summary */}
                  <div className="flex-grow space-y-2 mb-6 border-t border-gray-50 pt-4">
                    {order.items?.slice(0, 3).map((item, index) => (
                      <div key={index} className="flex justify-between items-center bg-gray-50/50 p-2 rounded text-xs">
                        <span className="text-gray-700 font-medium truncate pr-4">{item.name || item.productName}</span>
                        <span className="text-gray-400 whitespace-nowrap">x{item.quantity}</span>
                      </div>
                    ))}
                    {order.items?.length > 3 && (
                      <p className="text-center text-[10px] text-gray-400 font-bold">+ {order.items.length - 3} more items</p>
                    )}
                  </div>

                  {/* Price & Actions */}
                  <div className="mt-auto pt-4 border-t border-gray-100">
                    <div className="flex justify-between items-end mb-4">
                      <div>
                        <p className="text-[10px] text-gray-400 font-bold uppercase">Total Amount</p>
                        <p className="text-2xl font-black text-gray-900">₹{order.totalAmount?.toFixed(2)}</p>
                      </div>
                    </div>
                    <div className="w-full">
                      <button 
                        onClick={() => navigate(`/retailer/cancel-order/${order._id}`, { state: { order } })}
                        className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-lg font-bold text-xs transition-colors"
                      >
                        Cancel Order
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Review Modal */}
      {showReviewModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center animate-fade-in p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-2xl relative">
            <button 
              onClick={() => setShowReviewModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
            
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-yellow-50 rounded-full flex items-center justify-center text-3xl mx-auto mb-3 shadow-inner">
                🏆
              </div>
              <h2 className="text-xl font-bold text-gray-900">Rate & Review</h2>
              <p className="text-sm text-gray-500 mt-1">
                How was your experience with <br/><span className="font-bold text-gray-700">{reviewOrder?.items?.[0]?.name || reviewOrder?.items?.[0]?.productName}</span>?
              </p>
            </div>

            {/* Editable Stars */}
            <div className="flex justify-center gap-2 mb-6">
              {[1, 2, 3, 4, 5].map(star => {
                const isActive = star <= (hoverRating || reviewRating);
                return (
                  <button
                    key={star}
                    type="button"
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    onClick={() => setReviewRating(star)}
                    className={`text-4xl transition-all ${isActive ? 'text-yellow-400 scale-110' : 'text-gray-200 hover:scale-110'}`}
                  >
                    ★
                  </button>
                );
              })}
            </div>

            <textarea
              placeholder="Tell us what you loved (optional)"
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all resize-none min-h-[100px]"
            ></textarea>

            <button 
              onClick={handleSubmitReview}
              disabled={reviewRating === 0}
              className={`w-full mt-4 py-3 rounded-xl font-bold text-white transition-all shadow-md ${reviewRating === 0 ? 'bg-gray-300 cursor-not-allowed' : 'bg-primary-600 hover:bg-primary-700 active:scale-95'}`}
            >
              Submit Review
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default RetailerOrders;