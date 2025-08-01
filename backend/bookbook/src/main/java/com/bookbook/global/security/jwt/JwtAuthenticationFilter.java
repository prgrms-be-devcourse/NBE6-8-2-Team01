package com.bookbook.global.security.jwt;

import com.bookbook.domain.user.enums.Role;
import com.bookbook.global.security.CustomOAuth2User;
import io.jsonwebtoken.Claims;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Collections;
import java.util.HashMap;import java.util.List;
import java.util.Map;

@Slf4j
@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtProvider jwtProvider;

    @Value("${jwt.cookie.name}")
    private String jwtCookieName;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        try {
            String jwt = getJwtFromCookie(request);

            if (jwt != null && jwtProvider.validateToken(jwt)) {
                Claims claims = jwtProvider.getAllClaimsFromToken(jwt);

                Long userId = claims.get("userId", Long.class);
                String username = claims.get("username", String.class);
                String roleString = claims.get("role", String.class);
                Role role = Role.valueOf(roleString);

                List<GrantedAuthority> authorities = Collections.singletonList(new SimpleGrantedAuthority(role.name()));

                // ⭐ 변경된 부분: attributes 맵에 nameAttributeKey와 username 값을 넣어줍니다.
                // DefaultOAuth2User가 attributes 맵이 비어있는 것을 허용하지 않기 때문입니다.
                Map<String, Object> attributes = new HashMap<>();
                attributes.put("username", username); // "username"은 CustomOAuth2User의 nameAttributeKey와 일치해야 합니다.

                CustomOAuth2User customOAuth2User = new CustomOAuth2User(
                        authorities,
                        attributes, // ⭐ 수정: 비어있지 않은 attributes 맵 전달
                        "username", // nameAttributeKey (CustomOAuth2User 생성 시 "username"으로 설정되어 있음)
                        username,
                        null,
                        null,
                        userId,
                        false,
                        true,
                        role
                );

                UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                        customOAuth2User, null, authorities
                );
                authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

                SecurityContextHolder.getContext().setAuthentication(authentication);
            }
        } catch (Exception ex) {
            log.error("Could not set user authentication in security context", ex);
            response.sendError(HttpServletResponse.SC_UNAUTHORIZED, ex.getMessage());
            return;
        }

        filterChain.doFilter(request, response);
    }

    private String getJwtFromCookie(HttpServletRequest request) {
        Cookie[] cookies = request.getCookies();
        if (cookies != null) {
            for (Cookie cookie : cookies) {
                if (jwtCookieName.equals(cookie.getName())) {
                    return cookie.getValue();
                }
            }
        }
        return null;
    }
}