import axios from "axios";
import { Environment } from "../environments/GlobalVariables";
import AuthService from "./AuthService";

const API_URL = Environment.apiUrl + '/photo'

const PhotoService = {

    // Upload photos to a specific property
    uploadPhoto: async (propertyId, fileData) => {
        const currentUser = AuthService.getCurrentUser();
        if (!currentUser || !currentUser.accessToken) {
            console.error("Authentication error: missing jwt token");
            throw new Error("User not authenticated.");
        }

        try {
            const response = await axios.post(`${API_URL}/${propertyId}/upload-photo`, fileData, {
                headers: {
                    'Authorization': `Bearer ${currentUser.accessToken}`,
                    'Content-Type': 'multipart/form-data'
                },
                // Add timeout and size limits
                timeout: 60000, // 60 seconds
                maxContentLength: 50 * 1024 * 1024, // 50MB
                maxBodyLength: 50 * 1024 * 1024, // 50MB
                
                // Progress tracking
                onUploadProgress: (progressEvent) => {
                    const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    console.log(`Upload Progress: ${percentCompleted}%`);
                },
            });
            console.log("Photo upload response: ", response);
            return response;
        } catch (error) {
            console.error("Upload error:", error);
            
            // Enhanced error handling
            if (error.response?.status === 413) {
                throw new Error("Files too large! Please reduce file sizes or upload fewer files.");
            } else if (error.response?.status === 400) {
                throw new Error("Invalid files. Please check file types and sizes.");
            } else if (error.response?.status === 401) {
                throw new Error("Authentication failed. Please log in again.");
            } else if (error.response?.status === 404) {
                throw new Error("Property not found. Please check the property ID.");
            } else if (error.code === 'ECONNABORTED') {
                throw new Error("Upload timeout. Please try again with smaller files.");
            }
            
            throw error;
        }
    },

    // Fetch photo metadata only (lightweight)
    fetchPhotos: async (propertyId) => {
        const currentUser = AuthService.getCurrentUser();
        if (!currentUser || !currentUser.accessToken) {
            console.error("Authentication error: missing jwt token");
            throw new Error("User not authenticated.");
        }

        try {
            const response = await axios.get(`${API_URL}/${propertyId}/get-photos`, {
                headers: {
                    'Authorization': `Bearer ${currentUser.accessToken}`
                },
                timeout: 30000 // 30 seconds
            });
            // console.log("Photos metadata:", response.data);
            return response.data;
        } catch (error) {
            console.error("Fetch photos error:", error);
            
            if (error.response?.status === 404) {
                // Return empty result for 404 instead of throwing
                return { data: { photos: [], message: "No photos found" } };
            }
            
            throw error;
        }
    },

    // Fetch individual photo with full data
    fetchPhotoById: async (photoId) => {
        const currentUser = AuthService.getCurrentUser();
        if (!currentUser || !currentUser.accessToken) {
            console.error("Authentication error: missing jwt token");
            throw new Error("User not authenticated.");
        }

        try {
            const response = await axios.get(`${API_URL}/image/${photoId}`, {
                headers: {
                    'Authorization': `Bearer ${currentUser.accessToken}`
                },
                timeout: 30000
            });
            // console.log(response);
            
            return response;
        } catch (error) {
            console.error("Fetch photo error:", error);
            throw error;
        }
    },

    // Get photo as raw image URL (for direct display in img tags)
    getPhotoRawUrl: (photoId) => {
        const currentUser = AuthService.getCurrentUser();
        if (!currentUser || !currentUser.accessToken) {
            return null;
        }
        
        // Return URL without token for now - will be handled by interceptor
        return `${API_URL}/image/${photoId}/raw`;
    },

    // Get photo as base64 data URL for immediate display
    getPhotoDataUrl: async (photoId) => {
        try {
            const response = await PhotoService.fetchPhotoById(photoId);
            // console.log("Fetched photo data:", response);
            
            if (response?.data?.photo?.base64Data && response?.data?.photo?.contentType) {
                return `data:${response.data.photo.contentType};base64,${response.data.photo.base64Data}`;
            }
            
            console.warn(`No base64Data found for photo ${photoId}`);
            return null;
        } catch (error) {
            console.error("Error getting photo data URL:", error);
            return null;
        }
    },

    // Delete photo
    deletePhoto: async (photoId) => {
        const currentUser = AuthService.getCurrentUser();
        if (!currentUser || !currentUser.accessToken) {
            console.error("Authentication error: missing jwt token");
            throw new Error("User not authenticated.");
        }

        try {
            const response = await axios.delete(`${API_URL}/image/${photoId}`, {
                headers: {
                    'Authorization': `Bearer ${currentUser.accessToken}`
                }
            });
            return response;
        } catch (error) {
            console.error("Delete photo error:", error);
            throw error;
        }
    },

    // Batch upload with progress tracking
    batchUploadPhotos: async (propertyId, files, onProgress) => {
        const currentUser = AuthService.getCurrentUser();
        if (!currentUser || !currentUser.accessToken) {
            throw new Error("User not authenticated.");
        }

        const formData = new FormData();
        files.forEach(file => {
            formData.append('files', file);
        });

        try {
            const response = await axios.post(`${API_URL}/${propertyId}/upload-photo`, formData, {
                headers: {
                    'Authorization': `Bearer ${currentUser.accessToken}`,
                    'Content-Type': 'multipart/form-data'
                },
                timeout: 120000, // 2 minutes for batch upload
                maxContentLength: 50 * 1024 * 1024,
                maxBodyLength: 50 * 1024 * 1024,
                
                onUploadProgress: (progressEvent) => {
                    const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    onProgress?.(percentCompleted);
                },
            });

            return response;
        } catch (error) {
            console.error("Batch upload error:", error);
            throw error;
        }
    },

    // Validate file before upload
    validateFile: (file) => {
        const errors = [];
        const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
        const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

        if (!ALLOWED_TYPES.includes(file.type)) {
            errors.push(`${file.name}: Invalid file type. Only JPEG, PNG, and WebP are allowed.`);
        }

        if (file.size > MAX_FILE_SIZE) {
            errors.push(`${file.name}: File too large. Maximum size is 10MB.`);
        }

        if (file.size === 0) {
            errors.push(`${file.name}: File is empty.`);
        }

        return errors;
    },

    // Get file size in human readable format
    formatFileSize: (bytes) => {
        if (bytes === 0) return '0 Bytes';
        
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
};

export default PhotoService;