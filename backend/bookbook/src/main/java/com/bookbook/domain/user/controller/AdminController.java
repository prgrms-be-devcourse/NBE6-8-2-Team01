package com.bookbook.domain.user.controller;

import com.bookbook.domain.suspend.dto.request.UserSuspendRequestDto;
import com.bookbook.domain.suspend.dto.response.UserResumeResponseDto;
import com.bookbook.domain.suspend.dto.response.UserSuspendResponseDto;
import com.bookbook.domain.suspend.entity.SuspendedUser;
import com.bookbook.domain.suspend.service.SuspendedUserService;
import com.bookbook.domain.user.dto.response.UserDetailResponseDto;
import com.bookbook.domain.user.dto.UserLoginRequestDto;
import com.bookbook.domain.user.dto.UserResponseDto;
import com.bookbook.domain.user.dto.UserBaseDto;
import com.bookbook.domain.user.entity.User;
import com.bookbook.domain.user.service.AdminService;
import com.bookbook.global.rsdata.RsData;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/admin")
@RequiredArgsConstructor
public class AdminController {
    private final AdminService adminService;
    private final SuspendedUserService suspendedUserService;

    @PostMapping("/login")
    public RsData<UserResponseDto> adminLogin(
            @Valid @RequestBody UserLoginRequestDto requestDto
    ) {
        User admin = adminService.login(requestDto);
        UserResponseDto userResponseDto = new UserResponseDto(admin);

        return new RsData<>(
                "200-1",
                "관리자 %s님이 로그인하였습니다.".formatted(admin.getUsername()),
                userResponseDto
        );
    }

    @GetMapping("/users")
    public RsData<List<UserBaseDto>> getAllUsers() {
        List<UserBaseDto> users = adminService.getAllUsers();

        return new RsData<>(
                "200-1",
                "%d명의 유저가 이용 중입니다".formatted(users.size()),
                users
        );
    }

    @GetMapping("/users/suspend")
    public RsData<List<UserSuspendResponseDto>> getAllSuspendedHistory() {
        List<UserSuspendResponseDto> suspendedHistory = suspendedUserService.getAllSuspendedHistory();

        return new RsData<>(
                "200-1",
                "%d개의 이력을 발견했습니다".formatted(suspendedHistory.size()),
                suspendedHistory
        );
    }

    @PutMapping("/users/suspend")
    public RsData<UserSuspendResponseDto> suspendUser(
            @RequestBody UserSuspendRequestDto requestDto
    ) {
        SuspendedUser suspendedUser = suspendedUserService.addUserAsSuspended(requestDto);
        UserSuspendResponseDto userSuspendResponseDto = UserSuspendResponseDto.from(suspendedUser);

        return new RsData<>(
                "201-1",
                "%s님을 정지하였습니다",
                userSuspendResponseDto
        );
    }

    @GetMapping("/users/{userId}")
    public RsData<UserDetailResponseDto> getUserDetail(
            @PathVariable Long userId
    ) {
        UserDetailResponseDto specificUserInfo = adminService.getSpecificUserInfo(userId);

        return new RsData<>(
                "200-1",
                "%d 유저의 정보를 찾았습니다.".formatted(specificUserInfo.baseResponseDto().id()),
                specificUserInfo
        );
    }

    @PutMapping("/users/{userId}/resume")
    public RsData<UserResumeResponseDto> resumeUser(
            @PathVariable Long userId
    ) {
        User user = suspendedUserService.resumeUser(userId);
        UserResumeResponseDto responseDto = UserResumeResponseDto.from(user);

        return new RsData<>(
                "200-1",
                "%d번 유저의 정지가 해제되었습니다.".formatted(user.getId()),
                responseDto
        );
    }
}
