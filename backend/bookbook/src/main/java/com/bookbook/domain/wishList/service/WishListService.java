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

@Service
@RequiredArgsConstructor
public class WishListService {

    private final WishListRepository wishListRepository;
    private final UserRepository userRepository;
    private final RentRepository rentRepository;

    public List<WishListResponseDto> getWishListByUserId(Long userId) {
        return wishListRepository.findByUserIdOrderByCreateDateDesc(userId)
                .stream()
                .map(WishListResponseDto::from)
                .toList();
    }

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

    public void deleteWishList(Long userId, Integer rentId) {
        WishList wishList = wishListRepository.findByUserIdAndRentId(userId, rentId)
                .orElseThrow(() -> new IllegalArgumentException("찜하지 않은 게시글입니다."));
        wishListRepository.delete(wishList);
    }
}
