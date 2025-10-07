import React from 'react'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import PropertyService from '../../services/PropertyService'
import AuthService from '../../services/AuthService'

function EditProperty( {property, onClose, prId} ) {

    // used to take input from html form
    const [description, setDescription] = useState(property.description ? property.description : "")
    const [address, setAddress] = useState(property.address)
    const [area, setArea] = useState(property.area)
    const [areaUnit, setAreaUnit] = useState(property.areaUnit)
    const [monthlyRent, setMonthlyRent] = useState(property.monthlyRent)
    const [noOfBedrooms, setNoOfBedrooms] = useState(property.noOfBedrooms ? property.noOfBedrooms : 0)
    const [securityDeposit, setSecurityDeposit] = useState(property.securityDepositAmount ? property.securityDepositAmount : 0.0)
    const [photoFile, setPhotoFile] = useState(property.photoFile)

    const navigate = useNavigate();

    let propertyData = {
        "description":description,
        "address":address,
        "area":area,
        "areaUnit":areaUnit,
        "monthlyRent":monthlyRent,
        "noOfBedrooms":noOfBedrooms,
        "securityDepositAmount":securityDeposit,
        "photoFile":photoFile
    }

    let inputClassName = "mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"

    // !EDIT PROPERTY
    const handleEditProperty = async(e)=>{
        e.preventDefault();

        console.log("Sending data");
        console.log(propertyData);
        
        
        try{
            const response = await PropertyService.editProperty(propertyData, prId);
        
            if(response){
                switch (AuthService.getCurrentUser().role) {
                    case 'ROLE_OWNER':
                        navigate('/owner-dashboard')
                        break;
                    default:
                        navigate('/properties')
                        break;
                }
            }
        } catch(error){
            console.error(error);
        }
    }
    
  return (
    <div className='fixed w-350 h-fit top-1/2 left-1/2 -translate-1/2 rounded-2xl p-4 bg-gray-500 shadow-2xl opacity-95'>
        <div className="flex items-center justify-center bg-gray-500 p-4">
            <div className="w-full max-w-lg p-8 space-y-6 bg-white rounded-xl shadow-2xl">
            <h2 className="text-3xl font-extrabold text-center text-gray-900">
                Edit Property
            </h2>

            <form className="space-y-4">

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
                <label htmlFor="area" className="block text-sm font-medium text-gray-700">area<span className='text-red-700'>*</span></label>
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
                    <label htmlFor="newareaUnit" className="block text-sm font-medium text-gray-700">Area unit</label>
                    <select 
                    className={`${inputClassName}`} 
                    id="areaUnit" 
                    value={areaUnit}
                    onChange={(e)=>setAreaUnit(e.target.value)}>
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

                <div className="flex gap-3">
                        <button 
                        type="button"
                        onClick={onClose}
                        className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-base font-medium 
                            text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 
                            focus:ring-offset-2 focus:ring-red-500 transition duration-150"
                    >
                        Cancel
                    </button>
                    <button 
                        onClick={handleEditProperty}
                        className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-base font-medium 
                            text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 
                            focus:ring-offset-2 focus:ring-indigo-500 transition duration-150"
                    >
                        Save
                    </button>
                </div>
            </form>
            </div>
        </div>
    </div>
  )
}

export default EditProperty