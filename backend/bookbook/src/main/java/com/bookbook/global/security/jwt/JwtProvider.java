package com.bookbook.global.security.jwt;

import com.bookbook.global.exception.ServiceException;
import com.bookbook.global.security.refreshToken.RefreshToken;
import com.bookbook.global.security.refreshToken.RefreshTokenRepository;
import io.jsonwebtoken.*;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import lombok.Getter;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.security.Key;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@Slf4j
@Component
public class JwtProvider {

    private final String secretKey;
    @Getter
    private final int accessTokenValidityInSeconds;
    @Getter
    private final int refreshTokenValidityInSeconds;

    private final RefreshTokenRepository refreshTokenRepository;

    private Key key;

    public JwtProvider(@Value("${jwt.secret-key}") String secretKey,
                       @Value("${jwt.access-token-validity-in-seconds}") int accessTokenValidityInSeconds,
                       @Value("${jwt.refresh-token-validity-in-seconds}") int refreshTokenValidityInSeconds,
                       RefreshTokenRepository refreshTokenRepository) {
        this.secretKey = secretKey;
        this.accessTokenValidityInSeconds = accessTokenValidityInSeconds;
        this.refreshTokenValidityInSeconds = refreshTokenValidityInSeconds;
        this.refreshTokenRepository = refreshTokenRepository;
        getSigningKey(); // 키 초기화
    }

    private Key getSigningKey() {
        if (this.key == null) {
            byte[] keyBytes = Decoders.BASE64.decode(secretKey);
            this.key = Keys.hmacShaKeyFor(keyBytes);
        }
        return this.key;
    }

    // Access Token 생성 메서드 (기존과 동일)
    public String generateAccessToken(Long userId, String username, String role) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("userId", userId);
        claims.put("username", username);
        claims.put("role", role);

        Date now = new Date();
        Date validity = new Date(now.getTime() + accessTokenValidityInSeconds * 1000L);

        return Jwts.builder()
                .setClaims(claims)
                .setSubject(String.valueOf(userId))
                .setIssuedAt(now)
                .setExpiration(validity)
                .signWith(getSigningKey(), SignatureAlgorithm.HS512)
                .compact();
    }

    // Refresh Token 생성 및 저장 메서드
    @Transactional
    public String generateRefreshToken(Long userId) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("userId", userId);

        Date now = new Date();
        Date validity = new Date(now.getTime() + refreshTokenValidityInSeconds * 1000L);

        String refreshTokenValue = Jwts.builder()
                .setClaims(claims)
                .setSubject(String.valueOf(userId))
                .setIssuedAt(now)
                .setExpiration(validity)
                .signWith(getSigningKey(), SignatureAlgorithm.HS512)
                .compact();

        // DB에 기존 리프레시 토큰이 있는지 확인하고 업데이트하거나 새로 저장
        Optional<RefreshToken> existingToken = refreshTokenRepository.findByUserId(userId);
        if (existingToken.isPresent()) {
            RefreshToken refreshToken = existingToken.get();
            refreshToken.updateToken(refreshTokenValue, LocalDateTime.ofInstant(validity.toInstant(), ZoneId.systemDefault()));
        } else {
            refreshTokenRepository.save(
                    RefreshToken.builder()
                            .token(refreshTokenValue)
                            .userId(userId)
                            .expiryDate(LocalDateTime.ofInstant(validity.toInstant(), ZoneId.systemDefault()))
                            .build()
            );
        }
        return refreshTokenValue;
    }

    // 토큰에서 모든 클레임(claims) 추출 (기존과 동일하며, Refresh Token에도 사용 가능)
    public Claims getAllClaimsFromToken(String token) {
        try {
            return Jwts.parserBuilder()
                    .setSigningKey(getSigningKey())
                    .build()
                    .parseClaimsJws(token)
                    .getBody();
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

    // Access Token 유효성 검사 (JwtAuthenticationFilter에서 사용, 기존과 동일)
    public boolean validateToken(String token) {
        try {
            Jwts.parserBuilder().setSigningKey(getSigningKey()).build().parseClaimsJws(token);
            return true;
        } catch (Exception e) {
            log.error("JWT token validation failed: {}", e.getMessage());
            return false;
        }
    }

    // Refresh Token의 유효성 검사 (API 엔드포인트에서 사용)
    @Transactional
    public void validateRefreshToken(String refreshTokenValue) {
        try {
            // JWT 자체의 유효성 (서명, 구조 등) 검사
            Claims claims = getAllClaimsFromToken(refreshTokenValue);
            Long userId = claims.get("userId", Long.class);

            // DB에 저장된 리프레시 토큰과 일치하는지, 만료되지 않았는지 확인
            RefreshToken storedRefreshToken = refreshTokenRepository.findByToken(refreshTokenValue)
                    .orElseThrow(() -> new ServiceException("401-REFRESH-TOKEN-NOT-FOUND", "유효하지 않은 리프레시 토큰입니다."));

            if (!storedRefreshToken.getUserId().equals(userId)) {
                throw new ServiceException("401-REFRESH-TOKEN-MISMATCH", "토큰 소유자가 일치하지 않습니다.");
            }

            if (storedRefreshToken.isExpired()) {
                refreshTokenRepository.delete(storedRefreshToken); // 만료된 토큰 DB에서 삭제
                throw new ServiceException("401-REFRESH-TOKEN-EXPIRED", "만료된 리프레시 토큰입니다. 다시 로그인 해주세요.");
            }

        } catch (ServiceException e) {
            throw e;
        } catch (Exception e) {
            log.error("리프레시 토큰 유효성 검사 실패: {}", e.getMessage());
            throw new ServiceException("401-REFRESH-TOKEN-INVALID", "유효하지 않은 리프레시 토큰입니다.");
        }
    }

    // 리프레시 토큰을 DB에서 삭제하는 메서드 (로그아웃 시 호출)
    @Transactional
    public void deleteRefreshToken(Long userId) {
        refreshTokenRepository.deleteByUserId(userId);
    }
}