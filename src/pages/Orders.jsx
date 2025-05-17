import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { BACKEND_URL } from '../config';
import { motion } from 'framer-motion';
import { FaCopy } from 'react-icons/fa';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

// Base64 encoded placeholder image (1x1 transparent pixel)
const PLACEHOLDER_IMAGE = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';

// Helper function to get image URL (robust)
const getImageUrl = (product) => {
  const img = product?.image || (Array.isArray(product?.images) && product.images[0]);
  if (!img) return PLACEHOLDER_IMAGE;
  return img.startsWith('http') ? img : BACKEND_URL + img.replace(/^\/+/, '');
};

const Loader = ({ size = 'large', text = 'Loading...' }) => {
  const sizeClasses = {
    small: 'h-6 w-6',
    medium: 'h-8 w-8',
    large: 'h-12 w-12'
  };

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="relative">
        <div className={`${sizeClasses[size]} animate-spin rounded-full border-4 border-gray-200`}>
          <div className="absolute top-0 left-0 right-0 bottom-0 rounded-full border-4 border-primary-600 border-t-transparent animate-spin" 
               style={{ animationDuration: '1.5s' }}></div>
        </div>
      </div>
      {text && <p className="mt-4 text-gray-600">{text}</p>}
    </div>
  );
};

const statusStyles = {
  delivered: 'bg-green-100 text-green-800',
  processing: 'bg-blue-100 text-blue-800',
  out_for_delivery: 'bg-yellow-100 text-yellow-800',
  'out for delivery': 'bg-yellow-100 text-yellow-800',
  pending: 'bg-gray-100 text-gray-800',
  cancelled: 'bg-red-100 text-red-800',
};

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState({ type: null, orderId: null });
  const [error, setError] = useState(null);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isTrackingModalOpen, setIsTrackingModalOpen] = useState(false);
  const [trackingLoading, setTrackingLoading] = useState(false);

  const filters = [
    { value: 'all', label: 'All Orders' },
    { value: 'delivered', label: 'Delivered' },
    { value: 'pending', label: 'Pending' },
    { value: 'processing', label: 'Processing' },
    { value: 'out_for_delivery', label: 'Out for Delivery' },
    { value: 'cancelled', label: 'Cancelled' }
  ];

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/orders`, token ? { headers: { Authorization: `Bearer ${token}` } } : {});
      setOrders(response.data);
    } catch (err) {
      console.error('Failed to fetch orders:', err, err?.response);
      setError('Failed to fetch orders. Please try again later.');
      toast.error('Error loading orders');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => statusStyles[status?.toLowerCase()] || statusStyles.pending;

  const handleCancelOrder = async (orderId) => {
    if (window.confirm('Are you sure you want to cancel this order? Note: Cancelled orders are non-refundable.')) {
      try {
        setActionLoading({ type: 'cancel', orderId });
        await axios.post(`${API_URL}/orders/${orderId}/cancel`);
        
        setOrders(orders.map(order => 
          order._id === orderId 
            ? {
                ...order,
                status: 'Cancelled',
                paymentStatus: 'completed',
                trackingDetails: [
                  ...order.trackingDetails,
                  { 
                    status: 'Cancelled',
                    timestamp: new Date().toLocaleString('en-US', {
                      year: 'numeric',
                      month: '2-digit',
                      day: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit',
                      hour12: true
                    })
                  }
                ]
              }
            : order
        ));
        toast.success('Order cancelled successfully. Note: Cancelled orders are non-refundable.');
      } catch (err) {
        toast.error('Failed to cancel order. Please try again.');
      } finally {
        setActionLoading({ type: null, orderId: null });
      }
    }
  };

  const handleTrackOrder = async (order) => {
    try {
      setTrackingLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${API_URL}/orders/${order._id}/tracking`,
        { headers: token ? { Authorization: `Bearer ${token}` } : {} }
      );
      setSelectedOrder({ ...order, trackingDetails: response.data.trackingDetails });
      setIsTrackingModalOpen(true);
    } catch (err) {
      toast.error('Failed to fetch tracking details');
    } finally {
      setTrackingLoading(false);
    }
  };

  const handleDownloadInvoice = async (order) => {
    try {
      setActionLoading({ type: 'download', orderId: order._id });
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${API_URL}/orders/${order._id}/invoice`,
        { 
          responseType: 'blob',
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        }
      );
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `invoice-${order._id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success('Invoice downloaded successfully');
    } catch (err) {
      toast.error('Failed to download invoice');
    } finally {
      setActionLoading({ type: null, orderId: null });
    }
  };

  const filteredOrders = orders
    .filter(order => selectedFilter === 'all' || order.status?.toLowerCase() === selectedFilter)
    .filter(order => 
      searchQuery === '' || 
      order._id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (order.items && order.items.some(item => item.product?.name?.toLowerCase().includes(searchQuery.toLowerCase())))
    );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center">
        <Loader size="large" text="Loading your orders..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-sm p-8 text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={fetchOrders}
            className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-7xl mx-auto">
          {/* Header Section */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl font-bold text-gray-900 mb-4">My Orders</h1>
            <div className="w-20 h-1 bg-primary-600 mx-auto rounded-full mb-4"></div>
            <p className="text-gray-600 max-w-2xl mx-auto">
              View your recent and past orders below. Track, download invoices, and more.
            </p>
          </motion.div>

          {/* Main Content */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-white rounded-xl shadow-sm p-8 md:p-12"
          >
            <div className="flex flex-col sm:flex-row justify-between gap-4 mb-8">
              <div className="flex gap-2 overflow-x-auto pb-2">
                {filters.map(filter => (
                  <button
                    key={filter.value}
                    onClick={() => setSelectedFilter(filter.value)}
                    className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors duration-200 ${selectedFilter === filter.value ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-primary-100'}`}
                  >
                    {filter.label}
                  </button>
                ))}
              </div>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search orders..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full sm:w-64 px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="space-y-8">
              {filteredOrders.map((order) => (
                <div key={order._id} className="bg-gray-50 rounded-xl shadow border border-gray-100">
                  <div className="p-6">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
                      <div>
                        <p className="text-lg font-semibold text-gray-900">Order <span className="text-primary-600">#{order._id}</span></p>
                        <p className="text-sm text-gray-500">Placed on {order.deliveryDate ? new Date(order.deliveryDate).toLocaleString() : '-'}</p>
                        <p className="text-sm text-gray-500">{order.deliveryTime}</p>
                      </div>
                      <div className="flex flex-wrap items-center gap-3">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>{order.status}</span>
                        <button
                          onClick={() => handleTrackOrder(order)}
                          disabled={actionLoading.orderId === order._id || trackingLoading}
                          className="px-3 py-1 text-sm font-medium text-primary-600 hover:text-primary-700 disabled:opacity-50 flex items-center gap-2 border border-primary-100 rounded-md bg-primary-50 hover:bg-primary-100 transition-colors"
                        >
                          {actionLoading.type === 'track' && actionLoading.orderId === order._id ? <Loader size="small" text={null} /> : null}
                          Track Order
                        </button>
                        <button
                          onClick={() => handleDownloadInvoice(order)}
                          disabled={actionLoading.orderId === order._id}
                          className="px-3 py-1 text-sm font-medium text-primary-600 hover:text-primary-700 disabled:opacity-50 flex items-center gap-2 border border-primary-100 rounded-md bg-primary-50 hover:bg-primary-100 transition-colors"
                        >
                          {actionLoading.type === 'download' && actionLoading.orderId === order._id ? <Loader size="small" text={null} /> : null}
                          Download Invoice
                        </button>
                        {order.status === 'Processing' && (
                          <button
                            onClick={() => handleCancelOrder(order._id)}
                            disabled={actionLoading.orderId === order._id}
                            className="px-3 py-1 text-sm font-medium text-red-600 hover:text-red-700 disabled:opacity-50 flex items-center gap-2 border border-red-100 rounded-md bg-red-50 hover:bg-red-100 transition-colors"
                          >
                            {actionLoading.type === 'cancel' && actionLoading.orderId === order._id ? <Loader size="small" text={null} /> : null}
                            Cancel Order
                          </button>
                        )}
                      </div>
                    </div>
                    <div className="divide-y divide-gray-200">
                      {order.items && order.items.map((item, index) => (
                        <div key={index} className="py-4 flex items-center space-x-4">
                          <div className="flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden bg-white border border-gray-200">
                            <img
                              src={getImageUrl(item?.product)}
                              alt={item?.product?.name || 'Product image'}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                if (e.target.src !== PLACEHOLDER_IMAGE) {
                                  e.target.onerror = null;
                                  e.target.src = PLACEHOLDER_IMAGE;
                                }
                              }}
                              loading="lazy"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="text-lg font-medium text-gray-900 truncate">{item.product?.name}</h3>
                            <p className="text-sm text-gray-600">Quantity: {item.quantity} {item.product?.unit}</p>
                            <p className="text-sm text-gray-600">₹{item.price} per {item.product?.unit}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-medium text-gray-900">₹{item.price * item.quantity}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="mt-6 flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                      <div>
                        <p className="text-sm text-gray-600">Delivery Address:</p>
                        <p className="text-sm font-medium text-gray-900">
                          {order.deliveryAddress?.street}, {order.deliveryAddress?.city}, {order.deliveryAddress?.state} {order.deliveryAddress?.pincode}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-600">Total Amount</p>
                        <p className="text-2xl font-bold text-primary-600">₹{order.totalAmount}</p>
                      </div>
                    </div>
                    {/* OTP Section - Only show if order is not delivered or cancelled */}
                    {order.otp && order.status !== 'delivered' && order.status !== 'cancelled' && (
                      <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-700">Delivery OTP</p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="text-lg font-mono font-bold text-primary-600">
                              {order.otp}
                            </span>
                            <button
                              onClick={() => copyToClipboard(order.otp)}
                              className="p-2 text-gray-500 hover:text-primary-600 transition-colors"
                              title="Copy OTP"
                            >
                              <FaCopy size={16} />
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {filteredOrders.length === 0 && !loading && !error && (
                <div className="text-center py-16 bg-white rounded-xl shadow-md border border-gray-100">
                  <img src="/empty-orders.svg" alt="No orders" className="mx-auto mb-6 w-32 h-32 opacity-80" />
                  <p className="text-gray-600 mb-4 text-lg">You have no orders yet.</p>
                  <Link
                    to="/products"
                    className="inline-flex items-center px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-primary-600 hover:bg-primary-700 transition-colors"
                  >
                    Continue Shopping
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
      {/* Tracking Modal */}
      {isTrackingModalOpen && selectedOrder && (
        <SimpleModal open={isTrackingModalOpen} onClose={() => setIsTrackingModalOpen(false)} title={`Track Order #${selectedOrder._id}`}>
          {trackingLoading ? (
            <Loader size="medium" text="Loading tracking details..." />
          ) : (
            <div className="flex flex-col gap-0 relative">
              {statusSteps.map((step, idx) => {
                const currentStatus = selectedOrder.status?.toLowerCase();
                const isActive = statusSteps.findIndex(s => s.key === currentStatus) >= idx;
                const isCurrent = step.key === currentStatus;
                return (
                  <div key={step.key} className="flex items-center relative min-h-[60px]">
                    <div className="flex flex-col items-center mr-4">
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center z-10 ${isActive ? 'bg-primary-600 border-primary-600' : 'bg-gray-200 border-gray-300'}`}> 
                        {isCurrent ? (
                          <span className="w-2 h-2 bg-white rounded-full block"></span>
                        ) : null}
                      </div>
                      {idx < statusSteps.length - 1 && (
                        <div className={`w-1 h-10 ${isActive ? 'bg-primary-600' : 'bg-gray-200'}`}></div>
                      )}
                    </div>
                    <div>
                      <div className={`text-base font-medium ${isActive ? 'text-primary-700' : 'text-gray-400'}`}>{step.label}</div>
                    </div>
                  </div>
                );
              })}
              {selectedOrder.status?.toLowerCase() === 'cancelled' && (
                <div className="flex items-center mt-2">
                  <div className="w-5 h-5 rounded-full border-2 bg-red-500 border-red-500 flex items-center justify-center mr-4"></div>
                  <div className="text-base font-medium text-red-600">Cancelled</div>
                </div>
              )}
            </div>
          )}
        </SimpleModal>
      )}
    </div>
  );
};

const statusSteps = [
  { key: 'pending', label: 'Pending' },
  { key: 'confirmed', label: 'Confirmed' },
  { key: 'preparing', label: 'Preparing' },
  { key: 'out_for_delivery', label: 'Out for Delivery' },
  { key: 'delivered', label: 'Delivered' }
];

function SimpleModal({ open, onClose, title, children }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6 relative">
        <button onClick={onClose} className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
        <h2 className="text-xl font-semibold mb-4 text-center">{title}</h2>
        {children}
      </div>
    </div>
  );
}

const copyToClipboard = (otp) => {
  navigator.clipboard.writeText(otp);
  toast.success('OTP copied to clipboard!');
};

export default Orders; 