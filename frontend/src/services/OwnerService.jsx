import axios from "axios";
import { Environment } from "../environments/GlobalVariables";
import AuthService from "./AuthService";

const API_URL = Environment.apiUrl + "/owner"

const OwnerService = {
    getProperties: async ()=>{

        const currentUser = AuthService.getCurrentUser();
        if(!currentUser || !currentUser.jwtToken){
            console.log("Autheentication error: missing jwt token");
            return [];
        }
        console.log("Getting properties for owner: ", currentUser.username);
        
        const response = await axios.get(API_URL+"/properties", {
            headers:{
                'Authorization':`Bearer ${currentUser.jwtToken}`
            }
        });

        try {
            // console.log(response.data);
            return response.data;
        } catch (error) {
            console.error("Error getting property: ", error);
            return [];
        }
    },

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
    }
}

export default OwnerService;