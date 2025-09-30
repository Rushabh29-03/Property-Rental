import React from 'react'
import Header from '../header/Header'
import AuthService from '../../services/AuthService';
import { useState, useEffect } from 'react';
import OwnerService from '../../services/OwnerService';
import PreviewProperty from '../previewProperty/PreviewProperty';
import { useNavigate } from 'react-router';

function AllProperties() {

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

  // flag for specific property visibility
  const [isVisible, setIsVisible] = useState(false)
  const [clickedProperty, setClickedProperty] = useState()

  const navigate=useNavigate();

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

  // !GET PROPERTY
  const handleGetProperty = async () => {

    //response is array of properties
    const response = await AuthService.getAllProperties();

    setProperties(response?response:[]);
  }

  // runs when property gets changed
  useEffect(() => {

    handleGetProperty();
  }, []);

  const handleNavigate = (pr_id)=>{
    navigate(`/property/${pr_id}`);
  }

  return (
    <>
      {/* <span className='sticky top-0 z-100 w-full'><Header /></span> */}
      <div className='dashboard-container min-h-screen p-4 bg-gray-500'>
        <div className='property-wrap flex flex-wrap gap-5'>

          {properties.length === 0
            ? (<p className='w-full text-center text-white'>No properties added yet.</p>)
            : (
              // Use the map() function to iterate over the properties array
              properties.map((property) => (

                <div
                  onClick={()=>handleNavigate(property.id)}
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
    </>
  )
}

export default AllProperties