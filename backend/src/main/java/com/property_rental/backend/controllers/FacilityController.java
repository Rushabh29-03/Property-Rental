package com.property_rental.backend.controllers;

import com.property_rental.backend.dtos.FacilityDto;
import com.property_rental.backend.entities.Facility;
import com.property_rental.backend.service.FacilityService;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/facility")
public class FacilityController {

    private final FacilityService facilityService;

    public FacilityController(FacilityService facilityService) {
        this.facilityService = facilityService;
    }

    @PostMapping("/addNewFacility")
    @PreAuthorize("hasAnyRole('ADMIN', 'OWNER')")
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

    @GetMapping("/getAllFacilities")
    public ResponseEntity<?> getAllFacilities() {
        Map<String, Object> response = new HashMap<>();
        try {
            List<FacilityDto> facilityList = facilityService.getAllFacilities();
            response.put("message", "all facilities fetched successfully");
            response.put("facilityList", facilityList);
            return new ResponseEntity<>(facilityList, HttpStatus.OK);
        } catch (Exception e) {
            response.put("errMessage", e.getMessage());
            return new ResponseEntity<>(response, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
