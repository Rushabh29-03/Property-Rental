import axios, { AxiosHeaders } from "axios";
import { Environment } from "../environments/GlobalVariables";
import AuthService from "./AuthService";

const API_URL = Environment.apiUrl + '/admin'

const AdminService = {
    toggleVerifiedStatus: async(prId)=>{
        const currentUser=AuthService.getCurrentUser();
        if(!currentUser || !currentUser.jwtToken){
            console.error("Authentication error: missing jwt token");
            throw new Error("User not authenticated.");
        }

        console.log("Toggling verification for property with ID: ", prId);

        try {
            const response = await axios.put(`${API_URL}/toggleVerify/${prId}`, prId, {
                headers:{
                    'Authorization': `Bearer ${currentUser.jwtToken}`
                }
            });

            if(response.data.message){
                console.log("Response data: ", response.data);
                return response.data;
            }
            else
                alert(response.data.errMessage);
        } catch (error) {
            console.log("React error editing property: ", error);
            alert(error.response.data);
            throw error;
        }
    },
}

export default AdminService;