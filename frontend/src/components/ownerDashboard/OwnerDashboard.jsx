import React, { useId } from 'react'
import Header from '../header/Header'
import AuthService from '../../services/AuthService';
import { useState, useEffect } from 'react';
import OwnerService from '../../services/OwnerService';
import AllProperties from '../allProperties/AllProperties'
import { useProperty } from '../customHooks/PropertyContext';
import PropertyService from '../../services/PropertyService';
import './OwnerDashboard.css'

function OwnerDashboard() {

  const currentUser=AuthService.getCurrentUser();

  // response of getProperties is stored here
  const [properties, setProperties] = useState([]);

  // used to take input from html form
  const [description, setDescription] = useState("vgera vgera")
  const [address, setAddress] = useState("swarnim paradise")
  const [isVerified, setIsVerified] = useState(false)
  const [area, setArea] = useState(800)
  const [areaUnit, setAreaUnit] = useState("sq_feet")
  const [monthlyRent, setMonthlyRent] = useState(25000)
  const [noOfBedrooms, setNoOfBedrooms] = useState(2)
  const [securityDeposit, setSecurityDeposit] = useState(20000)
  const [photoFile, setPhotoFile] = useState([])

  // setProperties(OwnerService.getProperties(currentUser));

  let propertyData = {
    "description": description,
    "address": address,
    "isVerified": isVerified,
    "area": area,
    "areaUnit": areaUnit,
    "noOfBedrooms": noOfBedrooms,
    "monthlyRent": monthlyRent,
    "securityDepositAmount": securityDeposit 
  }

  let inputClassName = "mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"

  // !HANDLE PROPERTY CLICK
  const { handlePropertyClick } = useProperty();

  // !ADD PROPERTY
  const handleAddProperty = async (e) => {
    e.preventDefault();

    console.log("selected photos: ", photoFile);
    

    try {
        const response = await PropertyService.addProperty(propertyData);

        if (response) { 
            console.log("Property added successfully:", response);

            await handleGetProperty(); 
            window.scrollTo(0, 0);
        }
    } catch (error) {
        console.error("Failed to add property:", error);
    }
  }

  // !GET PROPERTY
  const handleGetProperty = async () => {

    //response is array of properties
    const response = await OwnerService.getProperties();

    setProperties(response);
  };

  // !GET PHOTOS HANDLER
  const handleInputPhotos = (e) => {

    if(e.target.files && e.target.files.length>5){
      alert("You cannot upload files more than 5");
      e.target.value = null;
      setPhotoFile([]);
    }

    if(e.target.files ){
      // console.log(e.target.files);
      // console.log(typeof(e.target.files));
      setPhotoFile(Array.from(e.target.files))
    }else{
      setPhotoFile([])
      console.log("Undergone in else part");
    }
  };

  // runs when page is mounted/rendered
  useEffect(() => {
    const userId=currentUser?.username;
    if(userId){
        handleGetProperty();
    } else
        setProperties([])
  }, [currentUser?.username]);

  return (
    <>
      {/* RENDERING ALL PROPERTIES */}
      <div className='dashboard-container min-h-screen p-4 bg-gray-500'>
        <div className='property-wrap flex flex-wrap gap-5'>

          {properties.length === 0
            ? (<p className='w-full text-center text-white'>No properties added yet.</p>)
            : (
              // Use the map() function to iterate over the properties array
              properties.map((property) => (

                <div
                  onClick={()=>handlePropertyClick(property)}
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
      
      {/* ADD PROPERTY */}
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
            <div>
              <label htmlFor="newareaUnit" className="block text-sm font-medium text-gray-700">Area unit new</label>
              <select className={`${inputClassName}`} id="areaUnit" onChange={(e)=>setAreaUnit(e.target.value)}>
                <option value='sq_feet'>sq_feet</option>
                <option value="sq_meter">sq_meter</option>
              </select>
            </div>

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
            
            {/* PHOTOS */}
            <div>
              <label htmlFor="photos" className="block text-sm font-medium text-gray-700">
                Property Photo (max 5 files: .jpg, .jpeg, .png)
              </label>
              <input 
                type="file" 
                id='photos'
                onChange={handleInputPhotos}
                multiple
                accept=".jpg, .jpeg, .png"
                className="mt-1 block w-full text-sm text-gray-900 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                max={2}
                />

              {/* Display the name of the selected file */}
              {photoFile && photoFile.length>0 && (
                <p className='mt-2 text-sm text-gray-500'>
                    Selected file(s): 
                    <br />
                    {
                      photoFile.map((photo, index) =>(
                        <span key={index}>
                          <strong className='text-gray-700'>{photo.name}</strong>
                          <br />
                        </span>
                      ))
                    }
                </p>
              )}
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