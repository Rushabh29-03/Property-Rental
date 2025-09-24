package com.propertyRental.pocproject.service;

import com.propertyRental.pocproject.entity.Property;
import com.propertyRental.pocproject.entity.User;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements CommandLineRunner {

    public final UserService userService;

    public DataInitializer(UserService userService){
        this.userService=userService;
    }

    @Override
    public void run(String... args) throws Exception {
//        User user=
//                new User("jordan2903", "1234", "s@gmail.com", "rushabh", "shah", "7984489202");
//
//        Property property = new Property("semi-furnished", "jeevan jyot society", 1159.5, 15000, 3, 15000);
//        Property property1 = new Property("furnished", "vavol", 800.0, 20000, 2, 20000);
//
//        user.add(property);
//        user.add(property1);
//
//        System.out.println("Saving user: "+user);
//        userService.saveUserWithProperties(user);
//        System.out.println("saved!!");

        addUser();
//        userService.rentProperty(4, 2);
//        userService.markPropertyAsWishList(4, 2);
    }

    private void addUser() {
        User user=
                new User("jakasbhai", "0209", "jakas@gmail.com", "rushabh", "shah", "8780419825");
        userService.saveUser(user);
    }


}
