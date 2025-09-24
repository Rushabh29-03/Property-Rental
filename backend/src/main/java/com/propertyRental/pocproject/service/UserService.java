package com.propertyRental.pocproject.service;

import com.propertyRental.pocproject.dao.AppDAO;
import com.propertyRental.pocproject.entity.Property;
import com.propertyRental.pocproject.entity.RentedProperty;
import com.propertyRental.pocproject.entity.User;
import com.propertyRental.pocproject.entity.WishListedProperty;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;

@Service
@Transactional
public class UserService {
    private final AppDAO appDAO;

    public UserService(AppDAO appDAO) {
        this.appDAO = appDAO;
    }

    public void saveUser(User user){
        appDAO.save(user);
    }

    public void saveUserWithProperties(User user){
        if(user.getProperties()!=null){
            user.getProperties().forEach(property -> property.setOwner(user));
        }
        appDAO.save(user);
    }

    public User getUserByid(int id){
        return appDAO.findUserById(id);
    }

    public void rentProperty(int user_id, int pr_id){
        User user=appDAO.findUserById(user_id);
        Property property=appDAO.findPropertyById(pr_id);

        RentedProperty rentedProperties =
                new RentedProperty(LocalDate.parse("2025-01-01"), LocalDate.parse("2025-05-20"), 15000, 10000);

        RentedProperty rentedProperties1=
                new RentedProperty(LocalDate.parse("2025-06-01"), LocalDate.parse("2025-07-01"), 10000, 5000);

        rentedProperties1.setUser(user);
        rentedProperties1.setProperty(property);

        appDAO.rentProperty(rentedProperties1);
    }

    public void markPropertyAsWishList(int user_id, int pr_id){
        User user=appDAO.findUserById(user_id);
        Property property=appDAO.findPropertyById(pr_id);

        WishListedProperty wishListedProperty=
                new WishListedProperty("nearby area");

        wishListedProperty.setUser(user);
        wishListedProperty.setProperty(property);
        wishListedProperty.setStatus("jakas bhai");

        appDAO.markAsWishList(wishListedProperty);
    }
}
