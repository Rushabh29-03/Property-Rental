import axios from "axios";
import { Environment } from "../environments/GlobalVariables";
import AuthService from "./AuthService";

const API_URL = Environment.apiUrl + "/owner"
const currentUser = AuthService.getCurrentUser();

const OwnerService = {
    getProperties: async (owner)=>{
        console.log("Getting properties for owner: ", owner.username);
        
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
            throw error;            
        }
    },

    addProperty: async(propertyData)=>{
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