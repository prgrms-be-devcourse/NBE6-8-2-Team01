package com.bookbook.domain.chat.config;

import com.bookbook.global.security.jwt.JwtProvider;
import com.bookbook.global.security.CustomOAuth2User;
import com.bookbook.domain.user.entity.User;
import com.bookbook.domain.user.repository.UserRepository;
import com.bookbook.domain.user.enums.Role;
import io.jsonwebtoken.Claims;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.config.ChannelRegistration;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

import java.util.Collections;
import java.util.HashMap;
import java.util.Map;

@Configuration
@EnableWebSocketMessageBroker
@RequiredArgsConstructor
@Slf4j
@Order(Ordered.HIGHEST_PRECEDENCE + 99)
public class WebSocketAuthConfig implements WebSocketMessageBrokerConfigurer {

    private final JwtProvider jwtProvider;
    private final UserRepository userRepository;

    @Override
    public void configureClientInboundChannel(ChannelRegistration registration) {
        registration.interceptors(new ChannelInterceptor() {
            @Override
            public Message<?> preSend(Message<?> message, MessageChannel channel) {
                StompHeaderAccessor accessor = MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);
                
                if (accessor != null && StompCommand.CONNECT.equals(accessor.getCommand())) {
                    // 쿠키에서 JWT 토큰 추출
                    String token = extractJwtFromCookie(accessor);
                    
                    if (token != null && jwtProvider.validateToken(token)) {
                        try {
                            // JWT에서 사용자 정보 추출
                            Claims claims = jwtProvider.getAllClaimsFromToken(token);
                            Long userId = claims.get("userId", Long.class);
                            String username = claims.get("username", String.class);
                            String role = claims.get("role", String.class);
                            
                            // 사용자 정보 조회
                            User user = userRepository.findById(userId).orElse(null);
                            if (user != null) {
                                // 간단한 attributes 맵 생성
                                Map<String, Object> attributes = new HashMap<>();
                                attributes.put("id", user.getId());
                                attributes.put("username", user.getUsername());
                                attributes.put("nickname", user.getNickname());
                                
                                // CustomOAuth2User 생성
                                CustomOAuth2User customUser = new CustomOAuth2User(
                                    Collections.singleton(new SimpleGrantedAuthority("ROLE_" + role)),
                                    attributes,
                                    "id", // nameAttributeKey
                                    user.getUsername(),
                                    user.getNickname(),
                                    user.getEmail(),
                                    user.getId(),
                                    false, // isNewUser
                                    user.isRegistrationCompleted(),
                                    user.getRole()
                                );
                                
                                // Authentication 객체 생성
                                Authentication authentication = new UsernamePasswordAuthenticationToken(
                                    customUser, 
                                    null, 
                                    customUser.getAuthorities()
                                );
                                
                                accessor.setUser(authentication);
                                log.info("WebSocket JWT 인증 성공 - userId: {}", userId);
                            }
                        } catch (Exception e) {
                            log.error("WebSocket JWT 인증 실패", e);
                        }
                    } else {
                        log.warn("WebSocket 연결 시 유효하지 않은 JWT 토큰");
                    }
                }
                
                return message;
            }
        });
    }

    private String extractJwtFromCookie(StompHeaderAccessor accessor) {
        // STOMP 헤더에서 쿠키 추출
        String cookieHeader = accessor.getFirstNativeHeader("cookie");
        if (cookieHeader != null) {
            String[] cookies = cookieHeader.split(";");
            for (String cookie : cookies) {
                String[] cookieParts = cookie.trim().split("=");
                if (cookieParts.length == 2 && "JWT_TOKEN".equals(cookieParts[0])) {
                    return cookieParts[1];
                }
            }
        }
        return null;
    }
}
