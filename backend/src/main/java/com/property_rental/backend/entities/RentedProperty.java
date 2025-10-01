package com.property_rental.backend.entities;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Entity
@Table(name = "rented_property")
public class RentedProperty {

    //    getters and setters
    //    create fields
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "rented_pr_id")
    private int id;

//    @Column(name = "property_id")
//    private int propertyId; //FOREIGN KEY

//    @Column(name = "user_id")
//    private int userId; //FOREIGN KEY

    @Setter
    @Getter
    @Column(name = "start_date", nullable = false)
    private LocalDate startDate;

    @Setter
    @Getter
    @Column(name = "end_date", nullable = false)
    private LocalDate endDate;

    @Setter
    @Getter
    @Column(name = "final_monthly_rent", nullable = false)
    private double finalMonthlyRent;

    @Setter
    @Getter
    @Column(name = "final_security_deposit", nullable = false)
    private double finalSecurityDeposit;

    @Setter
    @Getter
    @Column(name = "duration")
    private int duration; //in months

//        RENTED TO USERS
    @ManyToOne(cascade = {CascadeType.DETACH, CascadeType.MERGE,
            CascadeType.PERSIST, CascadeType.REFRESH})
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    //    RENTED TO PROPERTY
    @ManyToOne(cascade = {CascadeType.DETACH, CascadeType.MERGE,
            CascadeType.PERSIST, CascadeType.REFRESH})
    @JoinColumn(name = "property_id", nullable = false)
    private Property property;

    //    empty constructor
    public RentedProperty(){};

    //    constructor
    public RentedProperty(LocalDate startDate, LocalDate endDate, double finalMonthlyRent, double finalSecurityDeposit) {
        this.startDate = startDate;
        this.endDate = endDate;
        this.finalMonthlyRent = finalMonthlyRent;
        this.finalSecurityDeposit = finalSecurityDeposit;
        this.duration = (endDate.getYear() - startDate.getYear()) * 12 +
                (endDate.getMonthValue() - startDate.getMonthValue()) -
                ((endDate.getDayOfMonth()<startDate.getDayOfMonth()) ? 1 : 0);
    }


    //    toString()
    @Override
    public String toString() {
        return "RentedProperties{" +
                "id=" + id +
                ", startDate='" + startDate + '\'' +
                ", endDate='" + endDate + '\'' +
                ", finalMonthlyRent=" + finalMonthlyRent +
                ", finalSecurityDeposit=" + finalSecurityDeposit +
                ", duration=" + duration +
                '}';
    }
}
