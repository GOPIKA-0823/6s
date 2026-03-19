import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { updateOrderStatus } from '../../services/api';

/**
 * Cancel Order Page 
 * 
 * Features:
 * - Product summary (Food product details)
 * - Reason selection (Radio buttons)
 * - Refund amount display
 * - Policy mockup
 */
const CancelOrderPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const order = location.state?.order;

  const [selectedReason, setSelectedReason] = useState('');
  const [comments, setComments] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sample reasons from user request
  const reasons = [
    "Delayed Delivery Cancellation",
    "Incorrect item ordered",
    "Duplicate Order",
    "Food not required anymore",
    "Payment / Cash issue",
    "Ordered by mistake",
    "Wants to change item"
  ];

  if (!order) {
    navigate('/retailer/orders');
    return null;
  }

  const handleCancelRequest = async () => {
    if (!selectedReason) {
      alert('Please select a reason for cancellation');
      return;
    }

    try {
      setIsSubmitting(true);
      
      const payload = {
        newStatus: 'cancelled',
        notes: `Cancelled by Retailer. Reason: ${selectedReason}. ${comments ? 'Comments: ' + comments : ''}`
      };

      await updateOrderStatus(order._id, payload);
      
      alert('Order cancelled successfully.');
      navigate('/retailer/orders');
      
    } catch (err) {
      console.error('Error cancelling order:', err);
      alert(err.response?.data?.message || 'Failed to cancel order. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in pb-12">
      {/* Header */}
      <div className="flex items-center gap-4 py-2">
        <button onClick={() => navigate(-1)} className="text-2xl text-gray-800">←</button>
        <h1 className="text-xl font-bold text-gray-800">Cancel Order</h1>
      </div>

      {/* Product Summary Card */}
      <div className="bg-gray-50/50 rounded-2xl p-6 flex gap-4 border border-gray-100">
        <div className="w-20 h-20 bg-gray-200 rounded-lg flex items-center justify-center text-2xl">
          📦
        </div>
        <div className="flex-grow">
          <h3 className="font-bold text-gray-800 text-lg">
            {order.items?.[0]?.name || "Product Details"}
          </h3>
          <p className="text-gray-500 text-sm mt-1">
            Quantity: {order.items?.[0]?.quantity || 0}
          </p>
          <p className="font-bold text-gray-900 mt-2 text-lg">
            ₹{order.totalAmount?.toFixed(2)}
          </p>
        </div>
      </div>

      {/* Policy Section */}
      <div className="flex items-center justify-between py-4 border-b border-gray-100">
        <div className="flex items-center gap-2 text-primary-600 font-bold text-sm">
          <span className="text-lg">🔄</span> Eligible for cancellation
        </div>
        <button className="text-pink-500 font-black text-xs uppercase tracking-wider">
          View Policy
        </button>
      </div>

      {/* Reasons Section */}
      <div className="space-y-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Reason for cancellation</h2>
          <p className="text-gray-500 text-sm mt-1">
            Please tell us correct reason for cancellation. This information is only used to improve our service.
          </p>
        </div>

        <div className="space-y-4 pt-4">
          <h3 className="font-bold text-gray-800 text-sm">Select Reason <span className="text-orange-500">*</span></h3>
          <div className="space-y-6">
            {reasons.map((reason) => (
              <label key={reason} className="flex items-center gap-4 cursor-pointer group">
                <div className="relative">
                  <input 
                    type="radio" 
                    name="reason" 
                    value={reason}
                    checked={selectedReason === reason}
                    onChange={(e) => setSelectedReason(e.target.value)}
                    className="sr-only"
                  />
                  <div className={`w-6 h-6 rounded-full border-2 transition-all flex items-center justify-center ${
                    selectedReason === reason ? 'border-gray-900' : 'border-gray-300'
                  }`}>
                    {selectedReason === reason && <div className="w-3 h-3 bg-gray-900 rounded-full"></div>}
                  </div>
                </div>
                <span className={`font-medium transition-colors ${
                  selectedReason === reason ? 'text-gray-900' : 'text-gray-500 group-hover:text-gray-700'
                }`}>
                  {reason}
                </span>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Additional Comments */}
      <div className="pt-6">
        <textarea 
          placeholder="Additional Comments"
          className="w-full border-b border-gray-200 py-3 outline-none focus:border-pink-500 transition-colors text-sm"
          value={comments}
          onChange={(e) => setComments(e.target.value)}
        />
      </div>

      {/* Footer Actions */}
      <div className="pt-8 flex items-center justify-between border-t border-gray-100 mt-12 bg-white sticky bottom-0 py-4">
        <div>
          <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Refund Details</p>
          <p className="text-2xl font-black text-gray-900">₹{order.totalAmount?.toFixed(2)}</p>
        </div>
        <button 
          onClick={handleCancelRequest}
          disabled={!selectedReason || isSubmitting}
          className="bg-pink-500 hover:bg-pink-600 disabled:bg-gray-200 text-white px-10 py-5 rounded-lg font-black text-sm uppercase tracking-tighter flex items-center gap-3 transition-all relative overflow-hidden"
        >
          {isSubmitting ? "Processing..." : "Request Cancellation"}
          {!isSubmitting && <span className="text-xl">→</span>}
        </button>
      </div>
    </div>
  );
};

export default CancelOrderPage;
