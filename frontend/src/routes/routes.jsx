import { Routes, Route } from 'react-router-dom';
import LoginPage from '../components/loginPage/LoginPage';
import SignUp from '../components/signUpPage/SignUp';
import Home from '../components/homePage/Home';
import OwnerDashboard from '../components/ownerDashboard/OwnerDashboard';

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
    </Routes>
  );
};

export default AppRoutes;