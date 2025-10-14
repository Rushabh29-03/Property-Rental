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
    
    acceptRentRequest: async (rentData) => {
        const currentUser = AuthService.getCurrentUser();
        if (!currentUser || !currentUser.accessToken) {
            console.log("Authentication error: missing jwt token");
            return null;
        }

        console.log('Accepting rent request for: ', rentData);
        try {
            const response = await axios.post(`${API_URL}/accept-rent-request`, rentData, {
                headers: {
                    'Authorization': `Bearer ${currentUser.accessToken}`
                }
            });

            if (response) {
                console.log(response.data);
                return response.data;
            } else {
                throw new Error("No response received");
            }
        } catch (error) {
            console.error("React error accepting rent request: ", error);
            if (error.response?.data?.tokenErrMessage) {
                AuthService.relogin();
            } else {
                throw error;
            }
        }
    },

    rejectRentRequest: async (requestData) => {
        const currentUser = AuthService.getCurrentUser();
        if (!currentUser || !currentUser.accessToken) {
            console.log("Authentication error: missing jwt token");
            return null;
        }

        console.log('Rejecting rent request for: ', requestData);
        try {
            const response = await axios.post(`${API_URL}/reject-rent-request`, requestData, {
                headers: {
                    'Authorization': `Bearer ${currentUser.accessToken}`
                }
            });

            if (response) {
                console.log(response.data);
                return response.data;
            } else {
                throw new Error("No response received");
            }
        } catch (error) {
            console.error("React error rejecting rent request: ", error);
            if (error.response?.data?.tokenErrMessage) {
                AuthService.relogin();
            } else {
                throw error;
            }
        }
    },

    getRentRequestsCount: async (propertyId) => {
        const currentUser = AuthService.getCurrentUser();
        if (!currentUser || !currentUser.accessToken) {
            console.log("Authentication error: missing jwt token");
            return 0;
        }

        try {
            const response = await axios.get(`${API_URL}/property/${propertyId}/rent-requests-count`, {
                headers: {
                    'Authorization': `Bearer ${currentUser.accessToken}`
                }
            });

            if (response) {
                return response.data.count || 0;
            } else {
                return 0;
            }
        } catch (error) {
            console.error("React error getting rent requests count: ", error.response?.data);
            if (error.response?.data?.tokenErrMessage) {
                AuthService.relogin();
            }
            return 0;
        }
    },
    
    getRentRequests: async () => {
        const currentUser = AuthService.getCurrentUser();
        if (!currentUser || !currentUser.accessToken) {
            console.log("Authentication error: missing jwt token");
            return [];
        }

        console.log('Getting rent requests for owner: ', currentUser.username);
        try {
            const response = await axios.get(`${API_URL}/rent-requests`, {
                headers: {
                    'Authorization': `Bearer ${currentUser.accessToken}`
                }
            });

            if (response) {
                console.log(response.data);
                return response.data.rentRequests || [];
            } else {
                throw new Error("No response received");
            }
        } catch (error) {
            console.error("React error getting rent requests: ", error);
            if (error.response?.data?.tokenErrMessage) {
                AuthService.relogin();
            } else {
                return [];
            }
        }
    },
}

export default OwnerService;