package com.property_rental.backend.service;

import com.property_rental.backend.entities.Property;
import com.property_rental.backend.repositories.PropertyRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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

    public boolean isRented(int propertyId){
        return true;
    }
}
