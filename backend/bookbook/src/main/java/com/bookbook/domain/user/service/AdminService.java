package com.bookbook.domain.user.service;

import com.bookbook.domain.suspend.dto.request.UserSuspendRequestDto;
import com.bookbook.domain.suspend.entity.SuspendedUser;
import com.bookbook.domain.suspend.service.SuspendedUserService;
import com.bookbook.domain.user.dto.UserLoginRequestDto;
import com.bookbook.domain.user.dto.UserResponseDto;
import com.bookbook.domain.user.entity.User;
import com.bookbook.domain.user.enums.UserStatus;
import com.bookbook.domain.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Stream;

@Service
@RequiredArgsConstructor
public class AdminService {
    private final UserRepository userRepository;
    private final SuspendedUserService suspendedUserService;
    private final PasswordEncoder passwordEncoder;
    private final Float DANGER_RATING = 1.5f;

    @Transactional(readOnly = true)
    public User login(UserLoginRequestDto reqBody) {
        User user = findByUsername(reqBody.getUsername())
                .orElseThrow(() -> new RuntimeException("존재하지 않는 계정입니다"));

        checkPassword(user, reqBody.getPassword());

        return user;
    }

    @Transactional(readOnly = true)
    public List<UserResponseDto> getAllUsers() {
        return createAllUserStream()
                .map(UserResponseDto::new)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<UserResponseDto> getAllDangerUsers() {
        return createAllUserStream()
                .filter(user -> user.getRating() <= DANGER_RATING)
                .map(UserResponseDto::new)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<UserResponseDto> getAllSuspendedUsers() {
        return createAllUserStream()
                .filter(user -> user.getUserStatus().equals(UserStatus.SUSPENDED))
                .map(UserResponseDto::new)
                .toList();
    }

    private Optional<User> findByUsername(String username) {
        return userRepository.findByUsername(username);
    }

    private void checkPassword(User user, String password) {
        if (!passwordEncoder.matches(password, user.getPassword())) {
            throw new RuntimeException("존재하지 않는 계정입니다");
        }
    }

    private Stream<User> createAllUserStream() {
        return userRepository.findAll().stream();
    }

    private Optional<User> findUserById(Long id) {
        return userRepository.findById(id);
    }

    @Transactional
    public SuspendedUser suspendUser(UserSuspendRequestDto requestDto) {
        User user = findUserById(requestDto.userId())
                .orElseThrow(() -> new RuntimeException("존재하지 않는 ID의 유저입니다."));

        return suspendedUserService.addSuspendUser(user, requestDto);
    }
}
