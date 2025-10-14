package com.property_rental.backend.rental.entities;

import com.property_rental.backend.property.entities.Property;
import com.property_rental.backend.rental.models.RentRequest;
import com.property_rental.backend.user.entities.User;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Entity
@Table(name = "rented_property")
public class RentedProperty {

    //    create fields
    @Setter
    @Getter
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
    private float duration; //in months

    @Getter
    @Column(name = "status")
    private Boolean status=false;

//        RENTED TO USERS
    @Setter
    @Getter
    @ManyToOne(cascade = {CascadeType.DETACH, CascadeType.MERGE,
            CascadeType.PERSIST, CascadeType.REFRESH})
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    //    RENTED TO PROPERTY
    @Setter
    @Getter
    @ManyToOne(cascade = {CascadeType.DETACH, CascadeType.MERGE,
            CascadeType.PERSIST, CascadeType.REFRESH})
    @JoinColumn(name = "property_id", nullable = false)
    private Property property;

    //    empty constructor
    public RentedProperty(){};

    //    constructor
    public RentedProperty(LocalDate startDate, LocalDate endDate, double finalMonthlyRent, double finalSecurityDeposit, float duration, boolean status) {
        this.startDate = startDate;
        this.endDate = endDate;
        this.finalMonthlyRent = finalMonthlyRent;
        this.finalSecurityDeposit = finalSecurityDeposit;
        this.duration = duration;
        this.status = status;
    }

    public RentedProperty(RentRequest rentRequest){
        this.startDate = rentRequest.getStartDate();
        this.endDate = rentRequest.getEndDate();
    }

    public void setStatus(boolean status) {
        this.status = status;
    }

    //    toString()
    @Override
    public String toString() {
        return "RentedProperty{" +
                "id=" + id +
                ", startDate=" + startDate +
                ", endDate=" + endDate +
                ", finalMonthlyRent=" + finalMonthlyRent +
                ", finalSecurityDeposit=" + finalSecurityDeposit +
                ", duration=" + duration +
                ", status=" + status +
                ", user=" + user +
                ", property=" + property +
                '}';
    }
}
