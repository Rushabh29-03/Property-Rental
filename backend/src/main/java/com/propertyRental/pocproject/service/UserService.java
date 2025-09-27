package com.propertyRental.pocproject.service;

import com.propertyRental.pocproject.config.AppConfig;
import com.propertyRental.pocproject.entity.Admin;
import com.propertyRental.pocproject.entity.User;
import com.propertyRental.pocproject.repository.AdminRepository;
import com.propertyRental.pocproject.repository.UserRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class UserService implements UserDetailsService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private AdminRepository adminRepository;

    @Autowired
    private AppConfig appConfig;

    // Method to register a new regular user
    @Transactional
    public User registerUser(User user) {
        // Encode the password before saving it to the database
        user.setPassword(appConfig.passwordEncoder().encode(user.getPassword()));
        user.setRegistrationDate(LocalDateTime.now());
        // Set isOwner to false by default for a standard user registration
        System.out.println(user.isOwner()+"*********************");
//        user.setOwner(false);
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
        Optional<User> userOptional = userRepository.findByUserName(username);

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
}
