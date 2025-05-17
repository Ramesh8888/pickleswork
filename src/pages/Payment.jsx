import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import OTPVerification from '../components/OTPVerification';
import OTPPopup from '../components/OTPPopup';
import { payments, orders, subscriptions } from '../services/api';

const Payment = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { clearCart } = useCart();
  const [loading, setLoading] = useState(false);
  const [orderDetails, setOrderDetails] = useState(null);
  const [showOTP, setShowOTP] = useState(false);
  const [orderId, setOrderId] = useState(null);
  const [selectedMethod, setSelectedMethod] = useState('upi');
  const [deliveryOTP, setDeliveryOTP] = useState(null);

  useEffect(() => {
    // Get order details from location state
    const details = location.state?.subscriptionData || location.state?.orderData;
    if (!details) {
      toast.error('No payment details found');
      navigate('/cart');
      return;
    }
    // Fallback: if price is missing but amount is present, set price
    if (!details.price && details.amount) {
      details.price = details.amount;
    }
    setOrderDetails(details);
    console.log('DEBUG: Payment page orderDetails:', details);
  }, [location, navigate]);

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => {
        console.log('Razorpay script loaded');
        resolve(true);
      };
      script.onerror = () => {
        console.error('Failed to load Razorpay script');
        resolve(false);
      };
      document.body.appendChild(script);
    });
  };

  const handlePayment = async () => {
    try {
      setLoading(true);
      
      // Create order
      const amount = orderDetails.price || orderDetails.amount || orderDetails.total;
      if (!amount) {
        toast.error('No price found for this subscription.');
        return null;
      }
      console.log('Creating order with amount:', amount);
      
      const orderPayload = {
        amount: amount, // Amount should already be in paise from backend
        currency: 'INR',
        receipt: `order_${Date.now()}`
      };
      console.log('Order payload:', orderPayload);

      const { data: orderRes } = await payments.createOrder(orderPayload);
      console.log('Order response:', orderRes);

      if (!orderRes.orderId) {
        throw new Error(orderRes.message || 'Error creating order');
      }

      // Load Razorpay script if not already loaded
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        throw new Error('Failed to load Razorpay script');
      }

      const options = {
        key: orderRes.keyId,
        amount: orderRes.amount,
        currency: orderRes.currency,
        name: 'Akshi',
        description: 'Payment for your order',
        order_id: orderRes.orderId,
        prefill: {
          name: user?.name || '',
          email: user?.email || '',
          contact: user?.phone || ''
        },
        method: selectedMethod,
        config: {
          display: {
            blocks: {
              upib: {
                name: "Pay using UPI",
                instruments: [
                  {
                    method: "upi",
                    flows: ["collect", "intent"],
                    apps: ["google_pay", "phonepe", "paytm", "bhim"]
                  }
                ]
              },
              card: {
                name: "Pay using Card",
                instruments: [
                  {
                    method: "card"
                  }
                ]
              },
              nb: {
                name: "Net Banking",
                instruments: [
                  {
                    method: "netbanking"
                  }
                ]
              }
            },
            sequence: ["block.upib", "block.card", "block.nb"],
            preferences: {
              show_default_blocks: false
            }
          }
        },
        handler: async (response) => {
          try {
            console.log('Payment success response:', response);
            
            const verifyPayload = {
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature,
              orderDetails: {
                items: orderDetails.items,
                total: amount,
                address: location.state?.address,
                deliveryDate: location.state?.deliveryDate,
                deliveryTime: location.state?.deliveryTime
              }
            };
            console.log('Verify payload:', verifyPayload);

            const { data: verifyRes } = await payments.verifyPayment(verifyPayload);
            console.log('Verify response:', verifyRes);

            if (verifyRes.success || verifyRes.message === 'Payment verified successfully') {
              try {
                // 1. Create the order in the backend (if not a subscription)
                if (!orderDetails.planName) {
                  const orderPayload = {
                    items: orderDetails.items.map(item => ({
                      product: item.product._id,
                      quantity: item.quantity,
                      price: item.product.price
                    })),
                    deliveryAddress: orderDetails.address,
                    deliveryDate: orderDetails.deliveryDate,
                    deliveryTime: orderDetails.deliveryTime
                  };
                  const { data: orderData } = await orders.create(orderPayload);
                  toast.success('Payment successful!');
                  setDeliveryOTP(orderData.order.otp);
                } else {
                  // 2. Create the subscription in the backend
                  const subscriptionPayload = {
                    products: (orderDetails.items || orderDetails.products || []).map(item => ({
                      product: item.product?._id || item.product || item._id,
                      quantity: item.quantity,
                      price: item.price
                    })),
                    deliveryAddress: orderDetails.address || orderDetails.deliveryAddress || {
                      street: '',
                      city: '',
                      state: '',
                      pincode: ''
                    },
                    frequency: orderDetails.frequency || 'daily',
                    deliveryDays: orderDetails.deliveryDays || [],
                    deliveryTime: orderDetails.deliveryTime || '06:00',
                    duration: orderDetails.duration || 'monthly'
                  };
                  console.log('Subscription payload:', subscriptionPayload);
                  try {
                    const { data: subData } = await subscriptions.create(subscriptionPayload);
                    console.log('Subscription API response:', subData);
                    toast.success('Subscription started!');
                    setDeliveryOTP(subData.subscription.otp);
                  } catch (subErr) {
                    console.error('Subscription API error:', subErr?.response?.data || subErr);
                    toast.error(
                      subErr?.response?.data?.error ||
                      'Subscription creation failed. Please contact support.'
                    );
                  }
                }
                // 3. Clear cart and wait for it to complete
                await clearCart();
                // 4. Navigate to orders page after a short delay
                setTimeout(() => {
                  navigate('/orders', { replace: true });
                }, 2000);
              } catch (error) {
                console.error('Error in payment success flow:', error);
                navigate('/orders', { replace: true });
              }
            } else {
              throw new Error(verifyRes.message || 'Payment verification failed');
            }
          } catch (error) {
            console.error('Payment verification error:', error);
            toast.error(error.message || 'Error verifying payment');
          }
        },
        theme: {
          color: '#F59E0B'
        },
        modal: {
          backdropClose: false,
          escape: false,
          handleback: true,
          animation: true,
          ondismiss: function() {
            setLoading(false);
          }
        }
      };

      console.log('Razorpay options:', options);
      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error) {
      console.error('Payment error:', error);
      toast.error(error.message || 'Error processing payment');
      setLoading(false);
    }
  };

  if (!orderDetails) {
    return null;
  }

  if (showOTP) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <OTPVerification
          orderId={orderId}
          onVerificationComplete={() => {
            toast.success('Order confirmed!');
            navigate('/orders');
          }}
        />
      </div>
    );
  }

  const paymentMethods = [
    {
      id: 'upi',
      name: 'UPI Payment',
      description: 'Pay using Google Pay, PhonePe, or any UPI app',
      icon: (
        <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none">
          <rect width="24" height="24" rx="12" fill="#6366F1" />
          <path d="M7 12h10M12 7v10" stroke="white" strokeWidth="2" />
        </svg>
      ),
      apps: [
        { name: 'Google Pay', icon: '₹' },
        { name: 'PhonePe', icon: '₹' },
        { name: 'Paytm', icon: '₹' },
        { name: 'BHIM', icon: '₹' }
      ]
    },
    {
      id: 'card',
      name: 'Card Payment',
      description: 'Pay using Credit/Debit card',
      icon: (
        <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none">
          <rect width="24" height="24" rx="12" fill="#EF4444" />
          <path d="M7 10h10M7 14h10" stroke="white" strokeWidth="2" />
        </svg>
      )
    },
    {
      id: 'netbanking',
      name: 'Net Banking',
      description: 'Pay using your bank account',
      icon: (
        <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none">
          <rect width="24" height="24" rx="12" fill="#10B981" />
          <path d="M12 7v10M7 12h10" stroke="white" strokeWidth="2" />
        </svg>
      )
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {deliveryOTP && (
        <OTPPopup
          otp={deliveryOTP}
          onClose={() => setDeliveryOTP(null)}
        />
      )}
      <div className="max-w-lg mx-auto px-4 py-8">
        {/* Price Summary */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-900">Price Summary</h2>
            <span className="text-2xl font-bold text-primary-600">₹{orderDetails.total}</span>
          </div>
          <p className="text-sm text-gray-500 mt-1">Order #{orderId || 'Generating...'}</p>
        </div>

        {/* Payment Methods */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Payment Options</h2>
          <div className="space-y-4">
            {paymentMethods.map((method) => (
              <div
                key={method.id}
                className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                  selectedMethod === method.id
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-gray-200 hover:border-primary-200'
                }`}
                onClick={() => setSelectedMethod(method.id)}
              >
                <div className="flex items-center space-x-4">
                  {method.icon}
                  <div className="flex-1">
                    <h3 className="text-sm font-medium text-gray-900">{method.name}</h3>
                    <p className="text-sm text-gray-500">{method.description}</p>
                  </div>
                  <div className="flex items-center justify-center w-5 h-5 border-2 rounded-full border-primary-500">
                    {selectedMethod === method.id && (
                      <div className="w-3 h-3 rounded-full bg-primary-500" />
                    )}
                  </div>
                </div>
                {method.id === 'upi' && selectedMethod === 'upi' && (
                  <div className="mt-4 grid grid-cols-4 gap-4">
                    {method.apps.map((app) => (
                      <div
                        key={app.name}
                        className="flex flex-col items-center p-2 rounded-lg border border-gray-200 hover:border-primary-500 cursor-pointer"
                      >
                        <span className="text-2xl mb-1">{app.icon}</span>
                        <span className="text-xs text-gray-600">{app.name}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Pay Button */}
        <button
          onClick={handlePayment}
          disabled={loading}
          className="w-full bg-primary-600 text-white py-4 px-6 rounded-lg font-semibold text-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"
        >
          {loading ? (
            <div className="flex items-center justify-center">
              <svg className="animate-spin h-5 w-5 mr-3 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Processing...
            </div>
          ) : (
            `Pay ₹${orderDetails.price || orderDetails.amount || orderDetails.total || 0}`
          )}
        </button>

        <p className="text-xs text-center text-gray-500 mt-4">
          By clicking "Pay", you agree to our terms and conditions
        </p>
      </div>
    </div>
  );
};

export default Payment;