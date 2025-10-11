import axios from "axios";
import { Environment } from "../environments/GlobalVariables";
import AuthService from "./AuthService";

const API_URL = Environment.apiUrl + '/property'
const FACILITY_API_URL = Environment.apiUrl + '/propFacility'

const PropertyService = {
    getPropertyById: async (propertyId) => {
        const currentUser = AuthService.getCurrentUser();
        if (!currentUser || !currentUser.accessToken) {
            console.error("Authentication error: missing jwt token");
            throw new Error("User not authenticated.");
        }

        console.log("Fetching property with ID: ", propertyId);
        try {
            const response = await axios.get(`${API_URL}/properties/${propertyId}`, {
                headers: {
                    'Authorization': `Bearer ${currentUser.accessToken}`
                }
            });
            return response.data;
        } catch (error) {
            console.error(`Error getting property with ID ${propertyId}: `, error.response?.data);
            if (error.response?.data?.tokenErrMessage) {
                AuthService.logout();
            }
            throw error;
        }
    },

    addProperty: async (propertyData) => {
        const currentUser = AuthService.getCurrentUser();
        // check for missing user or token
        if (!currentUser || !currentUser.accessToken) {
            console.error("Authentication Error: Cannot add property, JWT token missing.");
            throw new Error("User not authenticated.");
        }

        console.log("Adding property");
        try {
            const response = await axios.post(API_URL + "/addProperty", propertyData, {
                headers: {
                    'Authorization': `Bearer ${currentUser.accessToken}`
                }
            });
            return response.data;
        } catch (error) {
            console.error("Error adding property: ", error.response?.data);
            if (error.response?.data?.tokenErrMessage) {
                AuthService.logout();
            }
            throw error;
        }
    },

    editProperty: async (propertyDto, prId) => {
        const currentUser = AuthService.getCurrentUser();
        if (!currentUser || !currentUser.accessToken) {
            console.log("Authentication error: missing jwt token");
            return [];
        }

        console.log("Attempting to edit property: ", prId);
        try {
            const response = await axios.put(`${API_URL}/edit_property/${prId}`, propertyDto, {
                headers: {
                    'Authorization': `Bearer ${currentUser.accessToken}`
                }
            });
            if (response.data.message) {
                console.log("Response data: ", response.data);
                return response.data;
            }
        } catch (error) {
            console.error("React error editing property: ", error);
            if (error.response?.data?.tokenErrMessage) {
                AuthService.logout();
            }
            throw error;
        }
    },

    getPropertyFacilities: async (prId) => {
        const currentUser = AuthService.getCurrentUser();
        if (!currentUser || !currentUser.accessToken) {
            console.log("Authentication error: missing user or jwt token");
            return [];
        }

        console.log("Fetching facilities for property with ID: ", prId);
        try {
            const response = await axios.get(`${API_URL}/getFacilities/${prId}`, {
                headers: {
                    'Authorization': `Bearer ${currentUser.accessToken}`
                }
            });
            if (response.data.errMessage)
                throw new Error(response.data.errMessage);
            return response.data;
        } catch (error) {
            console.error("React error fetching facilities for property id: ", prId, error);
            if (error.response?.data?.tokenErrMessage) {
                AuthService.logout();
            }
            throw error;
        }
    },

    // NEW: Get all available facilities
    getAllFacilities: async () => {
        const currentUser = AuthService.getCurrentUser();
        if (!currentUser || !currentUser.accessToken) {
            console.log("Authentication error: missing user or jwt token");
            return [];
        }

        console.log("Fetching all available facilities");
        try {
            const response = await axios.get(`${Environment.apiUrl}/facility/getAllFacilities`, {
                headers: {
                    'Authorization': `Bearer ${currentUser.accessToken}`
                }
            });
            return response.data;
        } catch (error) {
            console.error("React error fetching all facilities: ", error);
            if (error.response?.data?.tokenErrMessage) {
                AuthService.logout();
            }
            throw error;
        }
    },

    // NEW: Add facility to property
    addFacilityToProperty: async (propertyId, facilityData) => {
        const currentUser = AuthService.getCurrentUser();
        if (!currentUser || !currentUser.accessToken) {
            console.log("Authentication error: missing user or jwt token");
            throw new Error("User not authenticated.");
        }

        console.log(`Adding facility to property ${propertyId}:`, facilityData);
        try {
            const response = await axios.post(`${FACILITY_API_URL}/addFacility/${propertyId}`, facilityData, {
                headers: {
                    'Authorization': `Bearer ${currentUser.accessToken}`
                }
            });
            return response.data;
        } catch (error) {
            console.error("React error adding facility to property: ", error);
            if (error.response?.data?.tokenErrMessage) {
                AuthService.logout();
            }
            // Extract error message from response
            const errorMessage = error.response?.data || error.message || 'Failed to add facility';
            throw new Error(errorMessage);
        }
    },

    // NEW: Remove facility from property
    removeFacilityFromProperty: async (propertyId, facilityData) => {
        const currentUser = AuthService.getCurrentUser();
        if (!currentUser || !currentUser.accessToken) {
            console.log("Authentication error: missing user or jwt token");
            throw new Error("User not authenticated.");
        }

        console.log(`Removing facility from property ${propertyId}:`, facilityData);
        try {
            const response = await axios.delete(`${FACILITY_API_URL}/deletePropFacility/${propertyId}`, {
                headers: {
                    'Authorization': `Bearer ${currentUser.accessToken}`
                },
                data: facilityData // For DELETE request with body
            });
            return response.data;
        } catch (error) {
            console.error("React error removing facility from property: ", error);
            if (error.response?.data?.tokenErrMessage) {
                AuthService.logout();
            }
            // Extract error message from response
            const errorMessage = error.response?.data?.errMessage || error.message || 'Failed to remove facility';
            throw new Error(errorMessage);
        }
    },

    deletePropertyById: async (prId) => {
        const currentUser = AuthService.getCurrentUser();
        if (!currentUser || !currentUser.accessToken) {
            console.log("Authentication error: missing user or jwt token");
            return [];
        }

        console.log("Attempting to delete property: ", prId);
        try {
            const response = await axios.delete(`${API_URL}/delete_property/${prId}`, {
                headers: {
                    'Authorization': `Bearer ${currentUser.accessToken}`
                }
            });
            if (response.data.message) {
                console.log(response.data);
                return response.data;
            }
        } catch (error) {
            console.error("React Error deleting property: ", error);
            if (error.response?.data?.tokenErrMessage) {
                AuthService.logout();
            }
            throw error;
        }
    }
};


export default PropertyService;