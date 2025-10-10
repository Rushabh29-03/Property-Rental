import { Routes, Route } from 'react-router-dom';
import LoginPage from '../components/loginPage/LoginPage';
import SignUp from '../components/signUpPage/SignUp';
import Home from '../components/homePage/Home';
import OwnerDashboard from '../components/ownerDashboard/OwnerDashboard';
import AllProperties from '../components/allProperties/AllProperties';
import PreviewProperty from '../components/previewProperty/PreviewProperty';
import UserWishListPage from '../components/userWishListPage/UserWishListPage';
import Api from '../components/aapi/api';


const AppRoutes = () => {
  return (
    <Routes>
      {/* Route for the Login component */}
      <Route path="/" element={<Home />} /> 
      <Route path="/login" element={<LoginPage />} />

      {/* Route for the SignUp component */}
      <Route path="/signup" element={<SignUp/>} /> 

      {/* Route for owner Dashboard */}
      <Route path='/owner-dashboard' element={<OwnerDashboard />} />

      {/* preview specific property */}
      <Route path='/property/:pr_id' element={<PreviewProperty />} />

      {/* user wishlisted properties page */}
      <Route path='/wishList' element={<UserWishListPage />}/>

      {/* all properties */}
      <Route path='/properties' element={<AllProperties />}/>

      {/* testing */}
      <Route path='api/testing' element={<Api />}/>
    </Routes>
  );
};

export default AppRoutes;