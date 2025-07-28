package com.bookbook.domain.user.controller;

import com.bookbook.domain.suspend.dto.request.UserSuspendRequestDto;
import com.bookbook.domain.user.service.AdminService;
import com.bookbook.domain.suspend.dto.response.UserSuspendResponseDto;
import com.bookbook.domain.suspend.entity.SuspendedUser;
import com.bookbook.domain.user.dto.UserLoginRequestDto;
import com.bookbook.domain.user.dto.UserResponseDto;
import com.bookbook.domain.user.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {
    private final AdminService adminService;

    @PostMapping("/login")
    public ResponseEntity<UserResponseDto> adminLogin(
            @RequestBody UserLoginRequestDto requestDto
    ) {
        User admin = adminService.login(requestDto);

        UserResponseDto userResponseDto = new UserResponseDto(admin);
        return ResponseEntity.ok(userResponseDto);
    }

    @GetMapping("/members")
    public ResponseEntity<List<UserResponseDto>> getAllUsers() {
        List<UserResponseDto> users = adminService.getAllUsers();
        return ResponseEntity.ok(users);
    }

    @GetMapping("/members/danger")
    public ResponseEntity<List<UserResponseDto>> getAllDangerUsers() {
        List<UserResponseDto> allDangerUsers = adminService.getAllDangerUsers();
        return ResponseEntity.ok(allDangerUsers);
    }

    @GetMapping("/members/suspended")
    public ResponseEntity<List<UserResponseDto>> getAllSuspendedUsers() {
        List<UserResponseDto> allSuspendedUsers = adminService.getAllSuspendedUsers();
        return ResponseEntity.ok(allSuspendedUsers);
    }

    @PostMapping("/members/suspended")
    public ResponseEntity<UserSuspendResponseDto> suspendUser(
            @RequestBody UserSuspendRequestDto requestDto
    ) {
        SuspendedUser suspendedUser = adminService.suspendUser(requestDto);
        UserSuspendResponseDto userSuspendResponseDto = UserSuspendResponseDto.from(suspendedUser);
        return ResponseEntity.ok(userSuspendResponseDto);
    }


}
