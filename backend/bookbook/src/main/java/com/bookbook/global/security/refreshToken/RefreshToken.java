package com.bookbook.global.security.refreshToken;


import com.bookbook.global.jpa.entity.BaseEntity;
import jakarta.persistence.Entity;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class RefreshToken extends BaseEntity {

    private String token; // 실제 리프레시 토큰 값 (JWT)
    private Long userId; // 이 토큰을 소유한 유저 ID
    private LocalDateTime expiryDate; // 만료일시

    @Builder
    public RefreshToken(String token, Long userId, LocalDateTime expiryDate) {
        this.token = token;
        this.userId = userId;
        this.expiryDate = expiryDate;
    }

    // 토큰 값과 만료일을 업데이트하는 메서드
    public void updateToken(String newToken, LocalDateTime newExpiryDate) {
        this.token = newToken;
        this.expiryDate = newExpiryDate;
    }

    // 토큰 만료 여부 확인 메서드
    public boolean isExpired() {
        return this.expiryDate.isBefore(LocalDateTime.now());
    }
}