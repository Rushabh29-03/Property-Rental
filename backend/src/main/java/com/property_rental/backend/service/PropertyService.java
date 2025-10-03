package com.property_rental.backend.service;

import com.property_rental.backend.dtos.PropertyDto;
import com.property_rental.backend.entities.Property;
import com.property_rental.backend.repositories.PropertyRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.NoSuchElementException;
import java.util.Optional;

@Service
public class PropertyService {

    private final PropertyRepository propertyRepository;

    public PropertyService(PropertyRepository propertyRepository) {
        this.propertyRepository = propertyRepository;
    }

    public Property findPropertyById(int id){
        return propertyRepository.findById(id).orElse(null);
    }

    @Transactional
    public void deleteById(int propertyId){
        propertyRepository.deleteById(propertyId);
    }

    @Transactional
    public PropertyDto updateProperty(PropertyDto propertyDto, int propertyId){

//        check if received property is in database
        Property property=propertyRepository.findById(propertyId).orElseThrow(
                ()->new NoSuchElementException("Property not found")
        );

//        update property
//        ASSUMING I WONT RECEIVE NULL VALUE OF ANY DATA FROM FRONTEND
        property.setAddress(propertyDto.getAddress());
        property.setDescription(propertyDto.getDescription());
        property.setArea(propertyDto.getArea());
        property.setAreaUnit(propertyDto.getAreaUnit()!=null ? propertyDto.getAreaUnit() : property.getAreaUnit());
        property.setMonthlyRent(propertyDto.getMonthlyRent());
        property.setNoOfBedrooms(propertyDto.getNoOfBedrooms());
        property.setSecurityDepositAmount(propertyDto.getSecurityDepositAmount());
        property.setPhotoList(propertyDto.getPhotoList()!=null ? propertyDto.getPhotoList() : property.getPhotoList());

        Property updatedProperty = propertyRepository.save(property);
        return new PropertyDto(updatedProperty);
    }

    public boolean isRented(int propertyId){
        return true;
    }
}
