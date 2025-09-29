import React from 'react'
import Header from '../header/Header'
import AuthService from '../../services/AuthService';
import { useState, useEffect } from 'react';
import OwnerService from '../../services/OwnerService';

function OwnerDashboard() {

  const currentUser = AuthService.getCurrentUser();

  // response of getProperties is stored here
  const [properties, setProperties] = useState([]);

  // used to take inpput from html form
  const [description, setDescription] = useState("vgera vgera")
  const [address, setAddress] = useState("swarnim paradise")
  const [isVerified, setIsVerified] = useState(false)
  const [area, setArea] = useState(800)
  const [areaUnit, setAreaUnit] = useState("sq_feet")
  const [monthlyRent, setMonthlyRent] = useState(25000)
  const [noOfBedrooms, setNoOfBedrooms] = useState(2)
  const [securityDeposit, setSecurityDeposit] = useState(20000)

  // setProperties(OwnerService.getProperties(currentUser));

  let propertyData = {
    "description": description,
    "address": address,
    "isVerified": isVerified,
    "area": area,
    "areaUnit": areaUnit,
    "noOfBedrooms": noOfBedrooms,
    "monthlyRent": monthlyRent,
    "setSecurityDeposit": setSecurityDeposit
  }

  let inputClassName = "mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"

  // !ADD PROPERTY
  const handleAddProperty = async (e) => {
    e.preventDefault();

    const response = await OwnerService.addProperty(propertyData);
    console.log("Added property: ", response);

    setProperties(prev => [...prev, response])
    window.scrollTo(0, 0);
  }

  // !GET PROPERTY
  const handleGetProperty = async () => {

    //response is array of properties
    const response = await OwnerService.getProperties(currentUser);

    setProperties(response);
  }

  // runs when property gets changed
  useEffect(() => {

    handleGetProperty();
  }, []);

  return (
    <>
      <span className='sticky top-0 z-100 w-full'><Header /></span>
      <div className="dashboard-container min-h-screen p-4 bg-gray-500">
        <div className='property-wrap flex flex-wrap gap-5'>

          {properties.length === 0
            ? (<p className='w-full text-center'>Click "Get Property" to load your listings.</p>)
            : (
              // Use the map() function to iterate over the properties array
              properties.map((property) => (

                <div
                  key={property.id}
                  className={`property-box bg-gray-100 p-5 rounded-xl shadow-2xl outline-2 w-lg min-w-3xs transition duration-300 ease-in-out 
                    hover:scale-103
                    hover:rounded-2xl
                    ${property.isVerified ? 'hover:bg-green-100' : 'hover:bg-red-100'}`}
                  >
                  <h3 className='text-xl font-bold'>{property.address}</h3>
                  <p><strong>Rent:</strong> ₹{property.monthlyRent}</p>
                  <p><strong>Bedrooms:</strong> {property.noOfBedrooms}</p>
                  <p><strong>Area:</strong> {property.area} {property.areaUnit}</p>
                  <p className={`text-sm ${property.isVerified ? 'text-green-600' : 'text-red-600'}`}>
                    {property.isVerified ? 'Verified Listing' : 'Verification Pending'}
                  </p>
                  <p className='text-sm mt-2 text-gray-600 truncate'>{property.description}</p>
                </div>
              ))
            )
          } 
        </div>
        
      </div>
      
      <div className="flex items-center justify-center bg-gray-500 p-4">
        <div className="w-full max-w-lg p-8 space-y-6 bg-white rounded-xl shadow-2xl">
          <h2 className="text-3xl font-extrabold text-center text-gray-900">
            Add Property
          </h2>

          <form onSubmit={handleAddProperty} className="space-y-4">

            {/* ADDRESS */}
            <div>
              <label htmlFor="address" className="block text-sm font-medium text-gray-700">Address <span className='text-red-700'>*</span></label>

              <textarea 
                id="address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className={`${inputClassName}`}
              />
            </div>

            {/* DESCRIPTION */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
              <input
                type="text"
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className={`${inputClassName}`}
              />
            </div>

            {/* AREA */}
            <div>
              <label htmlFor="area" className="block text-sm font-medium text-gray-700">area (in square feet)<span className='text-red-700'>*</span></label>
              <input
                type="number"
                id="area"
                value={area}
                onChange={(e) => setArea(e.target.value)}
                className={`${inputClassName}`}
                required
              />
            </div>

            {/* AREA UNIT */}

            {/* NO OF BEDROOMS */}
            <div>
              <label htmlFor="noOfBedrooms">No. of bedrooms</label>
              <input 
                type="number"
                id='noOfBedrooms'
                value={noOfBedrooms}
                onChange={(e) => setNoOfBedrooms(e.target.value)}
                className={`${inputClassName}`}
                />
            </div>

            {/* MONTHLY RENT */}
            <div>
              <label htmlFor="monthlyRent" className="block text-sm font-medium text-gray-700">Monthly Rent <span className='text-red-700'>*</span></label>
              <input 
                type="number" 
                id='monthlyRent'
                value={monthlyRent}
                onChange={(e) => setMonthlyRent(e.target.value)}
                className={`${inputClassName}`}
                />
            </div>

            {/* SECURITY DEPOSIT */}
            <div>
              <label htmlFor="securityDeposit" className="block text-sm font-medium text-gray-700">Security Deposit</label>
              <input 
                type="number" 
                id='securityDeposit'
                value={securityDeposit}
                onChange={(e) => setSecurityDeposit(e.target.value)}
                className={`${inputClassName}`}
                />
            </div>
            <button 
              type="submit"
              className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-150"
              >Add Property</button>
          </form>
        </div>
      </div>
    </>
  )
}

export default OwnerDashboard