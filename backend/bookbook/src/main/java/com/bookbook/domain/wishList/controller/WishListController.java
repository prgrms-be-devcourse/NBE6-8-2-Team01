package com.bookbook.domain.wishList.controller;

import com.bookbook.domain.wishList.dto.WishListCreateRequestDto;
import com.bookbook.domain.wishList.dto.WishListResponseDto;
import com.bookbook.domain.wishList.service.WishListService;
import com.bookbook.global.rsdata.RsData;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 찜 목록 관리 컨트롤러
 * 
 * 사용자의 찜 목록 조회, 추가, 삭제 기능을 제공합니다.
 */
@RestController
@RequestMapping("/api/v1/user/{userId}/wishlist")
@RequiredArgsConstructor
public class WishListController {

    private final WishListService wishListService;

    /**
     * 찜 목록 조회 (검색 기능 포함)
     * 
     * 사용자의 찜 목록을 생성일 역순으로 조회합니다.
     * 
     * @param userId 사용자 ID
     * @param search 검색어 (선택사항, 책 제목/저자/출판사/게시글 제목에서 검색)
     * @return 찜 목록 리스트
     */
    @GetMapping
    public ResponseEntity<RsData<List<WishListResponseDto>>> getWishList(
            @PathVariable Long userId,
            @RequestParam(required = false) String search
    ) {
        List<WishListResponseDto> wishList;
        if (search != null && !search.trim().isEmpty()) {
            wishList = wishListService.searchWishListByUserId(userId, search);
        } else {
            wishList = wishListService.getWishListByUserId(userId);
        }
        return ResponseEntity.ok(RsData.of("200", "천 목록을 조회했습니다.", wishList));
    }

    /**
     * 찜 목록에 도서 추가
     * 
     * 사용자가 관심 있는 도서를 찜 목록에 추가합니다.
     * 이미 찜한 도서는 중복 추가할 수 없습니다.
     * 
     * @param userId 사용자 ID
     * @param request 찜 추가 요청 정보 (도서 게시글 ID)
     * @return 생성된 찜 정보
     */
    @PostMapping
    public ResponseEntity<RsData<WishListResponseDto>> addWishList(
            @PathVariable Long userId,
            @RequestBody WishListCreateRequestDto request
    ) {
        WishListResponseDto response = wishListService.addWishList(userId, request);
        return ResponseEntity.ok(RsData.of("200", "천 목록에 추가했습니다.", response));
    }

    /**
     * 찜 목록에서 도서 삭제
     * 
     * 사용자의 찜 목록에서 특정 도서를 제거합니다.
     * 
     * @param userId 사용자 ID
     * @param rentId 삭제할 도서 게시글 ID
     * @return 204 No Content
     */
    @DeleteMapping("/{rentId}")
    public ResponseEntity<RsData<Void>> deleteWishList(
            @PathVariable Long userId,
            @PathVariable Integer rentId
    ) {
        wishListService.deleteWishList(userId, rentId);
        return ResponseEntity.ok(RsData.of("200", "천 목록에서 삭제했습니다."));
    }
}
