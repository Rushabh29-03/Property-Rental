package com.property_rental.backend.controllers;

import com.property_rental.backend.dtos.PropertyDto;
import com.property_rental.backend.entities.Property;
import com.property_rental.backend.entities.User;
import com.property_rental.backend.repositories.PropertyRepository;
import com.property_rental.backend.repositories.UserRepository;
import com.property_rental.backend.service.OwnerService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/owner")
public class OwnerController {

    @Autowired
    private OwnerService ownerService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PropertyRepository propertyRepository;

    @PostMapping("/addProperty")
    @PreAuthorize("hasAnyRole('OWNER', 'ADMIN')")
    public ResponseEntity<PropertyDto> createProperty(@RequestBody Property property,
                                                      Principal principal){
        String username=principal.getName();
        User owner = userRepository.findByUserName(username);
        try {
            owner.add(property);
            Property newProperty=propertyRepository.save(property);

            PropertyDto propertyDto=PropertyDto.builder()
                    .id(newProperty.getId())
                    .description(newProperty.getDescription())
                    .address(newProperty.getAddress())
                    .isVerified(newProperty.isVerified())
                    .area(newProperty.getArea())
                    .areaUnit(newProperty.getAreaUnit())
                    .monthlyRent(newProperty.getMonthlyRent())
                    .noOfBedrooms(newProperty.getNoOfBedrooms())
                    .securityDepositAmount(newProperty.getSecurityDepositAmount())
                    .build();

            return new ResponseEntity<>(propertyDto, HttpStatus.CREATED);
        } catch(IllegalArgumentException e){
            System.err.println("Property creation failed: "+e.getMessage());
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        } catch (Exception e) {
            System.err.println("Internal server error while creating property: "+e.getMessage());
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }



    @ExceptionHandler(InternalError.class)
    @ResponseBody
    public Map<String, String> exceptionHandler(){
        return Collections.singletonMap("errMessage", "invalid invalid");
    }



    // This endpoint is only accessible to users with either OWNER or ADMIN roles.
    @GetMapping("/properties")
    @PreAuthorize("hasAnyRole('OWNER', 'ADMIN')")
    public ResponseEntity<List<PropertyDto>> getProperties(Principal principal) {

        User user=userRepository.findByUserName(principal.getName());

       try {
           List<PropertyDto> properties=user.getProperties();
           System.out.println(properties);
           return new ResponseEntity<>(properties, HttpStatus.OK);
       } catch (IllegalArgumentException e) {
           return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
       } catch (Exception e) {
           System.err.println("Internal server error while fetching property: "+e.getMessage());
           return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
       }
    }
}

