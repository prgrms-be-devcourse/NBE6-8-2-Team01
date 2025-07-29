package com.bookbook.global.security;

import com.bookbook.domain.user.entity.User;
import com.bookbook.domain.user.enums.Role;
import com.bookbook.domain.user.enums.UserStatus;
import com.bookbook.domain.user.repository.UserRepository;
import com.bookbook.global.util.NicknameGenerator;
import lombok.RequiredArgsConstructor;
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
            user.changeNickname(attributes.getNickname());
            userRepository.save(user); // 변경된 내용 저장
        } else {
            // 새 사용자일 경우
            String uniqueNickname = nicknameGenerator.generateUniqueNickname(attributes.getNickname());
            user = User.builder()
                    .username(username)
                    .email(attributes.email()) // email은 null일 수 있음
                    .nickname(uniqueNickname)
                    .address("기본 주소")
                    .password(passwordEncoder.encode(UUID.randomUUID().toString())) // 임시 비밀번호
                    .rating(0.0f)
                    .role(Role.USER)
                    .userStatus(UserStatus.ACTIVE)
                    .build();
            userRepository.save(user);
            isNewUser = true; // 새로운 사용자임을 표시
        }

        // DefaultOAuth2User 대신 CustomOAuth2User 객체를 반환
        return new CustomOAuth2User(
                Collections.singleton(new SimpleGrantedAuthority(user.getRole().name())),
                oAuth2User.getAttributes(), // OAuth2 provider로부터 받은 원본 속성
                userNameAttributeName,
                user.getUsername(), // DB에 저장된 사용자 ID (ex: kakao_12345)
                user.getNickname(), // DB에 저장된 닉네임
                user.getEmail(),    // DB에 저장된 이메일 (null 가능)
                user.getId(),       // DB에 저장된 User 엔티티의 고유 ID
                isNewUser           // 첫 로그인 여부 전달
        );
    }
}