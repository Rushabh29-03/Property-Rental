import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router'
import { useProperty } from '../customHooks/PropertyContext'
import OwnerService from '../../services/OwnerService';

function PreviewProperty() {

  const { selectedProperty, setSelectedProperty } = useProperty();
  const { pr_id } = useParams();

  // New local state to manage loading/error during fallback fetch
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // 1. Only run the fetch if context data is missing AND we have an ID
    if (!selectedProperty && pr_id) {
      setLoading(true);
      
      const fetchProperty = async () => {
        try {
          // Use the new service function to fetch the property by ID
          const data = await OwnerService.getPropertyById(pr_id); 
          
          // 2. Set the fetched data back into the context
          setSelectedProperty(data); 
          
          setLoading(false);
          
        } catch (err) {
          console.error("Context data missing. Fetching property with ID:", pr_id, err);
          setError("Failed to load property details. It may not exist or an API error occurred.");
          setLoading(false);
        }
      };

      fetchProperty();
    }
  }, [selectedProperty, pr_id, setSelectedProperty]); // Dependency array

  // --- RENDERING LOGIC ---
  
  // 3. Handle loading state
  if (loading) {
    return <div className="p-6 text-center text-blue-600">Loading property details...</div>
  }

  // 4. Handle error state
  if (error) {
    return <div className="p-6 text-center text-red-600">{error}</div>
  }

  // 5. Use the data from context (now guaranteed to be available or loading/error states would have returned)
  if (!selectedProperty) {
      // This state should be hit only if the ID is missing, but still safe to check
      return <div className="p-6 text-center text-gray-500">Property ID is missing from the URL.</div>
  }


  // Use selectedProperty to display all data
  return (
    <div className="p-6">
        <h1 className="text-3xl font-bold mb-4">{selectedProperty.address}</h1>
        
        <p className="mb-2"><strong>Description:</strong> {selectedProperty.description}</p>
        <p className="mb-2"><strong>Area:</strong> {selectedProperty.area} {selectedProperty.areaUnit}</p>
        <p className="mb-4"><strong>Rent:</strong> ₹{selectedProperty.monthlyRent} / month</p>
        <p className="mb-4"><strong>Bedrooms:</strong> {selectedProperty.noOfBedrooms}</p>


        {/* Action Buttons */}
        <div className="flex space-x-4 mt-6">
            <button className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600">
                Edit Property
            </button>
            <button className="bg-red-500 text-white p-2 rounded hover:bg-red-600">
                Delete Property
            </button>
            <button className="bg-green-500 text-white p-2 rounded hover:bg-green-600">
                Add Facilities & Rules
            </button>
        </div>
    </div>
  )
}

export default PreviewProperty