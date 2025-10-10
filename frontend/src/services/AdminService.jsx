import axios, { AxiosHeaders } from "axios";
import { Environment } from "../environments/GlobalVariables";
import AuthService from "./AuthService";

const API_URL = Environment.apiUrl + '/admin'

const AdminService = {
    toggleVerifiedStatus: async(prId)=>{
        const currentUser=AuthService.getCurrentUser();
        if(!currentUser || !currentUser.accessToken){
            console.error("Authentication error: missing jwt token");
            throw new Error("User not authenticated.");
        }

        console.log("Toggling verification for property with ID: ", prId);

        try {
            const response = await axios.put(`${API_URL}/toggleVerify/${prId}`, prId, {
                headers:{
                    'Authorization': `Bearer ${currentUser.accessToken}`
                }
            });

            if(response.data.message){
                console.log("Response data: ", response.data);
                return response.data;
            }
        } catch (error) {
            console.error("React error editing property: ", error);
            if(error.response.data.tokenErrMessage){
                AuthService.logout();
            }
        }
    },
}

export default AdminService;