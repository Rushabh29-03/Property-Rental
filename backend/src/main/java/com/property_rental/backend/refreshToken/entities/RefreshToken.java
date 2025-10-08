package com.property_rental.backend.refreshToken.entities;

import com.property_rental.backend.user.entities.User;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;
import java.time.LocalDateTime;

@Entity
@Table(name = "tokens")
public class RefreshToken {

    @Setter
    @Getter
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private int id;

    @Setter
    @Getter
    @Column(name = "refresh_token", nullable = false)
    private String refreshToken;

    @Setter
    @Getter
    @Column(name = "expiry_date", nullable = false, unique = true)
    private Instant expiryDate;

//    TOKEN TO USER
    @Setter
    @Getter
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

//    empty constructor
    public RefreshToken(){}

//    constructor
    public RefreshToken(String refreshToken, Instant expiryDate) {
        this.refreshToken = refreshToken;
        this.expiryDate = expiryDate;
    }

//    toString
    @Override
    public String toString() {
        return "RefreshToken{" +
                "id=" + id +
                ", refreshToken='" + refreshToken + '\'' +
                ", expiryDate=" + expiryDate +
                ", user=" + user +
                '}';
    }

    public boolean isExpired() {
        return this.expiryDate.isBefore(Instant.now());
    }
}
