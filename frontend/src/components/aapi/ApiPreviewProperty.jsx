import React, { useState, useEffect } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router'
import AuthService from '../../services/AuthService'
import PropertyService from '../../services/PropertyService'
import PhotoService from '../../services/PhotoService'

function ApiPreviewProperty() {
    // Navigate and Location hooks
    const navigate = useNavigate();
    const location = useLocation();
    const pr_id = 25
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
    const [showFacilityModal, setShowFacilityModal] = useState(false);
    const [showRentRequestModal, setShowRentRequestModal] = useState(false);

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

    // Rent request state
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [isSubmittingRequest, setIsSubmittingRequest] = useState(false);

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
    const wishListData = {
        "note": note
    };

    // Check if user can manage facilities
    const canManageFacilities = () => {
        return role === 'ROLE_ADMIN' || role === 'ROLE_OWNER'
    }

    // Check if user can send rent request
    const canSendRentRequest = () => {
        return role === 'ROLE_USER' || role === 'ROLE_ADMIN'
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

    // !HANDLE SEND RENT REQUEST
    const handleSendRentRequest = async (e) => {
        e.preventDefault();

        if (!startDate || !endDate) {
            alert('Please select both start and end dates');
            return;
        }

        if (new Date(startDate) >= new Date(endDate)) {
            alert('End date must be after start date');
            return;
        }

        const currentUser = AuthService.getCurrentUser();
        if (!currentUser || !currentUser.id) {
            alert('Please login to send rent request');
            return;
        }

        setIsSubmittingRequest(true);

        const rentRequestData = {
            userId: currentUser.id,
            propertyId: parseInt(pr_id),
            startDate: startDate,
            endDate: endDate
        };

        try {
            const response = await UserService.createRentRequest(rentRequestData);
            if (response) {
                alert('Rent request sent successfully! The owner will review your request.');
                setShowRentRequestModal(false);
                setStartDate('');
                setEndDate('');
            }
        } catch (error) {
            console.error('Error sending rent request:', error);
            alert('Failed to send rent request. Please try again.');
        } finally {
            setIsSubmittingRequest(false);
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
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-lg">Loading property details...</div>
            </div>
        );
    }

    // Handle error state
    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-lg text-red-600">{error}</div>
            </div>
        );
    }

    // Handle no property found
    if (!selectedProperty) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-lg">Property not found</div>
            </div>
        );
    }

    return (
        <div id="preview-property-body" className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Property Photos Section */}
                <div className="bg-white rounded-lg shadow-md mb-8">
                    <div className="relative">
                        {photos.length === 0 ? (
                            <div className="h-96 bg-gray-200 rounded-t-lg flex items-center justify-center">
                                <div className="text-center">
                                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                    <p className="mt-2 text-sm text-gray-500">Loading...</p>
                                </div>
                            </div>
                        ) : (
                            <div className="relative h-96 rounded-t-lg overflow-hidden">
                                {photoUrls[photos[currentPhotoIndex]?.id] ? (
                                    <img
                                        src={photoUrls[photos[currentPhotoIndex].id]}
                                        alt={`Property photo ${currentPhotoIndex + 1}`}
                                        className="w-full h-full object-cover"
                                        onClick={() => setShowPhotoModal(true)}
                                    />
                                ) : (
                                    <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                                        <div className="text-center">
                                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-2"></div>
                                            <p className="text-sm text-gray-500">Loading photo...</p>
                                        </div>
                                    </div>
                                )}

                                {/* Photo navigation */}
                                {photos.length > 1 && (
                                    <>
                                        <button
                                            onClick={prevPhoto}
                                            className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75"
                                        >
                                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                            </svg>
                                        </button>
                                        <button
                                            onClick={nextPhoto}
                                            className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75"
                                        >
                                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                            </svg>
                                        </button>
                                    </>
                                )}

                                {/* Photo counter */}
                                <div className="absolute bottom-4 right-4 bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-sm">
                                    {currentPhotoIndex + 1} / {photos.length}
                                </div>

                                {/* Delete photo button for owners/admins */}
                                {(role === 'ROLE_OWNER' || role === 'ROLE_ADMIN') && photos[currentPhotoIndex] && (
                                    <button
                                        onClick={(e) => handleDeletePhoto(e, photos[currentPhotoIndex].id)}
                                        className="absolute top-4 right-4 bg-red-500 text-white p-2 rounded-full hover:bg-red-600"
                                        title="Delete this photo"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                    </button>
                                )}
                            </div>
                        )}

                        {/* Photo thumbnails */}
                        {photos.length > 1 && (
                            <div className="flex space-x-2 p-4 overflow-x-auto">
                                {photos.map((photo, index) => (
                                    <div
                                        key={photo.id}
                                        className={`flex-shrink-0 w-16 h-16 rounded-md overflow-hidden cursor-pointer border-2 ${index === currentPhotoIndex ? 'border-indigo-500' : 'border-transparent'
                                            }`}
                                        onClick={() => {
                                            setCurrentPhotoIndex(index);
                                            if (!photoUrls[photo.id]) {
                                                loadIndividualPhoto(photo.id);
                                            }
                                        }}
                                    >
                                        {photoUrls[photo.id] ? (
                                            <img
                                                src={photoUrls[photo.id]}
                                                alt={`Thumbnail ${index + 1}`}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-600"></div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Property Details Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Property Information */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Basic Details */}
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <div className="flex justify-between items-start mb-4">
                                <h1 className="text-3xl font-bold text-gray-900">{selectedProperty.address}</h1>
                                <span className={`px-3 py-1 rounded-full text-sm font-medium ${selectedProperty.isVerified ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                                    }`}>
                                    {selectedProperty.isVerified ? 'Verified' : 'Pending Verification'}
                                </span>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                                <div className="text-center p-3 bg-gray-50 rounded-lg">
                                    <div className="text-2xl font-bold text-indigo-600">{selectedProperty.area}</div>
                                    <div className="text-sm text-gray-600">{selectedProperty.areaUnit}</div>
                                </div>
                                <div className="text-center p-3 bg-gray-50 rounded-lg">
                                    <div className="text-2xl font-bold text-indigo-600">{selectedProperty.noOfBedrooms}</div>
                                    <div className="text-sm text-gray-600">Bedrooms</div>
                                </div>
                                <div className="text-center p-3 bg-gray-50 rounded-lg">
                                    <div className="text-2xl font-bold text-indigo-600">₹{selectedProperty.monthlyRent?.toLocaleString()}</div>
                                    <div className="text-sm text-gray-600">Monthly Rent</div>
                                </div>
                                <div className="text-center p-3 bg-gray-50 rounded-lg">
                                    <div className="text-2xl font-bold text-indigo-600">₹{selectedProperty.securityDepositAmount?.toLocaleString()}</div>
                                    <div className="text-sm text-gray-600">Security Deposit</div>
                                </div>
                            </div>

                            <div className="border-t pt-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-3">Description</h3>
                                <p className="text-gray-700">{selectedProperty.description}</p>
                            </div>
                        </div>

                        {/* Property Rules */}
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Property Rules & Policies</h3>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center py-2 border-b">
                                    <span className="font-medium text-gray-700">Minimum Stay</span>
                                    <span className="text-gray-600">{selectedProperty.minStay || 0} months</span>
                                </div>
                                <div className="flex justify-between items-center py-2 border-b">
                                    <span className="font-medium text-gray-700">Pets Policy</span>
                                    <span className="text-gray-600">{selectedProperty.petsPolicy || 'Not specified'}</span>
                                </div>
                                <div className="flex justify-between items-center py-2 border-b">
                                    <span className="font-medium text-gray-700">Smoking</span>
                                    <span className="text-gray-600">{selectedProperty.smokingAllowed ? 'Allowed' : 'Not allowed'}</span>
                                </div>
                                {selectedProperty.otherRules && (
                                    <div className="py-2">
                                        <span className="font-medium text-gray-700">Other Rules</span>
                                        <p className="text-gray-600 mt-1">{selectedProperty.otherRules}</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Facilities Section */}
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-semibold text-gray-900">Facilities</h3>
                                <div className="flex space-x-2">
                                    <button
                                        onClick={getFacilitiesHandler}
                                        className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
                                    >
                                        {facilityLoaded ? 'Hide Facilities' : 'Show Facilities'}
                                    </button>
                                    {canManageFacilities() && (
                                        <button
                                            onClick={handleOpenFacilityModal}
                                            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                                        >
                                            Manage Facilities
                                        </button>
                                    )}
                                </div>
                            </div>

                            {facilityLoaded && (
                                facilities.length > 0 ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {facilities.map((facility, index) => (
                                            <div key={index} className="border rounded-lg p-4">
                                                <h4 className="font-medium text-gray-900">{facility.facName}</h4>
                                                {facility.description && (
                                                    <p className="text-sm text-gray-600 mt-1">{facility.description}</p>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-gray-500">No facilities available.</p>
                                )
                            )}
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Rent Request Button for Users */}
                        {canSendRentRequest() && (
                            <div className="bg-white rounded-lg shadow-md p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Interested in this property?</h3>
                                <button
                                    onClick={() => setShowRentRequestModal(true)}
                                    className="w-full bg-indigo-600 text-white py-3 px-4 rounded-md hover:bg-indigo-700 transition-colors font-medium"
                                >
                                    Send Rent Request
                                </button>
                            </div>
                        )}

                        {/* Wishlist Actions */}
                        {(role === 'ROLE_USER' || role === 'ROLE_ADMIN') && (
                            <div className="bg-white rounded-lg shadow-md p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Save this property</h3>
                                {isWishListed ? (
                                    <button
                                        onClick={handleRemoveWishlist}
                                        className="w-full bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 transition-colors"
                                    >
                                        Remove from Wishlist
                                    </button>
                                ) : (
                                    <div>
                                        <textarea
                                            value={note}
                                            onChange={(e) => setNote(e.target.value)}
                                            className={inputClassName}
                                            placeholder="Add a note (optional)"
                                            rows="3"
                                        />
                                        <button
                                            onClick={handleAddWishlist}
                                            className="w-full mt-3 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors"
                                        >
                                            Add to Wishlist
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Owner/Admin Actions */}
                        {(role === 'ROLE_OWNER' || role === 'ROLE_ADMIN') && (
                            <div className="bg-white rounded-lg shadow-md p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Property Management</h3>
                                <div className="space-y-3">
                                    <button
                                        onClick={() => setShowEditModal(true)}
                                        className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
                                    >
                                        Edit Property
                                    </button>
                                    <button
                                        onClick={() => setShowPhotoUpload(true)}
                                        className="w-full bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700 transition-colors"
                                    >
                                        Upload Photos
                                    </button>
                                    {role === 'ROLE_ADMIN' && (
                                        <button
                                            onClick={handleToggleVerify}
                                            className={`w-full py-2 px-4 rounded-md transition-colors ${verified ? 'bg-yellow-600 hover:bg-yellow-700' : 'bg-green-600 hover:bg-green-700'
                                                } text-white`}
                                        >
                                            {verified ? 'Mark as Unverified' : 'Mark as Verified'}
                                        </button>
                                    )}
                                    <button
                                        onClick={handleDeleteProperty}
                                        className="w-full bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 transition-colors"
                                    >
                                        Delete Property
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Rent Request Modal */}
            {showRentRequestModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Send Rent Request</h3>
                        <form onSubmit={handleSendRentRequest}>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Start Date
                                    </label>
                                    <input
                                        type="date"
                                        value={startDate}
                                        onChange={(e) => setStartDate(e.target.value)}
                                        className={inputClassName}
                                        required
                                        min={new Date().toISOString().split('T')[0]}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        End Date
                                    </label>
                                    <input
                                        type="date"
                                        value={endDate}
                                        onChange={(e) => setEndDate(e.target.value)}
                                        className={inputClassName}
                                        required
                                        min={startDate || new Date().toISOString().split('T')[0]}
                                    />
                                </div>
                                <div className="bg-gray-50 p-4 rounded-md">
                                    <p className="text-sm text-gray-600">
                                        <strong>Monthly Rent:</strong> ₹{selectedProperty.monthlyRent?.toLocaleString()}
                                    </p>
                                    <p className="text-sm text-gray-600">
                                        <strong>Security Deposit:</strong> ₹{selectedProperty.securityDepositAmount?.toLocaleString()}
                                    </p>
                                </div>
                            </div>
                            <div className="flex justify-end space-x-3 mt-6">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowRentRequestModal(false);
                                        setStartDate('');
                                        setEndDate('');
                                    }}
                                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmittingRequest}
                                    className={`px-4 py-2 rounded-md font-medium transition-colors ${isSubmittingRequest
                                            ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                                            : 'bg-indigo-600 text-white hover:bg-indigo-700'
                                        }`}
                                >
                                    {isSubmittingRequest ? 'Sending...' : 'Send Request'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Photo Modal */}
            {showPhotoModal && photos[currentPhotoIndex] && (
                <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50">
                    <div className="relative max-w-4xl max-h-4xl">
                        <button
                            onClick={() => setShowPhotoModal(false)}
                            className="absolute top-4 right-4 text-white hover:text-gray-300 z-10"
                        >
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                        <img
                            src={photoUrls[photos[currentPhotoIndex].id]}
                            alt={`Property photo ${currentPhotoIndex + 1}`}
                            className="max-w-full max-h-full object-contain"
                        />
                    </div>
                </div>
            )}

            {/* Edit Property Modal */}
            {showEditModal && (
                <EditProperty
                    property={selectedProperty}
                    onClose={() => setShowEditModal(false)}
                    onUpdate={handlePropertyUpdate}
                />
            )}

            {/* Photo Upload Modal */}
            {showPhotoUpload && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-96 overflow-y-auto">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold text-gray-900">Upload Photos</h3>
                            <button
                                onClick={() => setShowPhotoUpload(false)}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <PhotoUploadComponent
                            propertyId={pr_id}
                            onUploadSuccess={handlePhotoUploadSuccess}
                            onUploadError={handlePhotoUploadError}
                            showPreview={true}
                        />
                    </div>
                </div>
            )}

            {/* Facility Management Modal */}
            {showFacilityModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-96 overflow-y-auto">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold text-gray-900">Manage Facilities</h3>
                            <button
                                onClick={() => setShowFacilityModal(false)}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {/* Current Facilities */}
                        <div className="mb-6">
                            <h4 className="font-medium text-gray-900 mb-3">Current Facilities</h4>
                            {facilities.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {facilities.map((facility, index) => (
                                        <div key={index} className="border rounded-lg p-4 flex justify-between items-start">
                                            <div>
                                                <h5 className="font-medium text-gray-900">{facility.facName}</h5>
                                                {facility.description && (
                                                    <p className="text-sm text-gray-600 mt-1">{facility.description}</p>
                                                )}
                                            </div>
                                            <button
                                                onClick={() => handleRemoveFacilityFromProperty(facility.facName)}
                                                disabled={facilityLoadingStates[`remove_${facility.facName}`]}
                                                className="ml-2 text-red-600 hover:text-red-800 text-sm"
                                            >
                                                {facilityLoadingStates[`remove_${facility.facName}`] ? 'Removing...' : 'Remove'}
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-gray-500">No facilities added to this property yet.</p>
                            )}
                        </div>

                        {/* Available Facilities */}
                        <div className="mb-6">
                            <h4 className="font-medium text-gray-900 mb-3">Available Facilities</h4>
                            {allFacilities.length > 0 ? (
                                allFacilities.filter(facility => !isFacilityAdded(facility.facName)).length > 0 ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {allFacilities
                                            .filter(facility => !isFacilityAdded(facility.facName))
                                            .map((facility, index) => (
                                                <div key={index} className="border rounded-lg p-4 flex justify-between items-start">
                                                    <div>
                                                        <h5 className="font-medium text-gray-900">{facility.facName}</h5>
                                                        {facility.description && (
                                                            <p className="text-sm text-gray-600 mt-1">{facility.description}</p>
                                                        )}
                                                    </div>
                                                    <button
                                                        onClick={() => handleAddFacilityToProperty(facility.facName, facility.description)}
                                                        disabled={facilityLoadingStates[`add_${facility.facName}`]}
                                                        className="ml-2 text-green-600 hover:text-green-800 text-sm"
                                                    >
                                                        {facilityLoadingStates[`add_${facility.facName}`] ? 'Adding...' : 'Add'}
                                                    </button>
                                                </div>
                                            ))}
                                    </div>
                                ) : (
                                    <p className="text-gray-500">All available facilities have been added to this property.</p>
                                )
                            ) : (
                                <p className="text-gray-500">Loading facilities...</p>
                            )}
                        </div>

                        {/* Add New Facility */}
                        <div className="border-t pt-4">
                            <h4 className="font-medium text-gray-900 mb-3">Add New Facility</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <input
                                    type="text"
                                    value={newFacilityName}
                                    onChange={(e) => setNewFacilityName(e.target.value)}
                                    placeholder="Facility name"
                                    className={inputClassName}
                                />
                                <input
                                    type="text"
                                    value={newFacilityDescription}
                                    onChange={(e) => setNewFacilityDescription(e.target.value)}
                                    placeholder="Description (optional)"
                                    className={inputClassName}
                                />
                            </div>
                            <button
                                onClick={handleAddNewFacility}
                                className="mt-3 bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors"
                            >
                                Add New Facility
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
export default ApiPreviewProperty