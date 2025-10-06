package com.property_rental.backend.models;

import lombok.*;
import org.springframework.security.core.GrantedAuthority;

import java.util.Collection;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
@ToString
public class JwtResponse {

    private String accessToken;
    private String refreshToken;
    private String username;
    private String role;
}
