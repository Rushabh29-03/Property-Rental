import React, { useEffect, useState } from 'react'
import UserService from '../../services/UserService'
import OwnerService from '../../services/OwnerService'
import { useLocation, useNavigate, useParams } from 'react-router';
import AuthService from '../../services/AuthService';
import PropertyService from '../../services/PropertyService';
import PhotoService from '../../services/PhotoService';
import PhotoUploadComponent from '../photoUploadPage/PhotoUploadPage';

function RentRequest() {
    const currentUser = AuthService.getCurrentUser();
    const navigate = useNavigate();

    // Property state
    const [properties, setProperties] = useState([]);

    // Form state
    const [description, setDescription] = useState("");
    const [address, setAddress] = useState("");
    const [isVerified, setIsVerified] = useState(false);
    const [area, setArea] = useState("");
    const [areaUnit, setAreaUnit] = useState("sq_feet");
    const [monthlyRent, setMonthlyRent] = useState("");
    const [noOfBedrooms, setNoOfBedrooms] = useState("");
    const [securityDepositAmount, setSecurityDepositAmount] = useState("");
    const [minStay, setMinStay] = useState(0);
    const [petsPolicy, setPetsPolicy] = useState('');
    const [isSmokingAllowed, setIsSmokingAllowed] = useState(false);
    const [otherRules, setOtherRules] = useState('');

    // UI state
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitMessage, setSubmitMessage] = useState('');
    const [showAddForm, setShowAddForm] = useState(false);
    const [newPropertyId, setNewPropertyId] = useState(null);
    const [showPhotoUpload, setShowPhotoUpload] = useState(false);

    // Rent requests state
    const [rentRequests, setRentRequests] = useState([]);
    const [showRentRequests, setShowRentRequests] = useState(false);
    const [loadingRequests, setLoadingRequests] = useState(false);
    const [propertyRequestCounts, setPropertyRequestCounts] = useState({});

    // Photo management state
    const [propertyPhotos, setPropertyPhotos] = useState({});
    const [loadingPhotos, setLoadingPhotos] = useState({});
    const [photoUrls, setPhotoUrls] = useState({}); // Store loaded photo URLs
    const [loadingIndividualPhotos, setLoadingIndividualPhotos] = useState(new Set());

    const inputClassName = "mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm";

    // Navigate to property details
    const handleNavigate = (prId) => {
        navigate(`/property/${prId}`);
    };

    // Reset form
    const resetForm = () => {
        setDescription("");
        setAddress("");
        setIsVerified(false);
        setArea("");
        setAreaUnit("sq_feet");
        setMonthlyRent("");
        setNoOfBedrooms("");
        setSecurityDepositAmount("");
        setMinStay(0);
        setPetsPolicy('');
        setIsSmokingAllowed(false);
        setOtherRules('');
        setSubmitMessage('');
    };

    // Validate form
    const validateForm = () => {
        const errors = [];
        if (!description.trim()) errors.push("Description is required");
        if (!address.trim()) errors.push("Address is required");
        if (!area || area <= 0) errors.push("Valid area is required");
        if (!monthlyRent || monthlyRent <= 0) errors.push("Valid monthly rent is required");
        if (!noOfBedrooms || noOfBedrooms <= 0) errors.push("Number of bedrooms is required");
        if (!securityDepositAmount || securityDepositAmount < 0) errors.push("Security deposit amount is required");
        return errors;
    };

    // !HANDLE ADD PROPERTY
    const handleAddProperty = async (e) => {
        e.preventDefault();

        const validationErrors = validateForm();
        if (validationErrors.length > 0) {
            setSubmitMessage(`!!! Please fix the following errors: ${validationErrors.join(', ')}`);
            return;
        }

        setIsSubmitting(true);
        setSubmitMessage('Creating property...');

        const propertyData = {
            description: description.trim(),
            address: address.trim(),
            isVerified,
            area: Number(area),
            areaUnit,
            noOfBedrooms: Number(noOfBedrooms),
            monthlyRent: Number(monthlyRent),
            securityDepositAmount: Number(securityDepositAmount),
            minStay,
            petsPolicy: petsPolicy.trim(),
            isSmokingAllowed,
            otherRules: otherRules.trim()
        };

        try {
            const response = await PropertyService.addProperty(propertyData);
            if (response && response.id) {
                setSubmitMessage('Pass: ✅ Property created successfully! You can now add photos.');
                setNewPropertyId(response.id);
                setShowPhotoUpload(true);
                // Refresh properties list
                await handleGetProperty();
                // Scroll to photo upload section
                setTimeout(() => {
                    document.getElementById('photo-upload-section')?.scrollIntoView({ behavior: 'smooth' });
                }, 500);
            } else {
                setSubmitMessage('!!! Property creation failed. Please try again.');
            }
        } catch (error) {
            console.error('Property creation error:', error);
            setSubmitMessage(`!!! Error: ${error.response?.data?.message || error.message}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    // !HANDLE GET PROPERTY
    const handleGetProperty = async () => {
        try {
            const response = await OwnerService.getProperties();
            setProperties(response || []);
        } catch (error) {
            console.error('Error fetching properties:', error);
        }
    };

    // !LOAD RENT REQUESTS COUNT FOR EACH PROPERTY
    const loadPropertyRequestCounts = async () => {
        const counts = {};
        for (const property of properties) {
            try {
                const count = await OwnerService.getRentRequestsCount(property.id);
                counts[property.id] = count;
            } catch (error) {
                console.error(`Error loading request count for property ${property.id}:`, error);
                counts[property.id] = 0;
            }
        }
        setPropertyRequestCounts(counts);
    };

    // !HANDLE GET RENT REQUESTS
    const handleGetRentRequests = async () => {
        setLoadingRequests(true);
        try {
            const requests = await OwnerService.getRentRequests();
            setRentRequests(requests);
            setShowRentRequests(true);
        } catch (error) {
            console.error('Error fetching rent requests:', error);
            setRentRequests([]);
        } finally {
            setLoadingRequests(false);
        }
    };

    // !HANDLE ACCEPT RENT REQUEST
    const handleAcceptRentRequest = async (request) => {
        try {
            const rentData = {
                userId: request.userId,
                propertyId: request.propertyId,
                finalMonthlyRent: request.monthlyRent,
                finalSecurityDeposit: request.securityDeposit
            };

            const response = await OwnerService.acceptRentRequest(rentData);
            if (response) {
                alert('Rent request accepted successfully!');
                // Refresh rent requests
                await handleGetRentRequests();
                // Refresh property request counts
                await loadPropertyRequestCounts();
            }
        } catch (error) {
            console.error('Error accepting rent request:', error);
            alert('Failed to accept rent request. Please try again.');
        }
    };

    // !HANDLE REJECT RENT REQUEST
    const handleRejectRentRequest = async (request) => {
        if (!window.confirm('Are you sure you want to reject this rent request?')) {
            return;
        }

        try {
            const requestData = {
                userId: request.userId,
                propertyId: request.propertyId
            };

            const response = await OwnerService.rejectRentRequest(requestData);
            if (response) {
                alert('Rent request rejected successfully!');
                // Refresh rent requests
                await handleGetRentRequests();
                // Refresh property request counts
                await loadPropertyRequestCounts();
            }
        } catch (error) {
            console.error('Error rejecting rent request:', error);
            alert('Failed to reject rent request. Please try again.');
        }
    };

    // !Photo loading function - single click loads both metadata and first photo
    const loadPropertyPhotosAndFirstImage = async (propertyId, e) => {
        // Stop event propagation to prevent property card click
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }

        if (propertyPhotos[propertyId] || loadingPhotos[propertyId]) {
            return; // Already loaded or loading
        }

        setLoadingPhotos(prev => ({ ...prev, [propertyId]: true }));

        try {
            // 1. First load photo metadata
            const response = await PhotoService.fetchPhotos(propertyId);
            if (response?.photos && response.photos.length > 0) {
                setPropertyPhotos(prev => ({ ...prev, [propertyId]: response.photos }));
                // console.log(`Loaded ${response.photos.length} photos metadata for property ${propertyId}`);

                // 2. Immediately load the first photo's actual data
                const firstPhoto = response.photos[0];
                if (firstPhoto && !photoUrls[firstPhoto.id]) {
                    setLoadingIndividualPhotos(prev => new Set([...prev, firstPhoto.id]));

                    try {
                        const dataUrl = await PhotoService.getPhotoDataUrl(firstPhoto.id);
                        if (dataUrl) {
                            setPhotoUrls(prev => ({ ...prev, [firstPhoto.id]: dataUrl }));
                            // console.log(`Loaded photo data for first photo ${firstPhoto.id}`);
                        }
                    } catch (photoError) {
                        console.error(`Error loading first photo ${firstPhoto.id}:`, photoError);
                    } finally {
                        setLoadingIndividualPhotos(prev => {
                            const newSet = new Set(prev);
                            newSet.delete(firstPhoto.id);
                            return newSet;
                        });
                    }
                }
            }
        } catch (error) {
            console.error(`Error loading photos for property ${propertyId}:`, error);
        } finally {
            setLoadingPhotos(prev => ({ ...prev, [propertyId]: false }));
        }
    };

    // !Load individual photo data for additional photos
    const loadIndividualPhoto = async (photoId, e) => {
        // Stop event propagation
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }

        if (photoUrls[photoId] || loadingIndividualPhotos.has(photoId)) {
            return; // Already loaded or loading
        }

        setLoadingIndividualPhotos(prev => new Set([...prev, photoId]));

        try {
            // Get photo as base64 data URL for immediate display
            const dataUrl = await PhotoService.getPhotoDataUrl(photoId);
            if (dataUrl) {
                setPhotoUrls(prev => ({ ...prev, [photoId]: dataUrl }));
                // console.log(`Loaded photo data for photo ${photoId}`);
            } else {
                console.warn(`Failed to load photo data for photo ${photoId}`);
            }
        } catch (error) {
            console.error(`Error loading individual photo ${photoId}:`, error);
        } finally {
            setLoadingIndividualPhotos(prev => {
                const newSet = new Set(prev);
                newSet.delete(photoId);
                return newSet;
            });
        }
    };

    // !HANDLE PHOTO UPLOAD SUCCESS
    const handlePhotoUploadSuccess = (data) => {
        setSubmitMessage('Pass: ✅ Photos uploaded successfully!');
        // Refresh photos for the property
        if (newPropertyId) {
            setTimeout(() => {
                loadPropertyPhotosAndFirstImage(newPropertyId);
            }, 1000);
        }

        // Hide photo upload after successful upload
        setTimeout(() => {
            setShowPhotoUpload(false);
            setNewPropertyId(null);
            resetForm();
            setShowAddForm(false);
            window.scrollTo(0, 0);
        }, 2000);
    };

    // !HANDLE PHOTO UPLOAD ERROR
    const handlePhotoUploadError = (error) => {
        setSubmitMessage(`!!! Photo upload failed: ${error}`);
    };

    // !USE-EFFECT - Load properties on component mount
    useEffect(() => {
        const userId = currentUser?.username;
        if (userId) {
            handleGetProperty();
        } else {
            setProperties([]);
        }
    }, [currentUser?.username]);

    // !USE-EFFECT - load photos of properties
    useEffect(() => {
        for (const i of properties) {
            loadPropertyPhotosAndFirstImage(i.id);
        }
        // Load request counts for each property
        if (properties.length > 0) {
            loadPropertyRequestCounts();
        }
    }, [properties]);

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Owner Dashboard</h1>
                    <p className="mt-2 text-gray-600">Manage your properties and listings</p>
                </div>

                {/* Action Buttons */}
                <div className="mb-8 flex flex-wrap gap-4">
                    <button
                        onClick={() => setShowAddForm(!showAddForm)}
                        className="bg-indigo-600 text-white px-6 py-3 rounded-md hover:bg-indigo-700 transition-colors font-medium"
                    >
                        {showAddForm ? 'Cancel' : 'Add New Property'}
                    </button>
                    <button
                        onClick={handleGetRentRequests}
                        disabled={loadingRequests}
                        className="bg-green-600 text-white px-6 py-3 rounded-md hover:bg-green-700 transition-colors font-medium disabled:bg-gray-400"
                    >
                        {loadingRequests ? 'Loading...' : 'View Rent Requests'}
                    </button>
                </div>

                {/* Add Property Form */}
                {showAddForm && (
                    <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                        <h2 className="text-xl font-semibold text-gray-900 mb-6">Add New Property</h2>
                        <form onSubmit={handleAddProperty} className="space-y-6">
                            {/* Basic Information */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* ADDRESS */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Title</label>
                                    <input
                                        type="text"
                                        value={address}
                                        onChange={(e) => setAddress(e.target.value)}
                                        className={inputClassName}
                                        rows="3"
                                        placeholder="e.g., Name of your Flat"
                                        required
                                    />
                                </div>

                                {/* DESCRIPTION */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Address</label>
                                    <textarea
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        className={inputClassName}
                                        rows="3"
                                        placeholder="Full Address..."
                                        required
                                    />
                                </div>
                            </div>

                            {/* Property Details */}
                            {/* AREA */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Carpet Area</label>
                                    <input
                                        type="number"
                                        value={area}
                                        onChange={(e) => setArea(e.target.value)}
                                        className={inputClassName}
                                        placeholder="e.g., 1200"
                                        min="1"
                                        required
                                    />
                                </div>

                                {/* AREA UNIT */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Carpet Area Unit</label>
                                    <select
                                        value={areaUnit}
                                        onChange={(e) => setAreaUnit(e.target.value)}
                                        className={inputClassName}
                                    >
                                        <option value="sq_feet">Square Feet</option>
                                        <option value="sq_meter">Square Meter</option>
                                    </select>
                                </div>

                                {/* NO OF BEDROOMS */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Bedrooms</label>
                                    <input
                                        type="number"
                                        value={noOfBedrooms}
                                        onChange={(e) => setNoOfBedrooms(e.target.value)}
                                        className={inputClassName}
                                        placeholder="e.g., 3"
                                        min="1"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Financial Details */}
                            {/* MONTHLY RENT */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Monthly Rent</label>
                                    <input
                                        type="number"
                                        value={monthlyRent}
                                        onChange={(e) => setMonthlyRent(e.target.value)}
                                        className={inputClassName}
                                        placeholder="e.g., 25000"
                                        min="1"
                                        required
                                    />
                                </div>

                                {/* SECURITY DEPOSIT */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Security Deposit</label>
                                    <input
                                        type="number"
                                        value={securityDepositAmount}
                                        onChange={(e) => setSecurityDepositAmount(e.target.value)}
                                        className={inputClassName}
                                        placeholder="e.g., 50000"
                                        min="0"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Additional Details */}
                            {/* MINIMUM STAY */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Minimum Stay (months)</label>
                                    <input
                                        type="number"
                                        value={minStay}
                                        onChange={(e) => setMinStay(Number(e.target.value))}
                                        className={inputClassName}
                                        placeholder="e.g., 11"
                                        min="0"
                                    />
                                </div>

                                {/* PETS POLICY */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Pets Policy</label>
                                    <input
                                        type="text"
                                        value={petsPolicy}
                                        onChange={(e) => setPetsPolicy(e.target.value)}
                                        className={inputClassName}
                                        placeholder="e.g., No pets allowed"
                                    />
                                </div>
                            </div>

                            {/* Rules */}
                            {/* SMOKING ALLOWED FLAG */}
                            <div className="space-y-4">
                                <div className="flex items-center">
                                    <input
                                        type="checkbox"
                                        checked={isSmokingAllowed}
                                        onChange={(e) => setIsSmokingAllowed(e.target.checked)}
                                        className="mr-2"
                                    />
                                    <label className="text-sm font-medium text-gray-700">Smoking Allowed</label>
                                </div>

                                {/* OTHER RULES */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Other Rules</label>
                                    <textarea
                                        value={otherRules}
                                        onChange={(e) => setOtherRules(e.target.value)}
                                        className={inputClassName}
                                        rows="2"
                                        placeholder="Any additional rules or requirements..."
                                    />
                                </div>
                            </div>

                            {/* Submit Button */}
                            <div className="flex justify-end space-x-4">
                                <button
                                    type="button"
                                    onClick={() => {
                                        resetForm();
                                        setShowAddForm(false);
                                    }}
                                    className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className={`px-6 py-2 rounded-md font-medium transition-colors ${
                                        isSubmitting ? 'bg-gray-400 text-gray-200 cursor-not-allowed' : 'bg-indigo-600 text-white hover:bg-indigo-700'
                                    }`}
                                >
                                    {isSubmitting ? 'Creating...' : 'Create Property'}
                                </button>
                            </div>
                        </form>

                        {/* Status Message */}
                        {submitMessage && (
                            <div className="mt-4 p-4 rounded-md">
                                <p className={submitMessage.includes('Pass') ? 
                                    'bg-green-50 border border-green-200 text-green-700' : 
                                    'bg-red-50 border border-red-200 text-red-700'
                                }>
                                    {submitMessage}
                                </p>
                            </div>
                        )}
                    </div>
                )}

                {/* Photo Upload Section */}
                {showPhotoUpload && newPropertyId && (
                    <div id="photo-upload-section" className="bg-white rounded-lg shadow-md p-6 mb-8">
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">Add Photos to Your Property</h2>
                        <p className="text-gray-600 mb-6">Upload high-quality photos to attract more tenants. You can upload up to 5 photos.</p>
                        <PhotoUploadComponent
                            propertyId={newPropertyId}
                            onUploadSuccess={handlePhotoUploadSuccess}
                            onUploadError={handlePhotoUploadError}
                            showPreview={true}
                        />
                        <div className="mt-4 pt-4 border-t border-gray-200">
                            <button
                                onClick={() => {
                                    setShowPhotoUpload(false);
                                    setNewPropertyId(null);
                                    setShowAddForm(false);
                                    resetForm();
                                }}
                                className="text-gray-500 hover:text-gray-700 text-sm"
                            >
                                Skip photo upload for now
                            </button>
                        </div>
                    </div>
                )}

                {/* Rent Requests Modal */}
                {showRentRequests && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-96 overflow-y-auto">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-semibold text-gray-900">Rent Requests</h3>
                                <button
                                    onClick={() => setShowRentRequests(false)}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            {rentRequests.length === 0 ? (
                                <p className="text-gray-500 text-center py-8">No pending rent requests</p>
                            ) : (
                                <div className="space-y-4">
                                    {rentRequests.map((request, index) => (
                                        <div key={index} className="border rounded-lg p-4">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <h4 className="font-semibold text-gray-900">{request.propertyAddress}</h4>
                                                    <p className="text-sm text-gray-600">Requested by: {request.userName}</p>
                                                    <p className="text-sm text-gray-600">Email: {request.userEmail}</p>
                                                    <p className="text-sm text-gray-600">
                                                        Duration: {new Date(request.startDate).toLocaleDateString()} - {new Date(request.endDate).toLocaleDateString()}
                                                    </p>
                                                </div>
                                                <div className="flex flex-col justify-between">
                                                    <div>
                                                        <p className="text-sm text-gray-600">Monthly Rent: ₹{request.monthlyRent?.toLocaleString()}</p>
                                                        <p className="text-sm text-gray-600">Security Deposit: ₹{request.securityDeposit?.toLocaleString()}</p>
                                                    </div>
                                                    <div className="flex space-x-2 mt-4">
                                                        <button
                                                            onClick={() => handleAcceptRentRequest(request)}
                                                            className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 transition-colors"
                                                        >
                                                            Accept
                                                        </button>
                                                        <button
                                                            onClick={() => handleRejectRentRequest(request)}
                                                            className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700 transition-colors"
                                                        >
                                                            Reject
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Properties List */}
                <div className="bg-white rounded-lg shadow-md">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <h2 className="text-xl font-semibold text-gray-900">Your Properties</h2>
                    </div>

                    <div className="p-6">
                        {properties.length === 0 ? (
                            <div className="text-center py-12">
                                <div className="text-gray-400 mb-4">
                                    <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H9m0 0H5m0 0h2M7 7h10M7 11h4m6 0h4" />
                                    </svg>
                                </div>
                                <h3 className="text-lg font-medium text-gray-900 mb-2">No properties yet</h3>
                                <p className="text-gray-500 mb-4">Get started by adding your first property listing.</p>
                                <button
                                    onClick={() => setShowAddForm(true)}
                                    className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors"
                                >
                                    Add Your First Property
                                </button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {properties.map((property) => (
                                    <div
                                        key={property.id}
                                        className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                                    >
                                        {/* Property Image */}
                                        <div
                                            className="w-full h-48 bg-gray-200 rounded-md mb-4 flex items-center justify-center overflow-hidden"
                                            onClick={(e) => {
                                                // Only navigate to property details if we're not clicking on photo area
                                                if (!e.target.closest('.photo-area')) {
                                                    handleNavigate(property.id);
                                                }
                                            }}
                                        >
                                            {loadingPhotos[property.id] ? (
                                                <div className="text-gray-500 text-center">
                                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-2"></div>
                                                    <div className="text-sm">Loading photos...</div>
                                                </div>
                                            ) : propertyPhotos[property.id]?.length > 0 ? (
                                                <div className="w-full h-full photo-area">
                                                    {photoUrls[propertyPhotos[property.id][0].id] ? (
                                                        <img
                                                            src={photoUrls[propertyPhotos[property.id][0].id]}
                                                            alt={propertyPhotos[property.id][0].filename}
                                                            className="w-full h-full object-cover rounded-md cursor-pointer"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleNavigate(property.id);
                                                            }}
                                                            onError={(e) => {
                                                                e.target.style.display = 'none';
                                                                e.target.nextSibling.style.display = 'flex';
                                                            }}
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-400 hover:bg-gray-50 transition-colors cursor-pointer"
                                                             onClick={(e) => loadIndividualPhoto(propertyPhotos[property.id][0].id, e)}>
                                                            {loadingIndividualPhotos.has(propertyPhotos[property.id][0].id) ? (
                                                                <div className="text-center">
                                                                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600 mx-auto mb-2"></div>
                                                                    <div className="text-sm">Loading...</div>
                                                                </div>
                                                            ) : (
                                                                <div className="text-center">
                                                                    <svg className="mx-auto h-8 w-8 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                                    </svg>
                                                                    <div className="text-sm">Click to load photo</div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}

                                                    {/* Error fallback */}
                                                    <div className="w-full h-full bg-gray-100 items-center justify-center text-gray-400 hidden">
                                                        <div className="text-center">
                                                            <svg className="mx-auto h-8 w-8 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 15.5c-.77.833.192 2.5 1.732 2.5z" />
                                                            </svg>
                                                            <div className="text-sm">Failed to load photo</div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="text-gray-400 text-center hover:text-gray-600 transition-colors cursor-pointer photo-area">
                                                    <svg className="mx-auto h-8 w-8 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                    </svg>
                                                    <div className="text-sm">No photos added by owner</div>
                                                </div>
                                            )}
                                        </div>

                                        {/* PROPERTY DETAILS CARD */}
                                        <div className="space-y-2" onClick={() => handleNavigate(property.id)} style={{ cursor: 'pointer' }}>
                                            <h3 className="text-center font-bold text-gray-900 text-xl">{property.address}</h3>

                                            <div className="flex justify-between items-start">
                                                <h3 className="font-semibold text-gray-900 text-lg">₹{property.monthlyRent?.toLocaleString()}/month</h3>
                                                <span className={`px-2 py-1 text-xs rounded-full ${
                                                    property.isVerified ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                                                }`}>
                                                    {property.isVerified ? 'Verified' : 'Pending'}
                                                </span>
                                            </div>

                                            <div className="text-sm text-gray-600">
                                                <p><strong>Bedrooms:</strong> {property.noOfBedrooms}</p>
                                                <p><strong>Area:</strong> {property.area} {property.areaUnit}</p>
                                                <p><strong>Deposit:</strong> ₹{property.securityDepositAmount?.toLocaleString()}</p>
                                                {propertyPhotos[property.id] && (
                                                    <p><strong>Photos:</strong> {propertyPhotos[property.id].length}</p>
                                                )}
                                                {/* Show rent request count */}
                                                {propertyRequestCounts[property.id] !== undefined && (
                                                    <p><strong>Rent Requests:</strong> 
                                                        <span className={`ml-1 px-2 py-1 text-xs rounded-full ${
                                                            propertyRequestCounts[property.id] > 0 
                                                                ? 'bg-red-100 text-red-800' 
                                                                : 'bg-gray-100 text-gray-800'
                                                        }`}>
                                                            {propertyRequestCounts[property.id]}
                                                        </span>
                                                    </p>
                                                )}
                                            </div>

                                            <p className="text-gray-700 text-sm line-clamp-2">{property.description}</p>

                                            <div className="text-xs text-gray-500 border-t pt-2">
                                                <p>{property.description ? `Address : ${property.description}` : ''}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default RentRequest;