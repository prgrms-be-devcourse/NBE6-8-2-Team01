package com.bookbook.global.security.jwt;

import com.bookbook.global.exception.ServiceException;
import io.jsonwebtoken.*;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import lombok.Getter;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.security.Key;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

@Slf4j
@Component
public class JwtProvider {

    @Value("${jwt.secret-key}")
    private String secretKey; // application.yml에서 주입받을 JWT 비밀 키

    @Getter
    @Value("${jwt.access-token-validity-in-seconds}")
    private int accessTokenValidityInSeconds; // application.yml에서 주입받을 토큰 유효 시간 (초)

    private Key key; // 서명에 사용될 Key 객체

    // SecretKey로부터 서명 키를 초기화하는 메서드
    private Key getSigningKey() {
        if (this.key == null) {
            byte[] keyBytes = Decoders.BASE64.decode(secretKey);
            this.key = Keys.hmacShaKeyFor(keyBytes);
        }
        return this.key;
    }

    // Access Token 생성 메서드
    public String generateAccessToken(Long userId, String username, String role) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("userId", userId);
        claims.put("username", username);
        claims.put("role", role); // 사용자의 역할(ROLE_USER, ROLE_ADMIN 등) 추가

        Date now = new Date();
        // 토큰 만료 시간 설정: 현재 시간 + 유효 시간 (밀리초 단위)
        Date validity = new Date(now.getTime() + accessTokenValidityInSeconds * 1000L);

        return Jwts.builder()
                .setClaims(claims) // JWT에 포함될 데이터 (페이로드)
                .setSubject(String.valueOf(userId)) // 토큰의 주체 (보통 사용자 ID)
                .setIssuedAt(now) // 토큰 발행 시간
                .setExpiration(validity) // 토큰 만료 시간
                .signWith(getSigningKey(), SignatureAlgorithm.HS512) // 서명 알고리즘과 키 설정
                .compact(); // JWT 문자열 생성
    }

    // 토큰에서 모든 클레임(claims) 추출
    public Claims getAllClaimsFromToken(String token) {
        try {
            return Jwts.parserBuilder()
                    .setSigningKey(getSigningKey()) // 서명 키 설정
                    .build()
                    .parseClaimsJws(token) // 토큰 파싱 및 서명 검증
                    .getBody(); // 클레임 본문 반환
        } catch (io.jsonwebtoken.security.SecurityException | MalformedJwtException e) {
            log.info("잘못된 JWT 서명입니다.");
            throw new ServiceException("401-JWT-INVALID", "잘못된 JWT 서명입니다.");
        } catch (ExpiredJwtException e) {
            log.info("만료된 JWT 토큰입니다.");
            throw new ServiceException("401-JWT-EXPIRED", "만료된 JWT 토큰입니다.");
        } catch (UnsupportedJwtException e) {
            log.info("지원되지 않는 JWT 토큰입니다.");
            throw new ServiceException("401-JWT-UNSUPPORTED", "지원되지 않는 JWT 토큰입니다.");
        } catch (IllegalArgumentException e) {
            log.info("JWT 토큰이 잘못되었습니다.");
            throw new ServiceException("401-JWT-ILLEGAL", "JWT 토큰이 잘못되었습니다.");
        }
    }

    // 토큰 유효성 검사 (JwtAuthenticationFilter에서 사용)
    public boolean validateToken(String token) {
        try {
            Jwts.parserBuilder().setSigningKey(getSigningKey()).build().parseClaimsJws(token);
            return true; // 유효한 토큰
        } catch (Exception e) {
            log.error("JWT token validation failed: {}", e.getMessage());
            return false; // 유효하지 않은 토큰
        }
    }
}