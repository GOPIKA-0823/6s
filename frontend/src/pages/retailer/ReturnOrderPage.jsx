import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { updateOrderStatus } from '../../services/api';

/**
 * Return Order Page - eCommerce Style
 * 
 * Features matching user screenshots:
 * - Product Details header with "Eligible for return till..."
 * - List of standard eCommerce return reasons
 * - "Why are you returning?" descriptive block
 * - Additional Comments
 * - "PICKUP DETAILS ->" progression button (acting as completion for now)
 */
const ReturnOrderPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const order = location.state?.order;

  const [selectedReason, setSelectedReason] = useState('');
  const [comments, setComments] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Exact reasons matching the user's screenshot
  const reasons = [
    "Received a wrong or defective product",
    "Image shown did not match the actual product",
    "Quality Issues",
    "I Changed my mind",
    "Size or fit issues"
  ];

  if (!order) {
    navigate('/retailer/orders');
    return null;
  }

  const handleReturnRequest = () => {
    if (!selectedReason) {
      alert('Please select a reason for return');
      return;
    }

    // Navigate to Address selection page in 'pickup' mode
    navigate('/retailer/address', {
      state: {
        request: true, // Bypass the 'no request' boundary block on AddressPage
        mode: 'pickup',
        order,
        returnReason: selectedReason,
        returnComments: comments
      }
    });
  };

  return (
    <div className="max-w-md mx-auto bg-gray-50 min-h-screen pb-20 animate-fade-in font-sans">
      {/* Header */}
      <div className="flex items-center gap-4 py-4 px-4 bg-white sticky top-0 z-10 shadow-sm">
        <button onClick={() => navigate(-1)} className="text-2xl text-gray-800">←</button>
        <h1 className="text-lg font-bold text-gray-800">Return Order</h1>
      </div>

      <div className="space-y-2 pt-2">
        {/* Product Details Block */}
        <div className="bg-white p-4 flex gap-4">
          <div className="w-24 h-24 bg-gray-100 rounded-lg flex items-center justify-center text-4xl border border-gray-200 shadow-sm flex-shrink-0">
            📦
          </div>
          <div className="flex-grow">
            <h3 className="font-bold text-gray-900 text-sm leading-tight">
              {order.manufacturerName || order.manufacturerId?.companyName || "Manufacturer"}
            </h3>
            <p className="text-gray-500 text-xs mt-1 truncate max-w-[200px]">
               {order.items?.[0]?.name || "Product Name"}
            </p>
            <p className="text-gray-500 text-[10px] mt-1">
              Quantity: {order.items?.[0]?.quantity || 1}
            </p>
            <div className="mt-2 text-sm flex items-center gap-2">
               <span className="font-black text-gray-900">₹{order.totalAmount?.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Eligibility Header */}
        <div className="bg-white px-4 py-3 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-2 text-gray-600 font-medium text-xs">
            <span className="text-green-600 text-base">🔄</span> 
            Eligible for return till {new Date(new Date(order.updatedAt || order.createdAt).getTime() + 4 * 24 * 60 * 60 * 1000).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
          </div>
          <button className="text-pink-600 font-bold text-xs uppercase tracking-wide">
            View Policy
          </button>
        </div>

        {/* Reasons Section */}
        <div className="bg-white p-4 shadow-sm">
          <h2 className="text-base font-black text-gray-900 mb-1">Why are you returning?</h2>
          <p className="text-gray-500 text-xs mb-6">
            Please choose the correct reason for return. This information is only used to improve our service.
          </p>

          <div className="space-y-5">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Select Reason <span className="text-red-500">*</span></p>
            {reasons.map((reason) => (
              <label key={reason} className="flex flex-row-reverse justify-end gap-3 cursor-pointer group items-center">
                <span className={`text-sm flex-grow transition-colors ${
                  selectedReason === reason ? 'text-gray-900 font-medium' : 'text-gray-600 group-hover:text-gray-900'
                }`}>
                  {reason}
                </span>
                <div className="relative">
                  <input 
                    type="radio" 
                    name="reason" 
                    value={reason}
                    checked={selectedReason === reason}
                    onChange={(e) => setSelectedReason(e.target.value)}
                    className="sr-only"
                  />
                  <div className={`w-5 h-5 rounded-full border transition-all flex items-center justify-center ${
                    selectedReason === reason ? 'border-primary-600 bg-white' : 'border-gray-400 bg-white'
                  }`}>
                    {selectedReason === reason && <div className="w-2.5 h-2.5 bg-primary-600 rounded-full"></div>}
                  </div>
                </div>
              </label>
            ))}
          </div>

          {/* Comments Section */}
          <div className="mt-8 border-t border-gray-100 pt-6">
            <input 
              type="text"
              placeholder="Additional Comments"
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              className="w-full border-b border-gray-300 py-2 text-sm outline-none focus:border-pink-600 transition-colors bg-transparent placeholder-gray-400"
            />
          </div>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="fixed bottom-0 left-0 right-0 bg-white shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] max-w-md mx-auto">
         <div className="flex items-center justify-between p-3 border-t border-gray-200">
           <div className="pl-2">
             <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Refund Details</p>
             <p className="text-sm font-black text-gray-900">₹{order.totalAmount?.toFixed(2)}</p>
           </div>
           <button 
             onClick={handleReturnRequest}
             disabled={!selectedReason || isSubmitting}
             className="bg-[#E63946] hover:bg-[#d62828] disabled:bg-gray-300 disabled:text-gray-500 text-white px-6 py-3.5 rounded-lg font-bold text-xs uppercase flex items-center gap-2 transition-all shadow-md active:scale-95"
           >
             {isSubmitting ? "Processing..." : "Pickup Details"}
             {!isSubmitting && <span className="text-lg leading-none">→</span>}
           </button>
         </div>
      </div>
    </div>
  );
};

export default ReturnOrderPage;
