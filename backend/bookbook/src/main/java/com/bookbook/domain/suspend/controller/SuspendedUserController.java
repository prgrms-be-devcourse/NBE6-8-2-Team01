package com.bookbook.domain.suspend.controller;

import com.bookbook.domain.suspend.dto.request.UserSuspendRequestDto;
import com.bookbook.domain.suspend.dto.response.UserSuspendResponseDto;
import com.bookbook.domain.suspend.entity.SuspendedUser;
import com.bookbook.domain.suspend.service.SuspendedUserService;
import com.bookbook.domain.user.dto.response.UserDetailResponseDto;
import com.bookbook.domain.user.entity.User;
import com.bookbook.global.rsdata.RsData;
import com.bookbook.global.util.PageResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/admin/users")
@RequiredArgsConstructor
@Tag(name = "SuspendedUserController", description = "어드민 전용 유저 정지 관리 컨트롤러")
public class SuspendedUserController {

    private final SuspendedUserService suspendedUserService;

    /**
     * 유저 정지 히스토리를 가져옵니다.
     *
     * <p>페이지 번호와 사이즈의 조합으로 필터링된 페이지를 가져올 수 있습니다.
     *
     * @param page 페이지 번호
     * @param size 페이지 당 항목 수
     * @return 생성된 유저들의 정지 이력 페이지
     */
    @GetMapping("/suspend")
    @Operation(summary = "유저 정지 이력 조회")
    public ResponseEntity<RsData<PageResponse<UserSuspendResponseDto>>> getAllSuspendedHistory(
            @RequestParam(defaultValue = "1") Integer page,
            @RequestParam(defaultValue = "10") Integer size
    ) {
        Pageable pageable = PageRequest.of(page - 1, size);

        Page<UserSuspendResponseDto> historyPage = suspendedUserService.getSuspendedHistoryPage(pageable);
        PageResponse<UserSuspendResponseDto> response = PageResponse.from(historyPage, page, size);

        return ResponseEntity.ok(
                RsData.of(
                        "200-1",
                        "%d개의 정지 이력을 발견했습니다".formatted(historyPage.getTotalElements()),
                        response
                )
        );
    }

    /**
     * 유저를 정지시킵니다.
     *
     * @param requestDto 정지 요청 정보 (유저 ID, 정지 기간, 사유)
     * @return 정지된 유저의 최신 정보
     */
    @PatchMapping("/suspend")
    @Operation(summary = "유저 정지")
    public ResponseEntity<RsData<UserDetailResponseDto>> suspendUser(
            @RequestBody UserSuspendRequestDto requestDto
    ) {
        SuspendedUser suspendedUser = suspendedUserService.addUserAsSuspended(requestDto);
        UserDetailResponseDto userSuspendResponseDto = UserDetailResponseDto.from(suspendedUser.getUser());

        return ResponseEntity.ok(
                RsData.of(
                        "200-1",
                        "%s님을 정지하였습니다".formatted(suspendedUser.getUser().getUsername()),
                        userSuspendResponseDto
                )
        );
    }

    /**
     * 유저의 정지를 해제합니다.
     *
     * @param userId 정지를 해제할 유저 ID
     * @return 정지가 해제된 유저의 최신 정보
     */
    @PatchMapping("/{userId}/resume")
    @Operation(summary = "유저 정지 해제")
    public ResponseEntity<RsData<UserDetailResponseDto>> resumeUser(
            @PathVariable Long userId
    ) {
        User user = suspendedUserService.resumeUser(userId);
        UserDetailResponseDto userSuspendResponseDto = UserDetailResponseDto.from(user);

        return ResponseEntity.ok(
                RsData.of(
                        "200-1",
                        "%s님을 정지하였습니다".formatted(userSuspendResponseDto.baseResponseDto().nickname()),
                        userSuspendResponseDto
                )
        );
    }
}
