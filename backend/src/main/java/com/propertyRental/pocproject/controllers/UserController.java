package com.propertyRental.pocproject.controllers;

import com.propertyRental.pocproject.entity.User;
import com.propertyRental.pocproject.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/user")
public class UserController {

    @Autowired
    private UserService userService;

    // This endpoint is accessible to all authenticated users.
    // The SecurityConfig already ensures this, but using @PreAuthorize adds a layer of clarity.
    @GetMapping("/user")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<String> userEndpoint() {
        return ResponseEntity.ok("Hello User! Welcome to the general user portal.");
    }


}
