package com.property_rental.backend.admin.service;

import com.property_rental.backend.admin.repository.AdminRepository;
import com.property_rental.backend.auth.security.JwtHelper;
import com.property_rental.backend.core.config.AppConfig;
import com.property_rental.backend.property.dtos.PropertyDto;
import com.property_rental.backend.property.entities.Property;
import com.property_rental.backend.property.repository.PropertyRepository;
import com.property_rental.backend.admin.entities.Admin;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.NoSuchElementException;

@Service
public class AdminService {

    private final AdminRepository adminRepository;
    private final AppConfig appConfig;
    private final PropertyRepository propertyRepository;
    private final JwtHelper jwtHelper;

    public AdminService(AdminRepository adminRepository, AppConfig appConfig, PropertyRepository propertyRepository, JwtHelper jwtHelper) {
        this.adminRepository = adminRepository;
        this.appConfig = appConfig;
        this.propertyRepository = propertyRepository;
        this.jwtHelper = jwtHelper;
    }

    @Transactional
    public Admin registerAdmin(Admin admin){
        admin.setPassword(appConfig.passwordEncoder().encode(admin.getPassword()));

        return adminRepository.save(admin);
    }

    @Transactional
    public void addRefreshTokenToAdmin(String username, String refreshToken) {
        Admin admin = adminRepository.findByUserName(username).orElseThrow(
                ()-> new UsernameNotFoundException("Admin not found in admin table")
        );

        admin.setRefreshToken(refreshToken);
        admin.setExpiryDate(jwtHelper.getExpirationDateFromToken(refreshToken).toInstant());

        adminRepository.save(admin);
    }

    public Admin getRefreshTokenFromAdmin(String username) {

        return adminRepository.findByUserName(username).orElseThrow(
                ()-> new UsernameNotFoundException("Admin not found in admin table while getting token")
        );
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
