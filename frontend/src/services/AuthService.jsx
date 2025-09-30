import axios from 'axios';
import { Environment } from '../environments/GlobalVariables';

const API_URL = Environment.apiUrl + "/auth"

const AuthService = {    

    logout: ()=>{
        localStorage.removeItem('user');
    },

    getCurrentUser: ()=>{
        const user = localStorage.getItem('user');
        return user ? JSON.parse(user) : null;
    },

    setCurrentUser: (data)=>{
        localStorage.setItem('user', JSON.stringify(data));
        localStorage.setItem('role', JSON.stringify(data.role));
    },

    signIn: async (username, password)=>{

        console.log("Attempting sign-in...");

        try {
            // Await the POST request
            const response = await axios.post(API_URL + "/login",
                {
                    userName: username, 
                    password: password
                });

            // ! INVALID CREDENTIALS HANDLER
            if(response.data.errMessage){
                throw new Error(response.data.errMessage);
            }

            else if (response.data.jwtToken) { 
                AuthService.setCurrentUser(response.data);
                
            }
            console.log(response.data);
            return response.data; // Return the data
            
        } catch (error) {
            alert(error);
            console.error("Sign-in error:", error);
            
            throw error;
        }
    },

    signUp: async (userData, navigate)=>{
        console.log("Attempting sign-up...");
        AuthService.setCurrentUser(null);

        const response=await axios.post(API_URL+"/register/user", userData);

        try {
            if(! response.data.canProceed){
                alert(response.data.errMessage);
                console.log(response.data.detailError);
            }
            else{
                console.log("Sing-up response data: ", response.data);
                AuthService.setCurrentUser()
                await AuthService.signIn(userData.userName, userData.password);
                await navigate("/");
            }
        } catch (error) {
            console.error("Sign-up error: ", response.data.errMessage);
            throw error;
        }
    },

    getAllProperties: async()=>{
        console.log("fetching all properties");
        
        const response = await axios.get(API_URL+"/allProperties", {
            headers: {
                'Authorization': `Bearer ${AuthService.getCurrentUser().jwtToken}`
            }
        });

        try {
            return response.data;
        } catch (error) {
            console.error("Error fetching all properties");
            throw new error;
        }
    }
}

export default AuthService;