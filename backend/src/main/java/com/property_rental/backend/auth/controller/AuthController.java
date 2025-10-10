package com.property_rental.backend.auth.controller;

import com.property_rental.backend.property.service.PropertyService;
import com.property_rental.backend.owner.controller.OwnerController;
import com.property_rental.backend.property.dtos.PropertyDto;
import com.property_rental.backend.admin.entities.Admin;
import com.property_rental.backend.refreshToken.dtos.RefreshTokenDto;
import com.property_rental.backend.refreshToken.service.RefreshTokenService;
import com.property_rental.backend.user.entities.User;
import com.property_rental.backend.auth.models.JwtRequest;
import com.property_rental.backend.auth.models.JwtResponse;
import com.property_rental.backend.auth.security.JwtHelper;
import com.property_rental.backend.admin.service.AdminService;
import com.property_rental.backend.user.service.UserService;
import io.jsonwebtoken.JwtException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
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
    private final RefreshTokenService refreshTokenService;

    public AuthController(AuthenticationManager manager,
                          JwtHelper jwtHelper,
                          AdminService adminService,
                          UserService userService,
                          PropertyService propertyService,
                          OwnerController ownerController,
                          RefreshTokenService refreshTokenService) {
        this.manager = manager;
        this.jwtHelper = jwtHelper;
        this.adminService = adminService;
        this.userService = userService;
        this.propertyService = propertyService;
        this.ownerController = ownerController;
        this.refreshTokenService=refreshTokenService;
    }


    // =================================================================
    // -----------------------API TESTING URLS--------------------------
    // =================================================================
//    @GetMapping("/api/getAllPropertiesWithRentedOnes")
//    public ResponseEntity<PropertyDto>


    // =================================================================
    // -----------------------API TESTING URLS--------------------------
    // =================================================================

    @PostMapping("/generate-refresh-token")
    public ResponseEntity<?> getNewRefreshToken(@RequestBody  JwtRequest request) {
        Map<String, Object> response = new HashMap<>();

        try {
//            this.doAuthenticate(request.getUserName(), request.getPassword());

            // Load the user details to generate a token.
            UserDetails userDetails = userService.loadUserByUsername(request.getUserName()); //throws UsernameNotFoundException

            Authentication auth = new UsernamePasswordAuthenticationToken(
                    request.getUserName(),
                    null,
                    Collections.emptyList()
            );

            SecurityContextHolder.getContext().setAuthentication(auth);
            // Generate the JWT tokens.
            String accessToken = this.jwtHelper.generateAccessToken(userDetails);
            String refreshToken = this.jwtHelper.generateRefreshToken(userDetails);

//            add refresh token to database, overwrite if already available
//            isAdmin?, save token to admin table
            if(userDetails.getAuthorities().toArray()[0].toString().equals("ROLE_ADMIN")){
                adminService.addRefreshTokenToAdmin(userDetails.getUsername(), refreshToken);
            }

            else {
                refreshTokenService.addRefreshToken(request.getUserName(), refreshToken); // throws NoSuchElementException
            }

            JwtResponse jwtResponse = JwtResponse.builder()
                    .accessToken(accessToken)
                    .refreshToken(refreshToken)
                    .username(userDetails.getUsername())
                    .role(userDetails.getAuthorities().toArray()[0].toString())
                    .build();

            return new ResponseEntity<>(jwtResponse, HttpStatus.CREATED);
        } catch (UsernameNotFoundException | NoSuchElementException e) {
            response.put("errMessage", e.getMessage());
            return new ResponseEntity<>(response, HttpStatus.NOT_FOUND);
        } catch (Exception e) {
            response.put("errMessage", e.getMessage());
            return new ResponseEntity<>(response, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

//    get access token
    @PostMapping("/login")
    public ResponseEntity<?> loginUser(@RequestBody JwtRequest request) {
        Map<String, Object> response = new HashMap<>();

        try {
            this.doAuthenticate(request.getUserName(), request.getPassword());

            UserDetails userDetails = userService.loadUserByUsername(request.getUserName());

//            check if admin
//            if(userDetails.getAuthorities().toArray()[0].toString().equals("ROLE_ADMIN")){
//
//            }

//            check if admin
            if(userDetails.getAuthorities().toArray()[0].toString().equals("ROLE_ADMIN")){
                Admin admin = adminService.getRefreshTokenFromAdmin(userDetails.getUsername()); // throws UsernameNotFoundException
                if(admin.isRefreshTokenExpired()){
                    throw new JwtException("Admins refresh token is expired, generate again");
                }
            }
            else { //not admin
                RefreshTokenDto refreshTokenDto = refreshTokenService.getTokenByUserName(request.getUserName());  // throws UsernameNotFoundException
                if(refreshTokenDto.isExpired()){
                    throw new JwtException("Refresh token expired, generate again");
                }
            }

            String accessToken = this.jwtHelper.generateAccessToken(userDetails);

            JwtResponse jwtResponse = JwtResponse.builder()
                    .accessToken(accessToken)
                    .username(userDetails.getUsername())
                    .role(userDetails.getAuthorities().toArray()[0].toString())
                    .build();

            return new ResponseEntity<>(jwtResponse, HttpStatus.OK);
        } catch (UsernameNotFoundException e) {
            response.put("errMessage", e.getMessage());
            return new ResponseEntity<>(response, HttpStatus.NOT_FOUND);
        } catch (JwtException e) {
            response.put("errMessage", e.getMessage());
            return new ResponseEntity<>(response, HttpStatus.UNAUTHORIZED);
        } catch (Exception e) {
            response.put("errMessage", e.getMessage());
            return new ResponseEntity<>(response, HttpStatus.INTERNAL_SERVER_ERROR);
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

//    re-login if access token expired
    @PostMapping("/re-login")
    public ResponseEntity<?> re_login(@RequestBody JwtRequest request) {

        Map<String, Object> response = new HashMap<>();

        try {
            RefreshTokenDto refreshTokenDto = refreshTokenService.getTokenByUserName(request.getUserName()); // throws UsernameNotFoundException
            if(refreshTokenDto.isExpired()){
                response.put("errMessage", "Refresh token is expired, please generate refresh token first");
            }

            UserDetails userDetails = userService.loadUserByUsername(request.getUserName());
            this.doAuthenticate(userDetails.getUsername(), userDetails.getPassword());

            String accessToken = this.jwtHelper.generateAccessToken(userDetails);

            JwtResponse jwtResponse = JwtResponse.builder()
                    .accessToken(accessToken)
                    .username(userDetails.getUsername())
                    .role(userDetails.getAuthorities().toArray()[0].toString())
                    .build();

            return new ResponseEntity<>(jwtResponse, HttpStatus.OK);
        } catch (UsernameNotFoundException e){
            response.put("errMessage", e.getMessage());
            return new ResponseEntity<>(response, HttpStatus.NOT_FOUND);
        } catch (Exception e) {
            response.put("errMessage", e.getMessage());
            return new ResponseEntity<>(response, HttpStatus.INTERNAL_SERVER_ERROR);
        }
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
            userService.registerUser(user);

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
//            System.out.println(user.getAuthorities());
            List<PropertyDto> propertyDtoList=propertyService.allProperties();

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
