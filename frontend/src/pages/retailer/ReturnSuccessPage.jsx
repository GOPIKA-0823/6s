import { useLocation, useNavigate } from 'react-router-dom';

const ReturnSuccessPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const order = location.state?.order;

  if (!order) {
    navigate('/retailer/orders');
    return null;
  }

  // Get first product details for the thumbnail display
  const firstItem = order.items && order.items.length > 0 ? order.items[0] : { name: 'Unknown Product', price: order.totalAmount || 0 };
  const productName = firstItem.name || firstItem.productName || 'Order Item';
  const quantity = firstItem.quantity || 1;

  // Calculate generic future dates
  const pickupDate = new Date();
  pickupDate.setDate(pickupDate.getDate() + 3); // arbitrarily 3 days for pickup scheduled
  const formattedPickupDate = pickupDate.toLocaleDateString('en-GB', { weekday: 'short', day: '2-digit', month: 'short' });

  const refundDate = new Date();
  refundDate.setDate(refundDate.getDate() + 7);
  const formattedRefundDate = refundDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center pt-8 pb-20 px-4 font-sans">
      
      {/* Main White Card */}
      <div className="w-full max-w-md bg-white rounded-2xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-gray-100 p-5 p-6 animate-fade-in">
        
        {/* Header: Status & Date */}
        <div className="flex items-center gap-4 mb-6">
          <div className="relative">
            {/* Dark Circle with Box */}
            <div className="w-12 h-12 bg-[#111827] rounded-full flex items-center justify-center shadow-md">
              <span className="text-xl">📦</span>
            </div>
            {/* Overlapping Green Checkmark */}
            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-[#00A676] border-2 border-white rounded-full flex items-center justify-center">
              <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
          <div>
            <h2 className="text-[#00A676] font-bold text-lg leading-tight">Pickup Scheduled</h2>
            <p className="text-gray-500 text-sm">On {formattedPickupDate}</p>
          </div>
        </div>

        {/* Nested Product Info Card */}
        <div className="bg-white border border-gray-100 shadow-sm rounded-xl p-4 mb-6">
          {/* Top Half: Image & Details */}
          <div className="flex gap-4 items-center">
            {/* Product Thumbnail Box */}
            <div className="w-16 h-16 bg-white border border-gray-100 rounded-xl shadow-sm flex items-center justify-center shrink-0">
              <span className="text-2xl">📦</span>
            </div>
            
            {/* Text Details */}
            <div className="flex-grow">
              <div className="flex justify-between items-start">
                <h3 className="font-bold text-gray-900 text-base">{productName}</h3>
                <span className="text-gray-400 text-lg leading-none">&gt;</span>
              </div>
              <p className="text-gray-500 text-sm mt-0.5">Order Item</p>
              <p className="text-gray-400 text-[10px] font-bold tracking-widest uppercase mt-2">QUANTITY: {quantity}</p>
            </div>
          </div>

          {/* Bottom Half: Action Buttons */}
          <div className="flex gap-3 mt-5">
            <button className="flex-1 bg-white border border-gray-200 shadow-sm rounded-lg py-2.5 flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors">
              <span className="text-blue-600 text-sm font-bold">↻</span> 
              <span className="text-gray-900 text-sm font-bold">How it works</span>
            </button>
            <button 
              onClick={() => navigate('/retailer/orders')}
              className="flex-1 bg-blue-50/50 border border-blue-100 shadow-sm rounded-lg py-2.5 flex items-center justify-center gap-2 hover:bg-blue-50 transition-colors"
            >
              <span className="text-blue-600 text-sm font-bold">×</span> 
              <span className="text-blue-900 text-sm font-bold">Cancel</span>
            </button>
          </div>
        </div>

        {/* Info Text */}
        <div className="flex items-center gap-2 px-1 mb-8">
          <div className="w-2 h-2 rounded-full bg-[#00A676]"></div>
          <p className="text-gray-500 text-sm font-medium">Refund will be initiated after pickup</p>
        </div>

        {/* Rate & Review Box */}
        <div className="bg-white border border-gray-100 shadow-sm rounded-xl p-4 flex items-center gap-4">
          <div className="w-12 h-12 bg-[#FFF9E6] rounded-full flex items-center justify-center shrink-0">
             <span className="text-xl">🏆</span>
          </div>
          <div>
            <div className="flex gap-1 mb-1">
              {[1,2,3,4,5].map(i => (
                <svg key={i} className="w-5 h-5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
              ))}
            </div>
            <p className="text-gray-600 font-medium text-sm">Rate & Review</p>
          </div>
        </div>

      </div>

    </div>
  );
};

export default ReturnSuccessPage;

