package com.property_rental.backend.auth.controller;

import com.property_rental.backend.property.service.PropertyService;
import com.property_rental.backend.owner.controller.OwnerController;
import com.property_rental.backend.property.dtos.PropertyDto;
import com.property_rental.backend.user.entities.Admin;
import com.property_rental.backend.user.entities.User;
import com.property_rental.backend.auth.models.JwtRequest;
import com.property_rental.backend.auth.models.JwtResponse;
import com.property_rental.backend.auth.models.RefreshTokenRequest;
import com.property_rental.backend.auth.security.JwtHelper;
import com.property_rental.backend.admin.service.AdminService;
import com.property_rental.backend.user.service.UserService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/auth")
public class AuthController {



    private final AuthenticationManager manager;
    private final JwtHelper jwtHelper;
    private final AdminService adminService;
    private final UserService userService;
    private final PropertyService propertyService;
    private final OwnerController ownerController;

    public AuthController(AuthenticationManager manager,
                          JwtHelper jwtHelper,
                          AdminService adminService,
                          UserService userService,
                          PropertyService propertyService,
                          OwnerController ownerController) {
        this.manager = manager;
        this.jwtHelper = jwtHelper;
        this.adminService = adminService;
        this.userService = userService;
        this.propertyService = propertyService;
        this.ownerController = ownerController;
    }

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
        String accessToken = this.jwtHelper.generateAccessToken(userDetails);
        String refreshToken = this.jwtHelper.generateRefreshToken(userDetails);

        // Create the response object.
        JwtResponse response = JwtResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .username(userDetails.getUsername())
                .role((userDetails.getAuthorities().toArray()[0]).toString())
                .build();

        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @PostMapping("/refresh-token")
    public ResponseEntity<JwtResponse> refreshToken(@RequestBody RefreshTokenRequest request){
        String refreshToken = request.getRefreshToken();
        String username = this.jwtHelper.getUsernameFromToken(refreshToken);

        if(username!=null && !this.jwtHelper.isTokenExpired(refreshToken)){
//            load userDetails
            UserDetails userDetails = this.userService.loadUserByUsername(username);

            String newAccessToken = this.jwtHelper.generateAccessToken(userDetails);

            JwtResponse response = JwtResponse.builder()
                    .accessToken(newAccessToken)
                    .refreshToken(refreshToken) // Keep the original refresh token
                    .username(username)
                    .role(userDetails.getAuthorities().toArray()[0].toString())
                    .build();

            return new ResponseEntity<>(response, HttpStatus.OK);
        } else {
            // Handle invalid or expired refresh token
            return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
        }
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
            List<PropertyDto> propertyDtoList=propertyService.allProperties();

//            convert property list to p. dto list
//            List<PropertyDto> propertyDtoList = new ArrayList<>(List.of());
//            propertyList.stream().map(PropertyDto::new).forEach(propertyDtoList::add);

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
