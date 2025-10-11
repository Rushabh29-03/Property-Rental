import React, { useState, useEffect } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router'
import AuthService from '../../services/AuthService'
import PropertyService from '../../services/PropertyService'
import PhotoService from '../../services/PhotoService'

function ApiPreviewProperty() {
    // Navigate and Location hooks
    const navigate = useNavigate()
    const location = useLocation()
    const pr_id = 2;
    const role = AuthService.getCurrentUser()?.role

    // Property state
    const [selectedProperty, setSelectedProperty] = useState(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const [isVisible, setIsVisible] = useState(false)

    // Photo state
    const [photos, setPhotos] = useState([])
    const [photoUrls, setPhotoUrls] = useState({})
    const [loadingPhotos, setLoadingPhotos] = useState(new Set())
    const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0)
    const [showPhotoModal, setShowPhotoModal] = useState(false)
    const [showPhotoUpload, setShowPhotoUpload] = useState(false)

    // Modal states
    const [showEditModal, setShowEditModal] = useState(false)
    const [showFacilityModal, setShowFacilityModal] = useState(false)

    // Property rules state
    const [address, setAddress] = useState("")
    const [description, setDescription] = useState("")
    const [area, setArea] = useState(0.0)
    const [monthlyRent, setMonthlyRent] = useState(0.0)
    const [minStay, setMinStay] = useState(0)
    const [petsPolicy, setPetsPolicy] = useState(null)
    const [isSmokingAllowed, setIsSmokingAllowed] = useState(false)
    const [otherRules, setOtherRules] = useState(null)
    const [verified, setVerified] = useState(false)

    // Enhanced Facilities state
    const [facilities, setFacilities] = useState([])
    const [facilityLoaded, setFacilityLoaded] = useState(false)
    const [allFacilities, setAllFacilities] = useState([])
    const [newFacilityName, setNewFacilityName] = useState("")
    const [newFacilityDescription, setNewFacilityDescription] = useState("")
    const [facilityLoadingStates, setFacilityLoadingStates] = useState({})

    // Wishlist state
    const [note, setNote] = useState("EE haloo")
    const isWishListed = location.state?.isWishListedProp

    // CSS classes
    const inputClassName = 'mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm'
    const buttonClassName = "px-4 py-2 rounded-md font-medium transition-colors cursor-pointer"

    // Property data for updates
    const propertyRulesData = {
        "address": address,
        "area": area,
        "monthlyRent": monthlyRent,
        "minStay": minStay,
        "petsPolicy": petsPolicy,
        "smokingAllowed": isSmokingAllowed,
        "otherRules": otherRules
    }

    // Wishlist data
    const wishListData = {
        "note": note
    }

    // Check if user can manage facilities
    const canManageFacilities = () => {
        return role === 'ROLE_ADMIN' || role === 'ROLE_OWNER'
    }

    // Load photos for the property
    const loadPropertyPhotos = async (propertyId) => {
        try {
            const response = await PhotoService.fetchPhotos(propertyId)
            if (response?.photos) {
                setPhotos(response.photos)
                const photosToLoad = response.photos.slice(0, Math.min(3, response.photos.length))
                for (const photo of photosToLoad) {
                    loadIndividualPhoto(photo.id)
                }
            }
        } catch (error) {
            console.error('Error loading photos:', error)
        }
    }

    // Load individual photo
    const loadIndividualPhoto = async (photoId) => {
        if (photoUrls[photoId] || loadingPhotos.has(photoId)) return
        setLoadingPhotos(prev => new Set([...prev, photoId]))
        try {
            const dataUrl = await PhotoService.getPhotoDataUrl(photoId)
            if (dataUrl) {
                setPhotoUrls(prev => ({ ...prev, [photoId]: dataUrl }))
            }
        } catch (error) {
            console.error('Error loading photo:', error)
        } finally {
            setLoadingPhotos(prev => {
                const newSet = new Set(prev)
                newSet.delete(photoId)
                return newSet
            })
        }
    }

    // Photo slider navigation
    const nextPhoto = () => {
        if (photos.length > 0) {
            const nextIndex = (currentPhotoIndex + 1) % photos.length
            setCurrentPhotoIndex(nextIndex)
            if (!photoUrls[photos[nextIndex].id]) {
                loadIndividualPhoto(photos[nextIndex].id)
            }
        }
    }

    const prevPhoto = () => {
        if (photos.length > 0) {
            const prevIndex = currentPhotoIndex === 0 ? photos.length - 1 : currentPhotoIndex - 1
            setCurrentPhotoIndex(prevIndex)
            if (!photoUrls[photos[prevIndex].id]) {
                loadIndividualPhoto(photos[prevIndex].id)
            }
        }
    }

    // GET PROPERTY BY ID
    const handleGetPropertyById = async (prId) => {
        setLoading(true)
        try {
            const response = await PropertyService.getPropertyById(prId)
            if (response) {
                setSelectedProperty(response)
                await loadPropertyPhotos(prId)
            } else {
                setSelectedProperty([])
            }
        } catch (error) {
            console.error(error)
            setError('Failed to load property')
        } finally {
            setLoading(false)
        }
    }

    // HANDLE DELETE PHOTO
    const handleDeletePhoto = async (e, photoId) => {
        if (e) {
            e.preventDefault()
        }
        const isConfirmed = window.confirm("Are you sure you want to delete this photo?")
        if (!isConfirmed) return

        try {
            const response = await PhotoService.deletePhoto(photoId)
            if (response) {
                console.log('Photo deleted:', response)
                await loadPropertyPhotos(pr_id)
                if (currentPhotoIndex >= photos.length - 1) {
                    setCurrentPhotoIndex(0)
                }
            }
        } catch (error) {
            console.error('Error deleting photo:', error)
            alert('Failed to delete photo. Please try again.')
        }
    }

    // EDIT PROPERTY RULES
    const handleEditPropertyRules = async (e) => {
        e.preventDefault()
        console.log("Sending data: ", propertyRulesData)
        try {
            const response = await PropertyService.editProperty(propertyRulesData, pr_id)
            if (response) {
                alert('Property updated')
                await handleGetPropertyById(pr_id)
            }
        } catch (error) {
            console.error(error)
            alert('Failed to update property')
        }
    }

    // DELETE PROPERTY
    const handleDeleteProperty = () => {
        const isConfirmed = window.confirm("Are you sure to delete the property?")
        if (isConfirmed) {
            const response = PropertyService.deletePropertyById(pr_id)
            if (response && role) {
                if (role === "ROLE_ADMIN") navigate('/properties')
                else if (role === "ROLE_OWNER") navigate('/owner-dashboard')
                else throw error
                window.location.reload()
            }
        }
    }

    // TOGGLE VERIFY
    const handleToggleVerify = async (e) => {
        e.preventDefault()
        const response = await AdminService.toggleVerifiedStatus(pr_id)
        if (response) {
            alert(response.message)
            await handleGetPropertyById(pr_id)
        }
    }

    // GET FACILITIES HANDLER
    const getFacilitiesHandler = async (e) => {
        e.preventDefault()
        if (!facilityLoaded) {
            if (facilities.length === 0) {
                const response = await PropertyService.getPropertyFacilities(pr_id)
                if (response) {
                    setFacilities(response)
                    setFacilityLoaded(true)
                } else {
                    setFacilities([])
                    setFacilityLoaded(true)
                }
            } else {
                setFacilityLoaded(true)
            }
        } else {
            setFacilityLoaded(false)
        }
    }

    // NEW: GET ALL FACILITIES
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

    // NEW: ADD FACILITY TO PROPERTY
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

    // NEW: REMOVE FACILITY FROM PROPERTY
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

    // NEW: ADD NEW FACILITY
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

    // NEW: OPEN FACILITY MANAGEMENT MODAL
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

    // Check if facility is already added to property
    const isFacilityAdded = (facilityName) => {
        return facilities.some(f => f.facName.toLowerCase() === facilityName.toLowerCase())
    }

    // HANDLE ADD WISHLIST
    const handleAddWishlist = async (e) => {
        e.preventDefault()
        const response = await UserService.addWishList(pr_id, wishListData)
        if (response) {
            alert(response.message)
            navigate('/wishList')
        }
    }

    // HANDLE REMOVE WISHLIST
    const handleRemoveWishlist = async (e) => {
        e.preventDefault()
        const response = await UserService.removeWishListedProperty(pr_id)
        if (response) {
            alert(response.message)
            navigate('/wishList')
        }
    }

    // Handle photo upload success
    const handlePhotoUploadSuccess = (data) => {
        console.log('Photos uploaded successfully:', data)
        loadPropertyPhotos(pr_id)
        setShowPhotoUpload(false)
    }

    // Handle photo upload error
    const handlePhotoUploadError = (error) => {
        console.error('Photo upload failed:', error)
        alert('Photo upload failed: ' + error)
    }

    // Handle property update from EditProperty modal
    const handlePropertyUpdate = (updatedProperty) => {
        setSelectedProperty(updatedProperty)
        setShowEditModal(false)
    }

    // USE-EFFECT 1 - fetching property
    useEffect(() => {
        const userId = AuthService.getCurrentUser()?.username
        if (userId) {
            handleGetPropertyById(pr_id)
        } else {
            setSelectedProperty(null)
        }
    }, [pr_id])

    // USE-EFFECT 2 - scroll control
    useEffect(() => {
        const previewBody = document.getElementById('preview-property-body')
        if (previewBody) {
            if (isVisible) {
                document.body.style.overflow = 'hidden'
                previewBody.style.pointerEvents = 'none'
            } else {
                document.body.style.overflow = 'unset'
                previewBody.style.pointerEvents = 'unset'
            }
        }
        return () => {
            const bodyToReset = document.getElementById('preview-property-body')
            if (bodyToReset) {
                document.body.style.overflow = 'unset'
                bodyToReset.style.pointerEvents = 'unset'
            }
        }
    }, [isVisible])

    // USE-EFFECT 3 - update states
    useEffect(() => {
        if (selectedProperty) {
            setAddress(selectedProperty.address || '')
            setDescription(selectedProperty.description || '')
            setArea(selectedProperty.area || 0.0)
            setMonthlyRent(selectedProperty.monthlyRent || 0.0)
            setMinStay(selectedProperty.minStay || 0)
            setPetsPolicy(selectedProperty.petsPolicy || null)
            setIsSmokingAllowed(selectedProperty.smokingAllowed || false)
            setOtherRules(selectedProperty.otherRules || null)
            setVerified(selectedProperty.isVerified || false)
        }
    }, [selectedProperty])

    // Handle loading state
    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-lg text-gray-600">Loading property details...</p>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center p-8">
                    <div className="text-red-500 text-xl mb-4">⚠️</div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Error</h2>
                    <p className="text-gray-600">{error}</p>
                </div>
            </div>
        )
    }

    if (!selectedProperty) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center p-8">
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Property not found</h2>
                    <p className="text-gray-600">The requested property could not be found.</p>
                </div>
            </div>
        )
    }

    return (
        <div id="preview-property-body" className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
                {/* Photo Section */}
                <div className="mb-8">
                    <div className="relative">
                        {photos.length === 0 ? (
                            <div className="w-full h-96 bg-gray-200 rounded-lg flex items-center justify-center">
                                <div className="text-center">
                                    <div className="text-gray-400 text-6xl mb-4">🏠</div>
                                    <p className="text-gray-500">No photos available</p>
                                    {canManageFacilities() && (
                                        <button
                                            onClick={() => setShowPhotoUpload(true)}
                                            className="mt-4 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md"
                                        >
                                            Upload Photos
                                        </button>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="relative">
                                {loadingPhotos.has(photos[currentPhotoIndex]?.id) ? (
                                    <div className="w-full h-96 bg-gray-200 rounded-lg flex items-center justify-center">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                                        <span className="ml-2">Loading...</span>
                                    </div>
                                ) : (
                                    <img
                                        src={photoUrls[photos[currentPhotoIndex]?.id] || '/placeholder-image.jpg'}
                                        alt={`Property ${currentPhotoIndex + 1}`}
                                        className="w-full h-96 object-cover rounded-lg cursor-pointer"
                                        onClick={() => setShowPhotoModal(true)}
                                    />
                                )}

                                {/* Navigation arrows */}
                                {photos.length > 1 && (
                                    <>
                                        <button
                                            onClick={prevPhoto}
                                            className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-70 text-white p-2 rounded-full"
                                        >
                                            &#8249;
                                        </button>
                                        <button
                                            onClick={nextPhoto}
                                            className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-70 text-white p-2 rounded-full"
                                        >
                                            &#8250;
                                        </button>
                                    </>
                                )}

                                {/* Photo counter */}
                                <div className="absolute bottom-4 right-4 bg-black bg-opacity-50 text-white px-3 py-1 rounded">
                                    {currentPhotoIndex + 1} / {photos.length}
                                </div>

                                {/* Delete photo button for admin/owner */}
                                {canManageFacilities() && (
                                    <button
                                        onClick={(e) => handleDeletePhoto(e, photos[currentPhotoIndex]?.id)}
                                        className="absolute top-4 right-4 bg-red-500 hover:bg-red-600 text-white p-2 rounded-full"
                                        title="Delete this photo"
                                    >
                                        🗑️
                                    </button>
                                )}
                            </div>
                        )}

                        {/* Photo management buttons for admin/owner */}
                        {canManageFacilities() && photos.length > 0 && (
                            <div className="mt-4 flex gap-2">
                                <button
                                    onClick={() => setShowPhotoUpload(true)}
                                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md"
                                >
                                    Add More Photos
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Property Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800 mb-4">{selectedProperty.address}</h1>
                        <div className="space-y-3">
                            <div className="flex items-center">
                                <span className="font-semibold text-gray-600 w-32">Area:</span>
                                <span className="text-gray-800">{selectedProperty.area} {selectedProperty.areaUnit}</span>
                            </div>
                            <div className="flex items-center">
                                <span className="font-semibold text-gray-600 w-32">Bedrooms:</span>
                                <span className="text-gray-800">{selectedProperty.noOfBedrooms}</span>
                            </div>
                            <div className="flex items-center">
                                <span className="font-semibold text-gray-600 w-32">Monthly Rent:</span>
                                <span className="text-green-600 font-semibold">₹{selectedProperty.monthlyRent?.toLocaleString()}</span>
                            </div>
                            <div className="flex items-center">
                                <span className="font-semibold text-gray-600 w-32">Security Deposit:</span>
                                <span className="text-gray-800">₹{selectedProperty.securityDepositAmount?.toLocaleString()}</span>
                            </div>
                        </div>
                    </div>

                    <div>
                        <h3 className="text-xl font-semibold text-gray-800 mb-4">Property Rules</h3>
                        <div className="space-y-3">
                            <div className="flex items-center">
                                <span className="font-semibold text-gray-600 w-32">Min Stay:</span>
                                <span className="text-gray-800">{selectedProperty.minStay || 0} months</span>
                            </div>
                            <div className="flex items-center">
                                <span className="font-semibold text-gray-600 w-32">Pets Policy:</span>
                                <span className="text-gray-800">{selectedProperty.petsPolicy || 'Not specified'}</span>
                            </div>
                            <div className="flex items-center">
                                <span className="font-semibold text-gray-600 w-32">Smoking:</span>
                                <span className="text-gray-800">{selectedProperty.smokingAllowed ? 'Allowed' : 'Not allowed'}</span>
                            </div>
                            {selectedProperty.otherRules && (
                                <div>
                                    <span className="font-semibold text-gray-600">Other Rules:</span>
                                    <p className="text-gray-800 mt-1">{selectedProperty.otherRules}</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Description */}
                <div className="mb-8">
                    <h3 className="text-xl font-semibold text-gray-800 mb-4">Description</h3>
                    <p className="text-gray-700 leading-relaxed">{selectedProperty.description}</p>
                </div>

                {/* Facilities Section */}
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xl font-semibold text-gray-800">Facilities</h3>
                        <div className="flex gap-2">
                            <button
                                onClick={getFacilitiesHandler}
                                className={`${buttonClassName} ${facilityLoaded
                                    ? 'bg-red-500 hover:bg-red-600 text-white'
                                    : 'bg-blue-500 hover:bg-blue-600 text-white'
                                    }`}
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

                    {facilityLoaded && (
                        <div>
                            {facilities.length === 0 ? (
                                <p className="text-gray-500 italic">No facilities available.</p>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-4 mb-6">
                    {/* Wishlist buttons for users */}
                    {role === 'ROLE_USER' && (
                        <>
                            {!isWishListed ? (
                                <button
                                    onClick={handleAddWishlist}
                                    className={`${buttonClassName} bg-red-500 hover:bg-red-600 text-white`}
                                >
                                    ❤️ Add to Wishlist
                                </button>
                            ) : (
                                <button
                                    onClick={handleRemoveWishlist}
                                    className={`${buttonClassName} bg-gray-500 hover:bg-gray-600 text-white`}
                                >
                                    💔 Remove from Wishlist
                                </button>
                            )}
                        </>
                    )}

                    {/* Admin/Owner buttons */}
                    {canManageFacilities() && (
                        <>
                            <button
                                onClick={() => setShowEditModal(true)}
                                className={`${buttonClassName} bg-blue-500 hover:bg-blue-600 text-white`}
                            >
                                ✏️ Edit Property
                            </button>
                            <button
                                onClick={handleDeleteProperty}
                                className={`${buttonClassName} bg-red-500 hover:bg-red-600 text-white`}
                            >
                                🗑️ Delete Property
                            </button>
                        </>
                    )}

                    {/* Admin only buttons */}
                    {role === 'ROLE_ADMIN' && (
                        <button
                            onClick={handleToggleVerify}
                            className={`${buttonClassName} ${verified
                                ? 'bg-orange-500 hover:bg-orange-600'
                                : 'bg-green-500 hover:bg-green-600'
                                } text-white`}
                        >
                            {verified ? '❌ Unverify Property' : '✅ Verify Property'}
                        </button>
                    )}
                </div>

                {/* FACILITY MANAGEMENT MODAL */}
                {showFacilityModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
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
                                                            onClick={() => handleAddFacilityToProperty(facility.facName, "")}
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
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-auto m-4">
                            <EditProperty
                                property={selectedProperty}
                                onUpdate={handlePropertyUpdate}
                                onCancel={() => setShowEditModal(false)}
                            />
                        </div>
                    </div>
                )}

                {/* Photo Upload Modal */}
                {showPhotoUpload && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-auto m-4">
                            <PhotoUploadComponent
                                propertyId={pr_id}
                                onSuccess={handlePhotoUploadSuccess}
                                onError={handlePhotoUploadError}
                                onCancel={() => setShowPhotoUpload(false)}
                            />
                        </div>
                    </div>
                )}

                {/* Photo Modal */}
                {showPhotoModal && photos.length > 0 && (
                    <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50" onClick={() => setShowPhotoModal(false)}>
                        <div className="relative max-w-4xl max-h-full p-4">
                            <img
                                src={photoUrls[photos[currentPhotoIndex]?.id] || '/placeholder-image.jpg'}
                                alt={`Property ${currentPhotoIndex + 1}`}
                                className="max-w-full max-h-full object-contain"
                                onClick={(e) => e.stopPropagation()}
                            />
                            <button
                                onClick={() => setShowPhotoModal(false)}
                                className="absolute top-4 right-4 text-white text-2xl hover:text-gray-300"
                            >
                                ×
                            </button>
                            {photos.length > 1 && (
                                <>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); prevPhoto(); }}
                                        className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white text-3xl hover:text-gray-300"
                                    >
                                        &#8249;
                                    </button>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); nextPhoto(); }}
                                        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white text-3xl hover:text-gray-300"
                                    >
                                        &#8250;
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
export default ApiPreviewProperty