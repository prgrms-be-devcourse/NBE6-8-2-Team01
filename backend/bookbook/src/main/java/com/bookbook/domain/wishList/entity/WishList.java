package com.bookbook.domain.wishList.entity;

import com.bookbook.domain.rent.entity.Rent;
import com.bookbook.domain.user.entity.User;
import com.bookbook.domain.wishList.enums.WishListStatus;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.data.annotation.CreatedDate;

import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@NoArgsConstructor
public class WishList {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    private User user;

    @ManyToOne
    private Rent rent;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private WishListStatus status = WishListStatus.ACTIVE;

    @CreatedDate
    private LocalDateTime createDate;
}
