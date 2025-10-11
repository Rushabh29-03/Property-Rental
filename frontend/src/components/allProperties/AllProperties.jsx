import React from 'react'
import Header from '../header/Header'
import AuthService from '../../services/AuthService';
import { useState, useEffect } from 'react';
import OwnerService from '../../services/OwnerService';
import PreviewProperty from '../previewProperty/PreviewProperty';
import { useNavigate } from 'react-router';
import UserService from '../../services/UserService';
import PhotoService from '../../services/PhotoService';

function AllProperties() {
  const role = AuthService.getCurrentUser()?.role;
  const navigate = useNavigate();

  // Properties state
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Photo state
  const [propertyPhotos, setPropertyPhotos] = useState({});
  const [photoUrls, setPhotoUrls] = useState({});
  const [loadingPhotos, setLoadingPhotos] = useState(new Set());

  // Wishlist state
  const [wishListedProperties, setWishListedProperties] = useState([]);

  // Search and filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [filterVerified, setFilterVerified] = useState('all');
  const [sortBy, setSortBy] = useState('newest');

  // Create wishlist data mapping
  let wishListData = {};
  properties.forEach(property => {
    wishListData[property.id] = false;
  });

  (wishListedProperties || []).forEach(property => {
    wishListData[property.propertyDto?.id] = true;
  });

  // Load property photos
  const loadPropertyPhotos = async (propertyId) => {
    if (propertyPhotos[propertyId] || loadingPhotos.has(propertyId)) {
      return;
    }

    setLoadingPhotos(prev => new Set([...prev, propertyId]));

    try {
      const response = await PhotoService.fetchPhotos(propertyId);
      if (response?.photos?.length > 0) {
        setPropertyPhotos(prev => ({
          ...prev,
          [propertyId]: response.photos
        }));

        // Load first photo
        const firstPhoto = response.photos[0];
        if (firstPhoto && !photoUrls[firstPhoto.id]) {
          const dataUrl = await PhotoService.getPhotoDataUrl(firstPhoto.id);
          if (dataUrl) {
            setPhotoUrls(prev => ({
              ...prev,
              [firstPhoto.id]: dataUrl
            }));
          }
        }
      }
    } catch (error) {
      console.error(`Error loading photos for property ${propertyId}:`, error);
    } finally {
      setLoadingPhotos(prev => {
        const newSet = new Set(prev);
        newSet.delete(propertyId);
        return newSet;
      });
    }
  };

  // GET ALL PROPERTIES
  const handleGetProperty = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await AuthService.getAllProperties();
      setProperties(response ? response : []);

      // Load photos for first few properties
      if (response && response.length > 0) {
        const firstFew = response.slice(0, 6);
        firstFew.forEach(property => {
          loadPropertyPhotos(property.id);
        });
      }
    } catch (error) {
      console.error(error);
      setError('Failed to load properties');
    } finally {
      setLoading(false);
    }
  };

  // GET USER'S WISHLISTED PROPERTIES
  const getWishListed = async () => {
    try {
      const response = await UserService.getWishListedProperties();
      setWishListedProperties(Array.isArray(response) ? response : []);
    } catch (error) {
      console.error(error);
      setWishListedProperties([])
    }
  };

  // Filter and sort properties
  const filteredAndSortedProperties = properties
    .filter(property => {
      const matchesSearch = property.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        property.address.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesFilter = filterVerified === 'all' ||
        (filterVerified === 'verified' && property.isVerified) ||
        (filterVerified === 'unverified' && !property.isVerified);

      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'price-low':
          return (a.monthlyRent || 0) - (b.monthlyRent || 0);
        case 'price-high':
          return (b.monthlyRent || 0) - (a.monthlyRent || 0);
        case 'area-large':
          return (b.area || 0) - (a.area || 0);
        case 'area-small':
          return (a.area || 0) - (b.area || 0);
        default:
          return b.id - a.id; // newest first
      }
    });

  // Navigate to property details
  const handleNavigate = (pr_id) => {
    navigate(`/property/${pr_id}`, {
      state: { isWishListedProp: wishListData[pr_id] }
    });
  };

  // Load more photos on scroll or interaction
  const handleLoadMorePhotos = (propertyId) => {
    if (!propertyPhotos[propertyId]) {
      loadPropertyPhotos(propertyId);
    }
  };

  // Component mount effect
  useEffect(() => {
    handleGetProperty();
    if (role === 'ROLE_USER') {
      getWishListed();
    }
  }, []);

  // !USE-EFFECT - load phoots of all properties on page load
  useEffect(() => {
    for (const i of properties) {
      loadPropertyPhotos(i.id);
    }
  }, [properties])

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">All Properties</h1>
          <p className="text-gray-600">
            Discover your perfect rental property from our curated listings
          </p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* SearcFh */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Search Properties
              </label>
              <input
                type="text"
                placeholder="Search by description or address..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            {/* Filter by Verification */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Verification Status
              </label>
              <select
                value={filterVerified}
                onChange={(e) => setFilterVerified(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="all">All Properties</option>
                <option value="verified">Verified Only</option>
                <option value="unverified">Unverified Only</option>
              </select>
            </div>

            {/* Sort By */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Sort By
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="newest">Newest First</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="area-large">Area: Largest First</option>
                <option value="area-small">Area: Smallest First</option>
              </select>
            </div>
          </div>

          {/* Results Count */}
          <div className="mt-4 pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-600">
              Showing {filteredAndSortedProperties.length} of {properties.length} properties
            </p>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading properties...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="text-center py-12">
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={handleGetProperty}
              className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Properties Grid */}
        {!loading && !error && (
          <div>
            {filteredAndSortedProperties.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-4">
                  <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H9m0 0H5m0 0h2M7 7h10M7 11h4m6 0h4" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Properties Found</h3>
                <p className="text-gray-500 mb-4">
                  {searchTerm || filterVerified !== 'all' ?
                    'Try adjusting your search criteria.' :
                    'No properties have been added yet.'}
                </p>
                {(searchTerm || filterVerified !== 'all') && (
                  <button
                    onClick={() => {
                      setSearchTerm('');
                      setFilterVerified('all');
                    }}
                    className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
                  >
                    Clear Filters
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredAndSortedProperties.map((property) => (
                  <div
                    key={property.id}
                    className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                    onClick={() => handleNavigate(property.id)}
                  >
                    {/* Property Image */}
                    <div className="h-48 bg-gray-200 relative">
                      {loadingPhotos.has(property.id) ? (
                        <div className="h-full flex items-center justify-center">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                        </div>
                      ) : propertyPhotos[property.id]?.length > 0 ? (
                        <div className="h-full">
                          {photoUrls[propertyPhotos[property.id][0].id] ? (
                            <img
                              src={photoUrls[propertyPhotos[property.id][0].id]}
                              alt={propertyPhotos[property.id][0].filename}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.nextSibling.style.display = 'flex';
                              }}
                            />
                          ) : (
                            <div className="h-full bg-gray-100 flex items-center justify-center">
                              <span className="text-gray-400">Loading image...</span>
                            </div>
                          )}
                          {/* Fallback */}
                          <div className="h-full bg-gray-100 items-center justify-center text-gray-400 hidden">
                            <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </div>
                        </div>
                      ) : (
                        <div
                          className="h-full bg-gray-100 flex items-center justify-center text-gray-400 hover:bg-gray-50 transition-colors"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleLoadMorePhotos(property.id);
                          }}
                        >
                          <div className="text-center">
                            <svg className="mx-auto h-8 w-8 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <span className="text-sm">Click to load photos</span>
                          </div>
                        </div>
                      )}

                      {/* Photo Count Badge */}
                      {propertyPhotos[property.id]?.length > 1 && (
                        <div className="absolute top-2 right-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded-full text-xs">
                          {propertyPhotos[property.id].length} photos
                        </div>
                      )}

                      {/* Verification Badge */}
                      <div className="absolute top-2 left-2">
                        <span className={`px-2 py-1 text-xs rounded-full ${property.isVerified
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                          }`}>
                          {property.isVerified ? 'Verified' : 'Pending'}
                        </span>
                      </div>

                      {/* Wishlist Badge */}
                      {wishListData[property.id] && (
                        <div className="absolute bottom-2 right-2">
                          <div className="bg-red-500 text-white p-1 rounded-full">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                            </svg>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Property Details */}
                    <h3 className='text-center font-bold text-gray-900 text-xl'>
                      {property.address}
                    </h3>
                    <div className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-semibold text-lg text-gray-900">
                          ₹{property.monthlyRent?.toLocaleString()}/month
                        </h3>
                      </div>

                      <div className="space-y-1 text-sm text-gray-600 mb-3">
                        <div className="flex items-center">
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2V7zm0 0V5a2 2 0 012-2h6l2 2h6a2 2 0 012 2v2M7 13h10M7 17h4" />
                          </svg>
                          <span>{property.noOfBedrooms} Bedrooms</span>
                        </div>
                        <div className="flex items-center">
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                          </svg>
                          <span>{property.area} {property.areaUnit}</span>
                        </div>
                      </div>

                      {/* <p className="text-gray-700 text-sm line-clamp-2 mb-3">
                        {property.description}
                      </p> */}

                      <div className="text-xs text-gray-500 border-t pt-2">
                        <div className="flex items-center">
                          <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          <span className="truncate">{property.description}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default AllProperties