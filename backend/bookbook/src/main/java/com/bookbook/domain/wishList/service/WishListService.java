package com.bookbook.domain.wishList.service;

import com.bookbook.domain.user.entity.User;
import com.bookbook.domain.user.repository.UserRepository;
import com.bookbook.domain.wishList.dto.WishListCreateRequestDto;
import com.bookbook.domain.wishList.dto.WishListResponseDto;
import com.bookbook.domain.wishList.entity.WishList;
import com.bookbook.domain.wishList.repository.WishListRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class WishListService {

    private final WishListRepository wishListRepository;
    private final UserRepository userRepository;
    // TODO: RentRepository 추가 필요

    public List<WishListResponseDto> getWishListByUserId(Long userId) {
        return wishListRepository.findByUserIdOrderByCreateDateDesc(userId)
                .stream()
                .map(WishListResponseDto::from)
                .toList();
    }

    public WishListResponseDto addWishList(Long userId, WishListCreateRequestDto request) {
        // TODO: Rent 엔티티 구현 후 중복 체크 로직 추가
        // if (wishListRepository.findByUserIdAndRentId(userId, request.rentId()).isPresent()) {
        //     throw new IllegalArgumentException("이미 찜한 게시글입니다.");
        // }

        // 사용자 조회
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));

        // TODO: Rent 조회 - RentRepository 필요
        // Rent rent = rentRepository.findById(request.rentId())
        //         .orElseThrow(() -> new IllegalArgumentException("대여 게시글을 찾을 수 없습니다."));

        // 찜 목록 생성
        WishList wishlist = new WishList();
        wishlist.setUser(user);
        // wishlist.setRent(rent); // TODO: Rent 설정

        // 저장 및 반환
        WishList savedWishlist = wishListRepository.save(wishlist);
        return WishListResponseDto.from(savedWishlist);
    }

    public void deleteWishList(Long userId, Long rentId) {
        // TODO: Rent 엔티티 구현 후 활성화
        // WishList wishList = wishListRepository.findByUserIdAndRentId(userId, rentId)
        //         .orElseThrow(() -> new IllegalArgumentException("찜하지 않은 게시글입니다."));
        // wishListRepository.delete(wishList);

        // 임시 구현: ID로 직접 삭제
        throw new UnsupportedOperationException("Rent 엔티티 구현 필요");
    }
}
