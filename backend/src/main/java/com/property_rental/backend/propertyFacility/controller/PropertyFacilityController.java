package com.property_rental.backend.propertyFacility.controller;

import com.property_rental.backend.facility.entities.Facility;
import com.property_rental.backend.propertyFacility.dtos.PropertyFacilityDto;
import com.property_rental.backend.propertyFacility.service.PropertyFacilityService;
import com.property_rental.backend.propertyFacility.entities.PropertyFacility;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
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


//    IT WILL CREATE FACILITY IF NOT FOUND, AND ADD TO PROPERTY
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

    @DeleteMapping("deletePropFacility/{propertyId}")
    public ResponseEntity<?> deleteFacilityFromPropertyById(@PathVariable int propertyId, @RequestBody Facility facility){
        Map<String, Object> response = new HashMap<>();
        try {
//            get signed-in user
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            String role = authentication.getAuthorities().toArray()[0].toString();

            if(role.equals("ROLE_USER")){
                response.put("errMessage", "Only admin or owner can delete a property facility");
                return new ResponseEntity<>(response, HttpStatus.FORBIDDEN);
            }

            propertyFacilityService.removeFacilityFromProperty(authentication.getName(), facility.getFacName(), propertyId);
            response.put("message", "Facility deleted successfully from property: "+propertyId);
            return new ResponseEntity<>(response, HttpStatus.OK);
        } catch (NoSuchElementException e){
            response.put("errMessage", e.getMessage());
            return new ResponseEntity<>(response, HttpStatus.NOT_FOUND);
        } catch (IllegalStateException e){
            response.put("errMessage", e.getMessage());
            return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
        } catch (IllegalArgumentException e){
            response.put("errMessage", e.getMessage());
            return new ResponseEntity<>(response, HttpStatus.FORBIDDEN);
        } catch (Exception e) {
            response.put("errMessage", e.getMessage());
            return new ResponseEntity<>(response, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
