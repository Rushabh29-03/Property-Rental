package com.property_rental.backend.refreshToken.service;

import com.property_rental.backend.admin.entities.Admin;
import com.property_rental.backend.admin.repository.AdminRepository;
import com.property_rental.backend.auth.security.JwtHelper;
import com.property_rental.backend.refreshToken.dtos.RefreshTokenDto;
import com.property_rental.backend.refreshToken.repository.RefreshTokenRepository;
import com.property_rental.backend.refreshToken.entities.RefreshToken;
import com.property_rental.backend.user.entities.User;
import com.property_rental.backend.user.repository.UserRepository;
import com.property_rental.backend.user.service.UserService;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.NoSuchElementException;

@Service
public class RefreshTokenService {

    private final RefreshTokenRepository refreshTokenRepository;
    private final UserRepository userRepository;
    private final JwtHelper jwtHelper;
    private final UserService userService;
    private final AdminRepository adminRepository;

    public RefreshTokenService(RefreshTokenRepository refreshTokenRepository, UserRepository userRepository, JwtHelper jwtHelper, UserService userService, AdminRepository adminRepository) {
        this.refreshTokenRepository = refreshTokenRepository;
        this.userRepository = userRepository;
        this.jwtHelper = jwtHelper;
        this.userService = userService;
        this.adminRepository = adminRepository;
    }

    public RefreshTokenDto getTokenByUserId(int userId){
        RefreshToken refreshToken = refreshTokenRepository.findByUserId(userId).orElseThrow(
                ()-> new NoSuchElementException("User not found in token table with id: "+ userId)
        );
        return new RefreshTokenDto(refreshToken);
    }

    public RefreshTokenDto getTokenByUserName(String username){

        User user = userRepository.findByUserName(username).orElseThrow(
                ()-> new UsernameNotFoundException("Username not found in user table")
        );
        return this.getTokenByUserId(user.getId());
    }

    @Transactional
    public RefreshToken addRefreshToken(String username, String refreshToken){
        User user = userRepository.findByUserName(username).orElseThrow(
                ()-> new NoSuchElementException("User not found with username: "+username)
        );

//        check if received token is in database
        RefreshToken createdRefreshToken = refreshTokenRepository.findByUserId(user.getId()).orElse(new RefreshToken());

        Instant expiration = jwtHelper.getExpirationDateFromToken(refreshToken).toInstant();

        if(createdRefreshToken.getUser()==null){
            createdRefreshToken.setUser(user);
        }
        createdRefreshToken.setRefreshToken(refreshToken);
        createdRefreshToken.setExpiryDate(expiration);

        return refreshTokenRepository.save(createdRefreshToken);
    }
}
