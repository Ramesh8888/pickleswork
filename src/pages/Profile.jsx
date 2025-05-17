import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { FaUser, FaEnvelope, FaPhone, FaSignOutAlt, FaEdit, FaMapMarkerAlt } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import { user, orders, subscriptions as subscriptionService } from '../services/api';

function Subscriptions({ subscriptions, onPause, onCancel, loading }) {
  const [confirming, setConfirming] = useState({ id: null, action: null, status: null });

  const handleAction = (id, action, status) => {
    setConfirming({ id, action, status });
  };

  const confirmAction = () => {
    if (confirming.action === 'pause') onPause(confirming.id, confirming.status);
    if (confirming.action === 'resume') onPause(confirming.id, confirming.status);
    if (confirming.action === 'cancel') onCancel(confirming.id);
    setConfirming({ id: null, action: null, status: null });
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 mt-6">
      <h2 className="text-2xl font-bold text-primary-700 mb-6">My Subscriptions</h2>
      {loading ? (
        <div className="text-gray-500 text-center py-8">Loading subscriptions...</div>
      ) : subscriptions.length === 0 ? (
        <div className="text-gray-500 text-center py-8">You have no active subscriptions.</div>
      ) : (
        <div className="space-y-6">
          {subscriptions.map((sub, idx) => (
            <div
              key={sub._id || sub.id || idx}
              className="flex flex-col md:flex-row md:items-center md:justify-between bg-gray-50 rounded-lg p-4 border border-gray-100"
            >
              <div className="flex items-center gap-4">
                {sub.product?.image && (
                  <img
                    src={sub.product.image}
                    alt={sub.product.name}
                    className="w-16 h-16 object-cover rounded"
                  />
                )}
                <div>
                  <div className="text-lg font-semibold text-gray-900">
                    {sub.plan || sub.product?.name || 'Subscription'}
                  </div>
                  <div className="text-sm text-gray-500">
                    Status: <span className="text-gray-900">
                      {typeof sub.status === 'string' && ['active','paused','cancelled'].includes(sub.status)
                        ? sub.status.charAt(0).toUpperCase() + sub.status.slice(1)
                        : 'N/A'}
                    </span>
                  </div>
                  <div className="text-sm text-gray-500">
                    Next Billing:{' '}
                    {sub.nextBilling ||
                      (sub.nextBillingDate
                        ? new Date(sub.nextBillingDate).toLocaleDateString()
                        : 'N/A')}
                  </div>
                  <div className="text-sm text-gray-500">
                    Frequency: <span className="text-gray-900">{sub.frequency ? String(sub.frequency) : 'N/A'}</span>
                  </div>
                  <div className="text-sm text-gray-500">
                    Quantity: <span className="text-gray-900">
                      {Array.isArray(sub.products) && sub.products.length > 0
                        ? sub.products.reduce((sum, p) => sum + (Number.isFinite(p.quantity) ? p.quantity : 0), 0)
                        : 'N/A'}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex gap-2 mt-4 md:mt-0">
                {(sub.status === 'paused' || sub.status === 'Paused') ? (
                  <button
                    className="px-4 py-2 rounded-md border border-primary-200 text-primary-700 hover:bg-primary-50 transition-colors disabled:opacity-50"
                    disabled={loading}
                    onClick={() => handleAction(sub._id || sub.id, 'resume', sub.status)}
                  >
                    Resume
                  </button>
                ) : (
                  <button
                    className="px-4 py-2 rounded-md border border-primary-200 text-primary-700 hover:bg-primary-50 transition-colors disabled:opacity-50"
                    disabled={loading}
                    onClick={() => handleAction(sub._id || sub.id, 'pause', sub.status)}
                  >
                    Pause
                  </button>
                )}
                <button
                  className="px-4 py-2 rounded-md border border-red-200 text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
                  disabled={loading}
                  onClick={() => handleAction(sub._id || sub.id, 'cancel', sub.status)}
                >
                  Cancel
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      {/* Confirmation Dialog */}
      {confirming.id && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-xs text-center">
            <div className="mb-4 text-lg font-semibold">
              {confirming.action === 'cancel'
                ? 'Cancel this subscription?'
                : confirming.action === 'pause'
                ? 'Pause this subscription?'
                : 'Resume this subscription?'}
            </div>
            <div className="flex justify-center gap-4">
              <button
                className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300"
                onClick={() => setConfirming({ id: null, action: null, status: null })}
              >
                No
              </button>
              <button
                className="px-4 py-2 rounded bg-primary-600 text-white hover:bg-primary-700"
                onClick={confirmAction}
              >
                Yes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const Profile = () => {
  const { user: authUser, isAuthenticated, updateProfile, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('profile');
  const [userOrders, setUserOrders] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: {
      street: '',
      city: '',
      state: '',
      pincode: ''
    }
  });
  const [loading, setLoading] = useState(false);
  const [addressError, setAddressError] = useState(null);
  const [fetchAttempts, setFetchAttempts] = useState(0);
  const [activeSection, setActiveSection] = useState('profile');
  const [subsLoading, setSubsLoading] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    // Add a small delay before fetching to prevent rapid requests
    const timer = setTimeout(() => {
      fetchUserData();
    }, 500);

    return () => clearTimeout(timer);
  }, [isAuthenticated, navigate]);

  const fetchUserData = async () => {
    // Prevent multiple simultaneous requests
    if (fetchAttempts > 3) {
      console.log('Too many fetch attempts, stopping');
      return;
    }

    try {
      setIsLoading(true);
      setAddressError(null);
      setFetchAttempts(prev => prev + 1);

      // Fetch profile data first
      const profileResponse = await user.getProfile();
      const userData = profileResponse.data.user;

      // Initialize form data with user data
      setFormData({
        name: userData.name || '',
        email: userData.email || '',
        phone: userData.phone || '',
        address: userData.addresses?.[0] || {
          street: '',
          city: '',
          state: '',
          pincode: ''
        }
      });

      // Fetch orders and subscriptions in parallel
      const [ordersResponse, subscriptionsResponse] = await Promise.all([
        orders.getAll(),
        subscriptionService.getAll()
      ]);

      setUserOrders(ordersResponse.data);
      setSubscriptions(subscriptionsResponse.data);
    } catch (error) {
      console.error('Error fetching user data:', error);
      if (error.response?.status === 404) {
        // Initialize empty form data if user not found
        setFormData({
          name: '',
          email: '',
          phone: '',
          address: {
            street: '',
            city: '',
            state: '',
            pincode: ''
          }
        });
        setAddressError('Please complete your profile information');
      } else if (error.response?.status === 429) {
        // Handle rate limiting
        toast.error('Too many requests. Please wait a moment and try again.');
        setTimeout(() => {
          setFetchAttempts(0); // Reset attempts after delay
        }, 5000);
      } else {
        toast.error('Failed to load user data. Please try again later.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setAddressError(null);

    try {
      // Validate required fields
      if (!formData.name || !formData.email || !formData.phone) {
        toast.error('Please fill in all required fields');
        setLoading(false);
        return;
      }

      // Validate address fields if address is being updated
      if (formData.address) {
        const { street, city, state, pincode } = formData.address;
        if (!street || !city || !state || !pincode) {
          setAddressError('Please fill in all address fields');
          setLoading(false);
          return;
        }
      }

      // Prepare the update data
      const updateData = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone
      };

      // Only include address if it's being updated
      if (formData.address) {
        updateData.address = formData.address;
      }

      console.log('Sending update data:', updateData);

      const response = await user.updateProfile(updateData);

      if (response.data?.user) {
        await updateProfile(response.data.user);
        setIsEditing(false);
        toast.success('Profile updated successfully!');
        
        // Refresh user data after successful update
        await fetchUserData();
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      
      // Handle specific error cases
      if (error.response?.status === 400) {
        const errorMessage = error.response.data.error || 'Invalid data provided';
        setAddressError(errorMessage);
        toast.error(errorMessage);
      } else if (error.response?.status === 401) {
        toast.error('Your session has expired. Please log in again.');
        logout();
        navigate('/login');
      } else if (error.response?.status === 403) {
        toast.error('You do not have permission to update this profile.');
      } else if (error.response?.status === 404) {
        toast.error('Profile not found.');
      } else if (error.response?.status === 500) {
        toast.error('Server error. Please try again later.');
      } else {
        toast.error('Failed to update profile. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleCancelSubscription = async (subscriptionId) => {
    try {
      setSubsLoading(true);
      await subscriptionService.cancel(subscriptionId);
      setSubscriptions(prev => prev.filter(sub => (sub._id || sub.id) !== subscriptionId));
      toast.success('Subscription cancelled successfully!');
    } catch (error) {
      console.error('Error cancelling subscription:', error);
      toast.error('Failed to cancel subscription. Please try again.');
    } finally {
      setSubsLoading(false);
    }
  };

  const handlePauseSubscription = async (subscriptionId, status) => {
    try {
      setSubsLoading(true);
      let response;
      if (status === 'paused' || status === 'Paused') {
        response = await subscriptionService.resume(subscriptionId);
        toast.success('Subscription resumed successfully!');
      } else {
        response = await subscriptionService.pause(subscriptionId);
      toast.success('Subscription paused successfully!');
      }
      const updatedSub = response.data.subscription || response.data;
      setSubscriptions(prev => prev.map(sub => (sub._id || sub.id) === subscriptionId ? updatedSub : sub));
    } catch (error) {
      console.error('Error pausing/resuming subscription:', error);
      toast.error('Failed to update subscription. Please try again.');
    } finally {
      setSubsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
            <div className="space-y-4">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-12">
      <div className="container mx-auto px-4 max-w-3xl">
        <div className="bg-white rounded-xl shadow-sm p-8">
          <div className="flex gap-4 mb-8 border-b border-gray-100 pb-2">
                <button
              className={`px-4 py-2 rounded-t-md font-semibold transition-colors ${activeSection === 'profile' ? 'text-primary-700 border-b-2 border-primary-600 bg-primary-50' : 'text-gray-500 hover:text-primary-700'}`}
              onClick={() => setActiveSection('profile')}
              >
                Profile
              </button>
              <button
              className={`px-4 py-2 rounded-t-md font-semibold transition-colors ${activeSection === 'subscriptions' ? 'text-primary-700 border-b-2 border-primary-600 bg-primary-50' : 'text-gray-500 hover:text-primary-700'}`}
              onClick={() => setActiveSection('subscriptions')}
              >
                Subscriptions
              </button>
          </div>
          {activeSection === 'profile' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-lg font-medium text-gray-900">Personal Information</h2>
                  <button
                    onClick={() => setIsEditing(!isEditing)}
                    className="text-sm text-primary-600 hover:text-primary-700"
                  >
                    {isEditing ? 'Cancel' : 'Edit Profile'}
                  </button>
                </div>
                {isEditing ? (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Name</label>
                        <input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Email</label>
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Phone</label>
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <div className="flex items-center space-x-2 mb-2">
                          <FaMapMarkerAlt className="text-gray-400" />
                          <h3 className="text-sm font-medium text-gray-700">Address</h3>
                        </div>
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                          <div>
                            <label className="block text-sm font-medium text-gray-700">Street</label>
                            <input
                              type="text"
                              name="address.street"
                              value={formData.address.street}
                              onChange={handleInputChange}
                              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700">City</label>
                            <input
                              type="text"
                              name="address.city"
                              value={formData.address.city}
                              onChange={handleInputChange}
                              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700">State</label>
                            <input
                              type="text"
                              name="address.state"
                              value={formData.address.state}
                              onChange={handleInputChange}
                              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700">Pincode</label>
                            <input
                              type="text"
                              name="address.pincode"
                              value={formData.address.pincode}
                              onChange={handleInputChange}
                              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                    {addressError && (
                      <div className="text-red-600 text-sm bg-red-50 p-3 rounded-md">
                        {addressError}
                      </div>
                    )}
                    <div className="flex justify-end space-x-3">
                      <button
                        type="button"
                        onClick={() => setIsEditing(false)}
                        className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={loading}
                        className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {loading ? 'Saving...' : 'Save Changes'}
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Name</label>
                      <p className="mt-1 text-sm text-gray-900">{formData.name}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Email</label>
                      <p className="mt-1 text-sm text-gray-900">{formData.email}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Phone</label>
                      <p className="mt-1 text-sm text-gray-900">{formData.phone || 'Not provided'}</p>
                    </div>
                    <div className="sm:col-span-2">
                      <div className="flex items-center space-x-2 mb-2">
                        <FaMapMarkerAlt className="text-gray-400" />
                        <h3 className="text-sm font-medium text-gray-700">Address</h3>
                      </div>
                      <p className="mt-1 text-sm text-gray-900">
                        {formData.address ? (
                          `${formData.address.street}, ${formData.address.city}, ${formData.address.state} - ${formData.address.pincode}`
                        ) : (
                        <div className="flex items-center space-x-2">
                          <span>No address provided</span>
                          <button
                            onClick={() => setIsEditing(true)}
                            className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                          >
                            Add Address
                          </button>
                        </div>
                        )}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
          {activeSection === 'subscriptions' && (
            <Subscriptions
              subscriptions={subscriptions}
              onPause={handlePauseSubscription}
              onCancel={handleCancelSubscription}
              loading={subsLoading}
            />
          )}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                <FaSignOutAlt className="mr-2" />
                Logout
              </button>
            </div>
          </div>
      </div>
    </div>
  );
};

export default Profile; 