package com.bookbook.global.initData;

import com.bookbook.domain.book.entity.Book;
import com.bookbook.domain.book.enums.BookStatus;
import com.bookbook.domain.book.repository.BookRepository;
import com.bookbook.domain.user.entity.User;
import com.bookbook.domain.user.enums.Role;
import com.bookbook.domain.user.enums.UserStatus;
import com.bookbook.domain.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class InitData implements CommandLineRunner {
    
    private final UserRepository userRepository;
    private final BookRepository bookRepository;
    
    @Override
    public void run(String... args) throws Exception {
        if (userRepository.count() > 0) {
            return; // 이미 데이터가 있으면 생성하지 않음
        }
        
        createTestUsers();
        createTestBooks();
    }
    
    /**
     * 테스트용 사용자 생성
     */
    private void createTestUsers() {
        // 성북구 사용자
        User user1 = User.builder()
                .username("seongbuk_user")
                .password("password123")
                .nickname("성북구사용자")
                .email("seongbuk@test.com")
                .address("서울특별시 성북구 안암동 123-45")
                .role(Role.USER)
                .userStatus(UserStatus.ACTIVE)
                .build();
        userRepository.save(user1);
        
        // 강남구 사용자
        User user2 = User.builder()
                .username("gangnam_user")
                .password("password123")
                .nickname("강남구사용자")
                .email("gangnam@test.com")
                .address("서울특별시 강남구 역삼동 456-78")
                .role(Role.USER)
                .userStatus(UserStatus.ACTIVE)
                .build();
        userRepository.save(user2);
        
        // 마포구 사용자
        User user3 = User.builder()
                .username("mapo_user")
                .password("password123")
                .nickname("마포구사용자")
                .email("mapo@test.com")
                .address("서울특별시 마포구 합정동 789-12")
                .role(Role.USER)
                .userStatus(UserStatus.ACTIVE)
                .build();
        userRepository.save(user3);
        
        System.out.println("✅ 테스트 사용자 생성 완료");
    }
    
    /**
     * 테스트용 도서 생성
     */
    private void createTestBooks() {
        // 성북구 도서들 (이미지 있음)
        String[] seongbukBooks = {
                "작별하지 않는다|한강|문학동네|https://image.yes24.com/goods/107783916/XL",
                "내가 틀릴 수도 있습니다|한강|문학동네|https://image.yes24.com/goods/119024551/XL",
                "건너가는 자|한강|문학동네|https://image.yes24.com/goods/108893071/XL",
                "소년이 온다|한강|창비|https://image.yes24.com/goods/71935010/XL",
                "흰|한강|난다|https://image.yes24.com/goods/63588340/XL",
                "채식주의자|한강|창비|https://image.yes24.com/goods/37606775/XL",
                "바람이 분다 당신이 좋다|한강|문학과지성사|https://image.yes24.com/goods/89173952/XL"
        };
        
        for (int i = 0; i < seongbukBooks.length; i++) {
            String[] bookInfo = seongbukBooks[i].split("\\|");
            Book book = Book.builder()
                    .title(bookInfo[0])
                    .author(bookInfo[1])
                    .publisher(bookInfo[2])
                    .bookImage(bookInfo[3])
                    .region("성북구")
                    .status(BookStatus.AVAILABLE)
                    .ownerId(1L)
                    .rentalPrice(3000 + (i * 500))
                    .deposit(10000)
                    .description(bookInfo[0] + " - " + bookInfo[1] + "의 대표작")
                    .build();
            bookRepository.save(book);
        }
        
        // 강남구 도서들 (이미지 있음)
        String[] gangnamBooks = {
                "코스모스|칼 세이건|사이언스북스|https://image.yes24.com/goods/2341502/XL",
                "총균쇠|재러드 다이아몬드|문학사상|https://image.yes24.com/goods/698982/XL",
                "사피엔스|유발 하라리|김영사|https://image.yes24.com/goods/23030284/XL",
                "호모 데우스|유발 하라리|김영사|https://image.yes24.com/goods/39063445/XL",
                "21세기를 위한 21가지 제언|유발 하라리|김영사|https://image.yes24.com/goods/66913858/XL"
        };
        
        for (int i = 0; i < gangnamBooks.length; i++) {
            String[] bookInfo = gangnamBooks[i].split("\\|");
            Book book = Book.builder()
                    .title(bookInfo[0])
                    .author(bookInfo[1])
                    .publisher(bookInfo[2])
                    .bookImage(bookInfo[3])
                    .region("강남구")
                    .status(BookStatus.AVAILABLE)
                    .ownerId(2L)
                    .rentalPrice(4000 + (i * 500))
                    .deposit(15000)
                    .description(bookInfo[0] + " - " + bookInfo[1] + "의 베스트셀러")
                    .build();
            bookRepository.save(book);
        }
        
        // 마포구 도서들 (이미지 있음)
        String[] mapoBooks = {
                "미드나잇 라이브러리|매트 헤이그|인플루엔셜|https://image.yes24.com/goods/95041936/XL",
                "아몬드|손원평|창비|https://image.yes24.com/goods/74041846/XL",
                "달러구트 꿈 백화점|이미예|팩토리나인|https://image.yes24.com/goods/96689416/XL"
        };
        
        for (int i = 0; i < mapoBooks.length; i++) {
            String[] bookInfo = mapoBooks[i].split("\\|");
            Book book = Book.builder()
                    .title(bookInfo[0])
                    .author(bookInfo[1])
                    .publisher(bookInfo[2])
                    .bookImage(bookInfo[3])
                    .region("마포구")
                    .status(BookStatus.AVAILABLE)
                    .ownerId(3L)
                    .rentalPrice(3500 + (i * 300))
                    .deposit(12000)
                    .description(bookInfo[0] + " - 화제의 베스트셀러")
                    .build();
            bookRepository.save(book);
        }
        
        // 이미지 없는 도서들 (필터링 테스트용)
        for (int i = 1; i <= 3; i++) {
            Book bookWithoutImage = Book.builder()
                    .title("이미지 없는 도서 " + i)
                    .author("테스트 작가")
                    .region("성북구")
                    .status(BookStatus.AVAILABLE)
                    .ownerId(1L)
                    .rentalPrice(2000)
                    .deposit(8000)
                    .build();
            bookRepository.save(bookWithoutImage);
        }
        
        System.out.println("✅ 테스트 도서 생성 완료");
        System.out.println("📚 성북구 도서: " + seongbukBooks.length + "권");
        System.out.println("📚 강남구 도서: " + gangnamBooks.length + "권");
        System.out.println("📚 마포구 도서: " + mapoBooks.length + "권");
        System.out.println("📚 이미지 없는 도서: 3권 (필터링됨)");
    }
}
