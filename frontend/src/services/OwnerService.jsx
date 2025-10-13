import axios from "axios";
import { Environment } from "../environments/GlobalVariables";
import AuthService from "./AuthService";

const API_URL = Environment.apiUrl + "/owner"

const OwnerService = {
    getProperties: async ()=>{

        const currentUser = AuthService.getCurrentUser();
        if(!currentUser || !currentUser.accessToken){
            console.log("Autheentication error: missing jwt token");
            return [];
        }
        console.log("Getting properties for owner: ", currentUser.username);
        
        try {
            const response = await axios.get(API_URL+"/properties", {
                headers:{
                    'Authorization':`Bearer ${currentUser.accessToken}`
                }
            });

            // console.log(response.data);
            return response.data;
        } catch (error) {
            console.error("Error getting property: ", error.response.data);
            if(error.response.data.tokenErrMessage){
                AuthService.relogin();
            }
            else {
                return [];
            }
        }
    },
}

export default OwnerService;