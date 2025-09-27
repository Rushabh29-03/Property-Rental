package com.propertyRental.pocproject.controllers;

import com.propertyRental.pocproject.entity.Admin;
import com.propertyRental.pocproject.entity.User;
import com.propertyRental.pocproject.models.JwtRequest;
import com.propertyRental.pocproject.models.JwtResponse;
import com.propertyRental.pocproject.security.JwtHelper;
import com.propertyRental.pocproject.service.AdminService;
import com.propertyRental.pocproject.service.UserService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
public class AuthController {

    @Autowired
    private AuthenticationManager manager;

    @Autowired
    private JwtHelper helper;

    @Autowired
    private AdminService adminService;

    @Autowired
    private UserService userService;

    private Logger logger = LoggerFactory.getLogger(AuthController.class);

    // This endpoint handles the user login and issues a JWT token.
    // It is public, as configured in SecurityConfig.
    @PostMapping("/login")
    public ResponseEntity<JwtResponse> login(@RequestBody JwtRequest request) {

        // Authenticate the user with the provided username and password.
        this.doAuthenticate(request.getUserName(), request.getPassword());

        // Load the user details to generate a token.
        UserDetails userDetails = userService.loadUserByUsername(request.getUserName());

        // Generate the JWT token.
        String token = this.helper.generateToken(userDetails);

        // Create the response object.
        JwtResponse response = JwtResponse.builder()
                .jwtToken(token)
                .username(userDetails.getUsername())
                .build();

        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    private void doAuthenticate(String username, String password) {

        UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(username, password);
        try {
            manager.authenticate(authentication);

        } catch (BadCredentialsException e) {
            throw new BadCredentialsException(" Invalid Username or Password !!");
        }
    }

    @ExceptionHandler(BadCredentialsException.class)
    public String exceptionHandler() {
        return "Invalid Username or Password !!";
    }

    @PostMapping("/register/admin")
    public ResponseEntity<String> registerAdmin(@RequestBody Admin admin){
        try {
            Admin registeredAdmin = adminService.registerAdmin(admin);
            return new ResponseEntity<>("Admin registered successfully with username: "+registeredAdmin.getUserName(), HttpStatus.CREATED);
        } catch (Exception e) {
            return new ResponseEntity<>("Admin registration failed: "+e.getMessage(), HttpStatus.BAD_REQUEST);
        }
    }

    @PostMapping("/register/user")
    public ResponseEntity<String> registerUser(@RequestBody User user){
        try {
            System.out.println("******************"+user);
            User registeredUser = userService.registerUser(user);
            return new ResponseEntity<>("User registered successfully with username: " + registeredUser.getUserName(), HttpStatus.CREATED);
        } catch (Exception e) {
            return new ResponseEntity<>("User registration failed: " + e.getMessage(), HttpStatus.BAD_REQUEST);
        }
    }
}
