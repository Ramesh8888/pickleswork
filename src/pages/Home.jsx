import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import { motion } from 'framer-motion';
import apiService from '../api/apiService';

// Custom arrow components to fix the prop warnings
const PrevArrow = ({ onClick }) => (
  <button
    onClick={onClick}
    className="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-white p-2 rounded-full shadow-md hover:shadow-lg transition-all duration-200"
    aria-label="Previous slide"
  >
    <svg
      className="w-6 h-6 text-gray-600"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M15 19l-7-7 7-7"
      />
    </svg>
  </button>
);

const NextArrow = ({ onClick }) => (
  <button
    onClick={onClick}
    className="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-white p-2 rounded-full shadow-md hover:shadow-lg transition-all duration-200"
    aria-label="Next slide"
  >
    <svg
      className="w-6 h-6 text-gray-600"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9 5l7 7-7 7"
      />
    </svg>
  </button>
);

// Custom dot component
const CustomDot = ({ onClick }) => (
  <button
    onClick={onClick}
    className="w-3 h-3 mx-1 rounded-full bg-white opacity-50 hover:opacity-100 transition-opacity duration-200"
    aria-label="Go to slide"
  />
);

const Home = () => {
  const [featuredProducts, setFeaturedProducts] = useState([
    {
      id: 1,
      name: 'Green Chilli Pickle',
      description: 'Spicy and tangy, our green chilli pickle adds a fiery kick to every meal with its bold, flavorful blend of spices.',
      price: 187,
      image: 'https://cinnamonsnail.com/wp-content/uploads/2023/07/green-chili-pickle-feature.jpg',
      category: 'Green chilli Pickle',
      rating: 4.8,
      reviews: 120
    },
    {
      id: 2,
      name: 'Ginger pickle',
      description: 'Handmade fresh paneer with high protein content.',
      price: 220,
      image: 'https://www.indianhealthyrecipes.com/wp-content/uploads/2022/01/ginger-chutney-allam-chutney.jpg',
      category: 'Ginger pickle',
      rating: 4.9,
      reviews: 85
    },
    {
      id: 3,
      name: 'Chana Methi Pickle',
      description: 'Traditional curd made with pure milk and natural cultures.',
      price: 150,
      image: 'https://cdn.dotpe.in/longtail/store-items/8107508/c43vz1Dn.jpeg',
      category: 'Chana Methi Pickle',
      rating: 4.7,
      reviews: 95
    },
    {
      id: 4,
      name: 'Brinjal Pickle',
      description: '100% pure cow ghee made using traditional methods.',
      price: 250,
      image: 'https://dwarakapickles.com/wp-content/uploads/2022/05/BrinjalPickle-1.png',
      category: 'Brinjal Pickle',
      rating: 4.9,
      reviews: 150
    },
    {
      id: 5,
      name: 'Garlic Pickle',
      description: 'Creamy and rich butter made from fresh cream.',
      price: 180,
      image: 'https://saffronandherbs.com/wp-content/uploads/2024/02/torshi-seer.jpg',
      category: 'Garlic Pickle',
      rating: 4.8,
      reviews: 110
    }
  ]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Comment out the API call for development
  // useEffect(() => {
  //   const fetchFeaturedProducts = async () => {
  //     try {
  //       const response = await apiService.get('/products/featured');
  //       setFeaturedProducts(response.data);
  //       setLoading(false);
  //     } catch (err) {
  //       setError('Failed to load featured products');
  //       setLoading(false);
  //     }
  //   };

  //   fetchFeaturedProducts();
  // }, []);

  // Set loading to false since we're using sample data
  useEffect(() => {
    setLoading(false);
  }, []);

  const carouselSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 5000,
    pauseOnHover: true,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          arrows: true,
        },
      },
      {
        breakpoint: 768,
        settings: {
          arrows: false,
        },
      },
    ],
    prevArrow: <PrevArrow />,
    nextArrow: <NextArrow />,
    customPaging: () => <CustomDot />,
    appendDots: dots => (
      <div className="absolute bottom-4 left-0 right-0">
        <ul className="flex justify-center items-center m-0 p-0"> {dots} </ul>
      </div>
    )
  };

  const carouselItems = [
    {
      id: 1,
       title: 'veg-pickles',
      // description: 'Get the freshest pcikles product delivered to your doorstep',
      image: 'https://images.unsplash.com/photo-1664791461482-79f5deee490f?fm=jpg&q=60&w=3000&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTl8fHBpY2tsZXxlbnwwfHwwfHx8MA%3D%3D',
       buttonText: 'Shop Now',
      // buttonLink: '/products',
    },
    {
      id: 2,
       title: 'Non-veg pickles',
      // description: 'Never run out of your daily essentials with our subscription service',
      image: 'public/images/prawn.jpg',
       buttonText: 'Subscribe Now',
      buttonLink: '/subscriptions',
    },
    {
      id: 3,
      title: 'Leaf pickles',
      // description: 'We ensure the highest quality standards for all our products',
      image: 'public/images/curry.jpg',
       buttonText: 'Learn More',
      // buttonLink: '/about',
    },
  ];

  const categories = [
    { 
      id: 1, 
      name: 'Amal', 
      image: 'https://www.naturawfreshfoods.com/wp-content/uploads/2024/06/Amla-pickle-4.jpg', 
      link: '/products?category=Amal' 
    },
    // { 
    //   id: 2, 
    //   name: 'Fresh Vegetables', 
    //   image: 'https://i.pinimg.com/736x/da/4e/e6/da4ee6453b894c076b775350fe68cea5.jpg', 
    //   link: '/products?category=vegetables' 
    // },
    // { 
    //   id: 3, 
    //   name: 'Fresh Fruits', 
    //   image: 'https://i.pinimg.com/736x/7b/82/51/7b8251f15a271dc196009f14b7a77126.jpg', 
    //   link: '/products?category=fruits' 
    // },
    // { 
    //   id: 4, 
    //   name: 'Milk Products', 
    //   image: 'https://i.pinimg.com/736x/37/b6/11/37b61170e813bd28dc4a570485c1cffc.jpg', 
    //   link: '/products?category=dairy' 
    // },
    // { 
    //   id: 5, 
    //   name: 'Ghee & Oils', 
    //   image: 'https://i.pinimg.com/736x/c4/a1/f7/c4a1f74af939fcb0bf0f24011db494d2.jpg', 
    //   link: '/products?category=ghee' 
    // },
    { 
      id: 6, 
      name: 'Mango', 
      image: 'https://media.istockphoto.com/id/528476560/photo/mango-pickle.jpg?s=612x612&w=0&k=20&c=1Hi9BzNeMEfKkBOMniMyxWF4mVs8LXrE-qHEu3F_R5M=', 
      link: '/products?category=Mango' 
    },
    { 
      id: 7, 
      name: 'Tamarind', 
      image: 'https://m.media-amazon.com/images/I/61n8JOY6b7L._AC_UF1000,1000_QL80_.jpg', 
      link: '/products?category=Tamarind' 
    },
    // {
    //   id: 8,
    //   name: 'Pulses (Chemical-free)',
    //   image: 'https://i.pinimg.com/736x/53/63/01/536301a5234d63afd9bafde17d830a18.jpg',
    //   link: '/products?category=pulses'
    // },
    // {
    //   id: 9,
    //   name: 'Dry Fruits & Seeds',
    //   image: 'https://i.pinimg.com/736x/ef/fb/f0/effbf08ec26d14f022859691f5452d2d.jpg',
    //   link: '/products?category=dryfruits'
    // },
    {
      id: 10,
      name: 'Kariveypaku pickle',
      image: 'https://i0.wp.com/ahahomefoods.com/wp-content/uploads/2023/02/Curry-leaves-Pickle.jpg?fit=600%2C600&ssl=1',
      link: '/products?category=kariveypaku'
    },
    // {
    //   id: 11,
    //   name: 'Cereals & Millets',
    //   image: 'https://i.pinimg.com/736x/53/63/01/536301a5234d63afd9bafde17d830a18.jpg',
    //   link: '/products?category=cereals'
    // },
    // {
    //   id: 12,
    //   name: 'Salt & Sugar',
    //   image: 'https://i.pinimg.com/736x/ef/fb/f0/effbf08ec26d14f022859691f5452d2d.jpg',
    //   link: '/products?category=essentials'
    // },
    {
      id: 13,
      name: 'Tomato pickle',
      image: 'https://meenakshirecipe.com/wp-content/uploads/2024/02/IMG-20240306-WA0015.jpg',
      link: '/products?category=tomato'
    },
    {
      id: 14,
      name: 'Gongura pickle',
      image: 'https://chaarviconnects.com/wp-content/uploads/2024/02/Gonglora2.jpg',
      link: '/products?category=Gongura'
    },
    {
      id: 15,
      name: 'Lemon pickle',
      image: 'https://desicondiments.com/wp-content/uploads/2020/06/DSC_8869.jpg',
      link: '/products?category=Lemon'
    }
  ];

  const farmToHomeImages = [
    {
      id: 1,
      title: 'Pickle preparation',
      description: 'Direct from our Home',
       image: '/public/images/PIC1.webp',
    },
    {
      id: 2,
      title: 'Quality Check',
      description: 'Rigorous quality control',
      image: '/public/images/PIC.webp',
    },
    {
      id: 3,
      title: 'Home Delivery',
      description: 'Fresh at your doorstep',
      image: '/public/images/PDeliveryBoy.jpg',
    },
  ];

  const whyAkshiPoints = [
    {
      id: 1,
      title: 'Premium Quality',
      description: 'We source our dairy products from the finest farms, ensuring the highest quality standards.',
      icon: 'https://cdn-icons-png.freepik.com/256/16146/16146186.png?ga=GA1.1.1693911840.1744959436&semt=ais_hybrid'
    },
    {
      id: 2,
      title: 'Fresh Delivery',
      description: 'Get your dairy products delivered fresh to your doorstep every morning.',
      icon: 'https://cdn-icons-png.freepik.com/256/14090/14090766.png?ga=GA1.1.1693911840.1744959436&semt=ais_hybrid'
    },
    {
      id: 3,
      title: 'Hygienic Packaging',
      description: 'Our products are packed in hygienic, tamper-proof packaging to maintain freshness.',
      icon: 'https://cdn-icons-png.freepik.com/256/10645/10645206.png?ga=GA1.1.1693911840.1744959436&semt=ais_hybrid'
    },
    {
      id: 4,
      title: 'Best Prices',
      description: 'Enjoy competitive prices without compromising on quality.',
      icon: 'https://cdn-icons-png.freepik.com/256/7661/7661944.png?ga=GA1.1.1693911840.1744959436&semt=ais_hybrid'
    }
  ];

  return (
    <div className="min-h-screen pt-7 bg-white">
      {/* Hero Carousel */}
      <div className="relative">
        <Slider {...carouselSettings} className="w-full">
          {carouselItems.map((item) => (
            <div key={item.id} className="relative h-[300px] sm:h-[400px]">
              <div
                className="absolute inset-0 bg-cover bg-center"
                style={{ 
                  backgroundImage: `url(${item.image})`,
                  // backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  backgroundRepeat: 'no-repeat'
                }}
              >
                {/* <div className="absolute inset-0 bg-black bg-opacity-40" /> */}
              </div>
              <div className="relative h-full flex flex-col items-center justify-center text-center px-4">
                <motion.h1
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-4"
                >
                  {item.title}
                </motion.h1>
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="text-base sm:text-lg text-white mb-6"
                >
                  {item.description}
                </motion.p>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                >
                  {/* <Link
                    to={item.buttonLink}
                    className="inline-block bg-primary-600 hover:bg-primary-700 text-white font-medium py-2 px-5 rounded-lg transition-colors duration-200 shadow-lg hover:shadow-xl"
                  >
                    {item.buttonText}
                  </Link> */}
                </motion.div>
              </div>
            </div>
          ))}
        </Slider>
      </div>

      {/* Explore Categories */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-xl font-semibold text-gray-900 mb-8">
            Explore Categories
          </h2>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-7 gap-6 sm:gap-8">
            {categories.map((category) => (
              <Link 
                key={category.id} 
                to={category.link} 
                className="flex flex-col items-center group"
              >
                <div className="w-24 h-24 rounded-full bg-white shadow-sm mb-3 flex items-center justify-center overflow-hidden">
                  <div className="w-full h-full rounded-full overflow-hidden">
                    <img 
                      src={category.image} 
                      alt={category.name} 
                      className="w-full h-full object-cover transform scale-110 transition-transform duration-300 ease-out group-hover:scale-125"
                    />
                  </div>
                </div>
                <span className="text-sm text-center text-black font-medium">
                  {category.name}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* New Launches */}
      <section className="bg-yellow-400 py-2 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-6 sm:mb-8">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1 sm:mb-2">New Launches</h2>
            <p className="text-sm sm:text-base text-gray-600">Discover our latest pickle products</p>
          </div>
          {loading ? (
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
          ) : error ? (
            <div className="text-center text-red-600">{error}</div>
          ) : (
            <div className="relative group">
              <button 
                onClick={() => {
                  const container = document.querySelector('.new-launches-scroll');
                  container.scrollLeft -= 300;
                }}
                className="hidden sm:block absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-white p-2 rounded-full shadow-md hover:shadow-lg transition-all duration-200 opacity-0 group-hover:opacity-100"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div className="overflow-x-auto pb-4 -mx-4 px-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none'] new-launches-scroll">
                <div className="flex space-x-3 sm:space-x-4 min-w-max">
                  {featuredProducts.map((product) => (
                    <motion.div
                      key={product.id}
                      initial={{ opacity: 0, x: 20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.5 }}
                      className="bg-white rounded-lg shadow-sm sm:shadow-md overflow-hidden hover:shadow-md sm:hover:shadow-lg transition-shadow duration-200 w-56 sm:w-64 flex-shrink-0"
                    >
                      <Link to={`/products/${product.id}`} className="block">
                        <div className="relative h-36 sm:h-40">
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="p-3 sm:p-4">
                          <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-0.5 sm:mb-1">{product.name}</h3>
                          <p className="text-xs sm:text-sm text-gray-600 mb-1.5 sm:mb-2 line-clamp-2">{product.description}</p>
                          <div className="flex flex-col space-y-1.5">
                            <div className="flex flex-col">
                              <div className="flex items-baseline gap-1.5">
                                <span className="text-sm sm:text-base font-bold text-primary-600">₹{product.price}</span>
                                <span className="text-xs text-gray-500">/{product.unit}</span>
                              </div>
                              {product.discount > 0 && (
                                <span className="text-xs text-gray-500 line-through">
                                  ₹{Math.round(product.price * (1 + product.discount / 100))}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center">
                              <span className="text-yellow-400 mr-0.5 sm:mr-1">★</span>
                              <span className="text-xs sm:text-sm text-gray-600">{product.rating} ({product.reviews})</span>
                            </div>
                            <button className="w-full bg-red-600 hover:bg-primary-700 text-white text-sm font-medium py-1.5 px-3 rounded-md transition-colors duration-200">
                              Add to Cart
                            </button>
                          </div>
                        </div>
                      </Link>
                    </motion.div>
                  ))}
                </div>
              </div>
              <button 
                onClick={() => {
                  const container = document.querySelector('.new-launches-scroll');
                  container.scrollLeft += 300;
                }}
                className="hidden sm:block absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-white p-2 rounded-full shadow-md hover:shadow-lg transition-all duration-200 opacity-0 group-hover:opacity-100"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          )}
        </div>
      </section>

       {/* How We Make It Work
      <section className="py-14 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-4">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">How We Make It Work</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto mb-2">
              From farm to your doorstep, we ensure the highest quality standards at every step
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3">
            <div className="text-center p-6">
              <div className="w-20 h-20 flex items-center justify-center mx-auto">
                <img 
                  src="https://cdn-icons-png.freepik.com/256/11561/11561610.png?ga=GA1.1.1693911840.1744959436" 
                  alt="Delivery Icon"
                  className="w-12 h-12"
                />
              </div>
              <h3 className="text-xl font-semibold text-gray-900">Timely Delivery</h3>
              <p className="text-gray-600">Fresh products delivered at your preferred time</p>
            </div>
            <div className="text-center p-6">
            <div className="w-20 h-20 flex items-center justify-center mx-auto">
                <img 
                  src="https://cdn-icons-png.freepik.com/256/16741/16741133.png?ga=GA1.1.1693911840.1744959436&semt=ais_hybrid"
                  alt="Delivery Icon"
                  className="w-12 h-12"
                />
              </div>
              <h3 className="text-xl font-semibold text-gray-900">Quality Check</h3>
              <p className="text-gray-600">Rigorous quality checks at every step</p>
            </div>
            <div className="text-center p-6">
            <div className="w-20 h-20 flex items-center justify-center mx-auto">
                <img 
                  src="https://cdn-icons-png.freepik.com/256/7989/7989059.png?ga=GA1.1.1693911840.1744959436&semt=ais_hybrid" 
                  alt="Delivery Icon"
                  className="w-12 h-12"
                />
              </div>
              <h3 className="text-xl font-semibold text-gray-900">Easy Payments</h3>
              <p className="text-gray-600">Multiple payment options for your convenience</p>
            </div>
          </div>
        </div>
      </section>  */}

      {/* Farm to Home Images
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-yellow-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Process</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Experience our commitment to quality at every step of production
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {farmToHomeImages.map((item) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="relative h-48 rounded-lg overflow-hidden group shadow-md hover:shadow-lg transition-shadow duration-300"
              >
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-4">
                  <h3 className="text-lg font-semibold text-white mb-1">{item.title}</h3>
                  <p className="text-sm text-gray-200">{item.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section> */}

      {/* Subscription Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-250 rounded-lg overflow-hidden">
            <div className="grid grid-cols-1 md:grid-cols-2">
              <div className="p-8 md:p-12">
                {/* <h2 className="text-3xl font-bold text-black mb-4">Subscribe & Save</h2>
                <p className="text-black text-lg mb-6">
                  Get your daily pickle essentials delivered to your doorstep with our flexible subscription plans.
                </p>
                <Link
                  to="/subscriptions"
                  className="inline-block bg-white text-red-600 font-medium py-3 px-6 rounded-lg hover:bg-gray-100 transition-colors duration-200"
                >
                  View Plans
                </Link> */}
                <h1 class="font-bold text-2xl italic">Simple and Clear Options:</h1>
                <h2>1. "Ma Amma Ruchulu Pickles – A Taste of Tradition in Every Bite!"</h2><br/>
                <h2>2. "Ma Amma Ruchulu Pickles – All Types, All Tastes, All Love!"</h2><br/>
                <h2>3. "From Our Home to Yours – Ma Amma Ruchulu Pickles."</h2><br/>
                <h2>4. "Ma Amma Ruchulu – Authentic Pickles, Just Like Mom Makes."</h2><br/>
                <h2>5. "Every Jar, a Flavorful Memory – Ma Amma Ruchulu Pickles."</h2><br/>
                <h2>6. "Andariki Kavalsina Avakaya ikkada ready!"</h2>
              </div>
              <div className="hidden md:block">
                <img
                  src="public/images/karam.webp"
                  // alt="Subscription"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Maa Amma Ruchulu */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-yellow-400">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Choose Maa Amma Ruchulu?</h2>
            <p className="text-lg text-gray-600">Experience the difference with our premium pickle products</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {whyAkshiPoints.map((point) => (
              <motion.div
                key={point.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="bg-white rounded-lg p-6 text-center shadow-md hover:shadow-lg transition-shadow duration-200"
              >
                <img 
                  src={point.icon} 
                  alt={point.title} 
                  className="w-16 h-16 mx-auto mb-4"
                />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{point.title}</h3>
                <p className="text-gray-600">{point.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* View All Products Button */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <Link
            to="/products"
            className="inline-block bg-red-600 hover:bg-primary-700 text-white font-medium py-4 px-8 rounded-lg text-lg transition-colors duration-200"
          >
            View All Products
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home; 
