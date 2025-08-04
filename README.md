### 작업 흐름 상세

1. **이슈 생성**

- GitHub 이슈 탭에서 `feat | fix | chore | refactor | docs | style | test` 와 같은 **적절한 작업 태그를 지정**합니다.

2. **브랜치 생성**

- `feat/21-user-signup-api`와 같이 간략한 설명을 추가하면
  **브랜치 목록만 봐도 어떤 작업을 위한 브랜치인지 파악하기 더 용이**합니다.
- 예시:
  - `feat/21-user-signup-api` (백: 회원가입 API 구현)
- 모든 작업은 `main` 브랜치에서 분기하여 새로운 Feature 브랜치에서 진행합니다.

3. **커밋 메시지 작성**

- 앞서 정의한 **커밋 컨벤션을 철저히 준수**합니다.
- **예시:** `feat: 회원가입 API 구현 (#21)` (커밋 메시지에 `#이슈번호`를 포함)

### ✅ 커밋 컨벤션 (Commit Convention) 보완

| 태그       | 설명                                                                                |
| ---------- | ----------------------------------------------------------------------------------- |
| `feat`     | 새로운 기능 추가                                                                    |
| `fix`      | 버그 수정                                                                           |
| `style`    | 코드 포맷팅, 세미콜론 누락, UI 디자인 변경 등 (코드의 동작에 영향을 주지 않는 변경) |
| `refactor` | 리팩토링 (기능 변화 없이 코드 구조 개선, 가독성 향상 등)                            |
| `docs`     | 문서 수정 (README, Wiki, 주석 등)                                                   |
| `test`     | 테스트 코드 추가 또는 수정                                                          |
| `perf`     | 성능 개선                                                                           |
| `build`    | 빌드 시스템 또는 외부 종속성에 영향을 미치는 변경 (e.g., webpack, npm)              |

### 4. PR(Pull Request) 작성 상세

- **PR 제목:** `[태그] 간결한 PR 요약 (#이슈번호)` 형태로 작성.

  - 예시: `[feat] 회원가입 API 구현 (#21)`

- **PR 템플릿:** PR 템플릿을 사용하는 것은 정말 좋은 방법입니다. 다음과 같은 내용을 포함하도록 구성할 수 있습니다.

`## 💡 변경 사항

- [ ] 변경 1 <<

## 🔗 관련 이슈

close #이슈번호`

    `**close #{이슈번호}`:** PR 본문에 이 문구를 포함하면 PR이 머지될 때 해당 이슈가 자동으로 닫히도록 설정할 수 있습니다. 이는 GitHub Flow의 핵심 장점 중 하나입니다.

### 5. 코드 리뷰 및 머지 상세

- **리뷰 승인:** 최소 1명 이상의 팀원에게 리뷰 승인을 받는 규칙은 코드 품질을 높이는 데 매우 중요합니다.
- **Squash and Merge / Rebase and Merge:** GitHub에서 PR을 머지할 때 "Squash and Merge" 또는 "Rebase and Merge" 옵션을 고려해볼 수 있습니다.
  - **Squash and Merge:** 여러 개의 커밋을 하나의 커밋으로 합쳐서 `main` 브랜치에 머지합니다. `main` 브랜치의 커밋 히스토리를 깔끔하게 유지할 수 있습니다. (예시: "feat: 회원가입 API 구현 (#21)" 하나의 커밋으로 합쳐짐)

### 6. 브랜치 정리 상세(https://www.slog.gg/p/13973)

- `main` 브랜치에 머지된 feature 브랜치는 **즉시 삭제**하여 불필요한 브랜치가 쌓이는 것을 방지합니다.

---

## 📚 BookBook - 도서 대여 플랫폼

### 🏗️ 프로젝트 개요
BookBook은 개인 간 도서 대여를 중개하는 웹 플랫폼입니다. 사용자들이 자신의 도서를 등록하고, 다른 사용자와 대여 거래를 할 수 있는 서비스입니다.

### 🛠️ 기술 스택

#### Frontend
- **Framework**: Next.js 15.4.4
- **Language**: TypeScript 5.8.3
- **Styling**: Tailwind CSS 4.0
- **HTTP Client**: Axios 1.11.0
- **UI Components**: React Icons, Lucide React, React Modal
- **Toast**: React Toastify

#### Backend
- **Framework**: Spring Boot 3.5.4
- **Language**: Java 21
- **Database**: H2 (개발), MySQL (프로덕션)
- **ORM**: Spring Data JPA
- **Security**: Spring Security + OAuth2 + JWT
- **Documentation**: SpringDoc OpenAPI
- **Real-time**: WebSocket + STOMP
- **Validation**: Spring Validation

### ✨ 주요 기능

#### 🔐 인증/인가 시스템
- OAuth2 소셜 로그인 (Google, Kakao, Naver)
- JWT 기반 인증 및 Refresh Token 관리
- 역할 기반 접근 제어 (USER, ADMIN)

#### 👤 사용자 관리
- 회원가입/로그인/로그아웃
- 사용자 프로필 조회 및 수정
- 회원탈퇴 기능 (Soft Delete)
- 사용자 정지/해제 시스템 (자동 해제 스케줄링 포함)

#### 📚 도서 관리
- 도서 등록/수정/삭제 (Soft Delete)
- 도서 검색 및 필터링 (제목, 저자, 지역별)
- 이미지 업로드 및 관리
- 지역별 도서 분류
- 도서 상태 관리 (AVAILABLE, LOANED, FINISHED, DELETED)

#### 📝 대여 시스템
- 도서 대여 요청/승인/반납
- 대여 진행 상황 실시간 추적
- 내가 빌린 책 목록 (RentList)
- 내가 빌려준 책 목록 (LendList)
- 대여 가능한 도서 목록 조회

#### 💬 실시간 커뮤니케이션
- WebSocket 기반 실시간 채팅 시스템
- 채팅방 생성 및 관리
- 실시간 알림 시스템 (RENT_REQUEST, RETURN_REMINDER, WISHLIST_AVAILABLE, POST_CREATED)
- 메시지 히스토리 저장 및 조회

#### ⭐ 리뷰 시스템
- 도서 리뷰 작성/수정/삭제
- 평점 시스템
- 리뷰 조회 및 관리

#### 📋 위시리스트
- 관심 도서 등록/삭제 (Soft Delete)
- 위시리스트 상태 관리
- 위시리스트 조회

#### 🚨 신고 및 모니터링
- 사용자/게시글 신고 기능
- 관리자 신고 처리 시스템
- 신고 상태 관리 (PENDING, REVIEWED, PROCESSED)

#### 👨‍💼 관리자 기능
- 통합 관리자 대시보드
- 사용자 관리 (조회, 정지, 해제)
- 도서 게시글 관리
- 신고 내역 처리
- 정지된 사용자 관리 및 자동 해제

### 🏃‍♂️ 실행 방법

#### 환경 요구사항
- Java 21+
- Node.js 18+
- MySQL 8.0+ (프로덕션)

#### Backend 실행
```bash
cd backend/bookbook
./gradlew bootRun
```

#### Frontend 실행
```bash
cd frontend
npm install
npm run dev
```

#### 접속 정보
- **Frontend**: http://localhost:3000/bookbook
- **API 문서**: http://localhost:8080/swagger-ui/index.html
- **관리자 대시보드**: http://localhost:3000/admin/dashboard

### 📁 프로젝트 구조

#### Frontend
```
frontend/src/app/
├── bookbook/              # 메인 서비스
│   ├── rent/             # 도서 대여
│   ├── user/             # 사용자 페이지
│   │   ├── lendlist/     # 빌려준 책 목록
│   │   ├── rentlist/     # 빌린 책 목록
│   │   ├── wishlist/     # 위시리스트
│   │   ├── notification/ # 알림
│   │   └── profile/      # 프로필
│   └── MessagePopup/     # 실시간 채팅
├── admin/                # 관리자 페이지
│   └── dashboard/        # 관리자 대시보드
└── components/           # 공통 컴포넌트
```

#### Backend
```
backend/src/main/java/com/bookbook/
├── domain/
│   ├── user/             # 사용자 관리
│   ├── rent/             # 도서 대여
│   ├── rentBookList/     # 대여 가능한 도서 목록
│   ├── rentList/         # 빌린 책 관리
│   ├── lendList/         # 빌려준 책 관리
│   ├── wishList/         # 위시리스트
│   ├── chat/             # 실시간 채팅
│   ├── review/           # 리뷰 시스템
│   ├── notification/     # 알림 시스템
│   ├── report/           # 신고 관리
│   ├── suspend/          # 사용자 정지 관리
│   └── home/             # 홈페이지 데이터
└── global/               # 공통 설정 및 유틸리티
```

### 🎯 주요 특징
- **완전한 Soft Delete**: 모든 데이터 삭제는 논리적 삭제로 처리하여 데이터 복구 가능
- **실시간 소통**: WebSocket 기반 채팅으로 원활한 거래 진행
- **보안 강화**: Spring Security + JWT + OAuth2로 안전한 인증 시스템
- **자동화된 관리**: 정지된 사용자 자동 해제 등 스케줄링 기능
- **관리자 도구**: 효율적인 플랫폼 운영을 위한 통합 관리 시스템
- **반응형 UI**: 모바일과 데스크톱 최적화된 사용자 경험

### 🔒 보안 기능
- Spring Security 기반 인증/인가
- JWT 토큰 및 Refresh Token 자동 갱신
- OAuth2 소셜 로그인 연동
- 관리자 전용 보안 설정
- CORS 정책 및 XSS 방지
- 입력값 검증 및 SQL Injection 방지

---
