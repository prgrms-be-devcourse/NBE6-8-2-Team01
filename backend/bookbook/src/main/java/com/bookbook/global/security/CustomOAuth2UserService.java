package com.bookbook.global.security;

import com.bookbook.domain.user.entity.User;
import com.bookbook.domain.user.enums.Role;
import com.bookbook.domain.user.enums.UserStatus;
import com.bookbook.domain.user.repository.UserRepository;
import com.bookbook.domain.user.service.UserService;
import com.bookbook.global.util.NicknameGenerator;
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
    private final PasswordEncoder passwordEncoder;
    private final NicknameGenerator nicknameGenerator;

    @Override
    @Transactional
    public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {
        OAuth2UserService<OAuth2UserRequest, OAuth2User> delegate = new DefaultOAuth2UserService();
        OAuth2User oAuth2User = delegate.loadUser(userRequest);

        String registrationId = userRequest.getClientRegistration().getRegistrationId();
        String userNameAttributeName = userRequest.getClientRegistration().getProviderDetails().getUserInfoEndpoint().getUserNameAttributeName();

        OAuth2UserAttributes attributes =  OAuth2UserAttributes.of(registrationId, userNameAttributeName, oAuth2User.getAttributes());

        User user;
        String username = registrationId + "_" + attributes.id();

        Optional<User> existingUser = userRepository.findByUsername(username);

        if(existingUser.isPresent()) {
            user = existingUser.get();
        } else {
            String uniqueNickname = nicknameGenerator.generateUniqueNickname(attributes.getNickname()); // 변경
            user = User.builder()
                    .username(username)
                    .email(attributes.email())
                    .nickname(uniqueNickname)
                    .address("기본 주소")
                    .password(passwordEncoder.encode(UUID.randomUUID().toString()))
                    .rating(0.0f)
                    .role(Role.USER)
                    .userStatus(UserStatus.ACTIVE)
                    .build();
            userRepository.save(user);
        }

        return new DefaultOAuth2User(
                Collections.singleton(new SimpleGrantedAuthority(user.getRole().name())),
                oAuth2User.getAttributes(),
                userNameAttributeName
        );
    }

}
