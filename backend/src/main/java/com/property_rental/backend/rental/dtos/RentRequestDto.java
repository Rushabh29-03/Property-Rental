package com.property_rental.backend.rental.dtos;

import com.property_rental.backend.rental.entities.RentedProperty;
import lombok.*;

import java.time.LocalDate;

@Setter
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString
public class RentRequestDto {
    private int userId;
    private int propertyId;
    private String propertyAddress;
    private String userName;
    private String userEmail;
    private LocalDate startDate;
    private LocalDate endDate;
    private double monthlyRent;
    private double securityDeposit;
    private float duration;

    public RentRequestDto (RentedProperty rentedProperty) {
        this.userId = rentedProperty.getUser().getId();
        this.propertyId = rentedProperty.getProperty().getId();
        this.propertyAddress = rentedProperty.getProperty().getDescription();
        this.userName = rentedProperty.getUser().getUserName();
        this.userEmail = rentedProperty.getUser().getEmail();
        this.startDate = rentedProperty.getStartDate();
        this.endDate = rentedProperty.getEndDate();
        this.monthlyRent = rentedProperty.getProperty().getMonthlyRent();
        this.securityDeposit = rentedProperty.getProperty().getSecurityDepositAmount();
        this.duration = rentedProperty.getDuration();
    }
}
