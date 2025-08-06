package com.bookbook.domain.rentList.controller;
//08-06 유효상
import com.bookbook.domain.rentList.dto.RentRequestDecisionDto;
import com.bookbook.domain.rentList.service.RentListService;
import com.bookbook.domain.user.entity.User;
import com.bookbook.domain.user.service.UserService;
import com.bookbook.global.rsdata.RsData;
import com.bookbook.global.security.CustomOAuth2User;
import com.bookbook.global.security.jwt.JwtProvider;
import io.jsonwebtoken.Claims;
import io.swagger.v3.oas.annotations.Operation;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

/**
 * 대여 신청 수락/거절을 위한 Public 컨트롤러
 */
@RestController
@RequestMapping("/api/v1/public/rentlist")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "http://localhost:3000")
public class RentListPublicController {
    
    private final RentListService rentListService;
    private final UserService userService;
    private final JwtProvider jwtProvider;
    
    @Value("${jwt.cookie.name}")
    private String jwtAccessTokenCookieName;
    
    /**
     * 대여 신청 수락/거절 처리 (Public 버전)
     */
    @PatchMapping("/{rentListId}/decision")
    @Operation(summary = "대여 신청 수락/거절 (Public)", description = "JWT 토큰을 직접 검증하여 대여 신청을 처리합니다.")
    public ResponseEntity<RsData<String>> decideRentRequestPublic(
            @PathVariable Long rentListId,
            @RequestBody RentRequestDecisionDto decision,
            HttpServletRequest request
    ) {
        log.info("===== Public 대여 신청 수락/거절 API 호출 - RentList ID: {}, 결정: {} =====", 
                rentListId, decision.isApproved() ? "수락" : "거절");
        
        try {
            // JWT 토큰 추출
            String jwt = extractJwtFromRequest(request);
            if (jwt == null) {
                log.warn("JWT 토큰을 찾을 수 없음");
                return ResponseEntity.status(401)
                        .body(RsData.of("401-1", "로그인이 필요합니다. JWT 토큰이 없습니다.", "NO_TOKEN"));
            }
            
            // JWT 토큰 유효성 검증
            if (!jwtProvider.validateToken(jwt)) {
                log.warn("JWT 토큰이 유효하지 않음");
                return ResponseEntity.status(401)
                        .body(RsData.of("401-2", "로그인이 필요합니다. 토큰이 만료되었거나 유효하지 않습니다.", "INVALID_TOKEN"));
            }
            
            // JWT에서 사용자 정보 추출
            Claims claims = jwtProvider.getAllClaimsFromToken(jwt);
            Long userId = claims.get("userId", Long.class);
            
            log.info("JWT에서 추출된 사용자 ID: {}", userId);
            
            // 사용자 정보 조회
            User currentUser = userService.findById(userId);
            if (currentUser == null) {
                log.error("사용자 ID {}에 해당하는 사용자를 찾을 수 없습니다.", userId);
                return ResponseEntity.status(404)
                        .body(RsData.of("404-1", "사용자 정보를 찾을 수 없습니다.", null));
            }
            
            log.info("대여 신청 처리 시작 - 사용자: {}, RentList ID: {}", 
                    currentUser.getNickname(), rentListId);
            
            // 대여 신청 처리
            String result = rentListService.decideRentRequest(rentListId, decision, currentUser);
            log.info("대여 신청 처리 완료 - 결과: {}", result);
            
            return ResponseEntity.ok(RsData.of("200-1", result, "SUCCESS"));
            
        } catch (RuntimeException e) {
            log.error("대여 신청 처리 실패 - RentList ID: {}, 오류: {}", rentListId, e.getMessage(), e);
            return ResponseEntity.badRequest()
                    .body(RsData.of("400-1", e.getMessage(), "BUSINESS_ERROR"));
        } catch (Exception e) {
            log.error("예상치 못한 오류 발생 - RentList ID: {}, 오류: {}", rentListId, e.getMessage(), e);
            return ResponseEntity.status(500)
                    .body(RsData.of("500-1", "서버 내부 오류가 발생했습니다.", "INTERNAL_ERROR"));
        }
    }
    
    /**
     * JWT 토큰 추출 메서드
     */
    private String extractJwtFromRequest(HttpServletRequest request) {
        // Authorization 헤더에서 Bearer 토큰 확인
        String authHeader = request.getHeader("Authorization");
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            return authHeader.substring(7);
        }
        
        // 쿠키에서 JWT 토큰 확인
        Cookie[] cookies = request.getCookies();
        if (cookies != null) {
            for (Cookie cookie : cookies) {
                if (jwtAccessTokenCookieName.equals(cookie.getName())) {
                    return cookie.getValue();
                }
            }
        }
        
        return null;
    }
}
