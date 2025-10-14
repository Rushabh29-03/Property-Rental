import React, { useState, useEffect, useCallback } from 'react';
import PhotoService from '../../services/PhotoService';

const MAX_FILES = 5;
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

const PhotoUploadComponent = ({
    propertyId,
    onUploadSuccess,
    onUploadError,
    className = "",
    showPreview = true,
    autoUpload = false
}) => {
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [filePreviews, setFilePreviews] = useState([]);
    const [uploadProgress, setUploadProgress] = useState({});
    const [isUploading, setIsUploading] = useState(false);
    const [dragActive, setDragActive] = useState(false);
    const [errors, setErrors] = useState([]);

    // File validation function
    const validateFile = (file) => {
        const errors = [];

        if (!ALLOWED_TYPES.includes(file.type)) {
            errors.push(`${file.name}: Invalid file type. Only JPEG, PNG, and WebP are allowed.`);
        }

        if (file.size > MAX_FILE_SIZE) {
            errors.push(`${file.name}: File too large. Maximum size is 10MB.`);
        }

        return errors;
    };

    // Image compression function
    const compressImage = (file, quality = 0.8) => {
        return new Promise((resolve) => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            const img = new Image();

            img.onload = () => {
                // Calculate new dimensions (max 1920x1080)
                let { width, height } = img;
                const maxWidth = 1440;
                const maxHeight = 1080;

                if (width > maxWidth || height > maxHeight) {
                    const ratio = Math.min(maxWidth / width, maxHeight / height);
                    width *= ratio;
                    height *= ratio;
                }

                canvas.width = width;
                canvas.height = height;

                ctx.drawImage(img, 0, 0, width, height);

                canvas.toBlob(resolve, file.type, quality);
            };

            img.src = URL.createObjectURL(file);
        });
    };

    // Create file previews
    const createPreviews = useCallback((fileList) => {
        return Array.from(fileList).map(file => ({
            file,
            url: URL.createObjectURL(file),
            id: crypto.randomUUID(),
            size: file.size,
            name: file.name
        }));
    }, []);

    // !Handle file selection
    const handleFileChange = async (files) => {
        const newFiles = Array.from(files);
        const currentFileCount = selectedFiles.length;
        const availableSlots = MAX_FILES - currentFileCount;

        if (availableSlots <= 0) {
            setErrors([`Maximum ${MAX_FILES} files allowed.`]);
            return;
        }

        const filesToProcess = newFiles.slice(0, availableSlots);
        const validationErrors = [];
        const validFiles = [];

        // Validate files
        for (const file of filesToProcess) {
            const fileErrors = validateFile(file);
            if (fileErrors.length > 0) {
                validationErrors.push(...fileErrors);
            } else {
                validFiles.push(file);
            }
        }

        if (validationErrors.length > 0) {
            setErrors(validationErrors);
        } else {
            setErrors([]);
        }

        if (validFiles.length > 0) {
            // Compress images
            const compressedFiles = await Promise.all(
                validFiles.map(async (file) => {
                    if (file.size > 2 * 1024 * 1024) { // Compress files larger than 2MB
                        const compressed = await compressImage(file);
                        return new File([compressed], file.name, { type: file.type });
                    }
                    return file;
                })
            );

            const updatedFiles = [...selectedFiles, ...compressedFiles];
            setSelectedFiles(updatedFiles);
            setFilePreviews(prev => [...prev, ...createPreviews(compressedFiles)]);

            if (autoUpload && propertyId) {
                await handleUpload(compressedFiles);
            }
        }
    };

    // Handle file input change
    const onInputChange = (e) => {
        if (e.target.files?.length > 0) {
            handleFileChange(e.target.files);
        }
        e.target.value = null; // Reset input
    };

    // Handle drag events
    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();

        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    // Handle drop event
    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        if (e.dataTransfer.files?.length > 0) {
            handleFileChange(e.dataTransfer.files);
        }
    };

    // Remove file
    const handleRemoveFile = (idToRemove) => {
        const fileToRemove = filePreviews.find(preview => preview.id === idToRemove);
        if (fileToRemove) {
            URL.revokeObjectURL(fileToRemove.url);
        }

        setSelectedFiles(prev => prev.filter((_, index) =>
            filePreviews[index]?.id !== idToRemove
        ));

        setFilePreviews(prev => prev.filter(preview => preview.id !== idToRemove));
        setErrors([]);
    };

    // !Upload files
    const handleUpload = async (filesToUpload = selectedFiles) => {
        if (!propertyId) {
            setErrors(['Property ID is required for upload.']);
            return;
        }

        if (filesToUpload.length === 0) {
            setErrors(['Please select at least one file to upload.']);
            return;
        }

        setIsUploading(true);
        setErrors([]);

        const formData = new FormData();
        filesToUpload.forEach(file => {
            formData.append('files', file);
        });

        try {
            const response = await PhotoService.uploadPhoto(propertyId, formData);

            if (response.data.message) {
                onUploadSuccess?.(response.data);
                // Clear files after successful upload
                setSelectedFiles([]);
                filePreviews.forEach(preview => URL.revokeObjectURL(preview.url));
                setFilePreviews([]);
            } else {
                const error = response.data.errMessage || 'Upload failed';
                setErrors([error]);
                onUploadError?.(error);
            }
        } catch (error) {
            let errorMessage = 'Upload failed';

            if (error.response?.status === 413) {
                errorMessage = 'Files too large! Please reduce file sizes.';
            } else if (error.response?.status === 400) {
                errorMessage = 'Invalid files. Please check file types and sizes.';
            } else if (error.message) {
                errorMessage = error.message;
            }

            setErrors([errorMessage]);
            onUploadError?.(errorMessage);
        } finally {
            setIsUploading(false);
        }
    };

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            filePreviews.forEach(preview => URL.revokeObjectURL(preview.url));
        };
    }, [filePreviews]);

    return (
        <div className={`photo-upload-component ${className}`}>
            {/* Drag & Drop Area */}
            <div
                className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${dragActive
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-300 hover:border-gray-400'
                    } ${isUploading ? 'opacity-50 pointer-events-none' : ''}`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
            >
                <div className="space-y-4">
                    <div className="text-gray-600">
                        <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                            <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        <p className="mt-2 text-sm">
                            <label htmlFor="file-upload" className="cursor-pointer text-blue-600 hover:text-blue-500">
                                Click to upload
                            </label>
                            {' or drag and drop'}
                        </p>
                        <p className="text-xs text-gray-500">
                            PNG, JPG, WebP up to 10MB (Max {MAX_FILES} files)
                        </p>
                    </div>

                    <input
                        id="file-upload"
                        type="file"
                        className="hidden"
                        multiple
                        accept={ALLOWED_TYPES.join(',')}
                        onChange={onInputChange}
                        disabled={isUploading || selectedFiles.length >= MAX_FILES}
                    />
                </div>
            </div>

            {/* File Count */}
            {selectedFiles.length > 0 && (
                <div className="mt-2 text-sm text-gray-600">
                    {selectedFiles.length} / {MAX_FILES} files selected
                </div>
            )}

            {/* Error Messages */}
            {errors.length > 0 && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
                    <div className="text-sm text-red-600">
                        {errors.map((error, index) => (
                            <div key={index}>{error}</div>
                        ))}
                    </div>
                </div>
            )}

            {/* File Previews */}
            {showPreview && filePreviews.length > 0 && (
                <div className="mt-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Selected Files:</h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                        {filePreviews.map(preview => (
                            <div key={preview.id} className="relative group">
                                <div className="aspect-square rounded-lg overflow-hidden border border-gray-200">
                                    <img
                                        src={preview.url}
                                        alt={preview.name}
                                        className="w-full h-full object-cover"
                                    />
                                </div>

                                {/* Remove button */}
                                <button
                                    onClick={() => handleRemoveFile(preview.id)}
                                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 transition-colors cursor-pointer"
                                    disabled={isUploading}
                                >
                                    ×
                                </button>

                                {/* File info */}
                                <div className="mt-1 text-xs text-gray-500 truncate">
                                    {preview.name}
                                </div>
                                <div className="text-xs text-gray-400">
                                    {(preview.size / 1024 / 1024).toFixed(1)} MB
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Upload Button */}
            {!autoUpload && selectedFiles.length > 0 && (
                <div className="mt-4">
                    <button
                        onClick={() => handleUpload()}
                        disabled={isUploading || selectedFiles.length === 0}
                        className={`w-full py-2 px-4 rounded-md font-medium transition-colors ${isUploading || selectedFiles.length === 0
                                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                : 'bg-blue-600 text-white hover:bg-blue-700'
                            }`}
                    >
                        {isUploading ? (
                            <span className="flex items-center justify-center">
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Uploading {selectedFiles.length} file(s)...
                            </span>
                        ) : (
                            `Upload ${selectedFiles.length} file(s)`
                        )}
                    </button>
                </div>
            )}
        </div>
    );
};

export default PhotoUploadComponent;