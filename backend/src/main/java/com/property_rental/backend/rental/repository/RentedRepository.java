package com.property_rental.backend.rental.repository;

import com.property_rental.backend.rental.entities.RentedProperty;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface RentedRepository extends JpaRepository<RentedProperty, Integer> {


}
