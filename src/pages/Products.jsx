import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useCart } from '../context/CartContext';
import { toast } from 'react-hot-toast';
import { products as productsApi } from '../services/api';

const Products = () => {
  const { addToCart } = useCart();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('popular');
  const [viewMode, setViewMode] = useState('grid');
  const [priceRange, setPriceRange] = useState([0, 1000]);
  const [selectedTags, setSelectedTags] = useState([]);
  const [quantities, setQuantities] = useState({});

  const categories = [
    { id: 'all', name: 'All Products', icon: 'https://cdn-icons-png.flaticon.com/128/6785/6785304.png' },
    { id: 'mango', name: 'Mango pick', icon: '/public/images/Mango_pick.jpg'},
    { id: 'chicken', name: 'Chicken pick', icon: '/public/images/Chicken_pick.jpg'},
    { id: 'prawns', name: 'Prawns pick', icon: '/public/images/prawns.jpg'},
    { id: 'mutton', name: 'Mutton pick', icon: '/public/images/Mutton_pick.jpg'},
    { id: 'tomato', name: 'Tomato pick', icon: '/public/images/Tomato_pickle.jpg'}
  ];

  const allTags = [...new Set(products.flatMap(product => product.tags))];

  const filteredProducts = products
    .filter(product => selectedCategory === 'all' || product.category === selectedCategory)
    .filter(product => product.name.toLowerCase().includes(searchQuery.toLowerCase()))
    .filter(product => product.price >= priceRange[0] && product.price <= priceRange[1])
    .filter(product => selectedTags.length === 0 || selectedTags.some(tag => product.tags.includes(tag)))
    .sort((a, b) => {
      switch (sortBy) {
        case 'price-low':
          return a.price - b.price;
        case 'price-high':
          return b.price - a.price;
        case 'rating':
          return b.rating - a.rating;
        case 'newest':
          return b._id - a._id;
        default:
          return b.reviews - a.reviews;
      }
    });

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await productsApi.getAll();
        setProducts(response.data);
      } catch (err) {
        setError('Failed to load products');
        toast.error('Failed to load products');
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      const sidebar = document.getElementById('mobile-sidebar');
      const filterButton = document.getElementById('filter-button');
      if (showMobileFilters && sidebar && !sidebar.contains(event.target) && !filterButton.contains(event.target)) {
        setShowMobileFilters(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showMobileFilters]);

  const handleQuantityChange = (productId, value) => {
    setQuantities(q => ({
      ...q,
      [productId]: Math.max(1, (q[productId] || 1) + value)
    }));
  };

  const handleAddToCart = (product) => {
    addToCart({
      ...product,
      quantity: quantities[product._id] || 1
    });
  };

  const BACKEND_URL = 'http://localhost:5000/';
  const getImageUrl = (img) => {
    if (!img) return '/placeholder.png';
    return img.startsWith('http') ? img : BACKEND_URL + img.replace(/^\/+/, '');
  };

  return (
    <div className="min-h-screen bg-gray-100">

      {/* Search Bar */}
      <div className="bg-white border-b sticky top-14 z-20">
        <div className="max-w-7xl mx-auto px-3 py-3">
          <div className="relative">
            <input
              type="text"
              placeholder="Search for dairy products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
            <svg
              className="absolute left-3 top-2.5 w-5 h-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-3 py-4">
        <div className="flex gap-4">
          {/* Categories Sidebar */}
          <div className="sticky top-32 z-10 w-24 bg-white rounded-lg shadow-md p-2">
            {/* Categories Section */}
            <div className="mb-4">
              <h3 className="text-sm font-semibold mb-2">Categories</h3>
              <div className="flex flex-col space-y-2">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    className={`flex flex-col items-center px-2 py-2 rounded-md transition-colors ${
                      selectedCategory === category.id
                        ? 'bg-primary-100 text-primary-600'
                        : 'hover:bg-gray-100'
                    }`}
                    onClick={() => setSelectedCategory(category.id)}
                  >
                    <img
                      src={category.icon}
                      alt={category.name}
                      className="w-6 h-6 mb-1"
                    />
                    <span className="text-sm truncate text-center">{category.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Price Range Section */}
            <div className="border-t border-gray-100 pt-4">
              <h3 className="text-sm font-semibold mb-3">Price Range</h3>
              <div className="space-y-4">
                <div className="relative">
                  <input
                    type="range"
                    min="0"
                    max="1000"
                    value={priceRange[1]}
                    onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                    className="w-full h-1 bg-gray-200 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary-500 [&::-webkit-slider-thumb]:cursor-pointer [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-primary-500 [&::-moz-range-thumb]:cursor-pointer"
                  />
                  <div className="flex justify-between text-xs text-gray-600 mt-1">
                    <span>₹{priceRange[0]}</span>
                    <span>₹{priceRange[1]}</span>
                  </div>
                </div>
                <div className="flex flex-col space-y-2">
                  <div className="flex flex-col">
                    <label className="text-xs text-gray-600 mb-1">Min Price</label>
                    <input
                      type="number"
                      placeholder="Min"
                      className="w-full px-2 py-1.5 border rounded-md text-sm focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                      value={priceRange[0]}
                      onChange={(e) => setPriceRange([parseInt(e.target.value), priceRange[1]])}
                    />
                  </div>
                  <div className="flex flex-col">
                    <label className="text-xs text-gray-600 mb-1">Max Price</label>
                    <input
                      type="number"
                      placeholder="Max"
                      className="w-full px-2 py-1.5 border rounded-md text-sm focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                      value={priceRange[1]}
                      onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Products Grid */}
          <div className="flex-1">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {filteredProducts.map((product) => (
                <motion.div
                  key={product._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden group flex flex-col"
                >
                  <Link to={`/products/${product._id}`} className="block flex-1">
                    {/* Product Image */}
                    <div className="relative h-[160px] overflow-hidden">
                      <img
                        src={getImageUrl(product.image || (Array.isArray(product.images) && product.images[0]))}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      {product.discount > 0 && (
                        <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded text-xs font-medium shadow-sm">
                          {product.discount}% OFF
                        </div>
                      )}
                      {product.stock < 10 && (
                        <div className="absolute top-2 left-2 bg-amber-500 text-white px-2 py-1 rounded text-xs font-medium shadow-sm">
                          Low Stock
                        </div>
                      )}
                    </div>

                    {/* Product Info */}
                    <div className="p-3 flex flex-col flex-1">
                      <h3 className="text-sm font-medium text-gray-800 hover:text-primary-600 line-clamp-1">
                        {product.name}
                      </h3>
                      <p className="text-xs text-gray-600 mt-1 line-clamp-2">{product.description}</p>
                      
                      <div className="mt-2 flex flex-col">
                        <div className="flex items-baseline gap-1.5">
                          <span className="text-base font-semibold text-primary-600">₹{product.price}</span>
                          <span className="text-xs text-gray-500">/{product.unit}</span>
                        </div>
                        {product.discount > 0 && (
                          <span className="text-xs text-gray-500 line-through">
                            ₹{Math.round(product.price * (1 + product.discount / 100))}
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>
                  
                  <div className="p-3 pt-0">
                    {product.category === 'milk' ? (
                      <Link
                        to="/subscriptions"
                        className="w-full bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium py-2 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
                      >
                        <span>Subscribe Now</span>
                        <span className="text-xs bg-white/20 px-2 py-0.5 rounded">Subscription Only</span>
                      </Link>
                    ) : (
                      <div className="flex items-center gap-2">
                        <div className="flex-1 flex items-center border rounded-lg overflow-hidden">
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              handleQuantityChange(product._id, -1);
                            }}
                            className="px-3 py-1 bg-gray-100 hover:bg-gray-200 transition-colors text-gray-600"
                          >
                            -
                          </button>
                          <span className="flex-1 text-center py-1">
                            {quantities[product._id] || 1}
                          </span>
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              handleQuantityChange(product._id, 1);
                            }}
                            className="px-3 py-1 bg-gray-100 hover:bg-gray-200 transition-colors text-gray-600"
                          >
                            +
                          </button>
                        </div>
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            handleAddToCart(product);
                          }}
                          className="bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium py-2 px-4 rounded-lg transition-colors duration-200"
                        >
                          Add to Cart
                        </button>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>

            {/* No Results */}
            {filteredProducts.length === 0 && (
              <div className="text-center py-8">
                <svg
                  className="mx-auto h-12 w-12 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">No products found</h3>
                <p className="mt-1 text-xs text-gray-500">
                  Try adjusting your search or filter to find what you're looking for.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Products; 