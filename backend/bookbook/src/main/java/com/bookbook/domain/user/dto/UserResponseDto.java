package com.bookbook.domain.user.dto;

import com.bookbook.domain.user.entity.User;
import com.bookbook.domain.user.enums.Role;
import com.bookbook.domain.user.enums.UserStatus;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
public class UserResponseDto {
    private Long id;
    private String username;
    private String email;
    private String nickname;
    private String address;
    private float rating;
    private Role role;
    private UserStatus userStatus;
    private LocalDateTime createAt;
    private boolean registrationCompleted; // 회원가입 완료 여부

    // Entity를 DTO로 변환하는 생성자
    public UserResponseDto(User user) {
        this.id = user.getId();
        this.username = user.getUsername();
        this.email = user.getEmail();
        this.nickname = user.getNickname();
        this.address = user.getAddress();
        this.rating = user.getRating();
        this.role = user.getRole();
        this.userStatus = user.getUserStatus();
        this.createAt = user.getCreateAt();
        this.registrationCompleted = user.isRegistrationCompleted(); // 회원가입 완료 여부
    }
}