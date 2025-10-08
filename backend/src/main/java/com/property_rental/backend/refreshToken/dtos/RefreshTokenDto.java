package com.property_rental.backend.refreshToken.dtos;

import com.property_rental.backend.refreshToken.entities.RefreshToken;
import lombok.*;

import java.time.Instant;
import java.time.LocalDateTime;

@Setter
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString
public class RefreshTokenDto {
    private int id;
    private String refreshToken;
    private Instant expiryDate;
    private boolean isExpired;

    public RefreshTokenDto(RefreshToken refreshToken){
        this.id= refreshToken.getId();
        this.refreshToken= refreshToken.getRefreshToken();
        this.expiryDate= refreshToken.getExpiryDate();
        this.isExpired= refreshToken.isExpired();
    }
}
