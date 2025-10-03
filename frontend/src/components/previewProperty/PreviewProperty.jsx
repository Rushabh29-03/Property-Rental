import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router'
import AuthService from '../../services/AuthService';
import PropertyService from '../../services/PropertyService';
import { Link } from 'react-router';
import EditProperty from '../editProperty/EditProperty';

function PreviewProperty() {

  const [selectedProperty, setSelectedProperty] = useState(null)
  const { pr_id } = useParams();
  const role = AuthService.getCurrentUser().role;

  // manage loading/error during fallback fetch
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isVisible, setIsVisible] = useState(false)

  // navigate hook
  const navigate = useNavigate();

  // !GET PROPERTY BY ID
  const handleGetPropertyById = async(prId)=>{

    const response = await PropertyService.getPropertyById(prId);
    // console.log("response from PropertyService.getPropertyById(prId);")
    // console.log(response);
    setSelectedProperty(response);
  }

  // !DELETE PROPERTY
  const handleDeleteProperty = ()=>{
    const isConfirmed=window.confirm("Are you sure to delete the property?");
    if(isConfirmed){
      const response = PropertyService.deletePropertyById(pr_id);
      if(response && role){
        if(role==="ROLE_ADMIN")
          navigate('/properties');
        else if(role==="ROLE_OWNER")
          navigate('/owner-dashboard');
        else
          throw error;
        window.location.reload();
      }
    }
  }

  // !USE-EFFECT - fetching property
  useEffect(() => {

    const userId = AuthService.getCurrentUser()?.username;

    if(userId){
      handleGetPropertyById(pr_id);
    } else{
        setSelectedProperty(null)
    }
  }, [pr_id]); 


  // !USE-EFFECT - scroll controll
  useEffect(() => {
    const previewBody = document.getElementById('preview-property-body');
    
    // check if the element exists
    if (previewBody) {
      if (isVisible) {
        // 1. Disable scrolling on the entire body
        document.body.style.overflow = 'hidden';
        // prevent interaction with the background content
        previewBody.style.pointerEvents = 'none';
      } 
      else {
        // enable scrolling
        document.body.style.overflow = 'unset';
        // restore background interaction
        previewBody.style.pointerEvents = 'unset';
      }
    }

    // cleanup function
    return () => {
      // perform a null check in the cleanup function
      const bodyToReset = document.getElementById('preview-property-body');
      if (bodyToReset) {
        document.body.style.overflow = 'unset';
        bodyToReset.style.pointerEvents = 'unset';
      }
    };
  }, [isVisible]);

  
  // Handle loading state
  if (loading) {
    return <div className="p-6 text-center text-blue-600">Loading property details...</div>
  }

  // Handle error state
  if (error) {
    return <div className="p-6 text-center text-red-600">{error}</div>
  }

  // Use the data from context (now guaranteed to be available or loading/error states would have returned)
  if (!selectedProperty) {
      // This state should be hit only if the ID is missing, but still safe to check
      return <div className="p-6 text-center text-gray-500">Property ID is missing from the URL.</div>
  }


  // Use selectedProperty to display all data
  return (
    <>
      <div id='preview-property-body' className="p-6 min-h-screen bg-gray-100 select-none">
        {
          (role==='ROLE_OWNER'
            ? (<Link to='/owner-dashboard' className='text-blue-500'>{'<'}Go Back</Link>)
            : (<Link to='/properties' className='text-blue-500'>{'<'}Go Back to properties</Link>)
          )
        }
        <h1 className="text-3xl font-bold mb-4">{selectedProperty.address}</h1>
        
        <p className="mb-2"><strong>Description:</strong> {selectedProperty.description}</p>
        <p className="mb-2"><strong>Area:</strong> {selectedProperty.area} {selectedProperty.areaUnit}</p>
        <p className="mb-2"><strong>Bedrooms:</strong> {selectedProperty.noOfBedrooms}</p>
        <p className="mb-2"><strong>Rent:</strong> ₹{selectedProperty.monthlyRent} / month</p>
        <p className='mb-2'><strong>Security deposit:</strong> ₹{selectedProperty.securityDepositAmount}</p>

        {/* Action Buttons */}
        {(role==='ROLE_ADMIN' || role==='ROLE_OWNER') && (
          <div className="flex space-x-4 mt-6">
            <button className="outline-2 p-2 rounded cursor-pointer"
              onClick={()=>setIsVisible(true)}
            >
              Edit Property
            </button>
            <button onClick={handleDeleteProperty} className="outline-2 p-2 rounded cursor-pointer">
              Delete Property
            </button>
            <button className="outline-2 p-2 rounded cursor-pointer">
              Add Facilities & Rules
            </button>
          </div>
        )}
      </div>
      {/* EDIT PROPERTY */}
      {isVisible && (
        <EditProperty property={ selectedProperty } onClose={()=>setIsVisible(false)} prId={pr_id} ></EditProperty>
      )}
    </>
  )
}

export default PreviewProperty