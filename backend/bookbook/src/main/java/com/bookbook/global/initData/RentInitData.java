package com.bookbook.global.initData;

import com.bookbook.domain.rent.entity.Rent;
import com.bookbook.domain.rent.entity.RentStatus;
import com.bookbook.domain.rent.repository.RentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Slf4j  // log.info를 통해 초기화 시작/완료 및 데이터 존재 여부 등의 메시지를 로그로 남김
@Component
@Profile({"dev", "test"})   // dev 또는 test 프로필이 활성화된 경우에만 이 초기 데이터가 생성
@RequiredArgsConstructor
public class RentInitData implements CommandLineRunner {

    private final RentRepository rentRepository;

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        log.info("=== 대여 초기 데이터 생성 시작 ===");
        
        if (rentRepository.count() > 0) {
            log.info("이미 대여 데이터가 존재합니다. 초기 데이터 생성을 건너뜁니다.");
            return;
        }

        createRentData();
        
        log.info("=== 대여 초기 데이터 생성 완료 ===");
    }

    private void createRentData() {
        Rent rent1 = Rent.builder()
                .lenderUserId(1L)
                .title("마음을 편안하게 하는 책이에요.")
                .bookCondition("최상 (깨끗함)")
                .bookImage("/uploads/72432edd-9c53-4972-a04e-d6e97ed5e0a4.jpg")
                .address("제주특별자치도")
                .contents("손에 힘을 풀면 많은 것이 해결됩니다. 나티코 승려가 말하는 삶의 지혜를 배울 수 있어요.")
                .rentStatus(RentStatus.AVAILABLE)
                .bookTitle("내가 틀릴 수도 있습니다 - 숲속의 현자가 전하는 마지막 인생 수업")
                .author("비욘 나티코 린데블라드 , 토마스 산체스 (그림), 박미경")
                .publisher("다산초당")
                .category("인문 에세이")
                .description("2022년 1월, 한 사람이 세상을 떠났다. 그러자 스웨덴 전역에 거대한 애도의 물결이 일었다. 비욘 나티코 린데블라드. 수많은 스웨덴인들을 불안에서 끌어내어 평화와 고요로 이끌었던 그는 2018년 루게릭병에 진단받은 후에도 유쾌하고 따뜻한 지혜를 전하며 살아갔다.")
                .build();
        rentRepository.save(rent1);

        Rent rent2 = Rent.builder()
                .lenderUserId(1L)
                .title("모든 건 건너가기 위함임을 알게하는 책입니다.")
                .bookCondition("상 (사용감 적음)")
                .bookImage("/uploads/e35f5f5f-51f2-45fe-b04c-e76c7310e0af.jpg")
                .address("경상남도")
                .contents("아제아제 바라아제 바라승아제 모지사바하.\n이 문구가 얼마나 나를 편안하게 하는 지 알게됐어요.\n맘의 평화를 원하신다면 추천하는 책입니다.")
                .rentStatus(RentStatus.AVAILABLE)
                .bookTitle("건너가는 자 - 익숙함에서 탁월함으로 얽매임에서 벗어남으로")
                .author("최진석")
                .publisher("쌤앤파커스")
                .category("교양 인문학")
                .description("“익숙한 이곳에 머물러 있는가, 새로운 저곳으로 건너려 하는가?” 격변의 시대에 반야심경이 던지는 ‘인간다운 삶’이라는 화두. 철학자 최진석과 함께 읽는 삶의 지침서로서의 반야심경 인류의 고전에서 길어 올린 지혜의 정수.")
                .build();
        rentRepository.save(rent2);

        Rent rent3 = Rent.builder()
                .lenderUserId(1L)
                .title("술술 읽히는 자기개발도서를 찾는다면 추천이요!")
                .bookCondition("중 (사용감 있음)")
                .bookImage("/uploads/7ffcecde-f34f-480e-9e3e-43ee827c279f.jpg")
                .address("인천광역시")
                .contents("글자가 크고 글 사이 간격도 커서 책 두께에 비해 술술 읽혀나가는 책입니다.\n가볍게 빠르게 읽기 좋은 자기개발서로 추천해요.")
                .rentStatus(RentStatus.AVAILABLE)
                .bookTitle("역행자 확장판 - 돈·시간·운명으로부터 완전한 자유를 얻는 7단계 인생 공략집")
                .author("자청")
                .publisher("웅진지식하우스")
                .category("성공학")
                .description("95퍼센트의 인간은 타고난 유전자와 본성의 꼭두각시로 살아간다. 이들은 평생 돈, 시간, 운명에게 속박되어, 평범함을 벗어나지 못하고 불행하게 사는 ‘순리자’다. 그러나 5퍼센트의 인간은 다르다. 이들은 타고난 유전자의 본성을 역행해 돈, 시간, 운명으로부터 완전한 자유를 얻는다. 본성을 거슬러 행복을 쟁취하는 이들이 바로 ‘역행자’다.")
                .build();
        rentRepository.save(rent3);

        Rent rent4 = Rent.builder()
                .lenderUserId(1L)
                .title("죽음 후의 만날 곳에 대한 이야기가 담긴 시, 단테의 신곡입니다.")
                .bookCondition("중 (사용감 있음)")
                .bookImage("/uploads/f7a02993-8a9f-4ad5-92d2-d028debc3c4e.jpg")
                .address("전라북도")
                .contents("유명한 단테의 신곡.\n단테가 시로 현실감 있게 죽음의 세계에 다녀온 이야기를 해줍니다.")
                .rentStatus(RentStatus.AVAILABLE)
                .bookTitle("신곡 세트 - 전3권")
                .author("단테 알리기에로 , 윌리엄 블레이크 (그림), 박상진")
                .publisher("민음사")
                .category("외국시")
                .description("죽음 이후를 그리는 장대한 상상력으로 구원을 열망하는 인간의 조건을 그린 작품. 이탈리아의 시인 단테가 쓴 장편 서사시이다. 단테가 정치적 활동으로 인해 고향 피렌체에서 추방당한 뒤 세상을 떠나기까지 20여 년에 걸친 유랑 기간 중에 집필되었다.")
                .build();
        rentRepository.save(rent4);

        Rent rent5 = Rent.builder()
                .lenderUserId(1L)
                .title("순수함을 다시 한 번 만나는 책.")
                .bookCondition("하 (손상 있음)")
                .bookImage("/uploads/8a467325-4ff3-4a01-bb4b-de56579f64b2.jpg")
                .address("세종특별자치시")
                .contents("읽어도 읽어도 좋은 책이라 생각합니다.\n순수함을 만나고 싶다면 추천드려요.")
                .rentStatus(RentStatus.AVAILABLE)
                .bookTitle("어린 왕자")
                .author("앙투안 드 생텍쥐페리 , 이하영")
                .publisher("씨리얼")
                .category("프랑스소설")
                .description("전 세계 수많은 독자가 세대를 넘어 되풀이해 읽는 책, 바로 《어린 왕자》다. 낯선 별들을 여행하며 만남과 이별을 겪는 어린 왕자의 여정은 삶의 본질적인 질문을 담고 있다. 사랑과 책임, 관계와 기억 같은 주제는 나이에 따라 다르게 읽히며, 시간이 흐를수록 새로운 의미로 다가온다.")
                .build();
        rentRepository.save(rent5);

        Rent rent6 = Rent.builder()
                .lenderUserId(1L)
                .title("조선의 궁궐을 어린이도 이해할 수 있도록 설명해주는 책")
                .bookCondition("상 (사용감 적음)")
                .bookImage("/uploads/cb681dbf-b4b4-40e8-8d6b-b93c7043510b.jpg")
                .address("대구광역시")
                .contents("우리 조선의 많은 궁궐에 대해 설명해주는 책이에요.\n책을 읽고 자녀에게 설명해주기 너무 좋은 책!")
                .rentStatus(RentStatus.AVAILABLE)
                .bookTitle("우리 궁궐 이야기 - 아이에게 알려주는 궁궐 안내판과 조선 역사")
                .author("구완회")
                .publisher("상상출판")
                .category("조선시대 일반")
                .description("부모가 궁궐 안내판의 내용을 먼저 이해한 후, 아이들에게 쉽고 재미있게 설명할 수 있도록 이끌어준다. 이 책은 단순히 궁궐 여행을 위한 가이드북이 아니다. 궁궐의 과거와 현재를 알아보는 이야기책이며 부모용 역사 참고서라 할 만하다.")
                .build();
        rentRepository.save(rent6);

        Rent rent7 = Rent.builder()
                .lenderUserId(1L)
                .title("슬픔을 공부하면 슬픔을 이해할 수 있어요.")
                .bookCondition("최상 (깨끗함)")
                .bookImage("/uploads/fa3d0897-6c19-4d62-953e-71d78bed555b.jpg")
                .address("울산광역시")
                .contents("타인의 슬픔에 대해 지겹게 느끼는 건 참혹한 일입니다.\n타인의 슬픔은 가장 소중하고 가장 어려운 것.\n슬픔을 이해하려고 슬픔을 공부합니다.")
                .rentStatus(RentStatus.AVAILABLE)
                .bookTitle("슬픔을 공부하는 슬픔")
                .author("신형철")
                .publisher("한겨레출판")
                .category("한국에세이")
                .description("문학평론가 신형철이 4년 만에 새로운 산문집을 출간한다. 이번 산문집은 「한겨레21」에 연재됐던 '신형철의 문학 사용법'을 비롯, 각종 일간지와 문예지 등에 연재했던 글과 미발표 원고를 모아 엮은 것이다.")
                .build();
        rentRepository.save(rent7);

        Rent rent8 = Rent.builder()
                .lenderUserId(1L)
                .title("노벨상 수상한 한강 작가의 그 책.")
                .bookCondition("최상 (깨끗함)")
                .bookImage("/uploads/56483fa1-3f8b-4460-965d-d39095ccc201.jpg")
                .address("부산광역시")
                .contents("과거의 한 정부가 철저히 숨기려 했던 그 날.\n그날의 소년이 내게로 옵니다.\n한국인이라면, 이 슬픈 역사는 알아야하고 알려야 합니다.")
                .rentStatus(RentStatus.AVAILABLE)
                .bookTitle("소년이 온다 - 2024 노벨문학상 수상작가")
                .author("한강")
                .publisher("창비")
                .category("2000년대 이후 한국소설")
                .description("섬세한 감수성과 치밀한 문장으로 인간 존재의 본질을 탐구해온 작가 한강의 여섯번째 장편소설. '상처의 구조에 대한 투시와 천착의 서사'를 통해 한강만이 풀어낼 수 있는 방식으로 1980년 5월을 새롭게 조명한다.")
                .build();
        rentRepository.save(rent8);

        Rent rent9 = Rent.builder()
                .lenderUserId(1L)
                .title("사용한 카트는 제자리에 다시 돌려야할까?를 말하는 책")
                .bookCondition("최상 (깨끗함)")
                .bookImage("/uploads/9981cb11-26c5-47e9-8f86-1b6f9b3f81ea.jpg")
                .address("서울특별시")
                .contents("사용한 카트는 제자리에 다시 되돌려놔야할까?\n이유없이 친구의 뺨을 때리면 안되는 걸까?\n횡단보도가 너무 멀고, 날은 덥고, 그동안 나는 착한 일을 해왔으니 한 번쯤은 무단횡단해도 되겠지?\n\n이런 내 안의 작은 질문들이 모두 철학이었어요.\n더 좋은 삶을 위해 그 질문들에 답하는 방법을 알려주는 책입니다.")
                .rentStatus(RentStatus.AVAILABLE)
                .bookTitle("더 좋은 삶을 위한 철학 - 천사와 악마 사이 더 나은 선택을 위한 안내서")
                .author("마이클 슈어 , 염지선")
                .publisher("김영사")
                .category("인문 에세이")
                .description("복잡한 선택과 함정, 거짓 멘토와 어리석은 조언들로 가득한 이 세상에서 더 나은 선택을 하려는 이들을 위한 철학의 조언. 수천 년 동안 ‘좋은 삶이란 무엇인가’를 고민해온 철학자들의 지혜를 빌려 일상 속 윤리적 딜레마가 충돌하는 순간을 유머러스하게 조명한다.")
                .build();
        rentRepository.save(rent9);

        Rent rent10 = Rent.builder()
                .lenderUserId(1L)
                .title("인간관계를 과거에서 배워보는 시간.")
                .bookCondition("상 (사용감 적음)")
                .bookImage("/uploads/b3cf8ea0-d6dd-4b48-9080-373d59ee08b4.jpg")
                .address("서울특별시")
                .contents("군주론은 무작정 믿으면 매우 위험한 책이라는 것은 변함이 없어요.\n하지만, 그 속에서도 배울 수 있는 것이 있었습니다.\n역사와 인간관계를 배울 수 있는 책이에요. 추천!")
                .rentStatus(RentStatus.AVAILABLE)
                .bookTitle("군주론 (무삭제 완역본)")
                .author("니콜로 마키아벨리 , 김운찬")
                .publisher("현대지성")
                .category("외교정책/외교학")
                .description("현대지성 클래식 38권. 마키아벨리는 이 책에서 군주가 권력을 얻고 유지하려면 때로는 권모술수를 써야 하며, 사악한 행위도 서슴지 말아야 한다고 주장한다. “결과가 수단을 정당화한다”라고 정리되며 “마키아벨리즘”이라는 용어를 낳은 이 사상은, 종교와 윤리를 중시하던 유럽 사회에 큰 충격을 주었다.")
                .build();
        rentRepository.save(rent10);

        Rent rent11 = Rent.builder()
                .lenderUserId(1L)
                .title("내일의 내가 변하고 싶다면 추천합니다.")
                .bookCondition("상 (사용감 적음)")
                .bookImage("/uploads/d0087f5e-555e-48e1-b633-313d6fb4dd04.jpg")
                .address("대전광역시")
                .contents("살아지는 대로 살고 있는 나를 위해 추천합니다.")
                .rentStatus(RentStatus.AVAILABLE)
                .bookTitle("퓨처 셀프 - 현재와 미래가 달라지는 놀라운 혁명")
                .author("벤저민 하디 , 최은아")
                .publisher("상상스퀘어")
                .category("성공학")
                .description("‘미래의 나는 어떤 모습일까?’라는 질문은 우리가 인생에서 쉽게 놓치는 중요한 진실에 이르게 한다. 즉, 미래의 나와 연결될수록 현재 더 나은 삶을 살게 된다는 것이다. 이 책은 미래의 내가 어떤 모습일지 깊이 생각해보고, 지금 그 사람이 되는 방법을 구체적으로 알려주는 인생 지침서이다.")
                .build();
        rentRepository.save(rent11);

        Rent rent12 = Rent.builder()
                .lenderUserId(1L)
                .title("책을 왜 읽어야 하는 지 말하는 책이에요")
                .bookCondition("중 (사용감 있음)")
                .bookImage("/uploads/bdce65d0-ea25-4061-ae25-e9de215466d6.jpg")
                .address("강원특별자치도")
                .contents("책을 왜 읽어야 할까요?\n그 질문에 과학적인 근거를 바탕으로 설명해주는 책입니다.")
                .rentStatus(RentStatus.AVAILABLE)
                .bookTitle("독서의 뇌과학 - 당신의 뇌를 재설계하는 책 읽기의 힘")
                .author("가와시마 류타 , 황미숙")
                .publisher("현대지성")
                .category("기초과학/교양과학")
                .description("일본 뇌 과학계 최고 권위자인 가와시마 류타 교수는 다양한 독서 방법이 뇌에 미치는 영향을 면밀히 분석하면서 독서가 단순히 즐거움을 추구하는 행위만이 아니라 동시에 뇌를 활성화하는 최고의 자기계발 수단임을 알려준다.")
                .build();
        rentRepository.save(rent12);

        Rent rent13 = Rent.builder()
                .lenderUserId(1L)
                .title("편안하게 관계를 들여다 볼 수 있게 합니다.")
                .bookCondition("최상 (깨끗함)")
                .bookImage("/uploads/c796a7c1-e2b9-4acd-a2bd-0727b5b4a6b4.jpg")
                .address("경상북도")
                .contents("'사랑으로 일어나는 싸움에서 늘 먼저 미안하다고 말하는 이는 잘못을 저지른 쪽이 아니라 더 많이 그리워한 쪽이다.'\n이 한 문장으로 저는 책을 읽게 됐어요.\n꼭 추천하는 책이에요.")
                .rentStatus(RentStatus.AVAILABLE)
                .bookTitle("느낌의 공동체 - 신형철 산문 2006～2009")
                .author("신형철")
                .publisher("문학동네")
                .category("기타 명사에세이")
                .description("2008년 겨울에 첫 평론집 <몰락의 에티카>를 출간한 문학평론가 신형철의 첫 산문집. 2008년 12월에 그의 첫 평론집 <몰락의 에티카>가 나왔으니까 햇수로 3년 만에 선보이는 그의 두번째 책이다. 2006년 봄부터 2009년 겨울까지 그가 보고 듣고 읽고 만난 세상의 좋은 작품들로부터 기인한 책이다.")
                .build();
        rentRepository.save(rent13);

        log.info("대여 데이터 7건 생성 완료");
    }
}