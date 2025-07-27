package com.bookbook.domain.home.service;

import com.bookbook.domain.book.entity.Book;
import com.bookbook.domain.book.enums.BookStatus;
import com.bookbook.domain.book.repository.BookRepository;
import com.bookbook.domain.home.dto.HomeResponseDto;
import com.bookbook.domain.user.entity.User;
import com.bookbook.domain.user.enums.Role;
import com.bookbook.domain.user.enums.UserStatus;
import com.bookbook.domain.user.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
@DisplayName("HomeService 테스트")
class HomeServiceTest {

    @Mock
    private BookRepository bookRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private HomeService homeService;

    private User testUser;
    private List<Book> testBooks;

    @BeforeEach
    void setUp() {
        // 테스트용 사용자 생성
        testUser = User.builder()
                .username("testuser")
                .password("password")
                .nickname("테스트유저")
                .email("test@test.com")
                .address("서울특별시 성북구 안암동 123-45")
                .role(Role.USER)
                .userStatus(UserStatus.ACTIVE)
                .build();

        // 테스트용 도서 생성
        testBooks = List.of(
                Book.builder()
                        .title("테스트 도서 1")
                        .author("작가1")
                        .bookImage("image1.jpg")
                        .region("성북구")
                        .status(BookStatus.AVAILABLE)
                        .ownerId(1L)
                        .build(),
                Book.builder()
                        .title("테스트 도서 2")
                        .author("작가2")
                        .bookImage("image2.jpg")
                        .region("성북구")
                        .status(BookStatus.AVAILABLE)
                        .ownerId(1L)
                        .build()
        );
    }

    @Test
    @DisplayName("로그인한 사용자의 지역 기반 메인페이지 데이터 조회")
    void getHomeData_WithLoggedInUser() {
        // given
        Long userId = 1L;
        when(userRepository.findById(userId)).thenReturn(Optional.of(testUser));
        when(bookRepository.findTop5ByRegionWithImage(eq("성북구"), any(BookStatus.class)))
                .thenReturn(testBooks);
        when(bookRepository.countByRegionAndStatus(eq("성북구"), any(BookStatus.class)))
                .thenReturn(2L);

        // when
        HomeResponseDto result = homeService.getHomeData(userId);

        // then
        assertThat(result.getRegion()).isEqualTo("성북구");
        assertThat(result.getBookImages()).hasSize(2);
        assertThat(result.getBookImages()).containsExactly("image1.jpg", "image2.jpg");
        assertThat(result.getTotalBooksInRegion()).isEqualTo(2L);
        assertThat(result.getMessage()).isEqualTo("성북구에 최근 등록된 도서");
    }

    @Test
    @DisplayName("비로그인 사용자의 전체 기반 메인페이지 데이터 조회")
    void getHomeData_WithoutLoggedInUser() {
        // given
        when(bookRepository.findTop5WithImage(any(BookStatus.class)))
                .thenReturn(testBooks);
        when(bookRepository.countByStatus(any(BookStatus.class)))
                .thenReturn(10L);

        // when
        HomeResponseDto result = homeService.getHomeData(null);

        // then
        assertThat(result.getRegion()).isEqualTo("전체");
        assertThat(result.getBookImages()).hasSize(2);
        assertThat(result.getTotalBooksInRegion()).isEqualTo(10L);
        assertThat(result.getMessage()).isEqualTo("최근 등록된 도서");
    }

    @Test
    @DisplayName("주소에서 구 정보 추출 테스트")
    void extractRegionFromAddress() {
        // given
        String address1 = "서울특별시 성북구 안암동 123-45";
        String address2 = "부산광역시 해운대구 우동 456-78";
        String address3 = "경기도 수원시 팔달구 행궁동 789-12";

        // when & then
        // private 메서드이므로 public 메서드를 통해 간접 테스트
        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
        when(bookRepository.findTop5ByRegionWithImage(eq("성북구"), any(BookStatus.class)))
                .thenReturn(testBooks);

        HomeResponseDto result = homeService.getHomeData(1L);
        assertThat(result.getRegion()).isEqualTo("성북구");
    }
}
