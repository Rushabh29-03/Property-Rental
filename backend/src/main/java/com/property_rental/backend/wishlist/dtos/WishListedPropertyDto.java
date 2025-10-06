package com.property_rental.backend.wishlist.dtos;

import com.property_rental.backend.wishlist.entities.WishListedProperty;
import com.property_rental.backend.property.dtos.PropertyDto;
import lombok.*;

import java.time.LocalDateTime;

@Setter
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString
public class WishListedPropertyDto {
    private int id;
    private LocalDateTime wishlistDate;
    private String note;
    private String status;
    private PropertyDto propertyDto;

    public WishListedPropertyDto(WishListedProperty wishListedProperty){
        this.id= wishListedProperty.getId();
        this.wishlistDate= wishListedProperty.getWishlistDate();
        this.note= wishListedProperty.getNote();
        this.status= wishListedProperty.getStatus();
        this.propertyDto= wishListedProperty.getProperty();
    }
}
