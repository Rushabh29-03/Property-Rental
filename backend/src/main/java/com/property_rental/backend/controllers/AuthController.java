package com.property_rental.backend.controllers;

import com.property_rental.backend.dtos.PropertyDto;
import com.property_rental.backend.entities.Admin;
import com.property_rental.backend.entities.Property;
import com.property_rental.backend.entities.User;
import com.property_rental.backend.models.JwtRequest;
import com.property_rental.backend.models.JwtResponse;
import com.property_rental.backend.repositories.AdminRepository;
import com.property_rental.backend.repositories.PropertyRepository;
import com.property_rental.backend.security.JwtHelper;
import com.property_rental.backend.service.AdminService;
import com.property_rental.backend.service.UserService;
import io.jsonwebtoken.ExpiredJwtException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.*;

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
    private AdminRepository adminRepository;

    @Autowired
    private UserService userService;

    @Autowired
    private PropertyRepository propertyRepository;

    @Autowired
    private OwnerController ownerController;

    private Logger logger = LoggerFactory.getLogger(AuthController.class);


    // =================================================================
    // -----------------------API TESTING URLS--------------------------
    // =================================================================
//    @GetMapping("/api/getAllPropertiesWithRentedOnes")
//    public ResponseEntity<PropertyDto>


    // =================================================================
    // -----------------------API TESTING URLS--------------------------
    // =================================================================

    // This endpoint handles the user login and issues a JWT token.
    // It is public, as configured in SecurityConfig.
    @PostMapping("/login")
    public ResponseEntity<JwtResponse> login(@RequestBody JwtRequest request) {

        // Authenticate the user with the provided username and password.
        this.doAuthenticate(request.getUserName(), request.getPassword());

        // Load the user details to generate a token.
        UserDetails userDetails = userService.loadUserByUsername(request.getUserName());

//        System.out.println((userDetails.getAuthorities().toArray()[0]).toString());

        // Generate the JWT token.
        String token = this.helper.generateToken(userDetails);

        // Create the response object.
        JwtResponse response = JwtResponse.builder()
                .jwtToken(token)
                .username(userDetails.getUsername())
                .role((userDetails.getAuthorities().toArray()[0]).toString())
                .build();

        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    private void doAuthenticate(String username, String password) {

        UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(username, password);
        manager.authenticate(authentication);
    }

    @ExceptionHandler(BadCredentialsException.class)
    @ResponseBody // <-- 1. Tells Spring to serialize the return value (Map) into JSON
    public Map<String, String> exceptionHandler() {
        // 2. Return a Map with the desired key-value pair
        return Collections.singletonMap("errMessage", "invalid credentials");
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
    public ResponseEntity<Map<String, Object>> registerUser(@RequestBody User user){

        Map<String, Object> response = new HashMap<>();
        response.put("message", "");
        response.put("canProceed", false);
        try {
            User registeredUser = userService.registerUser(user);

            response.replace("message", "User registered successfully!!!");
            response.replace("canProceed", true);
            return new ResponseEntity<>(response, HttpStatus.CREATED);
//            return new ResponseEntity<>("User registered successfully with username: " + registeredUser.getUserName(), HttpStatus.CREATED);
        } catch (Exception e) {
            response.remove("message");
            response.put("errMessage", "User Registration failed!!");
            response.put("detailError", e.getMessage());
            return new ResponseEntity<>(response, HttpStatus.MULTI_STATUS);
        }
    }

    @GetMapping("/allProperties")
    public ResponseEntity<List<PropertyDto>> getAllProperties(){

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        UserDetails user=userService.loadUserByUsername(username);

        if(user!=null){
            System.out.println(user.getAuthorities());
            List<Property> propertyList=propertyRepository.allProperties();

//            convert property list to p. dto list
            List<PropertyDto> propertyDtoList = new ArrayList<>(List.of());
            propertyList.stream().map(PropertyDto::new).forEach(propertyDtoList::add);

            String role = user.getAuthorities().toArray()[0].toString();

//            return all properties to user or admin
            if(role.equals("ROLE_ADMIN") || role.equals("ROLE_USER"))
                return new ResponseEntity<>(propertyDtoList, HttpStatus.OK);
            else if (role.equals("ROLE_OWNER")) {
                return ownerController.getProperties();
            }
        }
        return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
    }
}
