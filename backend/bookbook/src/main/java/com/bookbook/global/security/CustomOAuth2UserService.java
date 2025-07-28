package com.bookbook.global.security;

import com.bookbook.domain.user.entity.User;
import com.bookbook.domain.user.enums.Role;
import com.bookbook.domain.user.enums.UserStatus;
import com.bookbook.domain.user.repository.UserRepository;
import com.bookbook.domain.user.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserService;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.DefaultOAuth2User;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CustomOAuth2UserService implements OAuth2UserService<OAuth2UserRequest, OAuth2User>{
    private final UserRepository userRepository;
    private final UserService userService;

    @Override
    @Transactional
    public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {
        OAuth2UserService<OAuth2UserRequest, OAuth2User> delegate = new DefaultOAuth2UserService();
        OAuth2User oAuth2User = delegate.loadUser(userRequest); // 소셜 서비스로부터 사용자 정보 로드

        String registrationId = userRequest.getClientRegistration().getRegistrationId(); // 소셜 서비스 ID
        String userNameAttributeName = userRequest.getClientRegistration().getProviderDetails().getUserInfoEndpoint().getUserNameAttributeName(); // 사용자 이름 속성

        // 소셜 로그인 서비스별로 사용자 정보를 가져오는 메서드 호출
        OAuth2UserAttributes attributes =  OAuth2UserAttributes.of(registrationId, userNameAttributeName, oAuth2User.getAttributes());

        User user;
        String username = registrationId + "_" + attributes.id(); // 소셜 서비스 ID와 사용자 ID를 조합하여 고유한 사용자 탐색 ex)kakao_1234567890

        Optional<User> existingUser = userRepository.findByUsername(username);

        if(existingUser.isPresent()) {
            user = existingUser.get();
        } else {
            String uniqueNickname = userService.generateUniqueNickname(attributes.getNickname()); // 사용자 이름을 기반으로 고유한 닉네임 생성
            // 새로운 사용자 생성
            user = User.builder()
                    .username(username)
                    .email(attributes.email())
                    .nickname(uniqueNickname)
                    .address("기본 주소") // 기본 주소 설정
                    .password(passwordEncoder.encode(UUID.randomUUID().toString())) // 소셜 로그인 사용자에게 임의의 비밀번호 할당
                    .rating(0.0f) // 초기 별점
                    .role(Role.USER) // 일반 사용자 역할
                    .userStatus(UserStatus.ACTIVE) // 활성화 상태
                    .build();
            userRepository.save(user);
        }

        return new DefaultOAuth2User(
                Collections.singleton(new SimpleGrantedAuthority(user.getRole().name())),
                oAuth2User.getAttributes(),
                userNameAttributeName
        );
    }

    private final PasswordEncoder passwordEncoder;
}
