import axios from "axios";
import { Environment } from "../environments/GlobalVariables";
import AuthService from "./AuthService";


const API_URL=Environment.apiUrl + '/user'; //localhost:8080/user

const UserService = {

    addWishList: async(prId, wishListPropertyData)=>{
        const currentUser = AuthService.getCurrentUser();
        if(!currentUser || !currentUser.accessToken){
            console.error("Authentication error: missing jwt token");
            throw new error("User not authenticated");
        }

        console.log('Adding property');
        
        try {
            const response = await axios.post(`${API_URL}/wishListProperty/${prId}`, wishListPropertyData, {
                headers:{
                    'Authorization': `Bearer ${currentUser.accessToken}`
                }
            });
            // console.log(response.data.message);
            return response.data;
        } catch (error) {
            console.error(`React error marking property: ${prId} as wishlist: `, error);
            if(error.response.data.tokenErrMessage){
                AuthService.relogin();
            }
        }
    },

    getWishListedProperties: async()=>{
        const currentUser = AuthService.getCurrentUser();
        if(!currentUser || !currentUser.accessToken){
            console.error("Authentication error: missing jwt token");
            throw new error("User not authenticated");
        }

        console.log('Fetching wishlisted properties for user: ', currentUser.username);
        
        try {
            const response = await axios.get(`${API_URL}/getWishListedProperties`, {
                headers:{
                    'Authorization': `Bearer ${currentUser.accessToken}`
                }
            });

            // console.log(response.data);
            return response.data;
        } catch (error) {
            console.error(`React Error fetching wishlisted properties for user: ${currentUser.username}: `, error.response.data);
            if(error.response.data.tokenErrMessage){
                AuthService.relogin();
            }
        }
    },

    removeWishListedProperty: async(prId)=>{
        const currentUser=AuthService.getCurrentUser();
        if(!currentUser || !currentUser.accessToken){
            console.error("Authentication error: missing jwt token");
            throw new error("User not authenticated");
        }

        console.log(`Attempting to remove property: ${prId} from wishlist`);

        try {
            const response = await axios.delete(`${API_URL}/removeWishListProperty/${prId}`, {
                headers: {
                    'Authorization': `Bearer ${currentUser.accessToken}`
                }
            });
            return response.data;
            
        } catch (error) {
            console.error(`React error removing property ${prId} from wishlist`);
            if(error.response.data.tokenErrMessage){
                AuthService.relogin();
            }
        }
    },

    createRentRequest: async(rentRequestData)=>{
        const currentUser = AuthService.getCurrentUser();
        if(!currentUser || !currentUser.accessToken){
            console.error("Authentication error: missing jwt token");
            throw new error("User not authenticated");
        }

        console.log(`Attempting to create rent request`, rentRequestData);

        try {
            const response = await axios.post(`${API_URL}/rent-property`, rentRequestData, {
                headers: {
                    'Authorization': `Bearer ${currentUser.accessToken}`
                }
            });

            console.log(response.data);
            return response.data;
        } catch (error) {
            console.error("React error creating rent request: ", error);
            if(error.response.data.tokenErrMessage){
                AuthService.relogin();
            }
        }
    },
}

export default UserService