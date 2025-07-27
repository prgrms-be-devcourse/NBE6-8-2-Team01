package com.bookbook.domain.user.entity;

import com.bookbook.domain.user.enums.Role;
import com.bookbook.domain.user.enums.UserStatus;
import com.bookbook.global.entity.BaseEntity;
import jakarta.persistence.*;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Entity
@Table(name = "users") // 예약어 충돌 방지
@EntityListeners(AuditingEntityListener.class)
@NoArgsConstructor(access = lombok.AccessLevel.PROTECTED)
@Getter  // 이 어노테이션 추가!
public class User extends BaseEntity {
    @Id
    @Column(name = "id")
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "username", unique = true, nullable = false) // api로 받아오는 username
    private String username;

    @Column(name = "password", nullable = false)
    private String password;

    @Column(name = "nickname", unique = true, nullable = false)
    private String nickname;

    @Column(name = "email", unique = true, nullable = false)
    private String email;

    @Column(name = "address", nullable = false)
    private String address;

    // 별점 = (리뷰를 남긴 사람들의 별점들의 합) / (리뷰를 남긴 사람의 수)
    // 리뷰 수를 우리가 어떻게 처리할 수 있을까요?
    @Min(0)
    @Max(5)
    @Column(name = "rating", nullable = false)
    private Float rating;

    @Enumerated(EnumType.STRING)
    @Column(name = "role", nullable = false)
    private Role role;

    @Enumerated(EnumType.STRING)
    @Column(name = "user_status", nullable = false)
    private UserStatus userStatus;

    @CreatedDate
    private LocalDateTime createAt;

    @LastModifiedDate
    private LocalDateTime updateAt;

    @Builder
    public User(String username, String password, String nickname, String email, String address, Role role, UserStatus userStatus) {
        this.username = username;
        this.password = password;
        this.nickname = nickname;
        this.email = email;
        this.address = address;
        this.rating = 0.0f;
        this.role = role != null ? role : Role.USER; // 기본값은 USER
        this.userStatus = userStatus != null ? userStatus : UserStatus.ACTIVE; // 기본값은 ACTIVE
    }

    public void changeAddress(String address) {
        this.address = address;
    }

    public void changeNickname(String nickname) {
        this.nickname = nickname;
    }

    public void changeUserStatus(UserStatus userStatus) {
        this.userStatus = userStatus;
    }

    public void changeRating(Float rating) {
        if (rating < 0 || rating > 5) {
            throw new IllegalArgumentException("Rating must be between 0 and 5");
        }
        this.rating = rating;
    }
}
