package com.property_rental.backend.rental;

import com.property_rental.backend.rental.entities.RentedProperty;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface RentedRepository extends JpaRepository<RentedProperty, Integer> {


}
