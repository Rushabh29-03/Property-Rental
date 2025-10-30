package com.property_rental.backend.user.repository;

import com.property_rental.backend.user.entities.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Integer> {

    // Spring Data JPA automatically creates a query for this method.
    // The method name must match the field name 'userName' in User entity.
    Optional<User> findByUserName(String userName);

//    Find user by email - for OAuth
    Optional<User> findByEmail(String email);

//    check if username exists
    boolean existsByUserName(String userName);

//    check if email exists
    boolean existsByEmail(String email);

}
