package com.propertyRental.pocproject.dao;

import com.propertyRental.pocproject.entity.Property;
import com.propertyRental.pocproject.entity.RentedProperty;
import com.propertyRental.pocproject.entity.User;
import com.propertyRental.pocproject.entity.WishListedProperty;
import jakarta.persistence.EntityManager;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

@Repository
public class AppDAOImpl implements AppDAO{

    private EntityManager entityManager;

//    inject entitymanager using constructor injection
    public AppDAOImpl(EntityManager entityManager){
        this.entityManager=entityManager;
    }

    @Override
    @Transactional
    public void save(User user) {
        entityManager.persist(user);
    }

    @Override
    public User findUserById(int id){
        return entityManager.find(User.class, id);
    }

    @Override
    public Property findPropertyById(int id) {
        return entityManager.find(Property.class, id);
    }

    @Override
    public void rentProperty(RentedProperty rentedProperties) {
        entityManager.persist(rentedProperties);
    }

    @Override
    public void markAsWishList(WishListedProperty wishListedProperty) {
        entityManager.persist(wishListedProperty);
    }
}
