package com.bookbook.domain.user.service;

import com.bookbook.domain.user.dto.UserBaseDto;
import com.bookbook.domain.user.dto.UserLoginRequestDto;
import com.bookbook.domain.user.dto.response.UserDetailResponseDto;
import com.bookbook.domain.user.entity.User;
import com.bookbook.domain.user.enums.Role;
import com.bookbook.domain.user.repository.UserRepository;
import com.bookbook.global.exception.ServiceException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class AdminService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional(readOnly = true)
    public User login(UserLoginRequestDto reqBody) {
        User user = findByUsername(reqBody.getUsername())
                .orElseThrow(() -> new RuntimeException("존재하지 않는 계정입니다"));

        checkPassword(user, reqBody.getPassword());

        if (user.getRole() != Role.ADMIN) {
            throw new ServiceException("401-1", "허가되지 않은 접근입니다.");
        }

        return user;
    }

    @Transactional(readOnly = true)
    public Page<UserBaseDto> getFilteredUsers(
            Pageable pageable, List<String> status, Long userId
    ) {
        return userRepository.findFilteredUsers(pageable, status, userId)
                .map(UserBaseDto::from);
    }

    @Transactional(readOnly = true)
    public UserDetailResponseDto getSpecificUserInfo(Long userId) {
        User user = findByUserId(userId);
        return UserDetailResponseDto.from(user);
    }

    public User findByUserId(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("존재하지 않는 유저입니다."));
    }

    private Optional<User> findByUsername(String username) {
        return userRepository.findByUsername(username);
    }

    private void checkPassword(User user, String password) {
        if (!passwordEncoder.matches(password, user.getPassword())) {
            throw new RuntimeException("존재하지 않는 계정입니다");
        }
    }
}
