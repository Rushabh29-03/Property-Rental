package com.propertyRental.pocproject.dao;

import com.propertyRental.pocproject.entity.Property;
import com.propertyRental.pocproject.entity.RentedProperty;
import com.propertyRental.pocproject.entity.User;
import com.propertyRental.pocproject.entity.WishListedProperty;

public interface AppDAO {

    void save(User user);

    User findUserById(int id);

    Property findPropertyById(int id);

    void rentProperty(RentedProperty rentedProperties);

    void markAsWishList(WishListedProperty wishListedProperty);
}
