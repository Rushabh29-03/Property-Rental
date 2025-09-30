import { createContext, useContext, useMemo, useState } from "react";
import { useNavigate } from "react-router";


// context object
const PropertyContext = createContext(null);

// custom hook
export const useProperty = ()=>{
    const context=useContext(PropertyContext);
    if(!context)
        throw new Error('use useProperty within a PropertyProvider')
    return context;
}

// provider component
export const PropertyProvider = ({ children })=>{
    const [selectedProperty, setSelectedProperty] = useState(null);
    const navigate=useNavigate();

    // call when property card is clicked
    const handlePropertyClick = (propertyData)=>{
        setSelectedProperty(propertyData);
        navigate(`/property/${propertyData.id}`)
    };

    const contextValue = useMemo(()=>{
        return {
            selectedProperty, 
            handlePropertyClick,
            setSelectedProperty
        };
    }, [selectedProperty]);

    return(
        <PropertyContext.Provider value={contextValue}>
            {children}
        </PropertyContext.Provider>
    )
}