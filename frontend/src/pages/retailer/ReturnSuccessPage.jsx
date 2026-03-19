import { useLocation, useNavigate } from 'react-router-dom';

const ReturnSuccessPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const order = location.state?.order;

  // Generate a random reference number or use order ID
  const referenceNumber = order?._id?.slice(-10) || Math.floor(Math.random() * 10000000000).toString();

  if (!order) {
    navigate('/retailer/orders');
    return null;
  }

  return (
    <div className="max-w-md mx-auto bg-gray-50 min-h-screen pb-20 animate-fade-in font-sans flex flex-col items-center pt-12">
      {/* Success Icon Header */}
      <div className="flex flex-col items-center px-6 text-center w-full">
        <div className="w-16 h-16 bg-[#00A676] rounded-full flex items-center justify-center mb-4 shadow-sm">
          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-xl font-bold text-gray-900 mb-1">Return Request Submitted</h1>
        <p className="text-sm text-gray-500 mb-8">Reference number: {referenceNumber}</p>

        {/* Product & Refund Details */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex items-start gap-4 text-left w-full mb-6">
          <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center text-xl flex-shrink-0 border border-gray-200">
            📦
          </div>
          <p className="text-sm text-gray-700 leading-relaxed">
            A refund of <span className="font-bold text-[#00A676]">₹ {order.totalAmount?.toFixed(2)}</span> will be initiated after the item is picked up and quality check has passed.
          </p>
        </div>

        {/* Timelines and Notes */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 w-full mb-6 text-left">
          
          <div className="flex gap-4 mb-6">
            <div className="flex-shrink-0 mt-0.5">
              <svg className="w-5 h-5 text-[#00A676]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" strokeWidth="2"></circle>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6l4 2"></path>
              </svg>
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-1">Pickup Within</p>
              <p className="text-sm text-gray-800 font-medium">7 days</p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex-shrink-0 mt-0.5">
              <svg className="w-5 h-5 text-[#00A676]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" strokeWidth="2"></circle>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 16v-4m0-4h.01"></path>
              </svg>
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-1">Please Note</p>
              <p className="text-sm text-gray-800">Keep your products and brand tags intact to give it back to delivery agent.</p>
            </div>
          </div>

        </div>

        {/* Next Steps */}
        <div className="w-full text-left px-2 mb-6">
          <h3 className="text-sm font-bold text-gray-900 mb-1">Next Steps</h3>
          <p className="text-sm text-gray-500">Please check your orders page to track pick up and refund.</p>
        </div>

        {/* Timeline Status Mock */}
        <div className="bg-[#f2f8f5] rounded-xl p-4 flex items-center gap-3 w-full border border-[#e1f0e8]">
           <div className="w-6 h-6 bg-[#00A676] rounded-full flex items-center justify-center flex-shrink-0">
             <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
             </svg>
           </div>
           <p className="text-sm font-bold text-[#00A676]">Return Request Submitted</p>
        </div>
      </div>

      {/* Done Footer */}
      <div className="fixed bottom-0 left-0 right-0 bg-white shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] max-w-md mx-auto p-4 border-t border-gray-200">
         <button 
           onClick={() => navigate('/retailer/orders')}
           className="w-full bg-[#E63946] hover:bg-[#d62828] text-white py-3.5 rounded-lg font-bold text-sm uppercase transition-all shadow-sm active:scale-95 text-center block"
         >
           Done
         </button>
      </div>
    </div>
  );
};

export default ReturnSuccessPage;
