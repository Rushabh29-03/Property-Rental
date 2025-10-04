package com.property_rental.backend.controllers;

import com.property_rental.backend.dtos.WishListedPropertyDto;
import com.property_rental.backend.entities.Property;
import com.property_rental.backend.entities.User;
import com.property_rental.backend.entities.WishListedProperty;
import com.property_rental.backend.service.PropertyService;
import com.property_rental.backend.service.UserService;
import com.property_rental.backend.service.WishListedPropertyService;
import io.jsonwebtoken.ExpiredJwtException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.HashMap;
import java.util.Map;
import java.util.NoSuchElementException;

@RestController
@RequestMapping("/user")
public class UserController {

    private final UserService userService;
    private final PropertyService propertyService;
    private final WishListedPropertyService wishListedPropertyService;

    public UserController(UserService userService, PropertyService propertyService, WishListedPropertyService wishListedPropertyService) {
        this.userService = userService;
        this.propertyService = propertyService;
        this.wishListedPropertyService = wishListedPropertyService;
    }


    // This endpoint is accessible to all authenticated users.
    // The SecurityConfig already ensures this, but using @PreAuthorize adds a layer of clarity.
    @GetMapping("/user")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<String> userEndpoint() {
        return ResponseEntity.ok("Hello User! Welcome to the general user portal.");
    }

    @ExceptionHandler(ExpiredJwtException.class)
    @ResponseBody
    public Map<String, String> exceptionHandler() {
        return Collections.singletonMap("errMessage", "JWT Token is expired, please login again.");
    }

    @PostMapping("/wishListProperty/{propertyId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'USER')")
    public ResponseEntity<?> markPropertyAsWishList(@PathVariable int propertyId, @RequestBody WishListedProperty wishListedProperty) {

//        get signed-in user
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        Map<String, Object> response = new HashMap<>();
        try {
            WishListedPropertyDto addedWishList = wishListedPropertyService.markAsWishlist(authentication.getName(), wishListedProperty, propertyId);
            response.put("message", "marked as wishlist success");
            response.put("addedWishList", addedWishList);
            return new ResponseEntity<>(response, HttpStatus.CREATED);
        } catch (UsernameNotFoundException e){
            response.put("errMessage", e.getMessage());
            return new ResponseEntity<>(response, HttpStatus.NOT_FOUND);
        } catch (NoSuchElementException e){
            response.put("errMessage", e.getMessage());
            return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
        } catch (Exception e){
            response.put("errMessage", e.getMessage());
            return new ResponseEntity<>(response, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}