package com.bookbook.domain.wishList.entity;

import com.bookbook.domain.rent.entity.Rent;
import com.bookbook.domain.user.entity.User;
import com.bookbook.domain.wishList.enums.WishListStatus;
import com.bookbook.global.jpa.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Getter
@Setter
@NoArgsConstructor
public class WishList extends BaseEntity {

    @ManyToOne
    private User user;

    @ManyToOne
    private Rent rent;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private WishListStatus status = WishListStatus.ACTIVE;
}
