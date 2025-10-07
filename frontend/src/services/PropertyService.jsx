import axios from "axios";
import { Environment } from "../environments/GlobalVariables";
import AuthService from "./AuthService";

const API_URL = Environment.apiUrl + '/property'

const PropertyService = {

    getPropertyById: async(propertyId)=>{
        const currentUser=AuthService.getCurrentUser();
        if(!currentUser || !currentUser.accessToken){
            console.error("Authentication error: missing jwt token");
            throw new Error("User not authenticated.");
        }

        console.log("Fetching property with ID: ", propertyId);

        try {
            const response = await axios.get(`${API_URL}/properties/${propertyId}`, {
                headers:{
                    'Authorization':`Bearer ${currentUser.accessToken}`
                }
            });
        
            return response.data;
        } catch (error) {
            console.error(`Error getting property with ID ${propertyId}: `, error.response.data);
            if(error.response.data.tokenErrMessage){
                AuthService.reLogin();
            }
        }

    },

    addProperty: async(propertyData)=>{

        const currentUser=AuthService.getCurrentUser();

        // check for missing user or token
        if (!currentUser || !currentUser.accessToken) {
            console.error("Authentication Error: Cannot add property, JWT token missing.");
            throw new Error("User not authenticated.");
        }

        console.log("Adding property");
        
        try {
            const response=await axios.post(API_URL+"/addProperty", propertyData, {
                headers: {
                    'Authorization': `Bearer ${currentUser.accessToken}`
                }
            });

            return response.data;
        } catch (error) {
            console.error("Error adding property: ", error.response.data);
            if(error.response.data.tokenErrMessage){
                AuthService.reLogin();
            }
        }
    },

    editProperty: async (propertyDto, prId)=>{
        const currentUser=AuthService.getCurrentUser();

        if(!currentUser || !currentUser.accessToken){
            console.log("Autheentication error: missing jwt token");
            return [];
        }
        console.log("Attempting to edit property: ", prId);

        try {
            const response=await axios.put(`${API_URL}/edit_property/${prId}`, propertyDto, {
                headers:{
                    'Authorization':`Bearer ${currentUser.accessToken}`
                }
            });

            if(response.data.message){
                console.log("Response data: ", response.data);
                return response.data;
            }
        } catch (error) {
            console.error("React error editing property: ", error);
            if(error.response.data.tokenErrMessage){
                AuthService.reLogin();
            }
        }
    },

    getPropertyFacilities: async(prId)=>{
        const currentUser=AuthService.getCurrentUser();

        if(!currentUser || !currentUser.accessToken){
            console.log("Autheentication error: missing user or jwt token");
            return [];
        }
        console.log("Fetching facilities for property with ID: ", prId);
        
        try {
            const response = await axios.get(`${API_URL}/getFacilities/${prId}`, {
                headers:{
                    'Authorization': `Bearer ${currentUser.accessToken}`
                }
            });

            if(response.data.errMessage)
                throw error

            return response.data;
        } catch (error) {
            console.error("React error fetching facilities for property id: ", prId);
            if(error.response.data.tokenErrMessage){
                AuthService.reLogin();
            }
        }
    },

    deletePropertyById: async(prId)=>{
        const currentUser=AuthService.getCurrentUser();
        
        if(!currentUser || !currentUser.accessToken){
            console.log("Autheentication error: missing user or jwt token");
            return [];
        }
        console.log("Attempting to delete property: ", prId);

        try {
            const response=await axios.delete(`${API_URL}/delete_property/${prId}`, {
                headers:{
                    'Authorization':`Bearer ${currentUser.accessToken}`
                }
            });
        
            if(response.data.message){
                console.log(response.data);
                return response.data;
            }
        } catch (error) {
            console.error("React Error deleting property: ", error);
            if(error.response.data.tokenErrMessage){
                AuthService.reLogin();
            }
        }
    }
}

export default PropertyService;