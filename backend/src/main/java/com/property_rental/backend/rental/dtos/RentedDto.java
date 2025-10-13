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
    private LocalDate startDate;
    private LocalDate endDate;
    private double finalMonthlyRent;
    private double finalSecurityDeposit;
    private int duration;

    public RentedDto(RentedProperty rentedProperty) {
        this.id = rentedProperty.getId();
        this.startDate = rentedProperty.getStartDate();
        this.endDate = rentedProperty.getEndDate();
        this.finalMonthlyRent = rentedProperty.getFinalMonthlyRent();
        this.finalSecurityDeposit = rentedProperty.getFinalSecurityDeposit();
        this.duration = (rentedProperty.getEndDate().getYear() - rentedProperty.getStartDate().getYear()) * 12 +
                (rentedProperty.getEndDate().getMonthValue() - rentedProperty.getStartDate().getMonthValue()) -
                ((rentedProperty.getEndDate().getDayOfMonth()<rentedProperty.getStartDate().getDayOfMonth()) ? 1 : 0);
    }
}
