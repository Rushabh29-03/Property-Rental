package com.property_rental.backend.user;

import com.property_rental.backend.user.entities.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Integer> {

    // Spring Data JPA automatically creates a query for this method.
    // The method name must match the field name 'userName' in User entity.
    Optional<User> findByUserName(String userName);
}
