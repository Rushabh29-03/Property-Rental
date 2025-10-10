package com.property_rental.backend.admin.entities;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;

@Entity
@Table(name = "admin")
public class Admin {

    //    getters and setters
    //    create fields
    @Setter
    @Getter
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "admin_id")
    private int id;

    @Setter
    @Getter
    @Column(name = "username", nullable = false, unique = true)
    private String userName;

    @Setter
    @Getter
    @Column(name = "password", nullable = false)
    private String password;

    @Setter
    @Getter
    @Column(name = "refresh_token", nullable = false)
    private String refreshToken;

    @Setter
    @Getter
    @Column(name = "expiry_date", nullable = false)
    private Instant expiryDate;

    //    empty constructor
    public Admin(){}

    //    constructor
    public Admin(String userName, String password) {
        this.userName = userName;
        this.password = password;
    }

    @Override
    public String toString() {
        return "Admin{" +
                "id=" + id +
                ", userName='" + userName + '\'' +
                ", password='" + password + '\'' +
                '}';
    }

    public boolean isRefreshTokenExpired() {
        return this.expiryDate.isBefore(Instant.now());
    }
}
