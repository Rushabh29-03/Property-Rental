package com.property_rental.backend.dtos;

import com.property_rental.backend.entities.Property;
import com.property_rental.backend.entities.RentedProperty;
import lombok.*;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString
public class PropertyDto {
    private int id;
    private String description;
    private String address;
    private Boolean isVerified;
    private Double area;
    private String areaUnit; //DEFAULT sq_feet
    private Double monthlyRent;
    private int noOfBedrooms;
    private Double securityDepositAmount;
    private List<RentedProperty> rentedPropertyList;

    public PropertyDto(Property property){
        this.id= property.getId();
        this.description= property.getDescription();;
        this.address= property.getAddress();;
        this.isVerified= property.getIsVerified();
        this.area= property.getArea();
        this.areaUnit= property.getAreaUnit();;
        this.monthlyRent= property.getMonthlyRent();
        this.noOfBedrooms= property.getNoOfBedrooms();
        this.securityDepositAmount= property.getSecurityDepositAmount();
    }
}
