package com.property_rental.backend.controllers;

import com.property_rental.backend.entities.Facility;
import com.property_rental.backend.service.FacilityService;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/facility")
@PreAuthorize("haxAnyRole('ADMIN', 'OWNER')")
public class FacilityController {

    private final FacilityService facilityService;

    public FacilityController(FacilityService facilityService) {
        this.facilityService = facilityService;
    }

    @PostMapping("/addNewFacility")
    public ResponseEntity<?> addNewFacility(@RequestBody Facility facility){
        Map<String, Object> response = new HashMap<>();
        Authentication authentication= SecurityContextHolder.getContext().getAuthentication();
        String role = authentication.getAuthorities().toArray()[0].toString();
        if(role.equals("ROLE_USER")){
            response.put("errMessage", "Access Denied!! you don't have access to add facilities");
            return new ResponseEntity<>(response, HttpStatus.FORBIDDEN);
        }
        try {
            facility.setFacName(facility.getFacName().toLowerCase());
            Facility createdFacility = facilityService.createFacility(facility);
            response.put("message", "Facility added successfully");
            response.put("added facility", createdFacility);
            return new ResponseEntity<>(response, HttpStatus.CREATED);
        } catch (Exception e) {
            response.put("errMessage", e.getMessage());
            return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
        }
    }
}
