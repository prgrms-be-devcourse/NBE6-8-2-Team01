package com.bookbook.domain.rentList.repository;

import com.bookbook.domain.rentList.entity.RentApplication;
import com.bookbook.domain.rentList.entity.RentList;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

// 대여 신청 및 수락을 처리하는 리포지토리
// 25.08.05 현준
@Repository
public interface RentApplicationRepository extends JpaRepository<RentApplication, Integer> {

    // 게시글에 대한 PENDING 상태의 신청 조회


}