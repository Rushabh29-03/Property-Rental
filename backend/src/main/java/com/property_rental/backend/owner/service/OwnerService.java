package com.property_rental.backend.owner.service;

import com.property_rental.backend.property.entities.Property;
import com.property_rental.backend.property.repository.PropertyRepository;
import com.property_rental.backend.user.entities.User;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class OwnerService {

    private final PropertyRepository propertyRepository;

    public OwnerService(PropertyRepository propertyRepository) {
        this.propertyRepository = propertyRepository;
    }

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
