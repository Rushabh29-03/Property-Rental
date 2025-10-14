package com.property_rental.backend.owner.controller;

import com.property_rental.backend.owner.service.OwnerService;
import com.property_rental.backend.property.dtos.PropertyDto;
import com.property_rental.backend.property.repository.PropertyRepository;
import com.property_rental.backend.property.service.PropertyService;
import com.property_rental.backend.rental.dtos.RentedDto;
import com.property_rental.backend.rental.service.RentedService;
import com.property_rental.backend.user.entities.User;
import com.property_rental.backend.user.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/owner")
public class OwnerController {

    private final OwnerService ownerService;
    private final UserRepository userRepository;
    private final PropertyRepository propertyRepository;
    private final PropertyService propertyService;
    private final RentedService rentedService;

    public OwnerController(OwnerService ownerService, UserRepository userRepository, PropertyRepository propertyRepository, PropertyService propertyService, RentedService rentedService) {
        this.ownerService = ownerService;
        this.userRepository = userRepository;
        this.propertyRepository = propertyRepository;
        this.propertyService = propertyService;
        this.rentedService = rentedService;
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
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
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

    @PostMapping("/accept-rent-request")
    @PreAuthorize("hasAnyRole('OWNER', 'ADMIN')")
    public ResponseEntity<?> acceptRentRequest(@RequestBody RentedDto rentedDto){ //gets userId and propertyId as RequestBody so no need to fetch
        Map<String, Object> response = new HashMap<>();
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        try {
            RentedDto updatedDto = rentedService.acceptRentRequest(rentedDto);
            response.put("message", "rent request accepted success");
            response.put("updated rented property", updatedDto);
            return new ResponseEntity<>(response, HttpStatus.OK);
        } catch (NoSuchElementException e){
            response.put("errMessage", e.getMessage());
            return new ResponseEntity<>(response, HttpStatus.NOT_FOUND);
        } catch (Exception e){
            response.put("errMessage", e.getMessage());
            return new ResponseEntity<>(response, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}

