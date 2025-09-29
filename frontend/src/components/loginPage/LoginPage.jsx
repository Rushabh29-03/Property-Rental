import React, { useState } from 'react'
import './LoginPage.css'
import axios from 'axios';
import authService from '../../services/authService';
import { Link, useNavigate } from 'react-router-dom'; // Import Link

function LoginPage() {

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate=useNavigate();

  const handleSignIn = async(e) => {
    e.preventDefault();

    await authService.signIn(username, password);
    navigate("/");
    // setUsername("");
    // setPassword("");
  };



  return (
    // Outer Container
    <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">

      {/* Form Card: Defines the white, shadowed box for the form */}
      <div className="w-full max-w-sm p-8 space-y-6 bg-white rounded-xl shadow-2xl">

        <h2 className="text-3xl font-extrabold text-center text-gray-900">
          Sign In
        </h2>

        <form onSubmit={handleSignIn} className="space-y-6">

          {/* Username Input Group */}
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700">
              Username
            </label>
            <input
              type="text"
              name="username"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="Enter your username"
              required
            />
          </div>

          {/* Password Input Group */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              type="password" // Corrected type for security
              name="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="••••••••"
              required
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-150"
          >
            Submit
          </button>
        </form>

        <div className="flex flex-col space-y-3 pt-2 text-center">
          {/* Sign Up Link */}
          <Link to="/signup" className="text-sm font-medium text-indigo-600 hover:text-indigo-500">
            Create a new account?
          </Link>

        </div>
      </div>
    </div>
  );
}

export default LoginPage