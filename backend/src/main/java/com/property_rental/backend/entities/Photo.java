package com.property_rental.backend.entities;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "photos")
public class Photo {

    @Setter
    @Getter
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private int id;

    @Setter
    @Getter
    @Column(name = "path", nullable = false)
    private String path;

    @Setter
    @Getter
    @Column(name = "is_main", nullable = false)
    private boolean isMain;

//    PHOTOS TO PROPERTY
    @Setter
    @Getter
    @ManyToOne
    @JoinColumn(name = "pr_id", nullable = false)
    private Property property;

//    empty constructor
    public Photo(){}

//    constructor
    public Photo(String path, boolean isMain) {
        this.path = path;
        this.isMain = isMain;
    }
}
