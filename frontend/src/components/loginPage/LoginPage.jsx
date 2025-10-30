import React, { useEffect, useState } from 'react'
import './LoginPage.css'
import axios from 'axios';
import AuthService from '../../services/AuthService';
import { Link, useNavigate } from 'react-router-dom'; // Import Link
import Header from '../header/Header';

function LoginPage() {

  const [username, setUsername] = useState("jordan2903");
  const [password, setPassword] = useState("1234");
  const [googleLoading, setGoogleLoading] = useState(false);
  const navigate = useNavigate();

  const handleSignIn = async (e) => {
    e.preventDefault();

    await AuthService.signIn(username, password);
    navigate("/");
    // setUsername("");
    // setPassword("");
  };

  /**
   * Handle Google Sign-In callback
   * Called by Google Sign-In button
   */
  const handleGoogleSuccess = async (response) => {
    setGoogleLoading(true);
    try {
      console.log("Google response received");
      const idToken = response.credential;

      // Send token to backend
      const result = await AuthService.googleSignIn(idToken);

      if (result) {
        console.log("Google sign-in successful, redirecting...");
        navigate("/");
      }
    } catch (error) {
      console.error("Google sign-in failed:", error);
      setGoogleLoading(false);
    }
  };

  const handleGoogleError = () => {
    console.error("Google Sign-In failed");
    alert("Google Sign-In failed. Please try again.");
  };

  useEffect(() => {
    // Check if Google script is loaded
    if (window.google) {
      try {
        window.google.accounts.id.initialize({
          client_id: '1045011433847-4cadhh7bohua94rcevv1iu9ojo7p3vn8.apps.googleusercontent.com',
          callback: handleGoogleSuccess,
          error_callback: handleGoogleError,
        });

        // Render the Google Sign-In button
        window.google.accounts.id.renderButton(
          document.getElementById('google-sign-in-button'),
          {
            theme: 'outline',
            size: 'large',
            text: 'signin_with'
          }
        );

        console.log("Google Sign-In button initialized");
      } catch (error) {
        console.error("Error initializing Google Sign-In:", error);
      }
    } else {
      console.warn("Google SDK not loaded yet");
    }
  }, [])

  return (
    <>
      {/* Outer Container */}
      <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
        {/* Form Card */}
        <div className="w-full max-w-sm p-8 space-y-6 bg-white rounded-xl shadow-2xl">
          <h2 className="text-3xl font-extrabold text-center text-gray-900">Sign In</h2>

          {/* Traditional Login Form */}
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
                onChange={e => setUsername(e.target.value)}
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
                type="password"
                name="password"
                id="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="Enter your password"
                required
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-150"
            >
              Sign In
            </button>
          </form>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Or continue with</span>
            </div>
          </div>

          {/* Google Sign-In Button Container */}
          <div className="flex flex-col space-y-3">
            <div
              id="google-sign-in-button"
              className="flex justify-center"
            >GOOGLE</div>

            {googleLoading && (
              <p className="text-sm text-center text-gray-600">
                Signing in with Google...
              </p>
            )}
          </div>

          {/* Sign Up Link */}
          <div className="text-center pt-2">
            <Link to="/signup" className="text-sm font-medium text-indigo-600 hover:text-indigo-500">
              Create a new account?
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}

export default LoginPage