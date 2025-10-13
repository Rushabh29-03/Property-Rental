package com.property_rental.backend.rental.controller;

import com.property_rental.backend.rental.dtos.RentedDto;
import com.property_rental.backend.rental.entities.RentedProperty;
import com.property_rental.backend.rental.service.RentedService;
import com.property_rental.backend.user.entities.User;
import com.property_rental.backend.user.service.UserService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.NoSuchElementException;

@RestController
@RequestMapping("/rented")
@PreAuthorize("hasAnyRole('USER', 'ADMIN')")
public class RentedController {

    private final UserService userService;
    private final RentedService rentedService;

    public RentedController(UserService userService, RentedService rentedService) {
        this.userService = userService;
        this.rentedService = rentedService;
    }

    @PostMapping("/rent-property/{propertyId}")
    public ResponseEntity<?> rentProperty(@PathVariable int propertyId, @RequestBody RentedProperty rentedProperty){
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        Map<String, Object> response = new HashMap<>();
        try {
            RentedDto rentedDto = rentedService.rentProperty(propertyId, authentication.getName(), rentedProperty);
            response.put("message", "property rented successfully");
            response.put("rented-property", rentedDto);

            return new ResponseEntity<>(response, HttpStatus.CREATED);
        } catch (UsernameNotFoundException | NoSuchElementException e) {
            response.put("errMessage", e.getMessage());
            return new ResponseEntity<>(response, HttpStatus.NOT_FOUND);
        } catch (Exception e) {
            response.put("errMessage", e.getMessage());
            return new ResponseEntity<>(response, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping("/get-rented-properties")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<?> getRentedProperties(){
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        Map<String, Object> response = new HashMap<>();
        try {
            if(authentication.getAuthorities().toArray()[0].toString().equals("ROLE_OWNER")){
                response.put("errMessage", "Access Denied");
                return new ResponseEntity<>(response, HttpStatus.FORBIDDEN);
            }
            User user = userService.findByUsername(authentication.getName());
            List<RentedDto> rentedDtoList = rentedService.getRentedPropertiesByUserId(user.getId());
            response.put("message", "Rented properties fetched successfully");
            response.put("rented properties", rentedDtoList);
            return new ResponseEntity<>(response, HttpStatus.OK);
        } catch (UsernameNotFoundException e){
            response.put("errMessage", e.getMessage());
            return new ResponseEntity<>(response, HttpStatus.NOT_FOUND);
        } catch (Exception e) {
            response.put("errMessage", e.getMessage());
            return new ResponseEntity<>(response, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
