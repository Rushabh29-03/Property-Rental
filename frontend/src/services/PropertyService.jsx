import axios from "axios";
import { Environment } from "../environments/GlobalVariables";
import AuthService from "./AuthService";

const API_URL = Environment.apiUrl + '/property'

const PropertyService = {

    getPropertyById: async(propertyId)=>{
        const currentUser=AuthService.getCurrentUser();
        if(!currentUser || !currentUser.jwtToken){
            console.error("Authentication error: missing jwt token");
            throw new Error("User not authenticated.");
        }

        console.log("Fetching property with ID: ", propertyId);

        const response = await axios.get(`${API_URL}/properties/${propertyId}`, {
            headers:{
                'Authorization':`Bearer ${currentUser.jwtToken}`
            }
        });

        try {
            return response.data;
        } catch (error) {
            console.error(`Error getting property with ID ${propertyId}: `, error);
            throw error;
        }

    },

    addProperty: async(propertyData)=>{

        const currentUser=AuthService.getCurrentUser();

        // check for missing user or token
        if (!currentUser || !currentUser.jwtToken) {
            console.error("Authentication Error: Cannot add property, JWT token missing.");
            throw new Error("User not authenticated.");
        }

        console.log("Adding property");
        
        const response=await axios.post(API_URL+"/addProperty", propertyData, {
            headers: {
                'Authorization': `Bearer ${currentUser.jwtToken}`
            }
        });

        try {
            return response.data;
        } catch (error) {
            console.error("Error adding property: ", error);
            throw error;
        }
    },

    editProperty: async (propertyDto, prId)=>{
        const currentUser=AuthService.getCurrentUser();

        if(!currentUser || !currentUser.jwtToken){
            console.log("Autheentication error: missing jwt token");
            return [];
        }
        console.log("Attempting to edit property: ", prId);

        try {
            const response=await axios.put(`${API_URL}/edit_property/${prId}`, propertyDto, {
                headers:{
                    'Authorization':`Bearer ${currentUser.jwtToken}`
                }
            });

            if(response.data.message){
                console.log("Response data: ", response.data);
                return response.data;
            }
            else{
                alert(response.data.errMessage)
            }
        } catch (error) {
            console.log("React error editing property: ", error);
            alert(error.response.data.errMessage)
            throw error;
        }
    },

    deletePropertyById: async(prId)=>{
        const currentUser=AuthService.getCurrentUser();
        
        if(!currentUser || !currentUser.jwtToken){
            console.log("Autheentication error: missing jwt token");
            return [];
        }
        console.log("Attempting to delete property: ", prId);

        try {
            const response=await axios.delete(`${API_URL}/delete_property/${prId}`, {
                headers:{
                    'Authorization':`Bearer ${currentUser.jwtToken}`
                }
            });
        
            if(response.data.message){
                console.log(response.data);
                return response.data;
            }
            else{
                alert(response.data.errMessage);
            }
            
        } catch (error) {
            console.log("React Error deleting property: ", error);
            alert(error.response.data.errMessage);
            throw error;
        }
    }
}

export default PropertyService;