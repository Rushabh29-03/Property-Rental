package com.property_rental.backend.photo.repository;

import com.property_rental.backend.photo.entities.Photo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PhotoRepository extends JpaRepository<Photo, Integer> {
    List<Photo> findByProperty_Id(int propertyId);
}
