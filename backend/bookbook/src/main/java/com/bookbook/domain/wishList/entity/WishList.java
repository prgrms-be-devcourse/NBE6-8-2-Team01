package com.bookbook.domain.wishList.entity;

import com.bookbook.domain.user.entity.User;
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

    // TODO: Rent 엔티티 구현 후 주석 해제
    // @ManyToOne
    // private Rent rent;

    @CreatedDate
    private LocalDateTime createDate;
}
