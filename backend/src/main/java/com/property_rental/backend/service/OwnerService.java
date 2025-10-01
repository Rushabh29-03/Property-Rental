package com.property_rental.backend.service;

import com.property_rental.backend.entities.Property;
import com.property_rental.backend.entities.User;
import com.property_rental.backend.repositories.PropertyRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
public class OwnerService {

    @Autowired
    private PropertyRepository propertyRepository;

    @Transactional
    public Property addProperty(Property property, User owner){
        if(owner==null){
            throw new IllegalArgumentException("Owner cannot be null while adding property.");
        }
        owner.add(property);

        return propertyRepository.save(property);
    }

    @Transactional
    public void deleteById(int propertyId){
        propertyRepository.deleteById(propertyId);
    }
}
