package com.property_rental.backend.repositories;

import com.property_rental.backend.entities.RentedProperty;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface RentedRepository extends JpaRepository<RentedProperty, Integer> {


}
