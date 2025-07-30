package com.bookbook.domain.wishList.service;

import com.bookbook.domain.rent.entity.Rent;
import com.bookbook.domain.rent.repository.RentRepository;
import com.bookbook.domain.user.entity.User;
import com.bookbook.domain.user.repository.UserRepository;
import com.bookbook.domain.wishList.dto.WishListCreateRequestDto;
import com.bookbook.domain.wishList.dto.WishListResponseDto;
import com.bookbook.domain.wishList.entity.WishList;
import com.bookbook.domain.wishList.repository.WishListRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * 찜 목록 관리 서비스
 * 
 * 사용자의 찜 목록 조회, 추가, 삭제 등의 비즈니스 로직을 처리합니다.
 */
@Service
@RequiredArgsConstructor
public class WishListService {

    private final WishListRepository wishListRepository;
    private final UserRepository userRepository;
    private final RentRepository rentRepository;

    /**
     * 사용자의 찜 목록 조회
     * 
     * 사용자의 모든 찜 목록을 생성일 역순으로 조회합니다.
     * 
     * @param userId 사용자 ID
     * @return 찜 목록 리스트
     */
    public List<WishListResponseDto> getWishListByUserId(Long userId) {
        return wishListRepository.findByUserIdOrderByCreateDateDesc(userId)
                .stream()
                .map(WishListResponseDto::from)
                .toList();
    }

    /**
     * 찜 목록에 도서 추가
     * 
     * 사용자가 관심 있는 도서를 찜 목록에 추가합니다.
     * 이미 찜한 도서는 중복 추가할 수 없습니다.
     * 
     * @param userId 사용자 ID
     * @param request 찜 추가 요청 정보
     * @return 생성된 찜 정보
     * @throws IllegalArgumentException 이미 찜한 게시글이거나 사용자/게시글을 찾을 수 없는 경우
     */
    public WishListResponseDto addWishList(Long userId, WishListCreateRequestDto request) {
        // 중복 체크 로직
        if (wishListRepository.findByUserIdAndRentId(userId, request.rentId()).isPresent()) {
            throw new IllegalArgumentException("이미 찜한 게시글입니다.");
        }

        // 사용자 조회
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));

        // Rent 조회
        Rent rent = rentRepository.findById(request.rentId())
                .orElseThrow(() -> new IllegalArgumentException("대여 게시글을 찾을 수 없습니다."));

        // 찜 목록 생성
        WishList wishList = new WishList();
        wishList.setUser(user);
        wishList.setRent(rent);

        // 저장 및 반환
        WishList savedWishList = wishListRepository.save(wishList);
        return WishListResponseDto.from(savedWishList);
    }

    /**
     * 찜 목록에서 도서 삭제
     * 
     * 사용자의 찜 목록에서 특정 도서를 제거합니다.
     * 
     * @param userId 사용자 ID
     * @param rentId 삭제할 도서 게시글 ID
     * @throws IllegalArgumentException 찜하지 않은 게시글인 경우
     */
    public void deleteWishList(Long userId, Integer rentId) {
        WishList wishList = wishListRepository.findByUserIdAndRentId(userId, rentId)
                .orElseThrow(() -> new IllegalArgumentException("찜하지 않은 게시글입니다."));
        wishListRepository.delete(wishList);
    }
}
