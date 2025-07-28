package com.bookbook.global.security;

import java.util.Map;

public record OAuth2UserAttributes(
        Map<String,Object> attributes,
        String nameAttributeKey,
        String name,
        String email,
        String id
) {

    //registrationId에 따라 다른 파싱 로직 적용
    public static OAuth2UserAttributes of(String registrationId, String userNameAttributeName, Map<String, Object> attributes) {
        if ("naver".equals(registrationId)) {
            return ofNaver(userNameAttributeName, attributes);
        } else if ("kakao".equals(registrationId)) {
            return ofKakao(userNameAttributeName, attributes);
        }
        return ofGoogle(userNameAttributeName, attributes);
    }

    private static OAuth2UserAttributes ofGoogle(String userNameAttributeName, Map<String, Object> attributes) {
        return new OAuth2UserAttributes(
                attributes,
                userNameAttributeName,
                (String) attributes.get("name"), // 이름 필드
                (String) attributes.get("email"), // 이메일 필드
                (String) attributes.get(userNameAttributeName) // 구글의 고유 ID는 "sub"
        );
    }

    @SuppressWarnings("unchecked")
    private static OAuth2UserAttributes ofNaver(String userNameAttributeName, Map<String, Object> attributes) {
        Map<String, Object> response = (Map<String, Object>) attributes.get(userNameAttributeName);
        return new OAuth2UserAttributes(
                response, // 네이버는 response Map을 실제 attributes로 사용
                "id", // 네이버에서 사용자를 식별하는 키는 'id'입니다.
                (String) response.get("nickname"), // 닉네임 필드
                (String) response.get("email"), // 이메일 필드
                (String) response.get("id") // 네이버의 고유 ID는 'id'
        );
    }

    @SuppressWarnings("unchecked")
    private static OAuth2UserAttributes ofKakao(String userNameAttributeName, Map<String, Object> attributes) {
        Map<String, Object> kakaoAccount = (Map<String, Object>) attributes.get("kakao_account");
        Map<String, Object> profile = (Map<String, Object>) kakaoAccount.get("profile");

        String email = (String) kakaoAccount.get("email");
        String nickname = (String) profile.get("nickname");

        return new OAuth2UserAttributes(
                attributes,
                userNameAttributeName,
                nickname,
                email,
                String.valueOf(attributes.get(userNameAttributeName))
        );
    }

    public String getNickname() { // 'name' 대신 'nickname'으로 통일성을 위해 변경
        return name;
    }
}
