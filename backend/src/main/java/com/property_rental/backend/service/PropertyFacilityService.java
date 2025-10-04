package com.property_rental.backend.service;

import com.property_rental.backend.dtos.PropertyFacilityDto;
import com.property_rental.backend.entities.Facility;
import com.property_rental.backend.entities.Property;
import com.property_rental.backend.entities.PropertyFacility;
import com.property_rental.backend.entities.PropertyFacilityId;
import com.property_rental.backend.repositories.FacilityRepository;
import com.property_rental.backend.repositories.PropertyFacilityRepository;
import com.property_rental.backend.repositories.PropertyRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.NoSuchElementException;
import java.util.Optional;

@Service
public class PropertyFacilityService {

    private final PropertyRepository propertyRepository;
    private final FacilityRepository facilityRepository;
    private final PropertyFacilityRepository propertyFacilityRepository;

    public PropertyFacilityService(
            PropertyRepository propertyRepository,
            FacilityRepository facilityRepository,
            PropertyFacilityRepository propertyFacilityRepository
    ) {
        this.propertyRepository = propertyRepository;
        this.facilityRepository = facilityRepository;
        this.propertyFacilityRepository = propertyFacilityRepository;
    }


    @Transactional
    public PropertyFacility addFacilityToProperty(String facName, String description, int propertyId){

        Property property = propertyRepository.findById(propertyId).orElseThrow(
                ()-> new NoSuchElementException("Property not found with id: "+propertyId)
        );
        Facility facility = facilityRepository.findByFacName(facName);

//        IT WILL CREATE NEW FACILITY IF FACILITY NOW AVAILABLE
        if(facility==null){
            facility = facilityRepository.save(new Facility(facName));
        }

//        create composite key
        PropertyFacilityId id = new PropertyFacilityId();
        id.setPropertyId(propertyId);
        id.setFacilityId(facility.getId());

//        check if relation already exists
        if(propertyFacilityRepository.existsById(id)){
            throw new IllegalStateException(String.format(
                    "Property with id %d already have facility '%s'", propertyId, facName
            ));
        }

//        create the join entity instance
        PropertyFacility propertyFacility = new PropertyFacility();
        propertyFacility.setId(id);
        propertyFacility.setProperty(property);
        propertyFacility.setFacility(facility);
        propertyFacility.setDescription(description);

//        save the new join relationship
        return propertyFacilityRepository.save(propertyFacility);
    }

    public List<PropertyFacilityDto> getFacilitiesByPropertyId(int propertyId){

        Property property = propertyRepository.findById(propertyId).orElseThrow(
                ()-> new NoSuchElementException("Property not found with id: "+propertyId)
        );

        return property.getPropertyFacilities();
    }
}
