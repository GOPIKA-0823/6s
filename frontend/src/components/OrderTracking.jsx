import { useState, useEffect } from 'react';
import { getOrderTracking, updateOrderStatus } from '../../services/api';

/**
 * Order Tracking Component
 * 
 * Features:
 * - Visual progress tracker showing order stages
 * - Detailed timeline of status updates
 * - Status update functionality (for manufacturers)
 * - Real-time tracking information
 */

// Order status stages in order
const ORDER_STAGES = [
  { id: 'order-placed', label: 'Order Placed', icon: '📋' },
  { id: 'processing', label: 'Processing', icon: '⚙️' },
  { id: 'packed', label: 'Packed', icon: '📦' },
  { id: 'shipped', label: 'Shipped', icon: '🚚' },
  { id: 'delivered', label: 'Delivered', icon: '✅' },
];

const OrderTracking = ({ orderId, userType, isManufacturer }) => {
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState('');
  const [updateNotes, setUpdateNotes] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    fetchOrderTracking();
  }, [orderId]);

  const fetchOrderTracking = async () => {
    try {
      setLoading(true);
      const response = await getOrderTracking(orderId);
      setOrder(response.data);
      setSelectedStatus(response.data.currentStatus);
      setError(null);
    } catch (err) {
      console.error('Error fetching order tracking:', err);
      setError('Failed to load order tracking information');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async () => {
    if (!selectedStatus || selectedStatus === order.currentStatus) {
      setError('Please select a different status');
      return;
    }

    try {
      setIsUpdating(true);
      await updateOrderStatus(orderId, {
        newStatus: selectedStatus,
        notes: updateNotes
      });
      
      // Refresh order data
      await fetchOrderTracking();
      setUpdateNotes('');
      setError(null);
    } catch (err) {
      console.error('Error updating order status:', err);
      setError('Failed to update order status');
    } finally {
      setIsUpdating(false);
    }
  };

  const getStageIndex = (statusId) => {
    return ORDER_STAGES.findIndex(stage => stage.id === statusId);
  };

  const currentStageIndex = getStageIndex(order?.currentStatus);
  const isCompleted = (stageId) => getStageIndex(stageId) <= currentStageIndex;
  const isActive = (stageId) => stageId === order?.currentStatus;

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="inline-block mb-4">
          <div className="animate-spin h-12 w-12 text-primary-500"></div>
        </div>
        <p className="text-gray-600">Loading order tracking...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
        <p className="text-red-700 font-medium">{error || 'Order not found'}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Error message */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
          <p className="text-red-700 font-medium">{error}</p>
        </div>
      )}

      {/* Order Header */}
      <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-primary-500">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="text-sm text-gray-600 font-medium">Order ID</p>
            <p className="text-lg font-bold text-gray-900">{orderId.substring(0, 8)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 font-medium">Created</p>
            <p className="text-lg font-bold text-gray-900">{new Date(order.createdAt).toLocaleDateString('en-IN')}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 font-medium">Amount</p>
            <p className="text-lg font-bold text-primary-600">₹{order.totalAmount}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 font-medium">Current Status</p>
            <p className="text-lg font-bold text-secondary-600">{ORDER_STAGES.find(s => s.id === order.currentStatus)?.label}</p>
          </div>
        </div>
      </div>

      {/* Visual Progress Tracker */}
      <div className="bg-white rounded-lg shadow-lg p-8">
        <h3 className="text-xl font-bold text-gray-900 mb-8">📍 Order Progress Tracker</h3>
        
        <div className="relative">
          {/* Progress line */}
          <div className="absolute top-6 left-0 right-0 h-1 bg-gray-200">
            <div
              className="h-full bg-gradient-to-r from-primary-500 to-secondary-400 transition-all duration-500"
              style={{
                width: `${currentStageIndex >= 0 ? ((currentStageIndex / (ORDER_STAGES.length - 1)) * 100) : 0}%`
              }}
            ></div>
          </div>

          {/* Stages */}
          <div className="flex justify-between relative z-10">
            {ORDER_STAGES.map((stage, index) => {
              const completed = isCompleted(stage.id);
              const active = isActive(stage.id);

              return (
                <div key={stage.id} className="flex flex-col items-center flex-1">
                  {/* Stage circle */}
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold transition-all duration-300 ${
                      completed
                        ? 'bg-gradient-to-r from-primary-500 to-secondary-400 text-white shadow-lg'
                        : 'bg-gray-200 text-gray-600'
                    } ${active ? 'ring-4 ring-primary-300 scale-110' : ''}`}
                  >
                    {stage.icon}
                  </div>

                  {/* Stage label */}
                  <p className={`mt-3 text-xs font-semibold text-center transition-all ${
                    completed ? 'text-gray-900' : 'text-gray-500'
                  }`}>
                    {stage.label}
                  </p>

                  {/* Timestamp */}
                  {order.statusTimeline && order.statusTimeline.find(s => s.stage === stage.id) && (
                    <p className="mt-1 text-xs text-gray-500">
                      {new Date(order.statusTimeline.find(s => s.stage === stage.id).timestamp).toLocaleDateString('en-IN')}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Status Timeline */}
      {order.statusTimeline && order.statusTimeline.length > 0 && (
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h3 className="text-xl font-bold text-gray-900 mb-6">📅 Status Timeline</h3>
          
          <div className="space-y-4">
            {order.statusTimeline.map((timeline, index) => (
              <div key={index} className="flex items-start space-x-4 pb-4 border-b border-gray-200 last:border-b-0">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-10 w-10 rounded-full bg-primary-100">
                    <span className="text-primary-600 font-bold text-sm">{index + 1}</span>
                  </div>
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">
                    {ORDER_STAGES.find(s => s.id === timeline.stage)?.label}
                  </p>
                  <p className="text-sm text-gray-600">
                    {new Date(timeline.timestamp).toLocaleString('en-IN')}
                  </p>
                  {timeline.notes && (
                    <p className="text-sm text-gray-700 mt-2 bg-gray-50 p-2 rounded">
                      💬 {timeline.notes}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Status Update Form (for manufacturers) */}
      {isManufacturer && order.currentStatus !== 'delivered' && order.currentStatus !== 'cancelled' && (
        <div className="bg-white rounded-lg shadow-lg p-8 border-l-4 border-secondary-400">
          <h3 className="text-xl font-bold text-gray-900 mb-6">🔄 Update Order Status</h3>
          
          <div className="space-y-6">
            {/* Status selector */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">Next Status</label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="">Select Status</option>
                {ORDER_STAGES.filter(stage => getStageIndex(stage.id) > currentStageIndex).map(stage => (
                  <option key={stage.id} value={stage.id}>
                    {stage.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">Update Notes (Optional)</label>
              <textarea
                value={updateNotes}
                onChange={(e) => setUpdateNotes(e.target.value)}
                placeholder="Add any notes about this status update..."
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                rows={3}
              />
            </div>

            {/* Update button */}
            <button
              onClick={handleStatusUpdate}
              disabled={isUpdating || !selectedStatus || selectedStatus === order.currentStatus}
              className="w-full bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white font-bold py-3 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
            >
              {isUpdating ? '⏳ Updating...' : '✅ Update Status'}
            </button>
          </div>
        </div>
      )}

      {/* Order Items */}
      <div className="bg-white rounded-lg shadow-lg p-8">
        <h3 className="text-xl font-bold text-gray-900 mb-6">📦 Order Items</h3>
        
        <div className="space-y-3">
          {order.items && order.items.map((item, index) => (
            <div key={index} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="font-semibold text-gray-900">{item.name}</p>
                <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
              </div>
              <p className="font-bold text-primary-600">₹{(item.price * item.quantity).toFixed(2)}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default OrderTracking;
