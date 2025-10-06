package com.property_rental.backend.user;

import com.property_rental.backend.wishlist.dtos.WishListedPropertyDto;
import com.property_rental.backend.wishlist.entities.WishListedProperty;
import com.property_rental.backend.property.PropertyService;
import com.property_rental.backend.wishlist.WishListedPropertyService;
import io.jsonwebtoken.ExpiredJwtException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/user")
public class UserController {

    Authentication authentication= SecurityContextHolder.getContext().getAuthentication();
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
    @GetMapping("/user/{userId}")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<?> userEndpoint(@PathVariable int userId) {

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

    @GetMapping("/getWishListedProperties")
    @PreAuthorize("hasAnyRole('ADMIN', 'USER')")
    public ResponseEntity<?> getWishListedProperties(){

//        get signed-in user
        Map<String, Object> response = new HashMap<>();
        try {
            List<WishListedPropertyDto> wishListedPropertyDtoList=wishListedPropertyService.getWishListedProperties(authentication.getName());
            response.put("message", "Fetched wishListed properties successfully");
            response.put("wishListedProperties", wishListedPropertyDtoList);
            return new ResponseEntity<>(response, HttpStatus.OK);
        } catch (UsernameNotFoundException e) {
            response.put("errMessage", e.getMessage());
            return new ResponseEntity<>(response, HttpStatus.NOT_FOUND);
        } catch (Exception e) {
            response.put("errMessage", e.getMessage());
            return new ResponseEntity<>(response, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @DeleteMapping("/removeWishListProperty/{propertyId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'USER')")
    public ResponseEntity<?> removeWishListProperty(@PathVariable int propertyId) {

//        get signed-in user
        Map<String, Object> response = new HashMap<>();
        try {
            wishListedPropertyService.removeWishList(authentication.getName(), propertyId);
            response.put("message", "Removed wishlist successfully");
            return new ResponseEntity<>(response, HttpStatus.OK);
        } catch (UsernameNotFoundException | NoSuchElementException e){
            response.put("errMessage", e.getMessage());
            return new ResponseEntity<>(response, HttpStatus.NOT_FOUND);
        } catch (Exception e) {
            response.put("errMessage", e.getMessage());
            return new ResponseEntity<>(response, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}