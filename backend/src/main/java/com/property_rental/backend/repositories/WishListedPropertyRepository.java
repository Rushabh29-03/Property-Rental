package com.property_rental.backend.repositories;

import com.property_rental.backend.entities.WishListedProperty;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface WishListedPropertyRepository extends JpaRepository<WishListedProperty, Integer> {
}
