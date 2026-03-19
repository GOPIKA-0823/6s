import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { createOrder, createRazorpayOrder, verifyRazorpayPayment } from '../../services/api';

/**
 * Payment Page Component
 * 
 * Features:
 * - Select payment method: UPI, Credit/Debit/ATM, Cash on Delivery
 * - Card/UPI details form with validation
 * - Dynamic price summary
 * - Razorpay Integration for online payments
 * - COD only available for Tamil Nadu
 */
const PaymentPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const request = location.state?.request;
  const deliveryAddress = location.state?.address;

  const [paymentMethod, setPaymentMethod] = useState('card');
  const [selectedUpiApp, setSelectedUpiApp] = useState('google_pay');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [checkoutStatus, setCheckoutStatus] = useState('form'); // form, success, failed
  const [checkoutError, setCheckoutError] = useState('');
  const [placedOrderDetails, setPlacedOrderDetails] = useState(null);
  const [isCodAvailable, setIsCodAvailable] = useState(true);
  
  const [cardData, setCardData] = useState({
    number: '',
    expiry: '',
    cvv: ''
  });
  
  const [upiId, setUpiId] = useState('');

  // Redirect if no request data (direct access attempt)
  useEffect(() => {
    if (!request) {
      navigate('/retailer/my-requests');
    }
  }, [request, navigate]);

  // Check COD availability based on delivery address (Tamil Nadu)
  useEffect(() => {
    if (deliveryAddress && !deliveryAddress.toLowerCase().includes('tamil nadu')) {
      setIsCodAvailable(false);
      if (paymentMethod === 'cod') {
        setPaymentMethod('card');
      }
    }
  }, [deliveryAddress, paymentMethod]);

  if (!request) return null;

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleCardChange = (e) => {
    let { name, value } = e.target;
    
    // Auto-format card number with spaces
    if (name === 'number') {
      value = value.replace(/\D/g, '').replace(/(.{4})/g, '$1 ').trim().slice(0, 19);
    }
    
    // Auto-format expiry with slash
    if (name === 'expiry') {
      value = value.replace(/\D/g, '');
      if (value.length > 2) {
        value = `${value.slice(0, 2)}/${value.slice(2, 4)}`;
      }
    }
    
    setCardData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
      // Basic Form Validations
      if (paymentMethod === 'card') {
        const cleanNumber = cardData.number.replace(/\s/g, '');
        if (cleanNumber.length !== 16) {
          return alert("Please enter a valid 16-digit card number.");
        }
        if (!/^\d{2}\/\d{2}$/.test(cardData.expiry)) {
          return alert("Please enter a valid expiry date (MM/YY).");
        }
        if (cardData.cvv.length !== 3) {
          return alert("Please enter a valid 3-digit CVV.");
        }
      }

    try {
      setIsSubmitting(true);
      
      const orderData = {
        manufacturerId: request.manufacturerId?._id || request.manufacturerId,
        retailerId: request.retailerId?._id || request.retailerId,
        items: [
          {
            productId: request.productId?._id || request.productId,
            name: request.productName,
            quantity: request.quantity,
            price: request.unitPrice,
          }
        ],
        totalAmount: request.totalAmount,
        manufacturerName: request.manufacturerName,
        retailerName: request.retailerName,
        paymentMethod: paymentMethod,
        paymentStatus: paymentMethod === 'cod' ? 'pending' : 'paid',
        shippingAddress: deliveryAddress || '',
        notes: `Order created via ${paymentMethod.toUpperCase()} from Request #${request._id.slice(-6).toUpperCase()}.`,
      };

      if (paymentMethod === 'cod') {
        const res = await createOrder(orderData);
        setPlacedOrderDetails(res.data);
        setCheckoutStatus('success');
      } else {
        // Razorpay Online Flow
        const isScriptLoaded = await loadRazorpayScript();
        if (!isScriptLoaded) {
          alert('Failed to load Razorpay SDK. Please check your internet connection.');
          return;
        }

        // 1. Create order on backend
        const { data: rzpOrder } = await createRazorpayOrder({ amount: request.totalAmount });
        
        // 2. Open Razorpay Checkout
        const options = {
          key: 'rzp_test_SSYMrIBvjhGxuY', // You must change this in production, or pull from env
          amount: rzpOrder.amount,
          currency: rzpOrder.currency,
          name: 'Agaram Agency',
          description: `Payment for Order`,
          order_id: rzpOrder.id,
          handler: async function (response) {
             try {
               // 3. Verify Payment
               await verifyRazorpayPayment({
                 razorpay_order_id: response.razorpay_order_id,
                 razorpay_payment_id: response.razorpay_payment_id,
                 razorpay_signature: response.razorpay_signature
               });

               // 4. Save Order in our DB
               orderData.razorpayOrderId = response.razorpay_order_id;
               orderData.razorpayPaymentId = response.razorpay_payment_id;
               
               const res = await createOrder(orderData);
               setPlacedOrderDetails(res.data);
               setCheckoutStatus('success');
             } catch (verifyErr) {
               console.error(verifyErr);
               setCheckoutError('Payment verification failed. Please contact support.');
               setCheckoutStatus('failed');
             }
          },
          prefill: {
            name: request.retailerName,
            contact: '' // You can pass actual contact here if available
          },
          theme: {
            color: '#1d4ed8' // primary-700
          }
        };

        const rzp = new window.Razorpay(options);
        rzp.on('payment.failed', function (response){
          setCheckoutError(`Payment Failed: ${response.error.description}`);
          setCheckoutStatus('failed');
          setIsSubmitting(false);
        });
        rzp.open();
        
      }
    } catch (err) {
      console.error('Error placing order:', err);
      setCheckoutError(err.response?.data?.message || 'Failed to complete payment. Please try again.');
      setCheckoutStatus('failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (checkoutStatus === 'success') {
    return (
      <div className="max-w-xl mx-auto mt-16 p-8 bg-white rounded-2xl border border-gray-100 shadow-xl text-center animate-slide-up">
        <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl shadow-inner">
          ✓
        </div>
        <h1 className="text-3xl font-black text-gray-900 mb-2">Order Confirmed!</h1>
        <p className="text-gray-600 mb-8">Your payment has been verified and processed securely.</p>
        
        <div className="bg-gray-50 rounded-xl p-6 text-left space-y-4 mb-8">
          <div className="flex justify-between items-center">
            <span className="text-gray-500 font-medium">Order ID</span>
            <span className="font-bold text-gray-900 bg-gray-200 px-3 py-1 rounded text-sm">{placedOrderDetails?._id || 'Pending'}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-500 font-medium">Amount Paid</span>
            <span className="font-bold text-lg text-gray-900">₹{request.totalAmount}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500 font-medium">Delivery To</span>
            <span className="font-medium text-right max-w-[200px] text-gray-800 text-sm">{deliveryAddress}</span>
          </div>
          <div className="pt-4 mt-4 border-t border-gray-200 flex justify-between items-center">
            <span className="text-gray-500 font-medium">Estimated Delivery</span>
            <span className="font-bold text-primary-600 text-lg">Within 2 Days</span>
          </div>
        </div>

        <button
          onClick={() => navigate('/retailer/orders')}
          className="w-full py-4 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-xl transition-all shadow-md active:scale-95"
        >
          View My Orders
        </button>
      </div>
    );
  }

  if (checkoutStatus === 'failed') {
    return (
      <div className="max-w-xl mx-auto mt-16 p-8 bg-white rounded-2xl border border-red-100 shadow-xl text-center animate-slide-up">
        <div className="w-20 h-20 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl shadow-inner">
          ✕
        </div>
        <h1 className="text-3xl font-black text-gray-900 mb-2">Payment Failed</h1>
        <p className="text-gray-600 mb-8">We could not process your payment. {checkoutError}</p>

        <div className="flex gap-4">
          <button
            onClick={() => {
              setCheckoutStatus('form');
              setCheckoutError('');
            }}
            className="flex-1 py-4 bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-bold rounded-xl shadow-md transition-all active:scale-95"
          >
            Review & Retry
          </button>
          <button
            onClick={() => navigate('/retailer/marketplace')}
            className="flex-1 py-4 bg-gray-100 hover:bg-gray-200 text-gray-900 font-bold rounded-xl transition-all"
          >
            Cancel Order
          </button>
        </div>
      </div>
    );
  }

  const isDeliveryAvailable = !!deliveryAddress;

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-fade-in pb-12">
      <div className="flex items-center gap-4">
        <button 
          onClick={() => navigate(-1)}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <span className="text-xl">←</span>
        </button>
        <h1 className="text-2xl font-bold text-gray-900">Complete Payment</h1>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Left: Payment Methods */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100">
            {/* Payment Options List */}
            <div className="divide-y divide-gray-100">
              {/* Credit/Debit Card */}
              <div 
                onClick={() => setPaymentMethod('card')}
                className={`p-6 cursor-pointer hover:bg-gray-50 transition-colors flex items-center justify-between ${paymentMethod === 'card' ? 'bg-blue-50/50' : ''}`}
              >
                <div className="flex items-center gap-4">
                  <div className="text-2xl">💳</div>
                  <div>
                    <h3 className="font-bold text-gray-900">Credit / Debit / ATM Card</h3>
                    <p className="text-xs text-gray-500">Secure payments via Razorpay</p>
                    <p className="text-[10px] text-green-600 font-bold mt-1">Get upto 5% cashback • 2 offers available</p>
                  </div>
                </div>
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${paymentMethod === 'card' ? 'border-primary-600' : 'border-gray-300'}`}>
                  {paymentMethod === 'card' && <div className="w-2.5 h-2.5 bg-primary-600 rounded-full"></div>}
                </div>
              </div>

              {/* Cash on Delivery */}
              <div 
                onClick={() => isCodAvailable && setPaymentMethod('cod')}
                className={`p-6 ${!isCodAvailable ? 'opacity-50 cursor-not-allowed bg-gray-50' : 'cursor-pointer hover:bg-gray-50'} transition-colors flex items-center justify-between ${paymentMethod === 'cod' ? 'bg-blue-50/50' : ''}`}
              >
                <div className="flex items-center gap-4">
                  <div className="text-2xl">💵</div>
                  <div>
                    <h3 className="font-bold text-gray-900">Cash on Delivery</h3>
                    {isCodAvailable ? (
                      <p className="text-xs text-gray-500">Pay when your product is delivered</p>
                    ) : (
                      <p className="text-xs text-red-500">Not serviceable for your location</p>
                    )}
                  </div>
                </div>
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${paymentMethod === 'cod' ? 'border-primary-600' : 'border-gray-300'}`}>
                  {paymentMethod === 'cod' && <div className="w-2.5 h-2.5 bg-primary-600 rounded-full"></div>}
                </div>
              </div>

               {/* Gift Card Placeholder */}
               <div className="p-6 opacity-60 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="text-2xl">🎁</div>
                  <div>
                    <h3 className="font-bold text-gray-900">Have a Gift Card?</h3>
                  </div>
                </div>
                <span className="text-[10px] bg-gray-100 px-2 py-1 rounded text-gray-500">Unavailable</span>
              </div>

              {/* UPI */}
              <div 
                onClick={() => setPaymentMethod('upi')}
                className={`p-6 cursor-pointer hover:bg-gray-50 transition-colors flex items-center justify-between ${paymentMethod === 'upi' ? 'bg-blue-50/50' : ''}`}
              >
                <div className="flex items-center gap-4">
                  <div className="text-2xl">📱</div>
                  <div>
                    <h3 className="font-bold text-gray-900">UPI</h3>
                    <p className="text-xs text-gray-500">Pay using Google Pay, PhonePe or Any UPI ID</p>
                  </div>
                </div>
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${paymentMethod === 'upi' ? 'border-primary-600' : 'border-gray-300'}`}>
                  {paymentMethod === 'upi' && <div className="w-2.5 h-2.5 bg-primary-600 rounded-full"></div>}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Payment Form & Summary */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
            <h2 className="font-bold text-lg mb-4">Payment Details</h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              {paymentMethod === 'card' && (
                <div className="space-y-4 animate-slide-up">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">CARD NUMBER</label>
                    <input 
                      type="text"
                      name="number"
                      placeholder="XXXX XXXX XXXX XXXX"
                      value={cardData.number}
                      onChange={handleCardChange}
                      required
                      maxLength="19"
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-500 mb-1">VALID THRU</label>
                      <input 
                        type="text"
                        name="expiry"
                        placeholder="MM/YY"
                        value={cardData.expiry}
                        onChange={handleCardChange}
                        required
                        maxLength="5"
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 mb-1">CVV</label>
                      <input 
                        type="password"
                        name="cvv"
                        placeholder="CVV"
                        value={cardData.cvv}
                        onChange={handleCardChange}
                        required
                        maxLength="3"
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}

              {paymentMethod === 'upi' && (
                <div className="animate-slide-up space-y-4">
                   <p className="text-sm text-gray-600 font-medium">Select your preferred UPI App below:</p>
                   <div className="grid grid-cols-2 gap-3">
                      <div 
                         onClick={() => setSelectedUpiApp('google_pay')}
                         className={`cursor-pointer border-2 p-3 rounded-xl flex items-center justify-center gap-2 font-bold text-sm transition-all ${selectedUpiApp === 'google_pay' ? 'border-primary-600 bg-blue-50/50 text-primary-700 shadow-md scale-[1.02]' : 'border-gray-200 bg-gray-50 text-gray-700 hover:border-gray-300'}`}
                      >
                        <span className="text-2xl">G</span> Google Pay
                      </div>
                      <div 
                         onClick={() => setSelectedUpiApp('phonepe')}
                         className={`cursor-pointer border-2 p-3 rounded-xl flex items-center justify-center gap-2 font-bold text-sm transition-all ${selectedUpiApp === 'phonepe' ? 'border-primary-600 bg-blue-50/50 text-primary-700 shadow-md scale-[1.02]' : 'border-gray-200 bg-gray-50 text-gray-700 hover:border-gray-300'}`}
                      >
                         <span className="text-2xl">P</span> PhonePe
                      </div>
                   </div>
                   <p className="text-[11px] text-gray-400 text-center flex items-center justify-center gap-1">
                     <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                     A secure UPI intent flow will launch on your device for fast checkout.
                   </p>
                </div>
              )}

              {paymentMethod === 'cod' && (
                <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-100 animate-slide-up">
                  <p className="text-sm text-yellow-700">
                    <strong>Note:</strong> Cash on Delivery is available. Please keep <strong>₹{request.totalAmount}</strong> ready at the time of delivery.
                  </p>
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting || !isDeliveryAvailable}
                className={`w-full py-4 font-black rounded-xl shadow-md transition-all mt-4 flex items-center justify-center gap-2 ${!isDeliveryAvailable ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-yellow-400 hover:bg-yellow-500 text-gray-900 active:scale-95'}`}
              >
                {!isDeliveryAvailable ? (
                   'Delivery Not Available'
                ) : isSubmitting ? (
                  <>
                    <div className="animate-spin h-5 w-5 border-4 border-gray-900 border-t-transparent rounded-full"></div>
                    <span>Processing Secure Payment...</span>
                  </>
                ) : (
                  paymentMethod === 'cod' ? `Place Order for ₹${request.totalAmount}` : `Pay ₹${request.totalAmount} Securely ${paymentMethod === 'upi' ? (selectedUpiApp === 'google_pay' ? 'via GPay' : 'via PhonePe') : ''}`
                )}
              </button>
            </form>

            <p className="text-[10px] text-gray-400 text-center mt-4">
              Safe and secure payments. 100% Payment Protection Easy Returns
            </p>
          </div>

          <div className="bg-white rounded-xl shadow border border-gray-100 p-6">
             <h3 className="font-bold text-gray-900 mb-2 underline decoration-yellow-400 underline-offset-4">Price Details</h3>
             <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                   <p className="text-gray-500">Price ({request.quantity} units)</p>
                   <p className="font-medium">₹{request.totalAmount}</p>
                </div>
                <div className="flex justify-between">
                   <p className="text-gray-500">Delivery Charges</p>
                   <p className="text-green-600 font-bold">FREE</p>
                </div>
                <div className="border-t border-dashed border-gray-300 pt-2 flex justify-between font-bold text-lg mt-2">
                   <p>Total Amount</p>
                   <p>₹{request.totalAmount}</p>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;
