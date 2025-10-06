import React, { useEffect, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router'
import AuthService from '../../services/AuthService';
import PropertyService from '../../services/PropertyService';
import { Link } from 'react-router';
import EditProperty from '../editProperty/EditProperty';
import AdminService from '../../services/AdminService';
import UserService from '../../services/UserService';

function PreviewProperty() {

  // navigate and Location hook
  const navigate = useNavigate();
  const location = useLocation();

  const [selectedProperty, setSelectedProperty] = useState(null)
  const { pr_id } = useParams();
  const role = AuthService.getCurrentUser().role; // 'ROLE_ADMIN'  

  // manage loading/error during fallback fetch
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isVisible, setIsVisible] = useState(false)

  // rules data state
  const [address, setAddress] = useState("")
  const [area, setArea] = useState(0.0)
  const [monthlyRent, setMonthlyRent] = useState(0.0)
  const [minStay, setMinStay] = useState(0)
  const [petsPolicy, setPetsPolicy] = useState(null)
  const [isSmokingAllowed, setIsSmokingAllowed] = useState(false)
  const [otherRules, setOtherRules] = useState(null)
  const [verified, setVerified] = useState(false)

  // facilities state
  const [facilities, setFacilities] = useState([])
  const [facilityLoaded, setFacilityLoaded] = useState(false)

  // wishlist state
  const [note, setNote] = useState("EE haloo")
  const isWishListed = location.state?.isWishListedProp

  // html classes
  let inputClassName='px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm'

  let buttonClassName ="outline-2 outline-black p-2 rounded cursor-pointer bg-blue-500 shadow-gray-700 shadow-2xl hover:bg-blue-600"

  // property rule data to send
  let propertyRulesData = {
    "address": address,
    "area": area,
    "monthlyRent": monthlyRent,
    "minStay": minStay,
    "petsPolicy": petsPolicy,
    "smokingAllowed": isSmokingAllowed,
    "otherRules": otherRules
  }

  // wishlist property data to send
  let wishListData = {
    "note": note
  }

  // !GET PROPERTY BY ID
  const handleGetPropertyById = async(prId)=>{

    const response = await PropertyService.getPropertyById(prId);
    
    if(response){
      setSelectedProperty(response);
    } else{
      setSelectedProperty([])
    }

    // console.log("getPropertyById: ", response);
  }

  // !EDIT PROPERTY RULES
  const handleEditPropertyRules = async(e)=>{
    e.preventDefault();

    console.log("Sending data: ", propertyRulesData);
    
    const resposne = await PropertyService.editProperty(propertyRulesData, pr_id);

    if(resposne){
      alert('Property updated');
      switch (AuthService.getCurrentUser().role) {
        case 'ROLE_OWNER':
          navigate('/owner-dashboard')
          break;
      
        default:
          navigate('/properties')
          break;
      }
    }
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

  // !TOGGLE VERIFY
  const handleToggleVerify = async(e)=>{
    e.preventDefault();

    const response = await AdminService.toggleVerifiedStatus(pr_id);
    if(response){
      navigate('/properties')
    }
  }

  // !GET FACILITIES HANDLER
  const getFacilitiesHandler = async(e)=>{
    e.preventDefault();

    if(facilities.length===0){
      const response = await PropertyService.getPropertyFacilities(pr_id);
      if(response){
        setFacilities(response);
        setFacilityLoaded(true);
      }else{
        console.log("no med pdyo");
      }
    }
  }

  // !HANDLE ADD WISHLIST
  const handleAddWishlist = async(e) => {
    e.preventDefault();
    const response = await UserService.addWishList(pr_id, wishListData);
    if(response){
      alert(response.message)
      navigate('/wishList')
    }
  }

  // !HANDLE REMOVE WISHLIST
  const handleRemoveWishlist = async(e) => {
    e.preventDefault();
    const response = await UserService.removeWishListedProperty(pr_id);
    if(response){
      alert(response.message)
      navigate('/wishList');
    }
  }

  // !USE-EFFECT 1 - fetching property
  useEffect(() => {

    const userId = AuthService.getCurrentUser()?.username;
    if(userId){
      handleGetPropertyById(pr_id);
    } else{
        setSelectedProperty(null)
    }
  }, [pr_id]); 


  // !USE-EFFECT 2 - scroll controll
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

  // !USE-EFFECT 3 - update states
  useEffect(() => {
      if (selectedProperty) {
          // Use property data to set the local state for editing
          setAddress(selectedProperty.address || '')
          setArea(selectedProperty.area || 0.0)
          setMonthlyRent(selectedProperty.monthlyRent || 0.0)
          setMinStay(selectedProperty.minStay || 0)
          setPetsPolicy(selectedProperty.petsPolicy || null)
          setIsSmokingAllowed(selectedProperty.smokingAllowed || false) 
          setOtherRules(selectedProperty.otherRules || null)
          setVerified(selectedProperty.isVerified || false)
      }
  }, [selectedProperty]);

  
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

        <br />
        <br />

        {/* MINIMUM STAY */}
        <h1 className='text-xl font-bold mb-4'>Rules</h1>
        <div>
          <p className="mb-2">
            <strong>Minimum stay (months): </strong> 
            <input 
              type='number' 
              min={0} max={36} 
              value={minStay}
              onChange={(e)=>setMinStay(e.target.value)}
              className={`${inputClassName}`}
              required
              disabled={role==='ROLE_USER' ? true : false}
            />
          </p>
        </div>

        {/* PETS POLICY */}
        <div>
          <p className="mb-2">
            <strong>Pets policy: </strong> 
            <input 
              type='text' 
              value={petsPolicy || ''} 
              onChange={(e)=>setPetsPolicy(e.target.value)}
              className={`${inputClassName}`}
              disabled={role==='ROLE_USER' ? true : false}
            />
          </p>
        </div>

        {/* SMOKING ALLOWED FLAG */}
        <div>
          <p className="mb-2">
            <label htmlFor="isSmokingAllowed"><strong>Smoking allowed: </strong></label>

            {/* show when user */}
            {role==='ROLE_USER' && (
              <input type="text" 
                value={isSmokingAllowed ? 'Yes' : 'No'}
                id='isSmokingAllowed'
                className={`${inputClassName}`}
                disabled={role==='ROLE_USER' ? true : false}
              />
            )}
            
            {/* show when not user */}
            {role!=='ROLE_USER' && (
              <input 
                type='checkbox' 
                checked={isSmokingAllowed}
                onChange={(e) => setIsSmokingAllowed(e.target.checked)}
                id='isSmokingAllowed' 
                className={`${inputClassName}`}
                disabled={role==='ROLE_USER' ? true : false}
              />
            )}
          </p>
        </div>

        {/* OTHER RULES */}
        <div>
          <p className="mb-2">
            <strong>Other Rules: </strong> 
            <input 
              type='text' 
              value={otherRules || ''} 
              onChange={(e)=>setOtherRules(e.target.value)}
              className={`${inputClassName}`}
              disabled={role==='ROLE_USER' ? true : false}
            />
          </p>
        </div>
        
        {/* show only when its not user */}
        <button onClick={handleEditPropertyRules}
          className={`${role==='ROLE_USER' ? 'hidden' : ''} outline-2 outline-black p-2 rounded cursor-pointer bg-blue-500 shadow-gray-700 shadow-2xl hover:bg-blue-600`}
        >
          Update property rules
        </button>

        <br /><br />
        {/* GET FACILITIES */}
        <button className={`${buttonClassName}`} onClick={(e)=>getFacilitiesHandler(e)}>Get Facilities</button>

        {facilities && facilities.length === 0
          ? (<p>{facilityLoaded ? "No facility." : ""}</p>)
          : (
            facilities.map((facility) => (
              <li className='ml-4' key={facility.facName}>
                <strong>{facility.facName}: </strong>
                {facility.description}
              </li>
            ))
          )
        }

        <br /><br />
        {/* VERIFY PROPERTY */}
        {(role==='ROLE_ADMIN') && (
          <div>
            <p className="mb-2">
              <label htmlFor="verify"><strong>Verify: </strong></label> 
              <input 
                type='checkbox' 
                checked={verified}
                onChange={(e) => {
                  setVerified(e.target.checked);                
                  return handleToggleVerify(e);
                }}
                id='verify' 
                className={`${inputClassName}`}
              />
            </p>
          </div>
        )}

        <br />
        {/* WISHLIST PROPERTY */}
        {(role==='ROLE_USER') && (isWishListed)
         ? (
          <button onClick={(e)=>handleRemoveWishlist(e)} className={`${buttonClassName}`}>Remove from Wishlist</button>
         )
         : (
          <button onClick={(e)=>handleAddWishlist(e)} className={`${buttonClassName}`}>Add to WishList</button>
         )
        }

        {/* Action Buttons */}
        <div className='fixed top-9/10 left-17/20'>
          {(role==='ROLE_ADMIN' || role==='ROLE_OWNER') && (
            <div className="flex space-x-4 mt-6">
              <button onClick={()=>setIsVisible(true)}
              className="outline-2 outline-black p-2 rounded cursor-pointer bg-blue-500 shadow-gray-700 shadow-2xl hover:bg-blue-600"
              >
                Edit Property
              </button>
              <button onClick={handleDeleteProperty} 
              className="outline-2 outline-black p-2 rounded cursor-pointer bg-red-500 shadow-gray-500 shadow-2xl hover:bg-red-600 text-white">
                Delete Property
              </button>
            </div>
          )}
        </div>
      </div>
      {/* EDIT PROPERTY */}
      {isVisible && (
        <EditProperty property={ selectedProperty } onClose={()=>setIsVisible(false)} prId={pr_id} ></EditProperty>
      )}
    </>
  )
}

export default PreviewProperty