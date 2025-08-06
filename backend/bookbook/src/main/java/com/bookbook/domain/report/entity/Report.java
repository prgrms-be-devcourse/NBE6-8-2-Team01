package com.bookbook.domain.report.entity;

import com.bookbook.domain.report.enums.ReportStatus;
import com.bookbook.domain.user.entity.User;
import com.bookbook.global.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;

import java.time.LocalDateTime;

@Entity // JPA 엔티티
@Getter
@Setter
@NoArgsConstructor
public class Report extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @CreatedDate
    private LocalDateTime createdDate;

    @LastModifiedDate
    private LocalDateTime modifiedDate;

    private LocalDateTime reviewedDate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ReportStatus status;

    @ManyToOne
    @JoinColumn(name = "reporter_user_id", nullable = false)
    private User reporterUser;

    @ManyToOne
    @JoinColumn(name = "target_user_id", nullable = false)
    private User targetUser;

    @ManyToOne
    @JoinColumn(name = "closer_id")
    private User closer;

    private String reason;

    public Report(User reporterUser, User targetUser, String reason) {
        this.reporterUser = reporterUser;
        this.targetUser = targetUser;
        this.reason = reason;
        this.status = ReportStatus.PENDING;
    }

    public void markAsReviewed() {
        this.status = ReportStatus.REVIEWED;
        this.reviewedDate = LocalDateTime.now();
    }

    public void markAsProcessed(User closer) {
        this.status = ReportStatus.PROCESSED;
        this.closer = closer;
    }
}
