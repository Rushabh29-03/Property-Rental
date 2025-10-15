package com.property_rental.backend.user.service;

import com.property_rental.backend.core.config.AppConfig;
import com.property_rental.backend.admin.repository.AdminRepository;
import com.property_rental.backend.user.repository.UserRepository;
import com.property_rental.backend.admin.entities.Admin;
import com.property_rental.backend.user.entities.User;
import io.jsonwebtoken.JwtException;
import jakarta.transaction.Transactional;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.Optional;

@Service
public class UserService implements UserDetailsService {

    private final UserRepository userRepository;

    private final AdminRepository adminRepository;

    private final AppConfig appConfig;

    public UserService(UserRepository userRepository, AdminRepository adminRepository, AppConfig appConfig) {
        this.userRepository = userRepository;
        this.adminRepository = adminRepository;
        this.appConfig = appConfig;
    }

    // Method to register a new regular user
    @Transactional
    public User registerUser(User user) {
        // Encode the password before saving it to the database
        user.setPassword(appConfig.passwordEncoder().encode(user.getPassword()));
        // Set isOwner to false by default for a standard user registration
//        System.out.println(user.isOwner()+"*********************");
        return userRepository.save(user);
    }

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {

        // 1. Attempt to find the user in the ADMIN table
        Optional<Admin> adminOptional = adminRepository.findByUserName(username);

        if (adminOptional.isPresent()) {
            Admin admin = adminOptional.get();
            List<GrantedAuthority> authorities = new ArrayList<>();
            authorities.add(new SimpleGrantedAuthority("ROLE_ADMIN"));

            // Return UserDetails for the Admin
            return new org.springframework.security.core.userdetails.User(
                    admin.getUserName(),
                    admin.getPassword(), // The encoded password
                    authorities
            );
        }

        // 2. If not found as an Admin, attempt to find the user in the USERS table
        User getUser = userRepository.findByUserName(username).orElseThrow(
                ()-> new UsernameNotFoundException("User not found with username: "+username)
        );

        Optional<User> userOptional= Optional.ofNullable(getUser);

        if (userOptional.isPresent()) {
            User user = userOptional.get();
            List<GrantedAuthority> authorities = new ArrayList<>();

            // Assign roles based on the 'isOwner' flag
            if (user.isOwner()) {
                authorities.add(new SimpleGrantedAuthority("ROLE_OWNER"));
            } else {
                authorities.add(new SimpleGrantedAuthority("ROLE_USER"));
            }

            // Return UserDetails for the regular User (or Owner)
            return new org.springframework.security.core.userdetails.User(
                    user.getUserName(),
                    user.getPassword(), // The encoded password
                    authorities
            );
        }

        // 3. If the username is not found in either table, throw an exception
        throw new UsernameNotFoundException("User '" + username + "' not found in either User or Admin table.");
    }

    public User findByUsername(String username){
        User user = userRepository.findByUserName(username).orElseThrow(
                ()-> new UsernameNotFoundException("User not found with username: "+username)
        );
        return user;
    }

    public User findUserByUserId(int userId){
        return userRepository.findById(userId).orElseThrow(
                ()-> new NoSuchElementException("User not found with id: "+userId)
        );
    }
}
