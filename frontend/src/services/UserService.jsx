import axios from "axios";
import { Environment } from "../environments/GlobalVariables";
import AuthService from "./AuthService";


const API_URL=Environment.apiUrl + '/user'; //localhost:8080

const UserService = {

    addWishList: async(prId, wishListPropertyData)=>{
        const currentUser = AuthService.getCurrentUser();
        if(!currentUser || !currentUser.jwtToken){
            console.error("Authentication error: missing jwt token");
            throw new error("User not authenticated");
        }

        console.log('Adding property');
        
        try {
            const response = await axios.post(`${API_URL}/wishListProperty/${prId}`, wishListPropertyData, {
                headers:{
                    'Authorization': `Bearer ${currentUser.jwtToken}`
                }
            });
            // console.log(response.data.message);
            return response.data;
        } catch (error) {
            console.error(`React error marking property: ${prId} as wishlist: `, error);
            throw error;
        }
    },

    getWishListedProperties: async()=>{
        const currentUser = AuthService.getCurrentUser();
        if(!currentUser || !currentUser.jwtToken){
            console.error("Authentication error: missing jwt token");
            throw new error("User not authenticated");
        }

        console.log('Fetching wishlisted properties for user: ', currentUser.username);
        
        try {
            const response = await axios.get(`${API_URL}/getWishListedProperties`, {
                headers:{
                    'Authorization': `Bearer ${currentUser.jwtToken}`
                }
            });

            // console.log(response.data);
            return response.data;
        } catch (error) {
            console.error(`React Error fetching wishlisted properties for user: ${currentUser.username}: `, error);
            throw error;
        }
    },

    removeWishListedProperty: async(prId)=>{
        const currentUser=AuthService.getCurrentUser();
        if(!currentUser || !currentUser.jwtToken){
            console.error("Authentication error: missing jwt token");
            throw new error("User not authenticated");
        }

        console.log(`Attempting to remove property: ${prId} from wishlist`);

        try {
            const response = await axios.delete(`${API_URL}/removeWishListProperty/${prId}`, {
                headers: {
                    'Authorization': `Bearer ${currentUser.jwtToken}`
                }
            });
            
            return response.data;
        } catch (error) {
            alert(error.response.data);
            console.log(`React error removing property ${prId} from wishlist`);
            throw error;
        }
    },
}

export default UserService