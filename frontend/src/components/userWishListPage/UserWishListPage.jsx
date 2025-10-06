import React, { useEffect, useState } from 'react'
import UserService from '../../services/UserService';
import { useNavigate } from 'react-router';

function UserWishListPage() {

    // loading state
    const [loading, setLoading] = useState(true);

    // usestates
    const [wishListedProperties, setWishListedProperties] = useState([])

    // navigate hook
    const navigate = useNavigate();

    // !GET WISHLISTED PROPERTIES
    const getWishListed = async()=> {
        const response = await UserService.getWishListedProperties();

        if(response){                    
            setWishListedProperties(response.wishListedProperties ? response.wishListedProperties : [])
            setLoading(false)
        } else{
            console.log("Med no padyo");
        }
    }

    // !HANDLE NAVIGATE
    const handleNavigate = (pr_id)=>{
        navigate(`/property/${pr_id}`, {
            state:{
                isWishListedProp : true
            }
        });
    }

    useEffect(()=>{
        getWishListed();
    }, [setWishListedProperties]);

    if(loading){
        return <div className="p-6 text-center text-blue-600">Loading property details...</div>
    }

  return (
    <>
        <div className='dashboard-container min-h-screen p-4 bg-gray-500'>
            <div className='property-wrap flex flex-wrap gap-5'>
                {wishListedProperties.length === 0
                    ? (<p className='w-full text-center text-white'>No properties added yet.</p>)
                    : (
                        wishListedProperties.map((property, index) => (
                        <div
                            onClick={()=>handleNavigate(property.propertyDto.id)}
                            key={index}
                            className={`property-box bg-gray-100 p-5 rounded-xl shadow-2xl outline-2 w-lg min-w-3xs transition duration-300 ease-in-out 
                                hover:scale-103
                                hover:rounded-2xl
                                ${property.propertyDto.isVerified ? 'hover:bg-green-100' : 'hover:bg-red-100'}`}
                            >
                            <h3 className='text-xl font-bold'>{property.propertyDto.address}</h3>
                            <p><strong>Rent:</strong> ₹{property.propertyDto.monthlyRent}</p>
                            <p><strong>Bedrooms:</strong> {property.propertyDto.noOfBedrooms}</p>
                            <p><strong>Area:</strong> {property.propertyDto.area} {property.propertyDto.areaUnit}</p>
                            <p className={`text-sm ${property.propertyDto.isVerified ? 'text-green-600' : 'text-red-600'}`}>
                                {property.propertyDto.isVerified ? 'Verified Listing' : 'Verification Pending'}
                            </p>
                            <p className='text-sm mt-2 text-gray-600 truncate'>{property.propertyDto.description}</p>
                            <p><strong>Note: </strong>'{property.note}'</p>
                        </div>
                        ))
                    )
                }
            </div>
        </div>
    </>
  )
}

export default UserWishListPage