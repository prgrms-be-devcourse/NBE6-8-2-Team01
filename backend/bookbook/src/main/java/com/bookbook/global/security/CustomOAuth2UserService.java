package com.bookbook.global.security;

import com.bookbook.domain.user.entity.User;
import com.bookbook.domain.user.enums.Role;
import com.bookbook.domain.user.enums.UserStatus;
import com.bookbook.domain.user.repository.UserRepository;
import com.bookbook.global.util.NicknameGenerator;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j; // 로그 추가를 위해 임포트
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserService;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;
import java.util.Optional;
import java.util.UUID;

@Slf4j // 로그 사용
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
        boolean isNewUser = false; // 첫 로그인 여부를 저장할 플래그

        Optional<User> existingUser = userRepository.findByUsername(username);

        if(existingUser.isPresent()) {
            user = existingUser.get();
            log.info("DEBUG: Existing user found: {}. Current nickname: {}", user.getUsername(), user.getNickname());

            String socialNicknameFromProvider = attributes.getNickname();

            if (socialNicknameFromProvider == null || socialNicknameFromProvider.trim().isEmpty()) {
                log.info("DEBUG: Social nickname is null or empty. Keeping current nickname: {}", user.getNickname());
            }

            else if (!user.getNickname().equals(socialNicknameFromProvider)) {

                if (userRepository.existsByNickname(socialNicknameFromProvider)) {
                    log.warn("DEBUG: Social nickname '{}' is already taken by another user. Not updating {}'s nickname.", socialNicknameFromProvider, user.getUsername());
                } else {
                    // 중복이 아니면 닉네임 업데이트
                    user.changeNickname(socialNicknameFromProvider);
                    log.info("DEBUG: User '{}'s nickname updated from '{}' to '{}'.", user.getUsername(), user.getNickname(), socialNicknameFromProvider);
                }
            }
            userRepository.save(user); // 변경된 내용 저장

        } else {
            // 새 사용자일 경우
            isNewUser = true;
            String socialNicknameFromProvider = attributes.getNickname();
            String initialNickname;

            if (socialNicknameFromProvider != null && !socialNicknameFromProvider.trim().isEmpty()) {
                // 소셜 닉네임이 존재하면 이를 기반으로 고유 닉네임 생성
                initialNickname = nicknameGenerator.generateUniqueNickname(socialNicknameFromProvider);
                log.info("DEBUG: Generated unique nickname '{}' from social nickname '{}' for new user.", initialNickname, socialNicknameFromProvider);
            } else {
                // 소셜 닉네임이 없으면 "새로운 사용자"를 기반으로 고유 닉네임 생성
                initialNickname = nicknameGenerator.generateUniqueNickname("새로운 사용자");
                log.info("DEBUG: Generated default unique nickname '{}' for new user.", initialNickname);
            }

            user = User.builder()
                    .username(username)
                    .email(attributes.email())
                    .nickname(initialNickname) // 새 사용자에게는 항상 고유 닉네임 적용
                    .address("기본 주소") // 초기 주소는 기본 값
                    .password(passwordEncoder.encode(UUID.randomUUID().toString()))
                    .rating(0.0f)
                    .role(Role.USER)
                    .userStatus(UserStatus.ACTIVE)
                    .build();
            userRepository.save(user);
            log.info("DEBUG: New user created and saved. Username: {}, ID: {}, Nickname: {}", user.getUsername(), user.getId(), user.getNickname());
        }

        // DefaultOAuth2User 대신 CustomOAuth2User 객체를 반환
        return new CustomOAuth2User(
                Collections.singleton(new SimpleGrantedAuthority(user.getRole().name())),
                oAuth2User.getAttributes(),
                userNameAttributeName,
                user.getUsername(),
                user.getNickname(),
                user.getEmail(),
                user.getId(),
                isNewUser
        );
    }
}