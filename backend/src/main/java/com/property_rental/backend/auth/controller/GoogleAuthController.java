package com.property_rental.backend.auth.controller;

import com.property_rental.backend.auth.models.GoogleLoginRequest;
import com.property_rental.backend.auth.models.JwtResponse;
import com.property_rental.backend.auth.security.JwtHelper;
import com.property_rental.backend.auth.service.GoogleAuthService;
import com.property_rental.backend.refreshToken.service.RefreshTokenService;
import com.property_rental.backend.user.entities.User;
import com.property_rental.backend.user.service.UserService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/auth/google")
public class GoogleAuthController {

    private final GoogleAuthService googleAuthService;
    private final UserService userService;
    private final JwtHelper jwtHelper;
    private final RefreshTokenService refreshTokenService;

    public GoogleAuthController(GoogleAuthService googleAuthService, UserService userService, JwtHelper jwtHelper, RefreshTokenService refreshTokenService) {
        this.googleAuthService = googleAuthService;
        this.userService = userService;
        this.jwtHelper = jwtHelper;
        this.refreshTokenService = refreshTokenService;
    }

    /**
     * Main Google OAuth2 Login Endpoint
     * Accepts Google ID Token and authenticates/registers user
     *
     * POST http://localhost:8080/auth/google/login
     * Body (JSON):
     * {
     *   "idToken": "YOUR_GOOGLE_ID_TOKEN_HERE"
     * }
     */
    @PostMapping("/login")
    public ResponseEntity<?> googleLogin(@RequestBody GoogleLoginRequest request) {
        Map<String, Object> response = new HashMap<>();

        try {
            // Verify Google ID Token
            Map<String, String> googleUserInfo = googleAuthService.verifyGoogleToken(request.getIdToken());

            if (googleUserInfo == null || googleUserInfo.isEmpty()) {
                response.put("errMessage", "Invalid Google ID token");
                return new ResponseEntity<>(response, HttpStatus.UNAUTHORIZED);
            }

            // Extract user details
            String email = googleUserInfo.get("email");
            String googleId = googleUserInfo.get("email").substring(0, googleUserInfo.get("email").indexOf('@'));
            String firstName = googleUserInfo.getOrDefault("given_name", "User");
            String lastName = googleUserInfo.getOrDefault("family_name", "");

            // Find or create user
            User user = googleAuthService.findOrCreateGoogleUser(email, googleId, firstName, lastName);

            // Generate JWT tokens
            UserDetails userDetails = userService.loadUserByUsername(user.getUserName());
            String accessToken = jwtHelper.generateAccessToken(userDetails);
            String refreshToken = jwtHelper.generateRefreshToken(userDetails);

            // Save refresh token
            refreshTokenService.addRefreshToken(user.getUserName(), refreshToken);

            // Build response
            JwtResponse jwtResponse = JwtResponse.builder()
                    .id(user.getId())
                    .accessToken(accessToken)
                    .refreshToken(refreshToken)
                    .username(user.getUserName())
                    .role(userDetails.getAuthorities().toArray()[0].toString())
                    .build();

            return new ResponseEntity<>(jwtResponse, HttpStatus.OK);

        } catch (Exception e) {
            e.printStackTrace();
            response.put("errMessage", "Google authentication failed");
            response.put("details", e.getMessage());
            return new ResponseEntity<>(response, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Health check endpoint
     */
    @GetMapping("/health")
    public ResponseEntity<Map<String, String>> healthCheck() {
        Map<String, String> response = new HashMap<>();
        response.put("status", "OK");
        response.put("message", "Google OAuth2 Controller is running");
        response.put("timestamp", java.time.LocalDateTime.now().toString());
        return ResponseEntity.ok(response);
    }
}
