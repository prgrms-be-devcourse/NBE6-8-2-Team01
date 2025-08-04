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
    private User user;  // 찜한 사용자 (위시리스트의 주인)

    @ManyToOne
    private Rent rent;  // 찜한 도서 (대여 게시글)

    // @Enumerated(EnumType.STRING) - enum을 문자열로 DB에 저장
    // 예: ACTIVE → "ACTIVE", DELETED → "DELETED"로 저장
    // EnumType.ORDINAL을 사용하면 0, 1로 저장되어 enum 순서 변경시 문제 발생
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    // 위시리스트 상태 - 기본값은 ACTIVE (활성 상태)
    // ACTIVE: 찜한 상태, DELETED: 찜 해제한 상태 (Soft Delete)
    private WishListStatus status = WishListStatus.ACTIVE;
}
