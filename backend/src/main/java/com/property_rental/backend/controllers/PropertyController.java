package com.property_rental.backend.controllers;

import com.property_rental.backend.dtos.PropertyDto;
import com.property_rental.backend.dtos.PropertyFacilityDto;
import com.property_rental.backend.entities.Property;
import com.property_rental.backend.entities.User;
import com.property_rental.backend.repositories.PropertyRepository;
import com.property_rental.backend.repositories.UserRepository;
import com.property_rental.backend.service.PropertyService;
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
@RequestMapping("/property")
public class PropertyController {

    private final PropertyRepository propertyRepository;

    private final PropertyService propertyService;

    private final UserRepository userRepository;

    public PropertyController(
            PropertyRepository propertyRepository,
            PropertyService propertyService,
            UserRepository userRepository
    ) {
        this.propertyRepository=propertyRepository;
        this.propertyService=propertyService;
        this.userRepository=userRepository;
    }

    @GetMapping("/properties/{propertyId}")
    public ResponseEntity<?> getPropertyById(@PathVariable int propertyId) {
        try {
            Property property=propertyService.findPropertyById(propertyId);
            PropertyDto propertyDto = new PropertyDto(property);

            // Return the property data with HTTP 200 OK
            return new ResponseEntity<>(propertyDto, HttpStatus.OK);
        } catch (Exception e) {
            // Handle exceptions (e.g., database error)
//            System.out.println(e.getMessage());
            return new ResponseEntity<>(e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @PostMapping("/addProperty")
    @PreAuthorize("hasAnyRole('OWNER', 'ADMIN')")
    public ResponseEntity<PropertyDto> createProperty(@RequestBody Property property){

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        try {
            User owner = userRepository.findByUserName(username).orElseThrow(
                    ()-> new UsernameNotFoundException("User not found with username: "+username)
            );
            owner.add(property);
            Property newProperty=propertyRepository.save(property);

            PropertyDto propertyDto= new PropertyDto(newProperty);

            return new ResponseEntity<>(propertyDto, HttpStatus.CREATED);
        } catch(IllegalArgumentException e){
            System.err.println("Property creation failed: "+e.getMessage());
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        } catch (Exception e) {
            System.err.println("Internal server error while creating property: "+e.getMessage());
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @PutMapping("edit_property/{propertyId}")
    @PreAuthorize("hasAnyRole('OWNER', 'ADMIN)")
    public ResponseEntity<Map<String, Object>> editPropertyById(
            @RequestBody PropertyDto propertyDto,
            @PathVariable int propertyId) {

        Map<String, Object> response=new HashMap<>();

//        get signed-in user username (Principal)
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String currentUser = authentication.getName();
        String role = authentication.getAuthorities().toString();

        try {
//            get property
            Property existingProperty=propertyService.findPropertyById(propertyId);

            if(existingProperty==null){
                response.put("errMessage", "Property not found");
                return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
            }

            boolean isAdmin = role.equals("[ROLE_ADMIN]");
            boolean isOwner = existingProperty.getOwner().getUserName().equals(currentUser);

            if(!isAdmin && !isOwner){
                response.put("errMessage", "You're not allowed to edit this property.");
                return new ResponseEntity<>(response, HttpStatus.FORBIDDEN);
            }

            PropertyDto updatedProperty=propertyService.updateProperty(propertyDto, propertyId);

            response.put("message", "Property updated successfully");
            response.put("updatedProperty", updatedProperty);
            return new ResponseEntity<>(response, HttpStatus.OK);
        } catch (NoSuchElementException e){
            response.put("errMessage", "Property not found with id: "+propertyId);
            return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
        } catch (Exception e) {
            response.put("errMessage", "Error updating property");
            response.put("detailError", e.getMessage());
            return new ResponseEntity<>(response, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @DeleteMapping("delete_property/{propertyId}")
    @PreAuthorize("hasAnyRole('OWNER', 'ADMIN)")
    public ResponseEntity<Map<String, Object>> deletePropertyById(@PathVariable int propertyId) {

        Map<String, Object> response = new HashMap<>();
//            get signed-in user username (Principal)
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String currentUser = authentication.getName();
        String role = authentication.getAuthorities().toString();
        try {
//            get property to check ownership
            Property property=propertyService.findPropertyById(propertyId);

//            return bad request if property not found
            if(property==null){
                response.put("errMessage", "Property not found.");
                return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
            }

//            check for rent status RETURNS TRUE ALWAYS CURRENTLY
//            if(propertyService.isRented(propertyId)){
//                response.put("errMessage", "Property is already rented, you cannot delete it");
//                return new ResponseEntity<>(response, HttpStatus.FORBIDDEN);
//            }

//            if admin wants to delete, let it delete without checking for ownership
            if(role.equals("[ROLE_ADMIN]")){
                propertyService.deleteById(propertyId);
                response.put("message", "Property deleted successfully");
                return new ResponseEntity<>(response, HttpStatus.OK);
            }

//            check for ownership
            if(! property.getOwner().getUserName().equals(currentUser)){
                response.put("errMessage", "Access denied!! You do not own this property.");
                return new ResponseEntity<>(response, HttpStatus.FORBIDDEN);
            }

//            delete property if everything is fine.
            propertyService.deleteById(propertyId);
            response.put("message", "Property deleted successfully");
            return new ResponseEntity<>(response, HttpStatus.OK);
        } catch (Exception e) {
            System.err.println("Error deleting property: "+e.getMessage());
            response.put("errMessage", "Error deleting property");
            response.put("detailError", e.getMessage());
            return new ResponseEntity<>(response, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

//    GET FACILITIES returns List of PropertyDto
    @GetMapping("/getFacilities/{propertyId}")
    public ResponseEntity<?> getPropFacility(@PathVariable int propertyId){
        Map<String, Object> response = new HashMap<>();
        try {
            Property property=propertyService.findPropertyById(propertyId);
            List<PropertyFacilityDto> propertyFacilityDtoList = property.getPropertyFacilities();
            return new ResponseEntity<>(propertyFacilityDtoList, HttpStatus.OK);
        } catch (NoSuchElementException e){
            response.put("errMessage", e.getMessage());
            return new ResponseEntity<>(response, HttpStatus.NOT_FOUND);
        } catch (Exception e) {
            response.put("errMessage", e.getMessage());
            return new ResponseEntity<>(response, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
