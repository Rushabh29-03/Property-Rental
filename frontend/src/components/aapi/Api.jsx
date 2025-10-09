import axios from 'axios';
import React, { useEffect, useState } from 'react'
import PhotoService from '../../services/PhotoService';
import { data } from 'react-router';

const MAX_FILES = 5;
const PR_ID = 9;

// Utility function to convert File objects into URL previews
const createPreviews = (fileList) => {
    return Array.from(fileList).map(file => ({
        file,
        url: URL.createObjectURL(file),
        id: crypto.randomUUID(), // Unique ID for keying/deletion
    }));
};

function Api() {
    // upload state
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [filePreviews, setFilePreviews] = useState([]);
    
    // fetch state
    const [propertyId, setPropertyId] = useState(9);
    const [fetchedPhotos, setFetchedPhotos] = useState([]);
    const [fetchStatus, setFetchStatus] = useState('');
    const [loadingImages, setLoadingImages] = useState(new Set());
    
    // global state
    const [statusMessage, setStatusMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // Utility function to convert File objects into URL previews
    const createPreviews = (fileList) => {
        return Array.from(fileList).map(file => ({
            file,
            url: URL.createObjectURL(file),
            id: crypto.randomUUID(),
        }));
    };

    // Clean up object URLs when component unmounts or files change
    useEffect(() => {
        return () => {
            filePreviews.forEach(preview => URL.revokeObjectURL(preview.url));
        };
    }, [filePreviews]);

    // UPLOAD LOGIC
    const handleFileChange = (event) => {
        const newFiles = event.target.files;
        if (newFiles.length === 0) return;

        const currentFileCount = selectedFiles.length;
        const filesToAdd = Array.from(newFiles).slice(0, MAX_FILES - currentFileCount);

        if (filesToAdd.length === 0) {
            setStatusMessage(`You have already selected the maximum limit of ${MAX_FILES} photos.`);
            return;
        }

        const updatedFiles = [...selectedFiles, ...filesToAdd];
        setSelectedFiles(updatedFiles);
        setFilePreviews(createPreviews(updatedFiles));
        setStatusMessage(`${updatedFiles.length} / ${MAX_FILES} photos selected.`);
        event.target.value = null;
    };

    const handleRemoveFile = (idToRemove) => {
        const updatedFiles = selectedFiles.filter(file => file.id !== idToRemove);
        setSelectedFiles(updatedFiles);

        const updatedPreviews = filePreviews.filter(preview => {
            if (preview.id === idToRemove) {
                URL.revokeObjectURL(preview.url);
                return false;
            }
            return true;
        });
        setFilePreviews(updatedPreviews);
        setStatusMessage(`Removed one photo. ${updatedFiles.length} / ${MAX_FILES} photos selected.`);
    };

    const handleUpload = async () => {
        if (selectedFiles.length === 0) {
            setStatusMessage('Please select at least one photo before uploading!');
            return;
        }

        setIsLoading(true);
        setStatusMessage(`Uploading ${selectedFiles.length} photos... 🚀`);

        const formData = new FormData();
        selectedFiles.forEach(file => {
            formData.append('files', file);
        });

        try {
            const response = await PhotoService.uploadPhoto(formData);
            if (response.data.message) {
                setStatusMessage(`✅ Upload Successful! ${response.data.message}`);
                setSelectedFiles([]);
                setFilePreviews([]);
                // Refresh the photos list
                if (propertyId) {
                    fetchPhotos(propertyId);
                }
            } else {
                const errorText = response.data.errMessage;
                setStatusMessage(`❌ Upload Failed (${response.status}): ${errorText.substring(0, 100)}...`);
            }
        } catch (error) {
            if (error.response?.status === 413) {
                setStatusMessage(`🚨 Files too large! Please reduce file sizes or upload fewer files.`);
            } else {
                setStatusMessage(`🚨 Network Error: ${error.message}`);
            }
            console.error('Upload Error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    // FETCH LOGIC - Only fetches metadata, not full images
    const fetchPhotos = async (prId) => {
        if (!prId) {
            setFetchStatus('Enter a property id to fetch photos');
            setFetchedPhotos([]);
            return;
        }

        setIsLoading(true);
        setFetchStatus(`Fetching photos for property with id: ${prId}`);
        setFetchedPhotos([]);

        try {
            const response = await PhotoService.fetchPhotos(prId);
            if (response.data.message) {
                const data = response.data.photos;
                console.log('Photo metadata received:', data);
                setFetchedPhotos(data);
                setFetchStatus(`Loaded ${data.length} photos for property: ${prId}`);
            } else if (response.status === 404) {
                setFetchStatus(`No photos found for property: ${prId}`);
            } else {
                setFetchStatus('Error fetching photos');
            }
        } catch (error) {
            if (error.response?.status === 413) {
                setFetchStatus(`Response too large! Try fetching fewer photos at once.`);
            } else {
                setFetchStatus(`Network error: ${error.message}`);
            }
            console.error('React error fetching photos:', error);
        } finally {
            setIsLoading(false);
        }
    };

    // Load individual image for preview
    const loadImage = async (photoId) => {
        if (loadingImages.has(photoId)) return;

        setLoadingImages(prev => new Set([...prev, photoId]));
        
        try {
            const response = await PhotoService.fetchPhotoById(photoId);
            if (response.data.photo && response.data.photo.base64Data) {
                // Update the photo in the fetchedPhotos array
                setFetchedPhotos(prev => prev.map(photo => 
                    photo.id === photoId 
                        ? { ...photo, base64Data: response.data.photo.base64Data }
                        : photo
                ));
            }
        } catch (error) {
            console.error('Error loading image:', error);
        } finally {
            setLoadingImages(prev => {
                const newSet = new Set(prev);
                newSet.delete(photoId);
                return newSet;
            });
        }
    };

    const isUploadDisabled = selectedFiles.length === 0 || isLoading;
    const isSelectDisabled = selectedFiles.length >= MAX_FILES || isLoading;
    const isFetchDisabled = !propertyId || isLoading;

    return (
        <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
            <h1>🏠 Property Photo Manager</h1>
            <p>Uploads will be linked to Property ID <strong>{PR_ID}</strong>.</p>

            {/* File Upload Section */}
            <div style={{ marginBottom: '30px', padding: '20px', border: '1px solid #ddd', borderRadius: '8px' }}>
                <h2>📤 Upload Photos</h2>
                
                <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleFileChange}
                    disabled={isSelectDisabled}
                    style={{ marginBottom: '10px' }}
                />
                
                <button
                    onClick={handleUpload}
                    disabled={isUploadDisabled}
                    style={{
                        padding: '10px 20px',
                        backgroundColor: isUploadDisabled ? '#ccc' : '#007bff',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: isUploadDisabled ? 'not-allowed' : 'pointer',
                        marginLeft: '10px'
                    }}
                >
                    {isLoading ? 'Uploading...' : `Upload ${selectedFiles.length} Photo(s)`}
                </button>

                {/* File Previews */}
                {filePreviews.length > 0 && (
                    <div style={{ marginTop: '15px' }}>
                        <h3>Selected Files:</h3>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                            {filePreviews.map(preview => (
                                <div key={preview.id} style={{ position: 'relative' }}>
                                    <img
                                        src={preview.url}
                                        alt={preview.file.name}
                                        style={{
                                            width: '100px',
                                            height: '100px',
                                            objectFit: 'cover',
                                            borderRadius: '4px',
                                            border: '1px solid #ddd'
                                        }}
                                    />
                                    <button
                                        onClick={() => handleRemoveFile(preview.id)}
                                        style={{
                                            position: 'absolute',
                                            top: '-5px',
                                            right: '-5px',
                                            backgroundColor: 'red',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '50%',
                                            width: '20px',
                                            height: '20px',
                                            cursor: 'pointer',
                                            fontSize: '12px'
                                        }}
                                    >
                                        x
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Fetch Photos Section */}
            <div style={{ marginBottom: '30px', padding: '20px', border: '1px solid #ddd', borderRadius: '8px' }}>
                <h2>📷 View Saved Photos</h2>
                
                <div className='mb-3.5'>
                    <label htmlFor="propertyIdInput">Property ID: </label>
                    <input
                        id="propertyIdInput"
                        type="number"
                        value={propertyId}
                        onChange={(e) => setPropertyId(parseInt(e.target.value) || '')}
                        style={{ marginRight: '10px', padding: '5px' }}
                    />
                    <button
                        onClick={() => fetchPhotos(propertyId)}
                        disabled={isFetchDisabled}
                        style={{
                            padding: '8px 16px',
                            backgroundColor: isFetchDisabled ? '#ccc' : '#28a745',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: isFetchDisabled ? 'not-allowed' : 'pointer'
                        }}
                    >
                        {isLoading ? 'Loading...' : 'Fetch Photos'}
                    </button>
                </div>

                <p style={{ fontStyle: 'italic', color: '#666' }}>
                    {fetchStatus || 'Click "Fetch" to load saved photos.'}
                </p>

                {/* Fetched Photos Grid */}
                {fetchedPhotos.length > 0 && (
                    <div style={{ marginTop: '20px' }}>
                        <h3>Found {fetchedPhotos.length} photo(s):</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '15px', marginTop: '15px' }}>
                            {fetchedPhotos.map(photo => (
                                <div key={photo.id} style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '10px' }}>
                                    <div style={{ marginBottom: '10px' }}>
                                        <strong>{photo.filename}</strong>
                                        <br />
                                        <small>Size: {Math.round(photo.fileSize / 1024)} KB</small>
                                        <br />
                                        <small>Type: {photo.contentType}</small>
                                    </div>
                                    
                                    {photo.base64Data ? (
                                        <img
                                            src={`data:${photo.contentType};base64,${photo.base64Data}`}
                                            alt={photo.filename}
                                            style={{
                                                width: '100%',
                                                height: '150px',
                                                objectFit: 'cover',
                                                borderRadius: '4px',
                                                border: '1px solid #ddd'
                                            }}
                                        />
                                    ) : (
                                        <div
                                            style={{
                                                width: '100%',
                                                height: '150px',
                                                backgroundColor: '#f8f9fa',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                border: '1px solid #ddd',
                                                borderRadius: '4px',
                                                cursor: 'pointer'
                                            }}
                                            onClick={() => loadImage(photo.id)}
                                        >
                                            {loadingImages.has(photo.id) ? (
                                                <span>Loading...</span>
                                            ) : (
                                                <span style={{ color: '#6c757d' }}>Click to load image</span>
                                            )}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Status Message */}
            <div style={{
                padding: '15px',
                backgroundColor: statusMessage.includes('✅') ? '#d4edda' :
                              statusMessage.includes('❌') || statusMessage.includes('🚨') ? '#f8d7da' : '#d1ecf1',
                border: `1px solid ${statusMessage.includes('✅') ? '#c3e6cb' :
                                    statusMessage.includes('❌') || statusMessage.includes('🚨') ? '#f5c6cb' : '#bee5eb'}`,
                borderRadius: '4px',
                color: statusMessage.includes('✅') ? '#155724' :
                       statusMessage.includes('❌') || statusMessage.includes('🚨') ? '#721c24' : '#0c5460'
                }}>
                <strong>Status:</strong> {statusMessage || fetchStatus || 'Ready.'}
            </div>
        </div>
    );
}

export default Api




// function Api() {

//     // upload state
//     const [selectedFiles, setSelectedFiles] = useState([]);
//     const [filePreviews, setFilePreviews] = useState([]);

//     // fetch state
//     const [propertyId, setPropertyId] = useState(9); // Property ID to fetch/upload to
//     const [fetchedPhotos, setFetchedPhotos] = useState([]);
//     const [fetchStatus, setFetchStatus] = useState('');

//     // global state
//     const [statusMessage, setStatusMessage] = useState('');
//     const [isLoading, setIsLoading] = useState(false);

//     // Clean up object URLs when component unmounts or files change
//     useEffect(() => {
//         return () => {
//             filePreviews.forEach(preview => URL.revokeObjectURL(preview.url));
//         };
//     }, [filePreviews]);

//     // !UPLOAD LOGIC
//     // Handle file selection from the input
//     const handleFileChange = (event) => {
//         const newFiles = event.target.files;

//         if (newFiles.length === 0) return;

//         const currentFileCount = selectedFiles.length;
//         const filesToAdd = Array.from(newFiles).slice(0, MAX_FILES - currentFileCount);

//         if (filesToAdd.length === 0) {
//             setStatusMessage(`You have already selected the maximum limit of ${MAX_FILES} photos.`);
//             return;
//         }

//         const updatedFiles = [...selectedFiles, ...filesToAdd];
//         setSelectedFiles(updatedFiles);
//         setFilePreviews(createPreviews(updatedFiles));
//         setStatusMessage(`${updatedFiles.length} / ${MAX_FILES} photos selected.`);
//         event.target.value = null; // Clear input to allow selection of same files again
//     };

//     // Handle removing a single file
//     const handleRemoveFile = (idToRemove) => {
//         const updatedFiles = selectedFiles.filter(file => file.id !== idToRemove);
//         setSelectedFiles(updatedFiles);

//         const updatedPreviews = filePreviews.filter(preview => {
//             if (preview.id === idToRemove) {
//                 URL.revokeObjectURL(preview.url); // Revoke URL for the removed file
//                 return false;
//             }
//             return true;
//         });
//         setFilePreviews(updatedPreviews);
//         setStatusMessage(`Removed one photo. ${updatedFiles.length} / ${MAX_FILES} photos selected.`);
//     };

//     // Handle the multi-file upload process
//     const handleUpload = async () => {
//         if (selectedFiles.length === 0) {
//             setStatusMessage('Please select at least one photo before uploading!');
//             return;
//         }

//         setIsLoading(true);
//         setStatusMessage(`Uploading ${selectedFiles.length} photos... 🚀`);

//         const formData = new FormData();
//         // 🚨 IMPORTANT: Append ALL files using the same key 'files'.
//         // This key must match the @RequestParam name in the Spring Boot controller.
//         selectedFiles.forEach(file => {
//             formData.append('files', file);
//         });

//         try {
//             const response = await PhotoService.uploadPhoto(formData);

//             if (response.data.message) {
//                 setStatusMessage(`✅ Upload Successful! ${response.data.message}`);
//                 setSelectedFiles([]);
//                 setFilePreviews([]);
//             } else {
//                 const errorText = response.data.errMessage;
//                 setStatusMessage(`❌ Upload Failed (${response.status}): ${errorText.substring(0, 100)}...`);
//             }
//         } catch (error) {
//             setStatusMessage(`🚨 Network Error: ${error}`);
//             console.error('Upload Error:', error);
//         } finally {
//             setIsLoading(false);
//         }
//     };

//     // !FETCH LOGIC
//     const fetchPhotos = async(prId)=> {
//         if(!prId) {
//             setFetchStatus('Enter a property id to fetch photos');
//             setFetchedPhotos([])
//             return;
//         }

//         setIsLoading(true)
//         setFetchStatus(`Fetching photos for property with id: ${prId}`);
//         setFetchedPhotos([]) //clear previous photos if available

//         try{
//             const response = await PhotoService.fetchPhotos(prId)

//             if(response.data.message){
//                 const data = await response.data.photos;
//                 console.log(data);
//                 setFetchedPhotos(data);
//                 setFetchStatus(`Loaded ${data.length} photod for property: ${prId}`);
//             } else if(response.status === 404) {
//                 setFetchStatus(`No photos found for property: ${id}`);
//             } else {
//                 setFetchStatus('Error fetching photos');
//             }
//         } catch(error){
//             setFetchStatus(`Network error using fetch: ${error}`);
//             console.error('React error fetching photos: ', error);
//         } finally {
//             setIsLoading(false)
//         }
//     }

//     const isUploadDisabled = selectedFiles.length === 0 || isLoading;
//     const isSelectDisabled = selectedFiles.length >= MAX_FILES || isLoading;
//     const isFetchDisabled = !propertyId || isLoading;

//     return (
//         <div className="min-h-screen bg-gray-50 flex flex-col items-center p-4 font-sans">
//       <div className="w-full max-w-4xl bg-white shadow-2xl rounded-xl p-8 transition-all duration-300">

//         <h1 className="text-3xl font-extrabold text-indigo-700 mb-6 text-center">
//           Photo Management Demo 📸
//         </h1>

//         <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
//             {/* UPLOAD SECTION */}
//             <div className="p-6 border border-indigo-200 rounded-xl">
//                 <h2 className="text-xl font-bold text-indigo-600 mb-4">1. Upload Photos</h2>
//                 <p className="text-sm text-gray-500 mb-4">
//                   Uploads will be linked to Property ID **{PR_ID}**.
//                 </p>

//                 {/* File Input */}
//                 <div className="mb-4">
//                   <input
//                     type="file"
//                     id="photoInput"
//                     accept="image/*"
//                     multiple
//                     capture="environment"
//                     onChange={handleFileChange}
//                     className="hidden"
//                     disabled={isSelectDisabled}
//                   />
//                   <label
//                     htmlFor="photoInput"
//                     className={`block w-full text-center py-3 px-4 rounded-lg font-semibold cursor-pointer transition duration-150 ${
//                       isSelectDisabled
//                         ? 'bg-gray-300 text-gray-500'
//                         : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-md hover:shadow-lg'
//                     }`}
//                   >
//                     {selectedFiles.length > 0 ? `Add More Photos (${selectedFiles.length}/${MAX_FILES})` : 'Take or Select Photos'}
//                   </label>
//                 </div>

//                 {/* Previews Section */}
//                 {filePreviews.length > 0 && (
//                   <div className="mb-6 p-3 bg-gray-50 rounded-lg">
//                     <h3 className="text-md font-semibold text-gray-700 mb-3">
//                       Local Previews ({filePreviews.length})
//                     </h3>
//                     <div className="grid grid-cols-3 gap-2">
//                       {filePreviews.map((preview) => (
//                         <div key={preview.id} className="relative group overflow-hidden rounded-lg shadow aspect-square">
//                           <img
//                             src={preview.url}
//                             alt="Local Preview"
//                             className="w-full h-full object-cover"
//                           />
//                           <button
//                             onClick={() => handleRemoveFile(preview.id)}
//                             className="absolute top-0 right-0 p-1 bg-red-600 text-white rounded-bl-lg text-xs font-bold"
//                             aria-label="Remove photo"
//                           >
//                             &times;
//                           </button>
//                         </div>
//                       ))}
//                     </div>
//                   </div>
//                 )}

//                 {/* Upload Button */}
//                 <button
//                   onClick={handleUpload}
//                   disabled={isUploadDisabled}
//                   className={`w-full py-3 px-4 rounded-lg font-bold text-lg transition duration-150 ${
//                     isUploadDisabled
//                       ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
//                       : 'bg-green-500 hover:bg-green-600 text-white shadow-xl transform hover:scale-[1.01]'
//                   }`}
//                 >
//                   {isLoading && statusMessage.includes('Uploading') ? (
//                     <div className="flex items-center justify-center">
//                       <svg className="animate-spin h-5 w-5 mr-3 text-white" viewBox="0 0 24 24">...</svg>
//                       Uploading...
//                     </div>
//                   ) : (
//                     `Upload ${selectedFiles.length} Photo(s)`
//                   )}
//                 </button>
//             </div>


//             {/* FETCH SECTION */}
//             <div className="p-6 border border-blue-200 rounded-xl">
//                 <h2 className="text-xl font-bold text-blue-600 mb-4">2. Fetch Photos from DB</h2>
                
//                 <div className="flex space-x-2 mb-4">
//                     <input
//                         type="number"
//                         placeholder="Enter Property ID (e.g., 1)"
//                         value={propertyId}
//                         onChange={(e) => setPropertyId(e.target.value)}
//                         className="flex-grow p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
//                         min="1"
//                     />
//                     <button
//                         onClick={() => fetchPhotos(propertyId)}
//                         disabled={isFetchDisabled}
//                         className={`py-2 px-4 rounded-lg font-semibold transition duration-150 ${
//                             isFetchDisabled
//                                 ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
//                                 : 'bg-blue-600 hover:bg-blue-700 text-white shadow-md'
//                         }`}
//                     >
//                         {isLoading && statusMessage.includes('Fetching') ? 'Loading...' : 'Fetch'}
//                     </button>
//                 </div>
                
//                 {/* Fetched Previews */}
//                 <div className="mt-4 p-3 bg-blue-50 rounded-lg min-h-[150px]">
//                     <h3 className="text-md font-semibold text-gray-700 mb-3">
//                       Database Photos ({fetchedPhotos.length})
//                     </h3>
                    
//                     {fetchedPhotos.length > 0 ? (
//                         <div className="grid grid-cols-3 gap-2">
//                             {fetchedPhotos.map((photo, index) => (
//                                 <div key={index} className="overflow-hidden rounded-lg shadow aspect-square border border-gray-300">
//                                     {/* 🚨 Preview: Use the dataUrl (Base64 encoded image) directly in the src */}
//                                     <img
//                                         src={photo.data}
//                                         alt={photo.filename}
//                                         className="w-full h-full object-cover"
//                                         title={photo.filename}
//                                     />
//                                 </div>
//                             ))}
//                         </div>
//                     ) : (
//                         <p className="text-gray-500 text-center py-4">{fetchStatus || 'Click "Fetch" to load saved photos.'}</p>
//                     )}
//                 </div>
//             </div>
//         </div>
        
//         {/* Global Status Message */}
//         <p className={`mt-6 text-center font-bold text-lg ${
//             statusMessage.includes('Successful') || fetchStatus.includes('Loaded') ? 'text-green-600' :
//             statusMessage.includes('Failed') || fetchStatus.includes('Error') ? 'text-red-600' :
//             'text-gray-500'
//         }`}>
//             {statusMessage || fetchStatus || 'Ready.'}
//         </p>
//       </div>
//     </div>
//     );
// }