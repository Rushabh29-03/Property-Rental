package com.property_rental.backend.controllers;

import com.property_rental.backend.dtos.PropertyDto;
import com.property_rental.backend.entities.Property;
import com.property_rental.backend.entities.User;
import com.property_rental.backend.repositories.PropertyRepository;
import com.property_rental.backend.repositories.UserRepository;
import com.property_rental.backend.service.OwnerService;
import com.property_rental.backend.service.PropertyService;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.*;

@RestController
@RequestMapping("/owner")
public class OwnerController {

    Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
    private final OwnerService ownerService;
    private final UserRepository userRepository;
    private final PropertyRepository propertyRepository;
    private final PropertyService propertyService;

    public OwnerController(OwnerService ownerService,
                           UserRepository userRepository,
                           PropertyRepository propertyRepository,
                           PropertyService propertyService) {
        this.ownerService = ownerService;
        this.userRepository = userRepository;
        this.propertyRepository = propertyRepository;
        this.propertyService = propertyService;
    }

    @ExceptionHandler(InternalError.class)
    @ResponseBody
    public Map<String, String> exceptionHandler(){
        return Collections.singletonMap("errMessage", "invalid invalid");
    }



    // This endpoint is only accessible to users with either OWNER or ADMIN roles.
    @GetMapping("/properties")
    @PreAuthorize("hasAnyRole('OWNER', 'ADMIN')")
    public ResponseEntity<List<PropertyDto>> getProperties() {

//        get signed-in username
        User user=userRepository.findByUserName(authentication.getName()).orElseThrow(
                ()-> new UsernameNotFoundException("User not found with username: "+authentication.getName())
        );

       try {
           List<PropertyDto> properties=user.getProperties();
//           System.out.println(properties);
           return new ResponseEntity<>(properties, HttpStatus.OK);
       } catch (IllegalArgumentException e) {
           return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
       } catch (Exception e) {
           System.err.println("Internal server error while fetching property: "+e.getMessage());
           return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
       }
    }
}

