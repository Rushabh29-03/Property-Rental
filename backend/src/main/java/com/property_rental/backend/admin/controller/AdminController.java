package com.property_rental.backend.admin.controller;

import com.property_rental.backend.admin.service.AdminService;
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
@RequestMapping("/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final AdminService adminService;

    public AdminController(AdminService adminService){
        this.adminService= adminService;
    }

    // This endpoint is only accessible to users with the ADMIN role.
    @GetMapping("/user")
    public ResponseEntity<String> adminEndpoint() {
        return ResponseEntity.ok("Hello Admin! You have full administrative access.");
    }

    @PutMapping("toggleVerify/{propertyId}")
    public ResponseEntity<Map<String, Object>> toggleVerifyPropertyByPropertyId(@PathVariable int propertyId){
        Map<String, Object> response = new HashMap<>();
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        try {
            System.out.println(authentication.getName());
            adminService.toggleVerifyPropertyById(propertyId);
            response.put("message", "property verification updated");
            return new ResponseEntity<>(response, HttpStatus.OK);
        } catch (NoSuchElementException e){
            response.put("errMessage", e.getMessage());
            return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
