package com.bookbook.domain.suspend.entity;

import com.bookbook.domain.user.entity.User;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Entity
@Getter
@Table(name = "suspended_users")
@EntityListeners(AuditingEntityListener.class)
@NoArgsConstructor(access = lombok.AccessLevel.PROTECTED)
public class SuspendedUser {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    @Column(name = "suspend_reason", nullable = false)
    private String reason;

    @CreatedDate
    @Column(name = "start_at")
    private LocalDateTime createDate;

    private LocalDateTime releaseDate;

    public SuspendedUser(User user, String reason) {
        this.user = user;
        this.reason = reason;
    }

    public SuspendedUser setSuspendPeriod(Integer period) {
        releaseDate = createDate.plusDays(period);
        return this;
    }
}
