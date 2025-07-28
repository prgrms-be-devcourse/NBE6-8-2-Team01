package com.bookbook.domain.suspend.entity;

import com.bookbook.domain.user.entity.User;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Entity
@Getter
@Table(name = "suspended_users")
@EntityListeners(AuditingEntityListener.class)
@NoArgsConstructor(access = lombok.AccessLevel.PROTECTED)
public class SuspendedUser {

    @Id
    @Column(name = "suspend_id")
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @Column(name = "suspend_reason", nullable = false)
    private String reason;

    @Column(name = "suspended_at", nullable = false)
    private LocalDateTime suspendedAt;

    @Column(name = "resumed_at", nullable = false)
    private LocalDateTime resumedAt;

    public SuspendedUser(User user, String reason) {
        this.user = user;
        this.reason = reason;
        this.suspendedAt = user.getSuspendedAt();
        this.resumedAt = user.getResumedAt();
    }
}
