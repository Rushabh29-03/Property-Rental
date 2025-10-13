package com.property_rental.backend.rental.repository;

import com.property_rental.backend.rental.dtos.RentedDto;
import com.property_rental.backend.rental.entities.RentedProperty;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RentedRepository extends JpaRepository<RentedProperty, Integer> {

    List<RentedDto> findByUserId(int userId);
}
