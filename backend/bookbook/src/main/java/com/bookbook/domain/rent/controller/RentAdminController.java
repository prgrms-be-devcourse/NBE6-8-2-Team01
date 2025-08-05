package com.bookbook.domain.rent.controller;

import com.bookbook.domain.rent.dto.response.RentDetailResponseDto;
import com.bookbook.domain.rent.entity.RentStatus;
import com.bookbook.domain.rent.service.RentService;
import com.bookbook.domain.rent.dto.request.ChangeRentStatusRequestDto;
import com.bookbook.domain.rent.dto.response.RentSimpleResponseDto;
import com.bookbook.global.util.PageResponse;
import com.bookbook.global.rsdata.RsData;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/admin")
@RequiredArgsConstructor
@Tag(name = "RentAdminController", description = "어드민 전용 대여 게시글 컨트롤러")
public class RentAdminController {

    private final RentService rentService;

    /**
     * 대여 게시글 작성 목록을 가져옵니다.
     *
     * <p>페이지 번호와 사이즈의 조합, 그리고 책 대여 상태와
     * 글 작성자 ID를 기반으로 필터링된 페이지를 가져올 수 있습니다.
     *
     * @param page 페이지 번호
     * @param size 페이지 당 항목 수
     * @param status 리뷰 생성 요청 데이터 (평점)
     * @param userId 대여 게시글 작성자 ID
     * @return 생성된 대여 게시글 페이지 정보
     */
    @GetMapping("/posts")
    @Operation(summary = "대여 게시글 목록 조회")
    public ResponseEntity<RsData<PageResponse<RentSimpleResponseDto>>> getPosts(
            @RequestParam(defaultValue = "1") Integer page,
            @RequestParam(defaultValue = "10") Integer size,
            @RequestParam(required = false) List<RentStatus> status,
            @RequestParam(required = false) Long userId
    ) {
        Pageable pageable = PageRequest.of(page - 1, size);

        Page<RentSimpleResponseDto> rentHistoryPage = rentService.getRentsPage(pageable, status, userId);
        PageResponse<RentSimpleResponseDto> response = PageResponse.from(rentHistoryPage, page, size);

        return ResponseEntity.ok(
                RsData.of(
                        "200-1",
                        "%d개의 글을 발견했습니다.".formatted(rentHistoryPage.getTotalElements()),
                        response
                ));
    }

    /**
     * 대여 게시글 하나의 상세 정보를 가져옵니다.
     *
     * @param id 대여 게시글 ID
     * @return 단일 대여 게시글 상세 정보
     */
    @GetMapping("/rent/{id}") // /rent/{id} 경로로 get 요청을 처리
    @Operation(summary = "단일 대여 게시글 상세 조회")
    public ResponseEntity<RsData<RentDetailResponseDto>> getRentDetail(
            @PathVariable int id
    ){
        RentDetailResponseDto responseDto = rentService.getRentPostDetail(id);

        return ResponseEntity.ok(
                RsData.of("200-1","%d 번 글 상태 변경 완료", responseDto)
        );
    }

    /**
     * 대여 게시글 하나의 상태를 수정합니다.
     *
     * @param id 대여 게시글 ID
     * @return 단일 대여 게시글 수정 후 상세 정보
     */
    @PatchMapping("/rent/{id}")
    @Operation(summary = "대여 게시글 상태 수정")
    public ResponseEntity<RsData<RentDetailResponseDto>> changeRentStatus(
            @PathVariable int id,
            @RequestBody ChangeRentStatusRequestDto status
    ){ // 경로 변수로 전달된 id를 사용
        RentDetailResponseDto responseDto = rentService.modifyRentPageStatus(id, status);

        return ResponseEntity.ok(
                RsData.of("200-1","%d 번 글 상태 변경 완료", responseDto)
        );
    }

    /**
     * 대여 게시글 하나를 영구적으로 삭제합니다.
     * 사용을 권장하지 않습니다.
     *
     * @param id 대여 게시글 ID
     * @deprecated HARD DELETE로 인한 사용 경고
     * @return 없음
     */
    @Deprecated
    @DeleteMapping("/rent/{id}") // /rent/{id} 경로로 DELETE 요청을 처리
    @Operation(summary = "대여 게시글 영구 삭제")
    public ResponseEntity<RsData<Void>> deleteRentPage(@PathVariable int id){ // 경로 변수로 전달된 id를 사용
        rentService.removeRentPage(id);
        return ResponseEntity.ok(
                RsData.of("200-1", "%d 번 글 삭제 완료".formatted(id))
        );
    }
}
