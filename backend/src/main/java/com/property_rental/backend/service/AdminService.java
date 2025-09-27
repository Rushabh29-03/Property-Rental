package com.property_rental.backend.service;

import com.property_rental.backend.config.AppConfig;
import com.property_rental.backend.entities.Admin;
import com.property_rental.backend.repositories.AdminRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AdminService {

    @Autowired
    private AdminRepository adminRepository;

    @Autowired
    private AppConfig appConfig;

    @Transactional
    public Admin registerAdmin(Admin admin){
        admin.setPassword(appConfig.passwordEncoder().encode(admin.getPassword()));

        return adminRepository.save(admin);
    }
}
