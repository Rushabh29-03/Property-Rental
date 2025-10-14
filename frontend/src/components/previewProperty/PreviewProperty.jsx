import React, { useEffect, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router'
import AuthService from '../../services/AuthService';
import PropertyService from '../../services/PropertyService';
import AdminService from '../../services/AdminService';
import UserService from '../../services/UserService';
import PhotoService from '../../services/PhotoService';
import EditProperty from '../editProperty/EditProperty';
import PhotoUploadComponent from '../photoUploadPage/PhotoUploadPage';

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
  const [showPhotoUpload, setShowPhotoUpload] = useState(false);

  // Modal states
  const [showEditModal, setShowEditModal] = useState(false);
  const [showFacilityModal, setShowFacilityModal] = useState(false)

  // Property rules state
  const [address, setAddress] = useState("");
  const [description, setDescription] = useState("");
  const [area, setArea] = useState(0.0);
  const [monthlyRent, setMonthlyRent] = useState(0.0);
  const [minStay, setMinStay] = useState(0);
  const [petsPolicy, setPetsPolicy] = useState(null);
  const [isSmokingAllowed, setIsSmokingAllowed] = useState(false);
  const [otherRules, setOtherRules] = useState(null);
  const [verified, setVerified] = useState(false);

  // Facilities state
  const [facilities, setFacilities] = useState([])
  const [facilityLoaded, setFacilityLoaded] = useState(false)
  const [allFacilities, setAllFacilities] = useState([])
  const [newFacilityName, setNewFacilityName] = useState("")
  const [newFacilityDescription, setNewFacilityDescription] = useState("")
  const [facilityLoadingStates, setFacilityLoadingStates] = useState({})

  // Wishlist state
  const [note, setNote] = useState("EE haloo");
  const isWishListed = location.state?.isWishListedProp;

  // CSS classes
  const inputClassName = 'mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm';
  const buttonClassName = "px-4 py-2 rounded-md font-medium transition-colors cursor-pointer";

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

  // Check if user can manage facilities
  const canManageFacilities = () => {
    return role === 'ROLE_ADMIN' || role === 'ROLE_OWNER'
  }

  // !Load photos for the property
  const loadPropertyPhotos = async (propertyId) => {
    try {
      const response = await PhotoService.fetchPhotos(propertyId);
      if (response?.photos) {
        setPhotos(response.photos);
        // Load first few photos
        const photosToLoad = response.photos.slice(0, Math.min(3, response.photos.length));
        for (const photo of photosToLoad) {
          loadIndividualPhoto(photo.id);
        }
      }
    } catch (error) {
      console.error('Error loading photos:', error);
    }
  };

  // !Load individual photo
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

  // !GET PROPERTY BY ID
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

  // !HANDLE DELETE PHOTO
  const handleDeletePhoto = async (e, photoId) => {
    if (e) {
      e.preventDefault();
    }

    const isConfirmed = window.confirm("Are you sure you want to delete this photo?");
    if (!isConfirmed) return;

    try {
      const response = await PhotoService.deletePhoto(photoId);
      if (response) {
        console.log('Photo deleted:', response);
        // Refresh photos after deletion
        await loadPropertyPhotos(pr_id);
        // Reset current index if needed
        if (currentPhotoIndex >= photos.length - 1) {
          setCurrentPhotoIndex(0);
        }
      }
    } catch (error) {
      console.error('Error deleting photo:', error);
      alert('Failed to delete photo. Please try again.');
    }
  };

  // !EDIT PROPERTY RULES
  const handleEditPropertyRules = async (e) => {
    e.preventDefault();
    console.log("Sending data: ", propertyRulesData);
    try {
      const response = await PropertyService.editProperty(propertyRulesData, pr_id);
      if (response) {
        alert('Property updated');
        // Refresh property data
        await handleGetPropertyById(pr_id);
      }
    } catch (error) {
      console.error(error);
      alert('Failed to update property');
    }
  };

  // !DELETE PROPERTY
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

  // !TOGGLE VERIFY
  const handleToggleVerify = async (e) => {
    e.preventDefault();
    const response = await AdminService.toggleVerifiedStatus(pr_id);
    if (response) {
      alert(response.message);
      // Refresh property data instead of navigating away
      await handleGetPropertyById(pr_id);
    }
  };

  // !GET FACILITIES HANDLER
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

  // !GET ALL FACILITIES
  const getAllFacilities = async () => {
    try {
      const response = await PropertyService.getAllFacilities()
      if (response) {
        setAllFacilities(response)
      }
    } catch (error) {
      console.error('Error fetching all facilities:', error)
    }
  }

  // !ADD FACILITY TO PROPERTY
  const handleAddFacilityToProperty = async (facilityName, description = "") => {
    const facilityKey = `add_${facilityName}`
    setFacilityLoadingStates(prev => ({ ...prev, [facilityKey]: true }))

    try {
      const response = await PropertyService.addFacilityToProperty(pr_id, {
        facName: facilityName,
        description: description
      })
      if (response) {
        alert(`Facility "${facilityName}" added successfully!`)
        // Refresh facilities
        const updatedFacilities = await PropertyService.getPropertyFacilities(pr_id)
        setFacilities(updatedFacilities || [])
      }
    } catch (error) {
      console.error('Error adding facility:', error)
      alert(`Failed to add facility: ${error.message || 'Unknown error'}`)
    } finally {
      setFacilityLoadingStates(prev => ({ ...prev, [facilityKey]: false }))
    }
  }

  // !REMOVE FACILITY FROM PROPERTY
  const handleRemoveFacilityFromProperty = async (facilityName) => {
    const facilityKey = `remove_${facilityName}`
    setFacilityLoadingStates(prev => ({ ...prev, [facilityKey]: true }))

    try {
      const response = await PropertyService.removeFacilityFromProperty(pr_id, {
        facName: facilityName
      })
      if (response) {
        alert(`Facility "${facilityName}" removed successfully!`)
        // Refresh facilities
        const updatedFacilities = await PropertyService.getPropertyFacilities(pr_id)
        setFacilities(updatedFacilities || [])
      }
    } catch (error) {
      console.error('Error removing facility:', error)
      alert(`Failed to remove facility: ${error.message || 'Unknown error'}`)
    } finally {
      setFacilityLoadingStates(prev => ({ ...prev, [facilityKey]: false }))
    }
  }

  // !ADD NEW FACILITY
  const handleAddNewFacility = async () => {
    if (!newFacilityName.trim()) {
      alert('Please enter a facility name')
      return
    }

    await handleAddFacilityToProperty(newFacilityName.trim(), newFacilityDescription.trim())
    setNewFacilityName("")
    setNewFacilityDescription("")
    // Refresh all facilities list
    await getAllFacilities()
  }

  // !OPEN FACILITY MANAGEMENT MODAL
  const handleOpenFacilityModal = async () => {
    if (!canManageFacilities()) {
      alert('You do not have permission to manage facilities')
      return
    }

    // Fetch current property facilities
    const propertyFacilities = await PropertyService.getPropertyFacilities(pr_id)
    setFacilities(propertyFacilities || [])

    // Fetch all available facilities
    await getAllFacilities()

    setShowFacilityModal(true)
  }

  // !Check if facility is already added to property
  const isFacilityAdded = (facilityName) => {
    return facilities.some(f => f.facName.toLowerCase() === facilityName.toLowerCase())
  }

  // !HANDLE ADD WISHLIST
  const handleAddWishlist = async (e) => {
    e.preventDefault();
    const response = await UserService.addWishList(pr_id, wishListData);
    if (response) {
      alert(response.message);
      navigate('/wishList');
    }
  };

  // !HANDLE REMOVE WISHLIST
  const handleRemoveWishlist = async (e) => {
    e.preventDefault();
    const response = await UserService.removeWishListedProperty(pr_id);
    if (response) {
      alert(response.message);
      navigate('/wishList');
    }
  };

  // !Handle photo upload success
  const handlePhotoUploadSuccess = (data) => {
    console.log('Photos uploaded successfully:', data);
    // Refresh photos
    loadPropertyPhotos(pr_id);

    // Close upload modal
    setShowPhotoUpload(false);
  };

  // !Handle photo upload error
  const handlePhotoUploadError = (error) => {
    console.error('Photo upload failed:', error);
    alert('Photo upload failed: ' + error);
  };

  // !Handle property update from EditProperty modal
  const handlePropertyUpdate = (updatedProperty) => {
    setSelectedProperty(updatedProperty);
    setShowEditModal(false);
  };

  // !USE-EFFECT 1 - fetching property
  useEffect(() => {
    const userId = AuthService.getCurrentUser()?.username;
    window.scrollTo(0, 0);
    if (userId) {
      handleGetPropertyById(pr_id);
    } else {
      setSelectedProperty(null);
    }
  }, [pr_id]);

  // !USE-EFFECT 2 - scroll control
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

  // !USE-EFFECT 3 - update states
  useEffect(() => {
    if (selectedProperty) {
      setAddress(selectedProperty.address || '');
      setDescription(selectedProperty.description || '');
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
    <div className="min-h-screen bg-gray-50" id="preview-property-body">
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
          <h1 className="text-3xl font-bold text-gray-900">{selectedProperty.address}</h1>
          <div className="mt-2 flex items-center">
            <span className={`px-3 py-1 text-sm rounded-full ${selectedProperty.isVerified
              ? 'bg-green-100 text-green-800'
              : 'bg-yellow-100 text-yellow-800'
              }`}>
              {selectedProperty.isVerified ? 'Verified' : 'Verification Pending'}
            </span>
          </div>
        </div>

        <div className={`grid grid-cols-1 lg:grid-cols-2 gap-8 
            ${showEditModal || showPhotoUpload || showFacilityModal ? 'blur-md' : ''} 
          `}>
          {/* Left Column - Photo Slider */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Property Photos</h2>
              {(role === 'ROLE_OWNER' || role === 'ROLE_ADMIN') && (
                <button
                  onClick={() => setShowPhotoUpload(true)}
                  className="text-indigo-600 hover:text-indigo-800 text-sm font-medium cursor-pointer"
                >
                  + Add Photos
                </button>
              )}
            </div>

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

                  {/* Delete Photo Button (for owners/admins) */}
                  {(role === 'ROLE_OWNER' || role === 'ROLE_ADMIN') && photos[currentPhotoIndex] && (
                    <button
                      onClick={(e) => handleDeletePhoto(e, photos[currentPhotoIndex].id)}
                      className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 cursor-pointer"
                      title="Delete this photo"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  )}
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
                  {(role === 'ROLE_OWNER' || role === 'ROLE_ADMIN') && (
                    <button
                      onClick={() => setShowPhotoUpload(true)}
                      className="mt-2 text-indigo-600 hover:text-indigo-800 text-sm font-medium cursor-pointer"
                    >
                      Add the first photo
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Property Details */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Property Details</h2>
              {(role === 'ROLE_OWNER' || role === 'ROLE_ADMIN') && (
                <button
                  onClick={() => setShowEditModal(true)}
                  className="text-indigo-600 hover:text-indigo-800 text-sm font-medium cursor-pointer"
                >
                  Edit Property
                </button>
              )}
            </div>

            <div className="space-y-6">
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
                <p className="text-gray-900">{selectedProperty.description}</p>
              </div>

              {/* Additional Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Minimum Stay</label>
                  <p className="text-gray-900">{selectedProperty.minStay || 0} months</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Pets Policy</label>
                  <p className="text-gray-900">{selectedProperty.petsPolicy || 'Not specified'}</p>
                </div>
              </div>

              {/* Smoking Policy */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Smoking Policy</label>
                <p className="text-gray-900">{selectedProperty.smokingAllowed ? 'Allowed' : 'Not allowed'}</p>
              </div>

              {/* Other Rules */}
              {selectedProperty.otherRules && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Other Rules</label>
                  <p className="text-gray-900">{selectedProperty.otherRules}</p>
                </div>
              )}

              {/* Role-based Action Buttons */}
              <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-200">

                {/* Admin/Owner Actions */}
                {(role === 'ROLE_ADMIN' || role === 'ROLE_OWNER') && (
                  <>
                    {/* Admin only */}
                    {role === 'ROLE_ADMIN' && (
                      <button
                        type="button"
                        onClick={handleToggleVerify}
                        className={`${buttonClassName} ${verified ? 'bg-yellow-600 hover:bg-yellow-700' : 'bg-green-600 hover:bg-green-700'
                          } text-white`}
                      >
                        {verified ? 'Unverify' : 'Verify'}
                      </button>
                    )}
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
                        className={`${buttonClassName} bg-gray-500 hover:bg-gray-600 text-white`}
                      >
                        ❤️ Remove from Wishlist
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={handleAddWishlist}
                        className={`${buttonClassName} bg-red-500 text-white hover:bg-red-600`}
                      >
                        ❤️ Add to Wishlist
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
                {canManageFacilities() && (
                  <button
                    onClick={handleOpenFacilityModal}
                    className={`${buttonClassName} bg-green-500 hover:bg-green-600 text-white`}
                  >
                    Manage Facilities
                  </button>
                )}
              </div>
            </div>

            {/* Facilities Section */}
            {facilityLoaded && (
              <div>
                {facilities.length === 0 ? (
                  <p className="text-gray-500 italic">No facilities available.</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 mt-2 gap-4">
                    {facilities.map((facility, index) => (
                      <div key={index} className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <h4 className="font-semibold text-blue-800 capitalize">{facility.facName}</h4>
                        {facility.description && (
                          <p className="text-sm text-blue-600 mt-1">{facility.description}</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Photo Upload Modal */}
        {showPhotoUpload && (
          <div className="fixed inset-0 bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto m-4">
              <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-900">Add Photos</h2>
                <button
                  onClick={() => setShowPhotoUpload(false)}
                  className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
                >
                  ×
                </button>
              </div>
              <div className="p-6">
                <PhotoUploadComponent
                  propertyId={pr_id}
                  onUploadSuccess={handlePhotoUploadSuccess}
                  onUploadError={handlePhotoUploadError}
                  showPreview={true}
                />
              </div>
            </div>
          </div>
        )}

        {/* FACILITY MANAGEMENT MODAL */}
        {showFacilityModal && (
          <div className="fixed inset-0 bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-800">Manage Facilities</h2>
                  <button
                    onClick={() => setShowFacilityModal(false)}
                    className="text-gray-500 hover:text-gray-700 text-2xl"
                  >
                    ×
                  </button>
                </div>

                {/* Add New Facility Section */}
                <div className="mb-8 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <h3 className="text-lg font-semibold text-green-800 mb-4">Add New Facility</h3>
                  <div className="space-y-4">
                    <input
                      type="text"
                      placeholder="Facility name (e.g., Swimming Pool)"
                      value={newFacilityName}
                      onChange={(e) => setNewFacilityName(e.target.value)}
                      className={inputClassName}
                    />
                    <textarea
                      placeholder="Description (optional)"
                      value={newFacilityDescription}
                      onChange={(e) => setNewFacilityDescription(e.target.value)}
                      className={inputClassName}
                      rows="3"
                    />
                    <button
                      onClick={handleAddNewFacility}
                      disabled={!newFacilityName.trim() || facilityLoadingStates[`add_${newFacilityName.trim()}`]}
                      className={`${buttonClassName} bg-green-500 hover:bg-green-600 text-white disabled:bg-gray-300 disabled:cursor-not-allowed`}
                    >
                      {facilityLoadingStates[`add_${newFacilityName.trim()}`] ? 'Adding...' : 'Add New Facility'}
                    </button>
                  </div>
                </div>

                {/* Current Property Facilities */}
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">
                    Current Property Facilities ({facilities.length})
                  </h3>
                  {facilities.length === 0 ? (
                    <p className="text-gray-500 italic">No facilities added to this property yet.</p>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {facilities.map((facility, index) => (
                        <div key={index} className="bg-red-50 border border-red-200 rounded-lg p-4 flex justify-between items-start">
                          <div className="flex-1">
                            <h4 className="font-semibold text-red-800 capitalize">{facility.facName}</h4>
                            {facility.description && (
                              <p className="text-sm text-red-600 mt-1">{facility.description}</p>
                            )}
                          </div>
                          <button
                            onClick={() => handleRemoveFacilityFromProperty(facility.facName)}
                            disabled={facilityLoadingStates[`remove_${facility.facName}`]}
                            className="ml-4 bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm disabled:bg-gray-300 disabled:cursor-not-allowed"
                          >
                            {facilityLoadingStates[`remove_${facility.facName}`] ? 'Removing...' : 'Remove'}
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Available Facilities to Add */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">
                    Available Facilities ({allFacilities.filter(f => !isFacilityAdded(f.facName)).length})
                  </h3>
                  {allFacilities.filter(f => !isFacilityAdded(f.facName)).length === 0 ? (
                    <p className="text-gray-500 italic">All available facilities have been added to this property.</p>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {allFacilities
                        .filter(facility => !isFacilityAdded(facility.facName))
                        .map((facility, index) => (
                          <div key={index} className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex justify-between items-start">
                            <div className="flex-1">
                              <h4 className="font-semibold text-blue-800 capitalize">{facility.facName}</h4>
                            </div>
                            <button
                              onClick={() => setNewFacilityName(facility.facName)}
                              disabled={facilityLoadingStates[`add_${facility.facName}`]}
                              className="ml-4 bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm disabled:bg-gray-300 disabled:cursor-not-allowed"
                            >
                              {facilityLoadingStates[`add_${facility.facName}`] ? 'Adding...' : 'Add'}
                            </button>
                          </div>
                        ))}
                    </div>
                  )}
                </div>

                <div className="mt-6 flex justify-end">
                  <button
                    onClick={() => setShowFacilityModal(false)}
                    className={`${buttonClassName} bg-gray-500 hover:bg-gray-600 text-white`}
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Edit Property Modal */}
        {showEditModal && (
          <EditProperty
            property={selectedProperty}
            prId={pr_id}
            onClose={() => setShowEditModal(false)}
            onUpdate={handlePropertyUpdate}
          />
        )}

        {/* Photo Modal */}
        {showPhotoModal && photos[currentPhotoIndex] && photoUrls[photos[currentPhotoIndex].id] && (
          <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
            <div className="relative max-w-4xl max-h-full p-4">
              <button
                onClick={() => setShowPhotoModal(false)}
                className="absolute top-4 right-4 text-white text-2xl hover:text-gray-300 z-10 cursor-pointer outline-2 outline-black bg-amber-100"
              >
                ❌
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
};

export default PreviewProperty;