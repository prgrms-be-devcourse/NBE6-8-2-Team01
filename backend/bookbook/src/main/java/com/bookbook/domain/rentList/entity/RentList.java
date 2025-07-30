package com.bookbook.domain.rentList.entity;

import com.bookbook.domain.rent.entity.Rent;
import com.bookbook.domain.user.entity.User;
import com.bookbook.global.jpa.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@NoArgsConstructor
public class RentList extends BaseEntity {
    
    private LocalDateTime loanDate;
    private LocalDateTime returnDate;
    
    @ManyToOne
    private User borrowerUser;
    
    @ManyToOne
    private Rent rent;
}