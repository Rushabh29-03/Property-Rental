package com.property_rental.backend.controllers;

import com.property_rental.backend.dtos.PropertyFacilityDto;
import com.property_rental.backend.entities.PropertyFacility;
import com.property_rental.backend.service.PropertyFacilityService;
import lombok.Getter;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.NoSuchElementException;

@RestController
@RequestMapping("/propFacility")
@PreAuthorize("hasAnyRole('ADMIN', 'OWNER')")
public class PropertyFacilityController {

    private final PropertyFacilityService propertyFacilityService;

    public PropertyFacilityController(PropertyFacilityService propertyFacilityService) {
        this.propertyFacilityService = propertyFacilityService;
    }


//    IT WILL CREATE FACILITY IF NOT FOUND AND ADD TO PROPERTY
    @PostMapping("/addFacility/{propertyId}")
    public ResponseEntity<?> addFacilityToProperty(
            @PathVariable int propertyId,
            @RequestBody PropertyFacilityDto propertyFacilityDto
            ){
        try {
            PropertyFacility propertyFacility = propertyFacilityService.addFacilityToProperty(
                    propertyFacilityDto.getFacName().toLowerCase(), // converting fac_name to lowercase to avoid issues
                    propertyFacilityDto.getDescription(),
                    propertyId
            );

            PropertyFacilityDto addedPropertyFacility = new PropertyFacilityDto(propertyFacility);

            return new ResponseEntity<>(addedPropertyFacility, HttpStatus.CREATED);
        } catch (IllegalStateException e){
            return new ResponseEntity<>(e.getMessage(), HttpStatus.CONFLICT);
        } catch (Exception e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
