package com.bookbook.domain.user.entity;

import com.bookbook.domain.suspend.entity.SuspendedUser;
import com.bookbook.domain.user.enums.Role;
import com.bookbook.domain.user.enums.UserStatus;
import com.bookbook.global.entity.BaseEntity; // BaseEntity 임포트 유지
import jakarta.persistence.*;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.AllArgsConstructor; // ✅ AllArgsConstructor 추가
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Getter
@Setter
@Table(name = "users") // 예약어 충돌 방지
@EntityListeners(AuditingEntityListener.class)
@NoArgsConstructor(access = lombok.AccessLevel.PROTECTED)
@AllArgsConstructor
public class User extends BaseEntity {

    @Id
    @Column(name = "user_id")
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "username", unique = true, nullable = false) // api로 받아오는 username
    private String username;

    @Column(name = "password", nullable = false)
    private String password;

    @Column(name = "nickname", unique = true, nullable = true)
    private String nickname;

    @Column(name = "email", unique = true, nullable = true)
    private String email;

    @Column(name = "address", nullable = true)
    private String address;

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

    private LocalDateTime suspendedAt;

    private LocalDateTime resumedAt;

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL)
    private List<SuspendedUser> suspends;

    @Column(name = "registration_completed", nullable = false)
    private boolean registrationCompleted;

    @Builder
    public User(Long id, String username, String password, String nickname, String email, String address,
                Float rating, Role role, UserStatus userStatus, LocalDateTime createAt, LocalDateTime updateAt,
                boolean registrationCompleted) {
        this.id = id; // id도 빌더로 생성될 수 있도록 추가
        this.username = username;
        this.password = password;
        this.nickname = nickname;
        this.email = email;
        this.address = address;
        this.rating = (rating != null) ? rating : 0.0f;
        this.role = (role != null) ? role : Role.USER;
        this.userStatus = (userStatus != null) ? userStatus : UserStatus.ACTIVE;
        this.createAt = createAt;
        this.updateAt = updateAt;
        this.registrationCompleted = registrationCompleted;
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

    public void suspend(Integer periodDays) {
        this.setUserStatus(UserStatus.SUSPENDED);
        this.setSuspendedAt(LocalDateTime.now());
        this.setResumedAt(suspendedAt.plusDays(periodDays));
    }

    public void resume() {
        this.setUserStatus(UserStatus.ACTIVE);
        this.setSuspendedAt(null);
        this.setResumedAt(null);
    }

    public boolean isSuspended() {
        return userStatus == UserStatus.SUSPENDED;
    }

    public void changeUsername(String username) {
        this.username = username;
    }

    public void updateInfo(String nickname, String address) {
        if (nickname != null && !nickname.trim().isEmpty()) {
            this.setNickname(nickname);
        }
        if (address != null && !address.trim().isEmpty()) {
            this.setAddress(address);
        }
    }
}