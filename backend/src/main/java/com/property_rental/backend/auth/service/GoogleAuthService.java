package com.property_rental.backend.auth.service;

import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import com.property_rental.backend.core.config.AppConfig;
import com.property_rental.backend.user.entities.User;
import com.property_rental.backend.user.repository.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@Service
public class GoogleAuthService {

    @Value("${google.client-id}")
    private String googleClientId;

    private final UserRepository userRepository;
    private final AppConfig appConfig;

    public GoogleAuthService(UserRepository userRepository, AppConfig appConfig) {
        this.userRepository = userRepository;
        this.appConfig = appConfig;
    }

    /**
     * Verifies Google ID Token and extracts user information
     * @param idToken - Google ID Token from client
     * @return Map with user info (email, sub, given_name, family_name, picture)
     */
    public Map<String, String> verifyGoogleToken(String idToken) {
        try {
            GoogleIdTokenVerifier verifier = new GoogleIdTokenVerifier.Builder(
                    new NetHttpTransport(),
                    new GsonFactory())
                    .setAudience(Collections.singletonList(googleClientId))
                    .build();

            GoogleIdToken googleIdToken = verifier.verify(idToken);

            if (googleIdToken != null) {
                GoogleIdToken.Payload payload = googleIdToken.getPayload();

                Map<String, String> userInfo = new HashMap<>();
                userInfo.put("email", payload.getEmail());
                userInfo.put("sub", payload.getSubject()); // Google's unique user ID
                userInfo.put("given_name", (String) payload.get("given_name"));
                userInfo.put("family_name", (String) payload.get("family_name"));
                userInfo.put("picture", (String) payload.get("picture"));
                userInfo.put("email_verified", payload.getEmailVerified().toString());

                return userInfo;
            }

            return null;

        } catch (Exception e) {
            System.err.println("Error verifying Google token: " + e.getMessage());
            e.printStackTrace();
            return null;
        }
    }

    /**
     * Finds existing user by email or creates new user from Google account
     * Automatically sets isOwner = false for new Google users
     *
     * @param email - User's Google email
     * @param googleId - Google's unique user ID (sub)
     * @param firstName - First name from Google
     * @param lastName - Last name from Google
     * @return User entity (existing or newly created)
     */
    public User findOrCreateGoogleUser(String email, String googleId, String firstName, String lastName) {
        // Try to find user by email first
        Optional<User> existingUserByEmail = userRepository.findByEmail(email);

        if (existingUserByEmail.isPresent()) {
            System.out.println("Found existing user by email: " + email);
            return existingUserByEmail.get();
        }

        // Try to find by username (googleId)
        Optional<User> existingUserByUsername = userRepository.findByUserName(googleId);

        if (existingUserByUsername.isPresent()) {
            System.out.println("Found existing user by username: " + googleId);
            return existingUserByUsername.get();
        }

        // User doesn't exist - create new user
        System.out.println("Creating new Google user with email: " + email);

        User newUser = new User();
        newUser.setUserName(googleId); // Google ID as username
        newUser.setEmail(email);
        newUser.setFirstName(firstName != null ? firstName : "User");
        newUser.setLastName(lastName != null ? lastName : "");

        // Set placeholder password (encoded for security)
        newUser.setPassword(appConfig.passwordEncoder().encode("GOOGLE_OAUTH_USER_" + System.currentTimeMillis()));

        // Default values as per requirement
        newUser.setIsOwner(false); // MUST be false for new Google users
        // phoneNo remains null (optional field)

        User savedUser = userRepository.save(newUser);
        System.out.println("Successfully created user with ID: " + savedUser.getId());

        return savedUser;
    }

    /**
     * Helper method to check if user exists by email
     */
    public boolean userExistsByEmail(String email) {
        return userRepository.findByEmail(email).isPresent();
    }

    /**
     * Helper method to get user by email
     */
    public Optional<User> getUserByEmail(String email) {
        return userRepository.findByEmail(email);
    }
}
