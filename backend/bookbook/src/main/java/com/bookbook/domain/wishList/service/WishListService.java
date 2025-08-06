package com.bookbook.domain.wishList.service;

import com.bookbook.domain.rent.entity.Rent;
import com.bookbook.domain.rent.repository.RentRepository;
import com.bookbook.domain.user.entity.User;
import com.bookbook.domain.user.repository.UserRepository;
import com.bookbook.domain.wishList.dto.WishListCreateRequestDto;
import com.bookbook.domain.wishList.dto.WishListResponseDto;
import com.bookbook.domain.wishList.entity.WishList;
import com.bookbook.domain.wishList.enums.WishListStatus;
import com.bookbook.domain.wishList.repository.WishListRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

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
     * 사용자의 모든 활성 상태인 찜 목록을 생성일 역순으로 조회합니다.
     * 
     * @param userId 사용자 ID
     * @return 찜 목록 리스트
     */
    public List<WishListResponseDto> getWishListByUserId(Long userId) {
        return wishListRepository.findByUserIdAndStatusOrderByCreatedDateDesc(userId, WishListStatus.ACTIVE)
                .stream()
                .map(wishList -> {
                    String lenderNickname = userRepository.findById(wishList.getRent().getLenderUserId())
                            .map(user -> user.getNickname())
                            .orElse("알 수 없음");
                    return WishListResponseDto.from(wishList, lenderNickname);
                })
                .toList();
    }

    /**
     * 사용자의 찜 목록 검색
     * 
     * @param userId 사용자 ID
     * @param searchKeyword 검색어 (책 제목, 저자, 출판사, 게시글 제목에서 검색)
     * @return 검색된 찜 목록
     */
    public List<WishListResponseDto> searchWishListByUserId(Long userId, String searchKeyword) {
        List<WishList> wishLists = wishListRepository.findByUserIdAndStatusOrderByCreatedDateDesc(userId, WishListStatus.ACTIVE);
        
        if (searchKeyword == null || searchKeyword.trim().isEmpty()) {
            return wishLists.stream()
                    .map(wishList -> {
                        String lenderNickname = userRepository.findById(wishList.getRent().getLenderUserId())
                                .map(user -> user.getNickname())
                                .orElse("알 수 없음");
                        return WishListResponseDto.from(wishList, lenderNickname);
                    })
                    .collect(Collectors.toList());
        }
        
        String searchLower = searchKeyword.toLowerCase().trim();
        
        return wishLists.stream()
                .filter(wishList -> {
                    Rent rent = wishList.getRent();
                    return rent.getBookTitle().toLowerCase().contains(searchLower) ||
                           rent.getAuthor().toLowerCase().contains(searchLower) ||
                           rent.getPublisher().toLowerCase().contains(searchLower) ||
                           rent.getTitle().toLowerCase().contains(searchLower);
                })
                .map(wishList -> {
                    String lenderNickname = userRepository.findById(wishList.getRent().getLenderUserId())
                            .map(user -> user.getNickname())
                            .orElse("알 수 없음");
                    return WishListResponseDto.from(wishList, lenderNickname);
                })
                .collect(Collectors.toList());
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
        // 중복 체크 로직 (ACTIVE 상태인 것만 체크)
        if (wishListRepository.findByUserIdAndRentIdAndStatus(userId, request.rentId(), WishListStatus.ACTIVE).isPresent()) {
            throw new IllegalArgumentException("이미 찜한 게시글입니다.");
        }

        // 사용자 조회
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));

        // 대여 게시글 존재 여부 확인
        Rent rent = rentRepository.findById(request.rentId())
                .orElseThrow(() -> new IllegalArgumentException("대여 게시글을 찾을 수 없습니다."));

        // 찜 목록 생성
        WishList wishList = new WishList();
        wishList.setUser(user);
        wishList.setRent(rent);

        // 저장 및 반환
        WishList savedWishList = wishListRepository.save(wishList);
        String lenderNickname = userRepository.findById(rent.getLenderUserId())
                .map(lenderUser -> lenderUser.getNickname())
                .orElse("알 수 없음");
        return WishListResponseDto.from(savedWishList, lenderNickname);
    }

    /**
     * 찜 목록에서 도서 삭제 (Soft Delete)
     * 
     * 사용자의 찜 목록에서 특정 도서를 제거합니다. (실제 데이터는 삭제하지 않고 상태만 변경)
     * 
     * @param userId 사용자 ID
     * @param rentId 삭제할 도서 게시글 ID
     * @throws IllegalArgumentException 찜하지 않은 게시글인 경우
     */
    public void deleteWishList(Long userId, Integer rentId) {
        // ACTIVE 상태인 찜 목록 조회 - 삭제된 것은 대상에서 제외
        WishList wishList = wishListRepository.findByUserIdAndRentIdAndStatus(userId, rentId, WishListStatus.ACTIVE)
                .orElseThrow(() -> new IllegalArgumentException("찜하지 않은 게시글입니다."));
        
        // Soft Delete 실행 - 실제 삭제가 아닌 상태만 변경
        // 데이터는 남겨두고 DELETED 상태로 변경하여 조회에서만 제외
        wishList.setStatus(WishListStatus.DELETED);
        
        // 변경사항을 데이터베이스에 저장 - JPA가 UPDATE 쿼리 실행
        wishListRepository.save(wishList);
    }
}
