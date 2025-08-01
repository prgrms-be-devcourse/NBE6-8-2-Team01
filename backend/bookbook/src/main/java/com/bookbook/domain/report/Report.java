package com.bookbook.domain.report;

import com.bookbook.domain.user.entity.User;
import com.bookbook.global.jpa.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Getter @Setter @NoArgsConstructor
public class Report extends BaseEntity {

    // BaseEntity를 상속받지만, User의 ID 타입에 맞추기 위해 다시 정의
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "reporter_user_id", nullable = false)
    private User reporterUser;

    @ManyToOne
    @JoinColumn(name = "target_user_id", nullable = false)
    private User targetUser;

    private String reason;

    public Report(User reporterUser, User targetUser, String reason) {
        this.reporterUser = reporterUser;
        this.targetUser = targetUser;
        this.reason = reason;
    }
}