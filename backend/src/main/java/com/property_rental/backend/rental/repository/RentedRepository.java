package com.property_rental.backend.rental.repository;

import com.property_rental.backend.rental.dtos.RentedDto;
import com.property_rental.backend.rental.entities.RentedProperty;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RentedRepository extends JpaRepository<RentedProperty, Integer> {

    List<RentedDto> findByUserId(int userId);
    Optional<RentedProperty> findByUserIdAndPropertyId(int userId, int propertyId);
    List<RentedProperty> findByPropertyId(int propertyId);

    @Query("SELECT COUNT(r) FROM RentedProperty r WHERE r.property.id = :propertyId AND r.status = false")
    int countPendingRequestsByPropertyId(@Param("propertyId") int propertyId);
}
