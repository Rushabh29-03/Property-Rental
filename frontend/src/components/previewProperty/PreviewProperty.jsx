import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router'
import { useProperty } from '../customHooks/PropertyContext'
import OwnerService from '../../services/OwnerService';
import AuthService from '../../services/AuthService';
import PropertyService from '../../services/PropertyService';
import { Link } from 'react-router';
import EditProperty from '../editProperty/EditProperty';

function PreviewProperty() {

  const { selectedProperty, setSelectedProperty } = useProperty();
  const { pr_id } = useParams();
  const role = AuthService.getCurrentUser().role;

  // manage loading/error during fallback fetch
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isVisible, setIsVisible] = useState(false)

  // navigate hook
  const navigate = useNavigate()

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

  useEffect(() => {
    // 1. Only run the fetch if context data is missing AND we have an ID
    if (!selectedProperty && pr_id) {
      setLoading(true);
      
      const fetchProperty = async () => {
        try {
          // Use the new service function to fetch the property by ID
          const data = await PropertyService.getPropertyById(pr_id);
          
          // 2. Set the fetched data back into the context
          setSelectedProperty(data); 
          console.log(data);
          
          setLoading(false);
          
        } catch (err) {
          console.error("Context data missing. Fetching property with ID:", pr_id, err);
          setError("Failed to load property details. It may not exist or an API error occurred.");
          setLoading(false);
        }
      };

      fetchProperty();
    }

    if(document.getElementById('preview-property-body')){
      if(isVisible){
        document.body.style.overflow='hidden'
        document.getElementById('preview-property-body').style.pointerEvents='none'
        document.getElementById('preview-property-body').style.userSelect='none'
      } 
      else{
        document.body.style.overflow='unset'
        document.getElementById('preview-property-body').style.pointerEvents='unset'
      }
    }
  }, [selectedProperty, pr_id, setSelectedProperty, isVisible]); 

  
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
      <div id='preview-property-body' className="p-6 min-h-screen bg-gray-100">
        {
          (role==='ROLE_OWNER'
            ? (<Link to='/owner-dashboard' className='text-blue-500'>{'<'}Go Back</Link>)
            : (<Link to='/properties' className=''>{'<'}Go Back to properties</Link>)
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
            <button className="outline-2 p-2 rounded"
              onClick={()=>setIsVisible(true)}
            >
              Edit Property
            </button>
            <button onClick={handleDeleteProperty} className="outline-2 p-2 rounded ">
              Delete Property
            </button>
            <button className="outline-2 p-2 rounded ">
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