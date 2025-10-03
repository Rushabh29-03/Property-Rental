package com.property_rental.backend.service;

import com.property_rental.backend.config.AppConfig;
import com.property_rental.backend.dtos.PropertyDto;
import com.property_rental.backend.entities.Admin;
import com.property_rental.backend.entities.Property;
import com.property_rental.backend.repositories.AdminRepository;
import com.property_rental.backend.repositories.PropertyRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.NoSuchElementException;

@Service
public class AdminService {

    private final AdminRepository adminRepository;

    private final AppConfig appConfig;

    private final PropertyRepository propertyRepository;

    public AdminService(
            AdminRepository adminRepository,
            AppConfig appConfig,
            PropertyRepository propertyRepository
    ){
        this.adminRepository=adminRepository;
        this.appConfig=appConfig;
        this.propertyRepository=propertyRepository;
    }

    @Transactional
    public Admin registerAdmin(Admin admin){
        admin.setPassword(appConfig.passwordEncoder().encode(admin.getPassword()));

        return adminRepository.save(admin);
    }

    @Transactional
    public PropertyDto toggleVerifyPropertyById(int propertyId){
        Property property= propertyRepository.findById(propertyId).orElseThrow(
                ()-> new NoSuchElementException("Property not found with id: "+propertyId)
        );

        property.setIsVerified(!property.getIsVerified());

        Property updatedProperty = propertyRepository.save(property);

        return new PropertyDto(updatedProperty);
    }
}
