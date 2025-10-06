import React, { useState } from 'react'
import AuthService from '../../services/AuthService';
import { Link, useNavigate } from 'react-router-dom'; // Import Link
import Header from '../header/Header';

function SignUp() {

  const [username, setUsername] = useState("new")
  const [password, setPassword] = useState("1234")
  const [email, setEmail] = useState("new@gmail.com")
  const [firstname, setFirstname] = useState("new")
  const [lastname, setLastname] = useState("shah")
  const [phoneNo, setPhoneNo] = useState("")
  const [isOwner, setIsOwner] = useState(false)
  const navigate=useNavigate()

  let userData = {
    "userName": username,
    "password": password,
    "email": email,
    "firstName": firstname,
    "lastName": lastname,
    "phoneNo": phoneNo,
    "isOwner": isOwner
  }

  const handleSignUp = async(e) => {
    e.preventDefault();

    await AuthService.signUp(userData, navigate);
  }

  return (
    <>
      {/* <span className='sticky top-0 z-100 w-full'><Header /></span> */}
      {/* // Outer container: Centers the form on a light gray background */}
      <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
        {/* Form Card: Defines the white, shadowed box for the form */}
        <div className="w-full max-w-lg p-8 space-y-6 bg-white rounded-xl shadow-2xl">
          <h2 className="text-3xl font-extrabold text-center text-gray-900">
            Create Account
          </h2>

          <form onSubmit={handleSignUp} className="space-y-4">

            {/* Username */}
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700">Username <span className='text-red-700'>*</span></label>
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="e.g., john_doe"
                required
              />
            </div>

            {/* Password (Changed to type="password" for security) */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password <span className='text-red-700'>*</span></label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="••••••••"
                required
              />
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email <span className='text-red-700'>*</span></label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="e.g., name@example.com"
                required
              />
            </div>

            {/* Firstname */}
            <div>
              <label htmlFor="firstname" className="block text-sm font-medium text-gray-700">First Name <span className='text-red-700'>*</span></label>
              <input
                type="text"
                id="firstname"
                value={firstname}
                onChange={(e) => setFirstname(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder='First Name'
                required
              />
            </div>

            {/* Lastname */}
            <div>
              <label htmlFor="lastname" className="block text-sm font-medium text-gray-700">Last Name <span className='text-red-700'>*</span></label>
              <input
                type="text"
                id="lastname"
                value={lastname}
                onChange={(e) => setLastname(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder='Last Name'
                required
              />
            </div>

            {/* PhoneNo */}
            <div>
              <label htmlFor="phoneNo" className="block text-sm font-medium text-gray-700">10-digit Phone Number</label>
              <input
                type="tel"
                id="phoneNo"
                value={phoneNo}
                onChange={(e) => setPhoneNo(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder='Enter 10 digit mobile number'
                maxLength='10'
                pattern='[0-9]{10}'
              />
            </div>

            {/* Checkbox Group: Is Owner */}
            <div className="flex items-center space-x-2 pt-2 pb-4">
              <input
                type="checkbox"
                id="isOwner"
                checked={isOwner}
                onChange={() => setIsOwner(prev => !prev)}
                className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
              />
              <label htmlFor="isOwner" className="text-sm font-medium text-gray-700">Are you owner of a property?</label>
            </div>

            {/* Sign Up Button */}
            <button
              type="submit"
              className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-150"
            >
              Sign Up
            </button>
          </form>

          <div className="flex flex-col space-y-3 pt-4 text-center">
            {/* Login Link */}
            <Link to="/login" className="font-medium text-sm text-indigo-600 hover:text-indigo-500">
              Already have account? Login
            </Link>

          </div>
        </div>
      </div>
    </>
  );
}

export default SignUp