package com.bookbook.config;

//08-06 유효상

import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Profile;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

/**
 * 데이터베이스 초기화 및 제약조건 업데이트 컴포넌트
 */
@Component
@RequiredArgsConstructor
@Slf4j
@Profile({"dev", "test", "default"}) // production 환경에서는 실행하지 않음
public class DatabaseInitializer {

    private final JdbcTemplate jdbcTemplate;

    @PostConstruct
    public void updateNotificationTypeConstraint() {
        try {
            log.info("===== 알림 타입 제약조건 업데이트 시작 =====");
            
            // 1. 기존 제약조건 삭제 (존재하는 경우)
            try {
                jdbcTemplate.execute("ALTER TABLE notification DROP CONSTRAINT IF EXISTS NOTIFICATION_TYPE_CHECK");
                log.info("기존 NOTIFICATION_TYPE_CHECK 제약조건 삭제 완료");
            } catch (Exception e) {
                log.warn("기존 제약조건 삭제 시 오류 (무시): {}", e.getMessage());
            }
            
            // 2. 새로운 제약조건 추가 (모든 NotificationType enum 값 포함)
            String newConstraint = "ALTER TABLE notification ADD CONSTRAINT NOTIFICATION_TYPE_CHECK " +
                    "CHECK (type IN ('RENT_REQUEST', 'RENT_APPROVED', 'RENT_REJECTED', 'WISHLIST_AVAILABLE', 'RETURN_REMINDER', 'POST_CREATED'))";
            
            jdbcTemplate.execute(newConstraint);
            log.info("새로운 NOTIFICATION_TYPE_CHECK 제약조건 추가 완료");
            
            // 3. 제약조건 확인
            Integer constraintCount = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM INFORMATION_SCHEMA.CHECK_CONSTRAINTS WHERE CONSTRAINT_NAME = 'NOTIFICATION_TYPE_CHECK'", 
                Integer.class
            );
            
            if (constraintCount != null && constraintCount > 0) {
                log.info("✅ NOTIFICATION_TYPE_CHECK 제약조건이 성공적으로 설정되었습니다");
            } else {
                log.warn("⚠️ NOTIFICATION_TYPE_CHECK 제약조건 설정을 확인할 수 없습니다");
            }
            
            // 4. 현재 notification 테이블의 type 컬럼 값들 확인
            try {
                Integer notificationCount = jdbcTemplate.queryForObject(
                    "SELECT COUNT(*) FROM notification", Integer.class
                );
                log.info("현재 notification 테이블의 레코드 수: {}", notificationCount);
                
                if (notificationCount != null && notificationCount > 0) {
                    jdbcTemplate.query(
                        "SELECT DISTINCT type FROM notification", 
                        (rs, rowNum) -> {
                            String type = rs.getString("type");
                            log.info("기존 알림 타입: {}", type);
                            return type;
                        }
                    );
                }
            } catch (Exception e) {
                log.warn("기존 데이터 확인 중 오류: {}", e.getMessage());
            }
            
            log.info("===== 알림 타입 제약조건 업데이트 완료 =====");
            
        } catch (Exception e) {
            log.error("알림 타입 제약조건 업데이트 실패: {}", e.getMessage(), e);
            // 애플리케이션 시작을 중단하지 않고 계속 진행
        }
    }
}
