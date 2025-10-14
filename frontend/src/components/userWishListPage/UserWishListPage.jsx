import React, { useEffect, useState } from 'react'
import UserService from '../../services/UserService';
import { useNavigate } from 'react-router';
import AuthService from '../../services/AuthService';
import PhotoService from '../../services/PhotoService';

function UserWishListPage() {
  const currentUser = AuthService.getCurrentUser();
  const navigate = useNavigate();

  // loading state
  const [loading, setLoading] = useState(true);

  // Property state
  const [wishListedProperties, setWishListedProperties] = useState([])

  // Photo management state
  const [propertyPhotos, setPropertyPhotos] = useState({});
  const [loadingPhotos, setLoadingPhotos] = useState({});
  const [photoUrls, setPhotoUrls] = useState({}); // Store loaded photo URLs
  const [loadingIndividualPhotos, setLoadingIndividualPhotos] = useState(new Set());

  // Navigate to property details
  const handleNavigate = (prId) => {
    navigate(`/property/${prId}`, {
            state:{
                isWishListedProp : true
            }
    });
  }
  // !GET WISHLISTED PROPERTIES
  const getWishListed = async () => {
    try {
      const response = await UserService.getWishListedProperties();
      if (response) {
        setWishListedProperties(response.wishListedProperties ? response.wishListedProperties : [])
        setLoading(false)
      }
    } catch (error) {
      console.error(error);
    }
  }

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
        console.log(`Loaded ${response.photos.length} photos metadata for property ${propertyId}`);

        // 2. Immediately load the first photo's actual data
        const firstPhoto = response.photos[0];
        if (firstPhoto && !photoUrls[firstPhoto.id]) {
          setLoadingIndividualPhotos(prev => new Set([...prev, firstPhoto.id]));

          try {
            const dataUrl = await PhotoService.getPhotoDataUrl(firstPhoto.id);
            if (dataUrl) {
              setPhotoUrls(prev => ({ ...prev, [firstPhoto.id]: dataUrl }));
              console.log(`Loaded photo data for first photo ${firstPhoto.id}`);
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
      } else {
        // Set empty array instead of leaving undefined to prevent "No photos added by owner" message
        setPropertyPhotos(prev => ({ ...prev, [propertyId]: [] }));
        console.log(`No photos found for property ${propertyId}`);
      }
    } catch (error) {
      console.error(`Error loading photos for property ${propertyId}:`, error);
      // Set empty array on error to prevent "No photos added by owner" message
      setPropertyPhotos(prev => ({ ...prev, [propertyId]: [] }));
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
        console.log(`Loaded photo data for photo ${photoId}`);
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

  // !USE-EFFECT
  useEffect(() => {
    getWishListed();
  }, [setWishListedProperties]);

  // !USE-EFFECT - load photos of properties
  useEffect(() => {
    for (const i of wishListedProperties) {
      loadPropertyPhotosAndFirstImage(i.propertyDto.id);
    }
  }, [wishListedProperties])

  if (loading) {
    return (
      <div className="p-6 text-center text-blue-600">
        Loading properties...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Wishlisted Properties</h1>
          <p className="mt-2 text-gray-600">
            Manage your wishlisted properties
          </p>
        </div>

        {/* Properties List */}
        <div className="bg-white rounded-lg shadow-md">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Your Properties</h2>
          </div>
          <div className="p-6">
            {wishListedProperties.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-4">
                  <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H9m0 0H5m0 0h2M7 7h10M7 11h4m6 0h4" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Your wishlist is empty</h3>
                <p className="text-gray-500 mb-4">
                  Get started by adding your first property to wishlist.
                </p>
                <button
                  onClick={() => navigate('/properties')}
                  className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors"
                >
                  Go to all properties.
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {wishListedProperties.map((property) => {
                  const { propertyDto } = property;
                  return (
                    <div
                      key={propertyDto.id}
                      className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      {/* Property Image */}
                      <div
                        className="w-full h-48 bg-gray-200 rounded-md mb-4 flex items-center justify-center overflow-hidden"
                        onClick={(e) => {
                          // Only navigate to property details if we're not clicking on photo area
                          if (!e.target.closest('.photo-area')) {
                            handleNavigate(propertyDto.id);
                          }
                        }}
                      >
                        {loadingPhotos[propertyDto.id] ? (
                          <div className="text-gray-500 text-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-2"></div>
                            <div className="text-sm">Loading photos...</div>
                          </div>
                        ) : propertyPhotos[propertyDto.id] && propertyPhotos[propertyDto.id].length > 0 ? (
                          <div className="w-full h-full photo-area">
                            {photoUrls[propertyPhotos[propertyDto.id][0].id] ? (
                              <img
                                src={photoUrls[propertyPhotos[propertyDto.id][0].id]}
                                alt={propertyPhotos[propertyDto.id][0].filename}
                                className="w-full h-full object-cover rounded-md cursor-pointer"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleNavigate(propertyDto.id);
                                }}
                                onError={(e) => {
                                  e.target.style.display = 'none';
                                  e.target.nextSibling.style.display = 'flex';
                                }}
                              />
                            ) : (
                              <div
                                className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-400 hover:bg-gray-50 transition-colors cursor-pointer"
                                onClick={(e) => loadIndividualPhoto(propertyPhotos[propertyDto.id][0].id, e)}
                              >
                                {loadingIndividualPhotos.has(propertyPhotos[propertyDto.id][0].id) ? (
                                  <div className="text-center">
                                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600 mx-auto mb-2"></div>
                                    <div className="text-sm">Loading...</div>
                                  </div>
                                ) : (
                                  <div className="text-center">
                                    <svg className="mx-auto h-8 w-8 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
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
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 15.5c-.77.833.192 2.5 1.732 2.5z" />
                                </svg>
                                <div className="text-sm">Failed to load photo</div>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div
                            className="text-gray-400 text-center hover:text-gray-600 transition-colors cursor-pointer photo-area"
                            onClick={(e) => loadPropertyPhotosAndFirstImage(propertyDto.id, e)}
                          >
                            <svg className="mx-auto h-8 w-8 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <div className="text-sm">Click to load photos</div>
                          </div>
                        )}
                      </div>

                      {/* PROPERTY DETAILS CARD */}
                      <div className="space-y-2" onClick={() => handleNavigate(propertyDto.id)} style={{ cursor: 'pointer' }}>
                        <h3 className="text-center font-bold text-gray-900 text-xl">{propertyDto.address}</h3>
                        <div className="flex justify-between items-start">
                          <h3 className="font-semibold text-gray-900 text-lg">
                            ₹{propertyDto.monthlyRent?.toLocaleString()}/month
                          </h3>
                          <span className={`px-2 py-1 text-xs rounded-full ${propertyDto.isVerified
                              ? 'bg-green-100 text-green-800'
                              : 'bg-yellow-100 text-yellow-800'
                            }`}>
                            {propertyDto.isVerified ? 'Verified' : 'Pending'}
                          </span>
                        </div>

                        <div className="text-sm text-gray-600">
                          <p><strong>Bedrooms:</strong> {propertyDto.noOfBedrooms}</p>
                          <p><strong>Area:</strong> {propertyDto.area} {propertyDto.areaUnit}</p>
                          <p><strong>Deposit:</strong> ₹{propertyDto.securityDepositAmount?.toLocaleString()}</p>
                          {propertyPhotos[propertyDto.id] && (
                            <p><strong>Photos:</strong> {propertyPhotos[propertyDto.id].length}</p>
                          )}
                        </div>

                        <div className="text-xs text-gray-500 border-t pt-2">
                          <p>{propertyDto.description ? `Address : ${propertyDto.description}` : ''}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
export default UserWishListPage







// function UserWishListPage() {

// // loading state
// const [loading, setLoading] = useState(true);

// // usestates
// const [wishListedProperties, setWishListedProperties] = useState([])

//     // navigate hook
//     const navigate = useNavigate();

// // !GET WISHLISTED PROPERTIES
// const getWishListed = async()=> {
//     try{
//         const response = await UserService.getWishListedProperties();

//         if(response){
//             setWishListedProperties(response.wishListedProperties ? response.wishListedProperties : [])
//             setLoading(false)
//         }
//     } catch(error){
//         console.error(error);
//     }
// }

//     // !HANDLE NAVIGATE
//     const handleNavigate = (pr_id)=>{
        // navigate(`/property/${pr_id}`, {
        //     state:{
        //         isWishListedProp : true
        //     }
//         });
//     }

// useEffect(()=>{
//     getWishListed();
// }, [setWishListedProperties]);

// if(loading){
//     return <div className="p-6 text-center text-blue-600">Loading property details...</div>
// }

//   return (
//     <>
//         <div className='dashboard-container min-h-screen p-4 bg-gray-500'>
//             <div className='property-wrap flex flex-wrap gap-5'>
//                 {wishListedProperties.length === 0
//                     ? (<p className='w-full text-center text-white'>No properties added yet.</p>)
//                     : (
//                         wishListedProperties.map((property, index) => (
//                         <div
//                             onClick={()=>handleNavigate(property.propertyDto.id)}
//                             key={index}
//                             className={`property-box bg-gray-100 p-5 rounded-xl shadow-2xl outline-2 w-lg min-w-3xs transition duration-300 ease-in-out
//                                 hover:scale-103
//                                 hover:rounded-2xl
//                                 ${property.propertyDto.isVerified ? 'hover:bg-green-100' : 'hover:bg-red-100'}`}
//                             >
//                             <h3 className='text-xl font-bold'>{property.propertyDto.address}</h3>
//                             <p><strong>Rent:</strong> ₹{property.propertyDto.monthlyRent}</p>
//                             <p><strong>Bedrooms:</strong> {property.propertyDto.noOfBedrooms}</p>
//                             <p><strong>Area:</strong> {property.propertyDto.area} {property.propertyDto.areaUnit}</p>
//                             <p className={`text-sm ${property.propertyDto.isVerified ? 'text-green-600' : 'text-red-600'}`}>
//                                 {property.propertyDto.isVerified ? 'Verified Listing' : 'Verification Pending'}
//                             </p>
//                             <p className='text-sm mt-2 text-gray-600 truncate'>{property.propertyDto.description}</p>
//                             <p><strong>Note: </strong>'{property.note}'</p>
//                         </div>
//                         ))
//                     )
//                 }
//             </div>
//         </div>
//     </>
//   )
// }