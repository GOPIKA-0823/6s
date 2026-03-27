import { useState, useEffect } from 'react';
import { getManufacturerOrders } from '../../services/api';

/**
 * Manufacturer Orders Page - South Indian Theme
 * 
 * Features:
 * - Display all orders from retailers
 * - Track order status (processing, shipped, delivered, completed)
 * - Real-time data fetching from API
 * - Error handling and loading states
 */
const ManufacturerOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Fetch orders from API on component mount
    const fetchOrders = async () => {
      try {
        const response = await getManufacturerOrders();
        setOrders(response.data);
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
        <h1 className="text-3xl font-bold mb-2">📦 Orders</h1>
        <p className="text-primary-100">Track and manage all your orders from retailers</p>
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
          <p className="text-gray-500 text-sm mt-2">Orders from retailers will appear here</p>
        </div>
      ) : (
        /* Orders Grid - Marketplace Style */
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {orders.map((order) => {
            const isCancelled = order.status === 'cancelled';
            const cancelTimestamp = order.statusTimeline?.find(s => s.stage === 'cancelled')?.timestamp;
            const cancelDate = cancelTimestamp
              ? new Date(cancelTimestamp).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })
              : new Date(order.createdAt).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' });

            // ── CANCELLED card layout ──────────────────────────────────────
            if (isCancelled) {
              return (
                <div key={order._id} className="bg-white rounded-xl shadow p-6 flex flex-col border border-gray-100">
                  {/* Cancelled header */}
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-9 h-9 rounded-full border-2 border-red-400 flex items-center justify-center text-red-400 text-base font-bold">✕</div>
                    <div>
                      <h3 className="font-bold text-gray-900 text-base">Cancelled</h3>
                      <p className="text-xs text-gray-400">on {cancelDate} as per your request</p>
                    </div>
                  </div>

                  {/* Items */}
                  <div className="space-y-2 mb-4 border-t border-gray-50 pt-3">
                    {order.items?.map((item, i) => (
                      <div key={i} className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center text-sm">📦</div>
                          <div>
                            <p className="text-sm font-medium text-gray-800">{item.name || item.productName}</p>
                            <p className="text-xs text-gray-400">Qty: {item.quantity}</p>
                          </div>
                        </div>
                        <span className="text-gray-400 text-xs">›</span>
                      </div>
                    ))}
                  </div>

                  {/* Refund amount & footer */}
                  <div className="mt-auto pt-3 border-t border-gray-100 flex justify-between items-end">
                    <div>
                      <p className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">Refund Amount</p>
                      <p className="text-lg font-bold text-gray-900">₹{order.totalAmount?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
                    </div>
                    <p className="text-xs text-gray-400 italic">Order Terminated</p>
                  </div>
                </div>
              );
            }

            // ── NORMAL card layout ─────────────────────────────────────────
            return (
              <div key={order._id} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 flex flex-col border border-gray-100">
                {/* Card Header */}
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 leading-tight">Order #{order._id?.substring(0, 8).toUpperCase()}</h3>
                    <p className="text-gray-400 text-[10px] uppercase tracking-widest mt-1">
                      {new Date(order.createdAt).toLocaleDateString('en-IN')}
                    </p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black tracking-tighter ${
                    order.status === 'delivered' ? 'bg-green-100 text-green-700'
                    : order.status === 'shipped' ? 'bg-blue-100 text-blue-700'
                    : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {order.status?.toUpperCase() || 'PLACED'}
                  </span>
                </div>

                {/* Retailer Info */}
                <div className="mb-4">
                  <div className="flex items-center space-x-1">
                    <p className="text-primary-600 font-bold text-sm">🏪 {order.retailerId?.companyName || 'Unknown Retailer'}</p>
                    {order.retailerId?.isVerified && (
                      <span className="text-blue-500" title="Verified Retailer">
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

                {/* Item List */}
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

                <div className="mt-auto pt-4 border-t border-gray-100" />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ManufacturerOrders;