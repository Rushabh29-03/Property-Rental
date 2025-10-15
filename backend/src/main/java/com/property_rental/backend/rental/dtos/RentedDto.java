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
public class RentedDto {

    private int id;
    private int userId;
    private int propertyId;
    private LocalDate startDate;
    private LocalDate endDate;
    private double finalMonthlyRent;
    private double finalSecurityDeposit;
    private float duration;
    private Boolean status;

    public RentedDto(RentedProperty rentedProperty) {
        this.id = rentedProperty.getId();
        this.userId = rentedProperty.getUser().getId();
        this.propertyId = rentedProperty.getProperty().getId();
        this.startDate = rentedProperty.getStartDate();
        this.endDate = rentedProperty.getEndDate();
        this.finalMonthlyRent = rentedProperty.getFinalMonthlyRent();
        this.finalSecurityDeposit = rentedProperty.getFinalSecurityDeposit();
        this.duration = rentedProperty.getDuration()!=0 ? rentedProperty.getDuration() : (rentedProperty.getEndDate().getYear() - rentedProperty.getStartDate().getYear()) * 12 +
                (rentedProperty.getEndDate().getMonthValue() - rentedProperty.getStartDate().getMonthValue()) -
                ((rentedProperty.getEndDate().getDayOfMonth()<rentedProperty.getStartDate().getDayOfMonth()) ? 1 : 0);
        this.status = rentedProperty.getStatus();
    }
}
