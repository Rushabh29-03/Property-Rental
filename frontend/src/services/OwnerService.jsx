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
}

export default OwnerService;