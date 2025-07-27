package com.bookbook.domain.wishList.repository;

import com.bookbook.domain.wishList.entity.WishList;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface WishListRepository extends JpaRepository<WishList, Long> {

    // 수정: createDate로 필드명 변경
    List<WishList> findByUserIdOrderByCreateDateDesc(Long userId);

    // TODO: Rent 엔티티 구현 후 주석 해제
    // Optional<WishList> findByUserIdAndRentId(Long userId, Long rentId);
}
