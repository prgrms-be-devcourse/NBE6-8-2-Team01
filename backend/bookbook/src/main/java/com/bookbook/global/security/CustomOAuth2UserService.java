package com.bookbook.global.security;

import com.bookbook.domain.user.entity.User;
import com.bookbook.domain.user.repository.UserRepository;
import com.bookbook.domain.user.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserService;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;
import java.util.Optional;

@Slf4j // 로그 사용
@Service
@RequiredArgsConstructor
public class CustomOAuth2UserService implements OAuth2UserService<OAuth2UserRequest, OAuth2User>{
    private final UserRepository userRepository;
    private final UserService userService;

    @Override
    @Transactional
    public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {
        OAuth2UserService<OAuth2UserRequest, OAuth2User> delegate = new DefaultOAuth2UserService();
        OAuth2User oAuth2User = delegate.loadUser(userRequest);

        String registrationId = userRequest.getClientRegistration().getRegistrationId();
        String userNameAttributeName = userRequest.getClientRegistration().getProviderDetails().getUserInfoEndpoint().getUserNameAttributeName();

        OAuth2UserAttributes attributes = OAuth2UserAttributes.of(registrationId, userNameAttributeName, oAuth2User.getAttributes());

        String username = registrationId + "_" + attributes.id();
        boolean isNewUser = false;
        boolean isRegistrationCompleted = false;

        // DB에 해당 유저가 있는지 확인 (isNewUser 판단을 위해 유지)
        Optional<User> existingUser = userRepository.findByUsername(username);
        if (existingUser.isEmpty()) {
            isNewUser = true;
        }

        // --- 핵심 변경: 사용자 생성/업데이트 로직을 UserService로 위임 ---
        User user = userService.findOrCreateUser(username, attributes.email(), attributes.nickname());

        isRegistrationCompleted = user.isRegistrationCompleted();

        log.info("DEBUG: User processed. Username: {}, ID: {}, Nickname: {}, Email: {}, isNewUser: {}, isRegistrationCompleted: {}",
                user.getUsername(), user.getId(), user.getNickname(), user.getEmail(), isNewUser, isRegistrationCompleted);

        return new CustomOAuth2User(
                Collections.singleton(new SimpleGrantedAuthority(user.getRole().name())),
                oAuth2User.getAttributes(),
                userNameAttributeName,
                user.getUsername(),
                user.getNickname(),
                user.getEmail(),
                user.getId(),
                isNewUser,
                isRegistrationCompleted,
                user.getRole()
        );
    }
}