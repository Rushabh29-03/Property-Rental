package com.property_rental.backend.wishlist.entities;

import com.property_rental.backend.property.dtos.PropertyDto;
import com.property_rental.backend.property.entities.Property;
import com.property_rental.backend.user.entities.User;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.DynamicInsert;

import java.time.LocalDateTime;

@Setter
@Getter
@Entity
@Table(name = "wishlisted_property")
@DynamicInsert
public class WishListedProperty {

    //    create fields
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "wishlisted_pr_id")
    private int id;

    @Setter
    @Getter
    @Column(name = "wishlist_date", insertable = false, updatable = false)
    private LocalDateTime wishlistDate=LocalDateTime.now(); //DEFAULT CURRENT_TIMESTAMP

    @Setter
    @Getter
    @Column(name = "note")
    private String note;

    @Setter
    @Getter
    @Column(name = "status", nullable = false)
    private String status="New"; //DEFAULT 'New'

    //    WISHLIST TO USER
    @Setter
    @Getter
    @ManyToOne(cascade = {CascadeType.DETACH, CascadeType.MERGE,
            CascadeType.PERSIST, CascadeType.REFRESH})
    @JoinColumn(name = "user_id")
    private User user;

    //    WISHLIST TO PROPERTY
    @Setter
    @ManyToOne(cascade = {CascadeType.DETACH, CascadeType.MERGE,
            CascadeType.PERSIST, CascadeType.REFRESH})
    @JoinColumn(name = "property_id")
    private Property property;

    //    empty constructor
    public WishListedProperty(){}

    //    constructor
    public WishListedProperty(String note, String status) {
        this.note = note;
        this.status = status;
    }

    public WishListedProperty(String note) {
        this.note = note;
    }

    //    toString()
    @Override
    public String toString() {
        return "WishListedProperties{" +
                "id=" + id +
                ", wishlistDate='" + wishlistDate + '\'' +
                ", note='" + note + '\'' +
                ", status='" + status + '\'' +
                '}';
    }

    public PropertyDto getProperty(){
        return new PropertyDto(property);
    }
}
