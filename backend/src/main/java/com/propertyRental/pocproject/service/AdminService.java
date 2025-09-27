package com.propertyRental.pocproject.service;

import com.propertyRental.pocproject.config.AppConfig;
import com.propertyRental.pocproject.entity.Admin;
import com.propertyRental.pocproject.repository.AdminRepository;
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
