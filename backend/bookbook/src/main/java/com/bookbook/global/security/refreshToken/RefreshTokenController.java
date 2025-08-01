package com.bookbook.global.security.refreshToken;

import com.bookbook.domain.user.entity.User;
import com.bookbook.domain.user.service.UserService;
import com.bookbook.global.exception.ServiceException;
import com.bookbook.global.rsdata.RsData;
import com.bookbook.global.security.jwt.JwtProvider;
import io.jsonwebtoken.Claims;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import static org.springframework.http.HttpStatus.BAD_REQUEST;

@Slf4j
@RestController
@RequestMapping("/api/v1/bookbook/auth")
@RequiredArgsConstructor
public class RefreshTokenController {

    private final JwtProvider jwtProvider;
    private final UserService userService;

    @Value("${jwt.cookie.name}")
    private String jwtAccessTokenCookieName;
    @Value("${jwt.cookie.refresh-name}")
    private String jwtRefreshTokenCookieName;


    @PostMapping("/refresh-token")
    public ResponseEntity<RsData<Void>> refreshAccessToken(HttpServletRequest request, HttpServletResponse response) {
        String refreshTokenValue = null;
        Cookie[] cookies = request.getCookies();
        if (cookies != null) {
            for (Cookie cookie : cookies) {
                if (jwtRefreshTokenCookieName.equals(cookie.getName())) {
                    refreshTokenValue = cookie.getValue();
                    break;
                }
            }
        }

        if (refreshTokenValue == null) {
            return new ResponseEntity<>(RsData.of("400-REFRESH-TOKEN-MISSING", "리프레시 토큰이 없습니다."), BAD_REQUEST);
        }

        try {
            // 1. 리프레시 토큰 유효성 검사 (JWT 자체 유효성, DB 존재 및 만료 여부)
            jwtProvider.validateRefreshToken(refreshTokenValue);

            // 2. 리프레시 토큰에서 사용자 ID 추출
            Claims claims = jwtProvider.getAllClaimsFromToken(refreshTokenValue);
            Long userId = claims.get("userId", Long.class);

            // 3. 사용자 정보 조회 (새로 추가한 getByIdOrThrow 메서드 사용)
            User user = userService.getByIdOrThrow(userId);

            // 4. 새로운 Access Token 발급
            String newAccessToken = jwtProvider.generateAccessToken(user.getId(), user.getUsername(), user.getRole().name());

            // 5. 새로운 Refresh Token 발급 (Rotating Refresh Token 전략)
            String newRefreshTokenValue = jwtProvider.generateRefreshToken(user.getId());

            // 6. 새로운 Access Token을 HTTP Only 쿠키에 담아 전송
            Cookie newAccessTokenCookie = new Cookie(jwtAccessTokenCookieName, newAccessToken);
            newAccessTokenCookie.setHttpOnly(true);
            newAccessTokenCookie.setSecure(false);
            newAccessTokenCookie.setPath("/");
            newAccessTokenCookie.setMaxAge(jwtProvider.getAccessTokenValidityInSeconds());
            response.addCookie(newAccessTokenCookie);

            // 7. 새로운 Refresh Token을 HTTP Only 쿠키에 담아 전송
            Cookie newRefreshTokenCookie = new Cookie(jwtRefreshTokenCookieName, newRefreshTokenValue);
            newRefreshTokenCookie.setHttpOnly(true);
            newRefreshTokenCookie.setSecure(false);
            newRefreshTokenCookie.setPath("/");
            newRefreshTokenCookie.setMaxAge(jwtProvider.getRefreshTokenValidityInSeconds());
            response.addCookie(newRefreshTokenCookie);

            return new ResponseEntity<>(RsData.of("200-OK", "새로운 액세스 토큰이 발급되었습니다."), HttpStatus.OK);

        } catch (ServiceException e) {
            throw e;
        } catch (Exception e) {
            log.error("토큰 갱신 중 예상치 못한 오류 발생", e);
            return new ResponseEntity<>(RsData.of("500-INTERNAL-SERVER-ERROR", "토큰 갱신 중 오류가 발생했습니다."), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}