package com.property_rental.backend.wishlist;

import com.property_rental.backend.wishlist.entities.WishListedProperty;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface WishListedPropertyRepository extends JpaRepository<WishListedProperty, Integer> {

    Optional<WishListedProperty> findByUserIdAndPropertyId(int userId, int propertyId);
}
