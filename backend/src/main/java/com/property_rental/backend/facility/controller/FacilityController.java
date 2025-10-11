package com.property_rental.backend.facility.controller;

import com.property_rental.backend.facility.service.FacilityService;
import com.property_rental.backend.facility.dtos.FacilityDto;
import com.property_rental.backend.facility.entities.Facility;
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

    // GET ALL FACILITIES - accessible to all authenticated users
    @GetMapping("/getAllFacilities")
    public ResponseEntity<?> getAllFacilities() {
        try {
            List<FacilityDto> facilities = facilityService.getAllFacilities();
            return new ResponseEntity<>(facilities, HttpStatus.OK);
        } catch (Exception e) {
            Map<String, String> response = new HashMap<>();
            response.put("errMessage", "Error fetching facilities");
            response.put("detailError", e.getMessage());
            return new ResponseEntity<>(response, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // CREATE NEW FACILITY - only ADMIN and OWNER can create facilities
    @PostMapping("/createFacility")
    @PreAuthorize("hasAnyRole('ADMIN', 'OWNER')")
    public ResponseEntity<?> createFacility(@RequestBody Facility facility) {
        Map<String, Object> response = new HashMap<>();
        try {
            // Convert facility name to lowercase to maintain consistency
            facility.setFacName(facility.getFacName().toLowerCase());

            Facility createdFacility = facilityService.createFacility(facility);
            response.put("message", "Facility created successfully");
            response.put("facility", new FacilityDto(createdFacility));
            return new ResponseEntity<>(response, HttpStatus.CREATED);
        } catch (Exception e) {
            response.put("errMessage", "Error creating facility");
            response.put("detailError", e.getMessage());
            return new ResponseEntity<>(response, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}