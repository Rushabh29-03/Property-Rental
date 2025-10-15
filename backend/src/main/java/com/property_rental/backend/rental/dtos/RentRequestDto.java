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
    private int requestId;
    private int userId;
    private int propertyId;
    private String propertyAddress;
    private String userName;
    private String userEmail;
    private LocalDate startDate;
    private LocalDate endDate;
    private double finalMonthlyRent;
    private double finalSecurityDeposit;
    private float duration;

    public RentRequestDto (RentedProperty rentedProperty) {
        this.requestId = rentedProperty.getId();
        this.userId = rentedProperty.getUser().getId();
        this.propertyId = rentedProperty.getProperty().getId();
        this.propertyAddress = rentedProperty.getProperty().getDescription();
        this.userName = rentedProperty.getUser().getUserName();
        this.userEmail = rentedProperty.getUser().getEmail();
        this.startDate = rentedProperty.getStartDate();
        this.endDate = rentedProperty.getEndDate();
        this.finalMonthlyRent = rentedProperty.getProperty().getMonthlyRent();
        this.finalSecurityDeposit = rentedProperty.getProperty().getSecurityDepositAmount();
        this.duration = rentedProperty.getDuration();
    }
}
