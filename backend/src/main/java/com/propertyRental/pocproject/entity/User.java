package com.propertyRental.pocproject.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.DynamicInsert;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "users")
@DynamicInsert
public class User {

//    getters and setters
    //    creating fields
    @Setter
    @Getter
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "user_id")
    private int id;

    @Setter
    @Getter
    @Column(name = "username", nullable = false, unique = true)
    private String userName;

    @Getter
    @Setter
    @Column(name = "password", nullable = false)
    private String password;

    @Setter
    @Getter
    @Column(name = "email", nullable = false, unique = true)
    private String email;

    @Getter
    @Setter
    @Column(name = "first_name", nullable = false)
    private String firstName;

    @Getter
    @Setter
    @Column(name = "last_name", nullable = false)
    private String lastName;

    @Getter
    @Setter
    @Column(name = "phone_no")
    private String phoneNo;

    @Column(name = "is_owner")
    private boolean isOwner=false; //DEFAULT false

    @Setter
    @Getter
    @Column(name = "registration_date", columnDefinition = "TIMESTAMP DEFAULT current_timestamp", updatable = false)
    private LocalDateTime registrationDate; //DEFAULT current_timestamp

//    OWNER TO PROPERTY
    @Setter
    @Getter
    @OneToMany(mappedBy = "owner",
        fetch = FetchType.LAZY,
        cascade = CascadeType.ALL)
    private List<Property> properties;

//    USER TO RENTED PROPERTY
    @Setter
    @Getter
    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL)
    private List<RentedProperty> rentedProperties;

//    USER TO WISHLIST PROPERTY
    @Setter
    @Getter
    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL)
    private List<WishListedProperty> wishListedProperties;

//    empty constructor
    public User (){}

//    constructor

    public User(String userName, String password, String email, String firstName, String lastName, String phoneNo) {
        this.userName = userName;
        this.password = password;
        this.email = email;
        this.firstName = firstName;
        this.lastName = lastName;
        this.phoneNo = phoneNo;
    }

    //    getters and setters
//    most of the getters and setters are handled by lombok.Getter and lombok.Setter
//    take a note of it if getter/setter doesn't work
    public boolean isOwner() {
        return isOwner;
    }

    public void setIsOwner(boolean owner) {
        isOwner = owner;
    }

    @Override
    public String toString() {
        return "User{" +
                "id=" + id +
                ", userName='" + userName + '\'' +
                ", password='" + password + '\'' +
                ", email='" + email + '\'' +
                ", firstName='" + firstName + '\'' +
                ", lastName='" + lastName + '\'' +
                ", phoneNo='" + phoneNo + '\'' +
                ", isOwner=" + isOwner +
                ", registrationDate='" + registrationDate + '\'' +
                '}';
    }

//    add convenience method to add properties
    public void add(Property property){
        if(properties==null)
            properties=new ArrayList<>();

        properties.add(property);
        property.setOwner(this);
    }

    public void addWishList(WishListedProperty wishListedProperty){
        if (wishListedProperties == null) {
            wishListedProperties=new ArrayList<>();
        }

        wishListedProperties.add(wishListedProperty);
    }

}
