import React, { useEffect, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router'
import AuthService from '../../services/AuthService';
import PropertyService from '../../services/PropertyService';
import AdminService from '../../services/AdminService';
import UserService from '../../services/UserService';
import PhotoService from '../../services/PhotoService';

function PreviewProperty() {
  // Navigate and Location hooks
  const navigate = useNavigate();
  const location = useLocation();
  const { pr_id } = useParams();
  const role = AuthService.getCurrentUser()?.role;

  // Property state
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isVisible, setIsVisible] = useState(false);

  // Photo state
  const [photos, setPhotos] = useState([]);
  const [photoUrls, setPhotoUrls] = useState({});
  const [loadingPhotos, setLoadingPhotos] = useState(new Set());
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [showPhotoModal, setShowPhotoModal] = useState(false);

  // Property rules state
  const [address, setAddress] = useState("");
  const [area, setArea] = useState(0.0);
  const [monthlyRent, setMonthlyRent] = useState(0.0);
  const [minStay, setMinStay] = useState(0);
  const [petsPolicy, setPetsPolicy] = useState(null);
  const [isSmokingAllowed, setIsSmokingAllowed] = useState(false);
  const [otherRules, setOtherRules] = useState(null);
  const [verified, setVerified] = useState(false);

  // Facilities state
  const [facilities, setFacilities] = useState([]);
  const [facilityLoaded, setFacilityLoaded] = useState(false);

  // Wishlist state
  const [note, setNote] = useState("EE haloo");
  const isWishListed = location.state?.isWishListedProp;

  // CSS classes
  const inputClassName = 'mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm';
  const buttonClassName = "px-4 py-2 rounded-md font-medium transition-colors";

  // Property data for updates
  const propertyRulesData = {
    "address": address,
    "area": area,
    "monthlyRent": monthlyRent,
    "minStay": minStay,
    "petsPolicy": petsPolicy,
    "smokingAllowed": isSmokingAllowed,
    "otherRules": otherRules
  };

  // Wishlist data
  const wishListData = { "note": note };

  // Load photos for the property
  const loadPropertyPhotos = async (propertyId) => {
    try {
      const response = await PhotoService.fetchPhotos(propertyId);

      if (response.photos) {
        setPhotos(response.photos);
        // Load first few photos
        const photosToLoad = response.photos.slice(0, response.photos.length>3 ? 3 : response.photos.length);

        for (const photo of photosToLoad) {
          loadIndividualPhoto(photo.id);
        }

      }
    } catch (error) {
      console.error('Error loading photos:', error);
    }
  };

  // Load individual photo
  const loadIndividualPhoto = async (photoId) => {
    if (photoUrls[photoId] || loadingPhotos.has(photoId)) return;

    setLoadingPhotos(prev => new Set([...prev, photoId]));
    try {
      const dataUrl = await PhotoService.getPhotoDataUrl(photoId);
      if (dataUrl) {
        setPhotoUrls(prev => ({ ...prev, [photoId]: dataUrl }));
      }
    } catch (error) {
      console.error('Error loading photo:', error);
    } finally {
      setLoadingPhotos(prev => {
        const newSet = new Set(prev);
        newSet.delete(photoId);
        return newSet;
      });
    }
  };

  // Photo slider navigation
  const nextPhoto = () => {
    if (photos.length > 0) {
      const nextIndex = (currentPhotoIndex + 1) % photos.length;
      setCurrentPhotoIndex(nextIndex);
      if (!photoUrls[photos[nextIndex].id]) {
        loadIndividualPhoto(photos[nextIndex].id);
      }
    }
  };

  const prevPhoto = () => {
    if (photos.length > 0) {
      const prevIndex = currentPhotoIndex === 0 ? photos.length - 1 : currentPhotoIndex - 1;
      setCurrentPhotoIndex(prevIndex);
      if (!photoUrls[photos[prevIndex].id]) {
        loadIndividualPhoto(photos[prevIndex].id);
      }
    }
  };

  // GET PROPERTY BY ID
  const handleGetPropertyById = async (prId) => {
    setLoading(true);
    try {
      const response = await PropertyService.getPropertyById(prId);
      if (response) {
        setSelectedProperty(response);
        await loadPropertyPhotos(prId);
      } else {
        setSelectedProperty([]);
      }
    } catch (error) {
      console.error(error);
      setError('Failed to load property');
    } finally {
      setLoading(false);
    }
  };

  // EDIT PROPERTY RULES
  const handleEditPropertyRules = async (e) => {
    e.preventDefault();
    console.log("Sending data: ", propertyRulesData);
    try {
      const response = await PropertyService.editProperty(propertyRulesData, pr_id);
      if (response) {
        alert('Property updated');
        switch (AuthService.getCurrentUser().role) {
          case 'ROLE_OWNER':
            navigate('/owner-dashboard');
            break;
          default:
            navigate('/properties');
            break;
        }
      }
    } catch (error) {
      console.error(error);
    }
  };

  // DELETE PROPERTY
  const handleDeleteProperty = () => {
    const isConfirmed = window.confirm("Are you sure to delete the property?");
    if (isConfirmed) {
      const response = PropertyService.deletePropertyById(pr_id);
      if (response && role) {
        if (role === "ROLE_ADMIN") navigate('/properties');
        else if (role === "ROLE_OWNER") navigate('/owner-dashboard');
        else throw error;
        window.location.reload();
      }
    }
  };

  // TOGGLE VERIFY
  const handleToggleVerify = async (e) => {
    e.preventDefault();
    const response = await AdminService.toggleVerifiedStatus(pr_id);
    if (response) {
      alert(response.message);
      navigate('/properties');
    }
  };

  // GET FACILITIES HANDLER
  const getFacilitiesHandler = async (e) => {
    e.preventDefault();
     if (!facilityLoaded) {
      // Show facilities: fetch if empty, or just show if already loaded
      if (facilities.length === 0) {
        const response = await PropertyService.getPropertyFacilities(pr_id);
        if (response) {
          setFacilities(response);
          setFacilityLoaded(true);
        } else {
          setFacilities([]);
          setFacilityLoaded(true);
        }
      } else {
        setFacilityLoaded(true);
      }
    } else {
      // Hide facilities
      setFacilityLoaded(false);
    }
  };

  // HANDLE ADD WISHLIST
  const handleAddWishlist = async (e) => {
    e.preventDefault();
    const response = await UserService.addWishList(pr_id, wishListData);
    if (response) {
      alert(response.message);
      navigate('/wishList');
    }
  };

  // HANDLE REMOVE WISHLIST
  const handleRemoveWishlist = async (e) => {
    e.preventDefault();
    const response = await UserService.removeWishListedProperty(pr_id);
    if (response) {
      alert(response.message);
      navigate('/wishList');
    }
  };

  // USE-EFFECT 1 - fetching property
  useEffect(() => {
    const userId = AuthService.getCurrentUser()?.username;
    if (userId) {
      handleGetPropertyById(pr_id);
    } else {
      setSelectedProperty(null);
    }
  }, [pr_id]);

  // USE-EFFECT 2 - scroll control
  useEffect(() => {
    const previewBody = document.getElementById('preview-property-body');
    if (previewBody) {
      if (isVisible) {
        document.body.style.overflow = 'hidden';
        previewBody.style.pointerEvents = 'none';
      } else {
        document.body.style.overflow = 'unset';
        previewBody.style.pointerEvents = 'unset';
      }
    }
    return () => {
      const bodyToReset = document.getElementById('preview-property-body');
      if (bodyToReset) {
        document.body.style.overflow = 'unset';
        bodyToReset.style.pointerEvents = 'unset';
      }
    };
  }, [isVisible]);

  // USE-EFFECT 3 - update states
  useEffect(() => {
    if (selectedProperty) {
      setAddress(selectedProperty.address || '');
      setArea(selectedProperty.area || 0.0);
      setMonthlyRent(selectedProperty.monthlyRent || 0.0);
      setMinStay(selectedProperty.minStay || 0);
      setPetsPolicy(selectedProperty.petsPolicy || null);
      setIsSmokingAllowed(selectedProperty.smokingAllowed || false);
      setOtherRules(selectedProperty.otherRules || null);
      setVerified(selectedProperty.isVerified || false);
    }
  }, [selectedProperty]);

  // Handle loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading property details...</p>
        </div>
      </div>
    );
  }

  // Handle error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => navigate('/properties')}
            className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
          >
            Back to Properties
          </button>
        </div>
      </div>
    );
  }

  if (!selectedProperty) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Property not found</p>
          <button
            onClick={() => navigate('/properties')}
            className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
          >
            Back to Properties
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate(-1)}
            className="mb-4 text-indigo-600 hover:text-indigo-800 flex items-center"
          >
            <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>
          <h1 className="text-3xl font-bold text-gray-900">{selectedProperty.description}</h1>
          <div className="mt-2 flex items-center">
            <span className={`px-3 py-1 text-sm rounded-full ${selectedProperty.isVerified
                ? 'bg-green-100 text-green-800'
                : 'bg-yellow-100 text-yellow-800'
              }`}>
              {selectedProperty.isVerified ? 'Verified' : 'Verification Pending'}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Photo Slider */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Property Photos</h2>

            {photos.length > 0 ? (
              <div className="space-y-4">
                {/* Main Photo Display */}
                <div className="relative">
                  <div className="aspect-w-16 aspect-h-9 bg-gray-200 rounded-lg overflow-hidden">
                    {photoUrls[photos[currentPhotoIndex]?.id] ? (
                      <img
                        src={photoUrls[photos[currentPhotoIndex].id]}
                        alt={photos[currentPhotoIndex].filename}
                        className="w-full h-80 object-cover cursor-pointer"
                        onClick={() => setShowPhotoModal(true)}
                      />
                    ) : (
                      <div className="w-full h-80 bg-gray-100 flex items-center justify-center">
                        {loadingPhotos.has(photos[currentPhotoIndex]?.id) ? (
                          <div className="text-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-2"></div>
                            <p className="text-sm text-gray-500">Loading...</p>
                          </div>
                        ) : (
                          <button
                            onClick={() => loadIndividualPhoto(photos[currentPhotoIndex].id)}
                            className="text-gray-500 hover:text-gray-700"
                          >
                            Click to load photo
                          </button>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Navigation Arrows */}
                  {photos.length > 1 && (
                    <>
                      <button
                        onClick={prevPhoto}
                        className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                        </svg>
                      </button>
                      <button
                        onClick={nextPhoto}
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    </>
                  )}

                  {/* Photo Counter */}
                  <div className="absolute bottom-2 right-2 bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-sm">
                    {currentPhotoIndex + 1} / {photos.length}
                  </div>
                </div>

                {/* Thumbnail Strip */}
                {photos.length > 1 && (
                  <div className="flex space-x-2 overflow-x-auto pb-2">
                    {photos.map((photo, index) => (
                      <button
                        key={photo.id}
                        onClick={() => {
                          setCurrentPhotoIndex(index);
                          if (!photoUrls[photo.id]) {
                            loadIndividualPhoto(photo.id);
                          }
                        }}
                        className={`flex-shrink-0 w-20 h-16 rounded-md overflow-hidden border-2 ${index === currentPhotoIndex ? 'border-indigo-500' : 'border-gray-200'
                          }`}
                      >
                        {photoUrls[photo.id] ? (
                          <img
                            src={photoUrls[photo.id]}
                            alt={photo.filename}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                            <div className="w-4 h-4 bg-gray-300 rounded"></div>
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="w-full h-80 bg-gray-100 rounded-lg flex items-center justify-center">
                <div className="text-center text-gray-500">
                  <svg className="mx-auto h-12 w-12 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p>No photos available</p>
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Property Details */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Property Details</h2>

            <form onSubmit={handleEditPropertyRules} className="space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Area</label>
                  <p className="text-lg font-semibold text-gray-900">
                    {selectedProperty.area} {selectedProperty.areaUnit}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Bedrooms</label>
                  <p className="text-lg font-semibold text-gray-900">{selectedProperty.noOfBedrooms}</p>
                </div>
              </div>

              {/* Financial Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Monthly Rent</label>
                  <p className="text-lg font-semibold text-green-600">₹{selectedProperty.monthlyRent?.toLocaleString()}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Security Deposit</label>
                  <p className="text-lg font-semibold text-gray-900">₹{selectedProperty.securityDepositAmount?.toLocaleString()}</p>
                </div>
              </div>

              {/* Address */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                <textarea
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className={inputClassName}
                  rows="2"
                  disabled={role === 'ROLE_USER'}
                />
              </div>

              {/* Editable Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Minimum Stay (months)</label>
                  <input
                    type="number"
                    value={minStay}
                    onChange={(e) => setMinStay(e.target.value)}
                    className={inputClassName}
                    disabled={role === 'ROLE_USER'}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Pets Policy</label>
                  <input
                    type="text"
                    value={petsPolicy || ''}
                    onChange={(e) => setPetsPolicy(e.target.value)}
                    className={inputClassName}
                    disabled={role === 'ROLE_USER'}
                    placeholder="e.g., No pets allowed"
                  />
                </div>
              </div>

              {/* Smoking Policy */}
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={isSmokingAllowed}
                  onChange={(e) => setIsSmokingAllowed(e.target.checked)}
                  id="isSmokingAllowed"
                  className="mr-2"
                  disabled={role === 'ROLE_USER'}
                />
                <label htmlFor="isSmokingAllowed" className="text-sm font-medium text-gray-700">
                  Smoking Allowed
                </label>
              </div>

              {/* Other Rules */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Other Rules</label>
                <textarea
                  value={otherRules || ''}
                  onChange={(e) => setOtherRules(e.target.value)}
                  className={inputClassName}
                  rows="3"
                  disabled={role === 'ROLE_USER'}
                  placeholder="Any additional rules or requirements..."
                />
              </div>

              {/* Role-based Action Buttons */}
              <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-200">
                {/* Admin/Owner Actions */}
                {role !== 'ROLE_USER' && (
                  <button
                    type="submit"
                    className={`${buttonClassName} bg-indigo-600 text-white hover:bg-indigo-700`}
                  >
                    Update Property
                  </button>
                )}

                {/* Admin Only Actions */}
                {role === 'ROLE_ADMIN' && (
                  <>
                    <button
                      type="button"
                      onClick={handleToggleVerify}
                      className={`${buttonClassName} ${verified ? 'bg-yellow-600 hover:bg-yellow-700' : 'bg-green-600 hover:bg-green-700'
                        } text-white`}
                    >
                      {verified ? 'Unverify' : 'Verify'}
                    </button>
                    <button
                      type="button"
                      onClick={handleDeleteProperty}
                      className={`${buttonClassName} bg-red-600 text-white hover:bg-red-700`}
                    >
                      Delete Property
                    </button>
                  </>
                )}

                {/* User Actions */}
                {role === 'ROLE_USER' && (
                  <>
                    {isWishListed ? (
                      <button
                        type="button"
                        onClick={handleRemoveWishlist}
                        className={`${buttonClassName} bg-red-600 text-white hover:bg-red-700`}
                      >
                        Remove from Wishlist
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={handleAddWishlist}
                        className={`${buttonClassName} bg-green-600 text-white hover:bg-green-700`}
                      >
                        Add to Wishlist
                      </button>
                    )}
                  </>
                )}

                {/* Facilities Button */}
                <button
                  type="button"
                  onClick={getFacilitiesHandler}
                  className={`${buttonClassName} bg-gray-600 text-white hover:bg-gray-700`}
                >
                  {facilityLoaded ? 'Hide Facilities' : 'Show Facilities'}
                </button>
              </div>
            </form>

            {/* Facilities Section */}
            {facilityLoaded && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h3 className="text-lg font-medium text-gray-900 mb-3">Facilities</h3>
                {facilities.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {facilities.map((facility, index) => (
                      <div key={index} className="bg-gray-100 px-3 py-2 rounded-md text-sm">
                        {facility.facName || facility}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">No facilities available.</p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Photo Modal */}
        {showPhotoModal && photos[currentPhotoIndex] && photoUrls[photos[currentPhotoIndex].id] && (
          <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
            <div className="relative max-w-4xl max-h-full p-4">
              <button
                onClick={() => setShowPhotoModal(false)}
                className="absolute top-4 right-4 text-white text-2xl hover:text-gray-300"
              >
                ×
              </button>
              <img
                src={photoUrls[photos[currentPhotoIndex].id]}
                alt={photos[currentPhotoIndex].filename}
                className="max-w-full max-h-full object-contain"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}


export default PreviewProperty