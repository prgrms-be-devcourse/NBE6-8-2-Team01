package com.bookbook.domain.user.controller;

import com.bookbook.domain.rent.service.RentService;
import com.bookbook.domain.suspend.dto.request.UserSuspendRequestDto;
import com.bookbook.domain.suspend.dto.response.UserResumeResponseDto;
import com.bookbook.domain.suspend.dto.response.UserSuspendResponseDto;
import com.bookbook.domain.suspend.entity.SuspendedUser;
import com.bookbook.domain.suspend.service.SuspendedUserService;
import com.bookbook.domain.user.dto.response.PageResponse;
import com.bookbook.domain.user.dto.response.UserDetailResponseDto;
import com.bookbook.domain.user.dto.response.UserLoginResponseDto;
import com.bookbook.domain.user.service.AdminService;
import com.bookbook.domain.user.dto.UserBaseDto;
import com.bookbook.domain.user.dto.UserLoginRequestDto;
import com.bookbook.domain.user.entity.User;
import com.bookbook.global.rsdata.RsData;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/admin")
@RequiredArgsConstructor
public class AdminController {
    private final AdminService adminService;
    private final SuspendedUserService suspendedUserService;
    private final RentService rentService;

    @PostMapping("/login")
    public RsData<UserLoginResponseDto> adminLogin(
            @Valid @RequestBody UserLoginRequestDto requestDto
    ) {
        User admin = adminService.login(requestDto);
        UserLoginResponseDto userLoginResponseDto = UserLoginResponseDto.from(admin);

        return new RsData<>(
                "200-1",
                "관리자 %s님이 로그인하였습니다.".formatted(admin.getUsername()),
                userLoginResponseDto
        );
    }

    @DeleteMapping("/logout")
    public RsData<Void> adminLogin() {
        return new RsData<>(
                "200-1",
                "로그아웃을 정상적으로 완료했습니다.",
                null
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

    @GetMapping("/users")
    public RsData<PageResponse<UserBaseDto>> getFilteredUsers(
            @RequestParam(defaultValue = "1") Integer page,
            @RequestParam(defaultValue = "10") Integer size,
            @RequestParam(required = false) List<String> status,
            @RequestParam(required = false) Long userId
    ) {
        Pageable pageable = PageRequest.of(page - 1, size);

        Page<UserBaseDto> userPage = adminService.getFilteredUsers(pageable, status, userId);
        PageResponse<UserBaseDto> response = PageResponse.from(userPage, page, size);

        return new RsData<>(
                "200-1",
                "해당 조건에 맞는 %d명의 유저를 찾았습니다.".formatted(userPage.getTotalElements()),
                response
        );
    }

    @GetMapping("/users/suspend")
    public RsData<PageResponse<UserSuspendResponseDto>> getAllSuspendedHistory(
            @RequestParam(defaultValue = "1") Integer page,
            @RequestParam(defaultValue = "10") Integer size
    ) {
        Pageable pageable = PageRequest.of(page - 1, size);

        Page<UserSuspendResponseDto> historyPage = suspendedUserService.getSuspendedHistoryPage(pageable);
        PageResponse<UserSuspendResponseDto> response = PageResponse.from(historyPage, page, size);

        return new RsData<>(
                "200-1",
                "%d개의 정지 이력을 발견했습니다".formatted(historyPage.getTotalElements()),
                response
        );
    }

//    @GetMapping("/posts")
//    public RsData<List<RentSimpleResponseDto>> getPosts() {
//        List<RentSimpleResponseDto> allRents = rentService.getAllRents();
//
//        return new RsData<>(
//                "200-1",
//                "%d개의 글을 발견했습니다.".formatted(allRents.size()),
//                allRents
//        );
//    }

//    @GetMapping("/reports")
//    public
}
