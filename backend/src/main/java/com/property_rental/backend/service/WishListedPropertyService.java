package com.property_rental.backend.service;

import com.property_rental.backend.dtos.PropertyDto;
import com.property_rental.backend.dtos.WishListedPropertyDto;
import com.property_rental.backend.entities.Property;
import com.property_rental.backend.entities.User;
import com.property_rental.backend.entities.WishListedProperty;
import com.property_rental.backend.repositories.WishListedPropertyRepository;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.NoSuchElementException;

@Service
public class WishListedPropertyService {

//    injection
    private final WishListedPropertyRepository wishListedPropertyRepository;
    private final UserService userService;
    private final PropertyService propertyService;

    public WishListedPropertyService(WishListedPropertyRepository wishListedPropertyRepository, UserService userService, PropertyService propertyService) {
        this.wishListedPropertyRepository = wishListedPropertyRepository;
        this.userService = userService;
        this.propertyService = propertyService;
    }

    @Transactional
    public WishListedPropertyDto markAsWishlist(String username, WishListedProperty wishListedProperty, int propertyId){

       try {
           User user = userService.findByUsername(username); //throws UsernameNotFoundException
           Property property = propertyService.findPropertyById(propertyId); //throws NoSuchElementException

           wishListedProperty.setProperty(property);
           wishListedProperty.setUser(user);

           user.addWishList(wishListedProperty);
           property.markAsWishList(wishListedProperty);

           return new WishListedPropertyDto(wishListedPropertyRepository.save(wishListedProperty));
       } catch (UsernameNotFoundException e){
           throw new UsernameNotFoundException(e.getMessage());
       } catch (NoSuchElementException e){
           throw new NoSuchElementException(e.getMessage());
       } catch (Exception e) {
           throw new RuntimeException(e);
       }
    }

    public List<WishListedPropertyDto> getWishListedProperties(String username) {
        try {
            User user = userService.findByUsername(username); //throws UsernameNotFoundException
            return user.getWishListedProperties();
        }  catch (UsernameNotFoundException e) {
            throw new UsernameNotFoundException(e.getMessage());
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    @Transactional
    public void removeWishList(String username, int propertyId) {

        try {
            User user = userService.findByUsername(username); //throws UserNameNotFoundException

            WishListedProperty wishListedProperty = wishListedPropertyRepository.findByUserIdAndPropertyId(user.getId(), propertyId).orElseThrow(
                    ()-> new NoSuchElementException("User  with id: "+user.getId()+" haven't marked property: "+propertyId+" as wish list")
            );
            wishListedPropertyRepository.delete(wishListedProperty);
        } catch (UsernameNotFoundException e){
            throw new UsernameNotFoundException(e.getMessage());
        } catch (NoSuchElementException e){
            throw new NoSuchElementException(e.getMessage());
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }
}
