package com.property_rental.backend.propertyFacility.service;

import com.property_rental.backend.facility.entities.Facility;
import com.property_rental.backend.property.entities.Property;
import com.property_rental.backend.facility.repository.FacilityRepository;
import com.property_rental.backend.property.repository.PropertyRepository;
import com.property_rental.backend.propertyFacility.entities.PropertyFacilityId;
import com.property_rental.backend.propertyFacility.repository.PropertyFacilityRepository;
import com.property_rental.backend.propertyFacility.dtos.PropertyFacilityDto;
import com.property_rental.backend.propertyFacility.entities.PropertyFacility;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.NoSuchElementException;

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
        Facility facility = facilityRepository.findByFacName(facName).orElse(null);

//        IT WILL CREATE NEW FACILITY IF FACILITY IS NOT AVAILABLE
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

    @Transactional
    public void removeFacilityFromProperty(String username, String facName, int propertyId){

        Property property = propertyRepository.findById(propertyId).orElseThrow(
                ()-> new NoSuchElementException("Property not found with id: "+propertyId)
        );

        System.out.println(username);

        if(! property.getOwner().getUserName().equals(username) && ! username.equals("jordan")){
            throw new IllegalArgumentException("Access denied, you're not owner/admin of this property.");
        }

        Facility facility = facilityRepository.findByFacName(facName).orElseThrow(
                ()-> new IllegalStateException(String.format(
                        "Property eith id %d don't have any facility '%s'", propertyId, facName
                ))
        );

//        create composite key
        PropertyFacilityId id = new PropertyFacilityId();
        id.setPropertyId(propertyId);
        id.setFacilityId(facility.getId());

        propertyFacilityRepository.deleteById(id);
    }
}
