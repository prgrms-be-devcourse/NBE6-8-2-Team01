package com.bookbook.global.security;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.oauth2.core.user.DefaultOAuth2User;

import java.util.Collection;
import java.util.Map;

public class CustomOAuth2User extends DefaultOAuth2User {

    private String username; // DB에 저장될 사용자 ID (ex: kakao_12345)
    private String nickname;
    private String email; // null 가능
    private Long userId; // DB에 저장된 User 엔티티의 고유 ID
    private boolean isNewUser; // 첫 로그인 여부
    private boolean isRegistrationCompleted;

    public CustomOAuth2User(Collection<? extends GrantedAuthority> authorities,
                            Map<String, Object> attributes,
                            String nameAttributeKey,
                            String username,
                            String nickname,
                            String email,
                            Long userId,
                            boolean isNewUser,
                            boolean isRegistrationCompleted) {
        super(authorities, attributes, nameAttributeKey);
        this.username = username;
        this.nickname = nickname;
        this.email = email;
        this.userId = userId;
        this.isNewUser = isNewUser;
        this.isRegistrationCompleted = isRegistrationCompleted;
    }

    // Getter 메서드들 (필요한 정보에 접근하기 위함)
    @Override // DefaultOAuth2User의 getName()을 오버라이드하여 username 반환
    public String getName() {
        return this.username;
    }

    public String getUsername() {
        return username;
    }

    public String getNickname() {
        return nickname;
    }

    public String getEmail() {
        return email;
    }

    public Long getUserId() {
        return userId;
    }

    public boolean isNewUser() {
        return isNewUser;
    }
}