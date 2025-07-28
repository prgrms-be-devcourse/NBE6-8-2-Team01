package com.bookbook.global.security;

import java.util.Map;

public class OAuth2UserAttributes {
    private Map<String,Object> attributes;
    private String nameAttributeKey;
    private String name;
    private String email;
    private String id;

    public OAuth2UserAttributes(Map<String,Object> attributes, String nameAttributeKey, String name, String email, String id) {
        this.attributes = attributes;
        this.nameAttributeKey = nameAttributeKey;
        this.name = name;
        this.email = email;
        this.id = id;
    }

    public static OAuth2UserAttributes of(String registrationId, String userNameAttributeName, Map<String,Object> attributes) {
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

    private static OAuth2UserAttributes ofNaver(String userNameAttributeName, Map<String, Object> attributes) {
        // 네이버는 사용자 정보가 'response'라는 Map 안에 있습니다.
        Map<String, Object> response = (Map<String, Object>) attributes.get(userNameAttributeName);
        return new OAuth2UserAttributes(
                response, // 네이버는 response Map을 실제 attributes로 사용
                "id", // 네이버에서 사용자를 식별하는 키는 'id'입니다.
                (String) response.get("nickname"), // 닉네임 필드
                (String) response.get("email"), // 이메일 필드
                (String) response.get("id") // 네이버의 고유 ID는 'id'
        );
    }

    private static OAuth2UserAttributes ofKakao(String userNameAttributeName, Map<String, Object> attributes) {
        // 카카오는 사용자 정보가 'kakao_account' Map 안에 있고, 닉네임은 'profile' Map 안에 있습니다.
        Map<String, Object> kakaoAccount = (Map<String, Object>) attributes.get("kakao_account");
        Map<String, Object> profile = (Map<String, Object>) kakaoAccount.get("profile");

        String email = (String) kakaoAccount.get("email"); // 이메일
        String nickname = (String) profile.get("nickname"); // 닉네임

        return new OAuth2UserAttributes(
                attributes,
                userNameAttributeName, // 카카오는 'id' 필드가 바로 attributes의 최상위에 있습니다.
                nickname,
                email,
                String.valueOf(attributes.get(userNameAttributeName)) // 카카오의 고유 ID는 'id' (숫자)
        );
    }

    public Map<String, Object> getAttributes() {
        return attributes;
    }

    public String getNameAttributeKey() {
        return nameAttributeKey;
    }

    public String getNickname() { // 'name' 대신 'nickname'으로 통일성을 위해 변경
        return name;
    }

    public String getEmail() {
        return email;
    }

    public String getId() {
        return id;
    }
}
