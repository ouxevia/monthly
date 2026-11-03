// 테마 · 스타일 · 글씨체 · 공휴일 데이터

// 과목 색상 테마
// 테마마다 기준색 10개(과목 순서대로 배정)만 정하고, 미완료(연함) · 완료(짙음) 한 쌍은 자동으로 만듭니다.
//  - 미완료: 검은 글씨가 잘 보일 만큼 밝게 (기준색이 이미 밝으면 그대로)
//  - 완료: 흰 글씨가 잘 보일 만큼 진하게 (기준색이 이미 진하면 그대로)
// 결과 형식은 c: [[이름, 미완료색, 완료색], ...]

const RAINBOW = ['빨강', '주황', '노랑', '초록', '파랑', '남색', '보라', '분홍', '청록', '모카'];

const THEME_SOURCES = [
  // 영화 분위기를 살리면서 색조는 다양하게 (비슷한 색끼리 겹치지 않게)
  { id: 'mv-enola', group: 'movie', name: '에놀라 홈즈', desc: '여름 들판 · 리넨 셔츠 · 멜빵', names: ['들판 골드', '숲 그린', '하늘 블루', '벽돌 레드', '라벤더', '네이비', '티 로즈', '틸', '다크 초콜릿', '자두'], base: ['#D6B04C', '#4E7A3A', '#7FA6C9', '#A8473A', '#8E7AAE', '#2E3E5E', '#D08A96', '#3E7E7A', '#4A3226', '#6E3A5E'] },
  { id: 'mv-bigfish', group: 'movie', name: '빅 피쉬', desc: '수선화 들판 · 네이비 수트', names: ['수선화', '네이비 수트', '서커스 레드', '풀밭 그린', '라벤더 블루', '강물 틸', '오렌지', '핑크 드레스', '은빛 물고기', '나무 브라운'], base: ['#E8C840', '#2E3C6E', '#C0443C', '#6E9E44', '#8C93C8', '#3E8C9A', '#E0883A', '#D88AA8', '#A8B4BC', '#8A6440'] },
  { id: 'mv-midnight', group: 'movie', name: '미드나잇 인 파리', desc: '비 내린 다리 위 가로등', names: ['밤 블루', '가로등 옐로', '와인 레드', '센강 틸', '살구', '라일락', '카페 브라운', '압생트 그린', '장미', '비 오는 회색'], base: ['#2A3D6A', '#F2C25A', '#A83A48', '#3E8A8E', '#E8A070', '#A694C8', '#7A5238', '#8AAA4E', '#D88A9A', '#8C96A6'] },
  { id: 'mv-potter', group: 'movie', name: '해리포터', desc: '차콜 · 버건디 · 골드 · 틸', names: ['그리핀도르 레드', '골드', '슬리데린 그린', '래번클로 블루', '촛불 오렌지', '마법 보라', '호수 틸', '양피지', '석벽 그레이', '요정 핑크'], base: ['#9E2A34', '#D4A83A', '#2E6A48', '#2E4E8E', '#E08A3C', '#6E4A8E', '#2E7E80', '#DCC9A0', '#7E7A76', '#C87A92'] },
  { id: 'mv-spirited', group: 'movie', name: '센과 치히로', desc: '온천장 · 숲 · 하쿠', names: ['온천장 핑크', '하쿠 틸', '머스타드', '숲 그린', '라벤더', '등불 오렌지', '다크 브라운', '하늘', '피치', '가오나시 차콜'], base: ['#E04A6A', '#0E6E86', '#E0A83A', '#6CB04E', '#9A82A6', '#E87A4A', '#5E3A2A', '#7EB8D8', '#E8B4A0', '#3E3A3E'] },
  { id: 'mv-cmbyn', group: 'movie', name: '콜 미 바이 유어 네임', desc: '이탈리아 호숫가 · 줄무늬 셔츠', names: ['수영장 블루', '살구', '민트', '레몬', '체리 레드', '올리브', '하늘', '포레스트', '라일락', '와인'], base: ['#2F6FB6', '#E89A6A', '#8ECFA8', '#E8D05A', '#C2443C', '#7A8A44', '#9CC4E0', '#2E5E3E', '#A894C0', '#7A2E44'] },
  { id: 'mv-lalaland', group: 'movie', name: '라라랜드', desc: '보랏빛 노을 · 노란 드레스', names: ['미아 옐로', '로열 블루', '레드 드레스', '퍼플 노을', '피치 핑크', '에메랄드', '하늘', '마젠타', '오렌지 노을', '밤 틸'], base: ['#E8C23A', '#2A4C96', '#B8323A', '#7A68B8', '#EAA090', '#2E8A6E', '#8EB8DE', '#B8487E', '#E8884A', '#2E5E5A'] },
  { id: 'mv-queens', group: 'movie', name: '퀸스 갬빗', desc: '60년대 거실 · 체스 · 틸 소파', names: ['체스 레드', '틸 소파', '그린', '오렌지', '체커 블랙', '하늘', '머스타드', '네이비', '모브', '크림'], base: ['#9E2E38', '#2E6E74', '#4E7A4A', '#D8783A', '#2A2A30', '#8EB4D8', '#C8A040', '#2E3E6A', '#9A6E8A', '#E6DAC0'] },
  { id: 'mv-dune', group: 'movie', name: '듄', desc: '사막 · 모래빛 수트 · 흐린 하늘', names: ['스파이스 오렌지', '사막 모래', '하늘 블루', '스틸 그레이', '사막 장미', '프레멘 블루', '다크 초콜릿', '오아시스 그린', '라벤더 노을', '아라키스 금빛'], base: ['#D2763A', '#E0BE8A', '#7EA6D0', '#5E6A78', '#C86A8A', '#2E5E9E', '#3E2A24', '#5E8E5A', '#A08EB8', '#D8A83A'] },
  { id: 'mv-bridgerton', group: 'movie', name: '브리저튼', desc: '리젠시 드레스룸 · 파우더 블루 · 로즈', names: ['파우더 블루', '로즈', '바이올렛', '세이지', '샴페인 골드', '피치', '로열 네이비', '와인', '틸', '코랄'], base: ['#8EAEDA', '#E09AAE', '#8A6AC0', '#8AAE8E', '#D6B46A', '#F0B08E', '#2E3E7A', '#8A2E48', '#3E8A8E', '#E07E78'] },
  { id: 'mv-coraline', group: 'movie', name: '코렐라인', desc: '파란 머리 · 노란 우비', names: ['파란 머리', '노란 우비', '체리 레드', '이끼 그린', '보라', '오렌지', '하늘', '핑크', '다크 네이비', '틸'], base: ['#1E4E9E', '#E8C23A', '#B8384A', '#5E8A3E', '#6E4A9E', '#E0843A', '#7EB0D0', '#E08AAE', '#1A2A44', '#2E8A8A'] },
  { id: 'mv-wicked', group: 'movie', name: '위키드', desc: '글린다 핑크 · 엘파바 그린', names: ['엘파바 그린', '글린다 핑크', '에메랄드 시티', '라벤더', '골드', '로즈 레드', '라임', '하늘', '마녀 블랙', '피치'], base: ['#4E8A3E', '#E88AAE', '#2E7A5E', '#A890D0', '#D8B04A', '#C8485C', '#A8C45E', '#8EC0E0', '#2E2E36', '#F0B090'] },

  // 도시 분위기
  { id: 'ct-london', group: 'city', name: '런던', desc: '빨간 공중전화 · 담쟁이 · 돌담', names: ['공중전화 레드', '로열 블루', '하이드파크 그린', '템스 틸', '돌담 베이지', '담쟁이 오렌지', '라벤더', '가로등 차콜', '머스타드', '장미'], base: ['#C8323A', '#2E4E8E', '#4E8A4E', '#3E7E86', '#C8B490', '#D8743A', '#9A8AB8', '#3E4046', '#C8A040', '#D88A98'] },
  { id: 'ct-paris', group: 'city', name: '파리', desc: '아연 지붕 · 마카롱 · 카페 테라스', names: ['세느 블루', '마카롱 핑크', '라벤더', '테라스 레드', '크루아상 골드', '마로니에 그린', '아연 지붕', '오스만 크림', '민트', '밤의 네이비'], base: ['#3E6E9E', '#E8A0B4', '#A890D0', '#B8323A', '#D8A44A', '#5E8A4E', '#7E8A96', '#E8DCC4', '#8ED0C0', '#1E2A4E'] },
  { id: 'ct-rome', group: 'city', name: '로마', desc: '테라코타 벽 · 사이프러스 · 젤라토', names: ['테라코타', '레몬', '사이프러스', '바티칸 블루', '피스타치오', '키안티 레드', '라일락', '분수 아쿠아', '에스프레소', '젤라토 핑크'], base: ['#C0623E', '#EAD860', '#3E6A4A', '#2E4A8E', '#A8C478', '#9A2A3A', '#A08EC0', '#4EB0C0', '#5A3A2E', '#E89AB0'] },
  { id: 'ct-newyork', group: 'city', name: '뉴욕', desc: '옐로 캡 · 브라운스톤 · 센트럴파크', names: ['옐로 캡', '브라운스톤', '브로드웨이 퍼플', '센트럴파크', '허드슨 블루', '핑크 네온', '브로드웨이 레드', '자유의 여신', '미드나잇', '콘크리트'], base: ['#F2C230', '#7A4A36', '#7A5EA8', '#4E7A44', '#3E5E80', '#E89AB0', '#C62E3A', '#7EB8A4', '#1A2230', '#B8B4AC'] },
  { id: 'ct-la', group: 'city', name: 'LA', desc: '선셋 · 야자수 · 태평양', names: ['선셋 오렌지', '핑크 노을', '야자수', '퍼시픽 블루', '하늘', '할리우드 골드', '샌드', '부겐빌레아', '라벤더 하늘', '밤의 보라'], base: ['#F08A4E', '#F2A0A8', '#4E8A5A', '#2E7EB0', '#9CCCE8', '#E2B84A', '#E8D2AE', '#C83E7A', '#B4A6D8', '#3A2E5E'] },
  { id: 'ct-florence', group: 'city', name: '피렌체', desc: '두오모 · 대리석 · 아르노 강', names: ['두오모 테라코타', '두오모 그린', '아르노 블루', '투스칸 옐로', '와인', '대리석 크림', '로즈 마블', '올리브', '라벤더', '하늘'], base: ['#B85A3A', '#3E7A5A', '#4E7EA8', '#E0B84A', '#7A2840', '#E6DCC6', '#D88A98', '#8A8A44', '#9A86BE', '#9CC6E0'] },
  { id: 'ct-tokyo', group: 'city', name: '도쿄', desc: '벚꽃 · 도리이 · 네온', names: ['벚꽃', '도리이 레드', '말차', '인디고', '유자', '등나무', '네온 시안', '콘크리트', '노을 오렌지', '신사 숲'], base: ['#F2A8BC', '#D0402E', '#8EAA4E', '#2E3E7E', '#F0CC4A', '#A88EC8', '#3EB8C8', '#8E9096', '#E8843A', '#3E6E4E'] },
  { id: 'ct-berlin', group: 'city', name: '베를린', desc: '콘크리트 · 그래피티 · 티어가르텐', names: ['콘크리트', '그래피티 옐로', '그래피티 핑크', '장벽 블루', '테크노 블랙', '티어가르텐', '벽돌', '샌드스톤', '페트롤', '녹슨 철'], base: ['#8E8E8C', '#F0C834', '#E25A8A', '#3E6EA8', '#1E1E22', '#5A7A4A', '#A8503E', '#D6C29A', '#2E5E66', '#8A4A2E'] },
  { id: 'ct-sydney', group: 'city', name: '시드니', desc: '하버 · 본다이 비치 · 자카란다', names: ['하버 블루', '오페라하우스', '본다이 아쿠아', '샌드', '유칼립투스', '자카란다', '산호', '선샤인', '레드 센터', '딥 오션'], base: ['#1E6EA8', '#F0EEE6', '#5EC4C8', '#E8CFA0', '#8AAE9A', '#9E86D0', '#F08A72', '#F2C84E', '#B8502E', '#123A5E'] },
  { id: 'ct-seoul', group: 'city', name: '서울', desc: '단청 · 한강 · 은행잎', names: ['단청 레드', '단청 그린', '한강 블루', '노을 오렌지', '라일락', '은행잎', '한복 분홍', '쪽빛', '기와 차콜', '백자'], base: ['#B83A30', '#3E8A6A', '#4E7EAE', '#E8843A', '#A890CC', '#EDC23E', '#E07898', '#2A3E6E', '#3A3A40', '#EEEAE0'] },

  // 여행지 · 영화 · 문구점에서 골라 담은 추천 조합
  { id: 'pk-santorini', group: 'pick', name: '산토리니', desc: '에게해 · 흰 벽 · 부겐빌레아', names: ['에게해 블루', '레몬', '부겐빌레아', '올리브', '하늘', '테라코타', '라벤더', '민트', '화이트 워시', '무화과'], base: ['#1F5FA8', '#E8C547', '#C2417A', '#7C8A4E', '#8EC4E8', '#C0643E', '#9C8CC4', '#8ED0B8', '#E4E0D6', '#6E3E6E'] },
  { id: 'pk-kyoto', group: 'pick', name: '교토의 가을', desc: '단풍 · 은행 · 말차', names: ['단풍 레드', '은행 옐로', '말차', '쪽빛', '감 오렌지', '등나무', '기와 그레이', '연분홍', '이끼', '나무 브라운'], base: ['#B83A2E', '#E2B33C', '#7E9A4E', '#2E4A72', '#E07E3C', '#8E78B0', '#6E7076', '#E8A8B0', '#4E6A3E', '#7A5238'] },
  { id: 'pk-aurora', group: 'pick', name: '아이슬란드 오로라', desc: '오로라 · 빙하 · 화산석', names: ['오로라 그린', '밤하늘', '핑크 오로라', '빙하 블루', '퍼플', '이끼', '노을', '온천 아쿠아', '화산석', '눈'], base: ['#3EBF8E', '#1E2A4E', '#D46EA8', '#8EC8DE', '#7A5EB4', '#8AA05A', '#E89A6E', '#5EC4C0', '#4A4A50', '#DDE4EA'] },
  { id: 'pk-marrakech', group: 'pick', name: '마라케시', desc: '마조렐 블루 · 사프란 · 민트티', names: ['마조렐 블루', '사프란', '민트티', '장미', '테라코타', '라벤더', '하늘', '올리브', '대추야자', '라임워시'], base: ['#2E4FB0', '#E8A23A', '#6EAA8A', '#D47A8A', '#B85A36', '#9A86C0', '#8EC0E0', '#8A8A3E', '#6E3E2A', '#E2D6B8'] },
  { id: 'pk-budapest', group: 'pick', name: '그랜드 부다페스트 호텔', desc: '핑크 호텔 · 보라 제복 · 케이크 상자', names: ['멘들스 핑크', '벨보이 퍼플', '머스타드', '스노우 블루', '엘리베이터 레드', '민트', '오렌지', '초콜릿', '스카이', '포레스트'], base: ['#E8A0B0', '#5E3A6E', '#D8A83E', '#A8C4DE', '#B8323E', '#8EC4B0', '#E8843A', '#5A3A2E', '#6E9EC8', '#3E6A4E'] },
  { id: 'pk-jeju', group: 'pick', name: '제주', desc: '감귤 · 유채꽃 · 현무암', names: ['감귤', '제주 바다', '동백', '유채꽃', '오름 그린', '수국', '현무암', '하늘', '해녀 블루', '모래'], base: ['#F08A2E', '#2E8AB0', '#C0323E', '#EAC83E', '#6E9A4E', '#8E86C8', '#4A4A4E', '#9CC8E6', '#1E4A6E', '#DCCBA8'] },
  { id: 'pk-forest', group: 'pick', name: '리틀 포레스트', desc: '시골 부엌 · 텃밭 · 사계절', names: ['토마토', '들깨 그린', '호박', '민트', '고구마 퍼플', '꽃분홍', '개울 블루', '레몬', '밤하늘', '버섯 브라운'], base: ['#D04A3A', '#6E8A4A', '#E2963E', '#8ED0BE', '#8A5E86', '#E4A0A8', '#3E7EA8', '#E8D060', '#2E3A52', '#8A6A4E'] },
  { id: 'pk-provence', group: 'pick', name: '프로방스', desc: '라벤더 밭 · 해바라기 · 올리브', names: ['라벤더', '해바라기', '지중해 블루', '로즈', '올리브', '테라코타', '시냇물', '포도 와인', '세이지', '석회암'], base: ['#9A84C8', '#EAC23E', '#3A72B0', '#D88A9A', '#7A8A4A', '#C2683E', '#6EB0B8', '#6E2A44', '#A8B8A0', '#D6C6A8'] },
  { id: 'pk-nordic', group: 'pick', name: '노르딕', desc: '피오르 · 링곤베리 · 자작나무', names: ['피오르 블루', '링곤베리', '버터', '숲', '오로라 민트', '모브', '라이트 우드', '블루베리', '안개', '차콜'], base: ['#3E6E96', '#B8324A', '#EAD08A', '#3E5E4A', '#8ECDB8', '#A88AA8', '#C8A07A', '#4A4A8A', '#B8C2C8', '#3E4048'] },
  { id: 'pk-stationery', group: 'pick', name: '문구점', desc: '형광펜 · 색연필 · 포스트잇', names: ['형광 핑크', '레몬', '민트', '하늘', '라벤더', '피치', '그린', '코랄', '네이비 펜', '연필 그레이'], base: ['#F08AA8', '#F2D45A', '#7ED0B8', '#84B8EA', '#B49ADE', '#F4A882', '#8CC46A', '#F07A6A', '#2E3E7A', '#8A8A8E'] },

  // 빨주노초파남보 + 분홍 (+ 청록 · 모카): 같은 무지개를 톤만 다르게
  { id: 'rb-pastel', group: 'rainbow', name: '파스텔', desc: '부드러운 파스텔 무지개', base: ['#F5A9A9', '#F9C99B', '#F7E08E', '#BCE2A8', '#A9D3F0', '#AEB9EC', '#CDB6EC', '#F5B9D6', '#A8DED8', '#D8C8B8'] },
  { id: 'rb-vivid', group: 'rainbow', name: '원색', desc: '쨍한 원색 무지개', base: ['#E8443A', '#F28C28', '#F5C518', '#3DAA4E', '#1E90E0', '#3949AB', '#8E44AD', '#EC4F98', '#12A89A', '#8D5A3B'] },
  { id: 'rb-vintage', group: 'rainbow', name: '빈티지', desc: '바랜 종이 느낌 무지개', base: ['#B5534A', '#C97B45', '#D2A63E', '#7F9455', '#4F8A9C', '#4A5D86', '#7A5C88', '#C07F8E', '#3F7A70', '#8A6A50'] },
  { id: 'rb-muted', group: 'rainbow', name: '톤다운', desc: '차분하게 가라앉은 무지개', base: ['#C98A86', '#D3A27F', '#D6C184', '#9AAE8A', '#88A8B8', '#8790B4', '#A592B2', '#D0A0B2', '#8DB5AE', '#B3A497'] },
  { id: 'rb-water', group: 'rainbow', name: '수채화', desc: '맑게 번진 물감 무지개', base: ['#EE7A74', '#F4AA64', '#F3D46E', '#8FCF86', '#6DBCE0', '#768FD2', '#A886CF', '#F095BD', '#6CCFC4', '#C69C7E'] },
  { id: 'rb-jewel', group: 'rainbow', name: '주얼톤', desc: '보석처럼 깊은 무지개', base: ['#A51E36', '#C55A1E', '#C99A1E', '#2E7D4F', '#1F639E', '#2E3584', '#5E2E85', '#A6336E', '#0F6E6A', '#6B3E26'] },

  // 여러 색이 섞인 조합
  { id: 'mx-blush', group: 'mix', name: '블러시 가든', desc: '블러시 · 로즈우드 · 세이지', names: ['블러시', '로즈우드', '세이지', '미스티 스카이', '미드나잇', '바닐라', '라벤더', '테라코타', '라떼', '더스크'], base: ['#F7C8D3', '#B46A72', '#A8B58A', '#A8B7C6', '#2D3A47', '#F3E3C3', '#B8A6D6', '#C8805A', '#C9A68A', '#7A6E8E'] },
  { id: 'mx-butter', group: 'mix', name: '버터 & 버건디', desc: '버터밀크 · 파스텔 블루 · 버건디', names: ['버터밀크', '파스텔 블루', '올드 버건디', '세이지', '블러시', '카라멜', '네이비', '라벤더', '테라코타', '올리브'], base: ['#FFF1B5', '#C1DBE8', '#6B2E33', '#A8B58A', '#EDBFC0', '#C08552', '#3A4A6B', '#C3B5D9', '#C46A4A', '#8C8A5A'] },
  { id: 'mx-retro', group: 'mix', name: '레트로 팝', desc: '라벤더 · 라임에이드 · 토마토', names: ['오텀 라벤더', '라임에이드', '토마토 잼', '퓨어 선', '모네 연못', '버블검', '스카이', '틸', '체리', '크림'], base: ['#D1CAEA', '#D6D35F', '#C45F3F', '#F4D242', '#898E46', '#F29CC3', '#80B0E8', '#008471', '#B23A48', '#EFE3C2'] },
  { id: 'mx-baby', group: 'mix', name: '베이비 팝', desc: '라벤더 · 피치 · 풀장', names: ['베이비 라벤더', '블루 스카이', '수선화', '나이트', '피치', '양귀비', '푸크시아', '풀장', '세이지', '모카'], base: ['#DBC0E8', '#A3C1E2', '#F7E289', '#252D45', '#FBB28B', '#F76F54', '#EA5E8B', '#47B5A8', '#9FA88E', '#A47A5E'] },
  { id: 'mx-spring', group: 'mix', name: '봄 정원', desc: '새잎 · 골드 · 핑크', names: ['라일락 그레이', '새잎', '굿 서프', '골드 벨벳', '핑크', '파피', '버터 옐로', '완두꽃', '라벤더', '민트'], base: ['#D3C2CD', '#849E15', '#92A2A8', '#B28622', '#F3B3BD', '#D8560E', '#F4DA7A', '#5B6FB8', '#B7A6D6', '#9ED3C0'] },
  { id: 'mx-pantone', group: 'mix', name: '클래식', desc: '옐로 · 레드 · 세룰리안 · 브라운', names: ['트랜스패런트 옐로', '셉터 레드', '세룰리안', '포팅 소일', '샴브레이', '에스프레소', '글레이셔', '세이지', '포레스트', '코랄'], base: ['#F5EFC6', '#8C1D24', '#A5BCDE', '#7A5446', '#79A3C3', '#3A2119', '#D2E2EC', '#9EA98A', '#3E5E45', '#E0806A'] },
];

function hexToHsl(hex) {
  const n = parseInt(hex.slice(1), 16);
  const r = ((n >> 16) & 255) / 255, g = ((n >> 8) & 255) / 255, b = (n & 255) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  const l = (max + min) / 2;
  let h = 0, s = 0;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    h = max === r ? (g - b) / d + (g < b ? 6 : 0) : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
    h /= 6;
  }
  return [h, s, l];
}

function hslToHex(h, s, l) {
  const f = (p, q, t) => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  };
  let r, g, b;
  if (s === 0) { r = g = b = l; } else {
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = f(p, q, h + 1 / 3); g = f(p, q, h); b = f(p, q, h - 1 / 3);
  }
  return '#' + [r, g, b].map((x) => Math.round(Math.min(1, Math.max(0, x)) * 255).toString(16).padStart(2, '0')).join('').toUpperCase();
}

// 상대 휘도 (0 = 검정, 1 = 흰색)
function luminance(hex) {
  const n = parseInt(String(hex).slice(1), 16);
  const lin = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); };
  return 0.2126 * lin((n >> 16) & 255) + 0.7152 * lin((n >> 8) & 255) + 0.0722 * lin(n & 255);
}

const LIGHT_MIN = 0.45; // 미완료: 이 이상 밝아야 검은 글씨가 또렷함
// 완료색은 모든 색을 같은 깊이로: 흰 글씨가 읽히는 선에서 최대한 옅게 (휘도 0.21~0.26)
const DEEP_MAX = 0.26; // 이보다 밝으면 흰 글씨가 흐려짐
const DEEP_MIN = 0.21; // 이보다 어두우면 무겁게 보여서 밝힘
const DEEP_SAT = 0.32; // 완료색 채도 상한: 낮을수록 회색이 섞인 탁한 톤

// 기준색의 색상(hue)은 그대로 두고 밝기만 조절해서 [미완료색, 완료색]을 만듦
function mixWhite(hex, t) {
  const n = parseInt(hex.slice(1), 16);
  return '#' + [n >> 16, (n >> 8) & 255, n & 255].map((v) => Math.round(v + (255 - v) * t).toString(16).padStart(2, '0')).join('').toUpperCase();
}

// soft: 미완료색을 흰색에 가까운 옅은 색으로 (무비 · 시티 무드 · 추천 팔레트)
export function makePair(hex, soft = false) {
  const [h, s, l] = hexToHsl(hex);
  let light = hex;
  if (soft) {
    // 흰색을 같은 비율로 섞어 옅게 (원래 색끼리의 밝기 차이는 그대로 남음)
    // 회색빛으로 바래지 않게 채도는 조금 살려 줌 (원래 무채색이면 그대로)
    // 원래 아주 밝은 색은 종이 배경에 묻히지 않게 흰색을 덜 섞음
    let t = 0.7;
    while (t > 0.2 && luminance(mixWhite(hex, t)) > 0.82) t -= 0.05;
    const [mh, ms, ml] = hexToHsl(mixWhite(hex, t));
    light = hslToHex(mh, s < 0.08 ? ms : Math.max(ms, 0.3), ml);
  } else if (luminance(hex) < LIGHT_MIN) {
    const ls = Math.min(s, 0.45); // 진한 색을 밝힐 때 형광처럼 보이지 않게
    for (let x = Math.max(l, 0.5); x <= 0.97; x += 0.01) {
      light = hslToHex(h, ls, x);
      if (luminance(light) >= LIGHT_MIN) break;
    }
  }
  // 완료색: 회색이 살짝 섞인 톤다운 색으로, 흰 글씨가 읽히는 깊이(휘도 DEEP_MIN~DEEP_MAX)에 맞춤
  // 기준색이 원래 그 깊이여도 채도는 낮춰서 모든 색이 같은 차분한 톤이 되게 함
  // 원래 색끼리의 차이는 조금 남김: 원래 채도가 낮을수록 더 회색빛, 원래 밝을수록 범위 안에서 조금 더 옅게
  const ds = Math.min(s, DEEP_SAT * Math.min(1, s / 0.5));
  const target = DEEP_MIN + (DEEP_MAX - DEEP_MIN) * Math.min(1, Math.max(0, (l - 0.2) / 0.6));
  let deep = hslToHex(h, ds, 0.7);
  for (let x = 0.7; x >= 0.05; x -= 0.005) {
    deep = hslToHex(h, ds, x);
    if (luminance(deep) <= target) break;
  }
  return [light, deep];
}

// 배경색 위에서 읽기 좋은 글자색 (진한 글씨 또는 흰 글씨)
export function inkOn(hex) {
  return luminance(hex) > 0.3 ? '#2F2B27' : '#FFFFFF';
}

export const THEME_GROUPS = [
  { id: 'custom', name: '내 팔레트', desc: '직접 고른 색으로 만든 조합' },
  { id: 'movie', name: '무비 무드', desc: '영화 장면에서 뽑은 색감' },
  { id: 'city', name: '시티 무드', desc: '도시 풍경에서 뽑은 색감' },
  { id: 'pick', name: '추천 팔레트', desc: '여행지 · 영화 · 문구점에서 골라 담은 조합' },
  { id: 'rainbow', name: '레인보우', desc: '빨주노초파남보 + 분홍 순서' },
  { id: 'mix', name: '컬러 믹스', desc: '여러 색을 조화롭게 섞은 조합' },
];

const SOFT_GROUPS = ['movie', 'city', 'pick'];

export const THEMES = THEME_SOURCES.map((t) => ({
  id: t.id,
  group: t.group,
  name: t.name,
  desc: t.desc,
  base: t.base.slice(),
  c: t.base.map((hex, i) => [(t.names || RAINBOW)[i], ...makePair(hex, SOFT_GROUPS.includes(t.group))]),
}));

// 사용자가 만든 팔레트 → 테마 형식으로
export function buildCustomTheme(p) {
  const colors = (p.colors || []).filter((x) => /^#[0-9a-fA-F]{6}$/.test(x.hex));
  const list = colors.length ? colors : [{ name: '색 1', hex: '#A9D3F0' }];
  return {
    id: p.id,
    group: 'custom',
    name: p.name || '내 팔레트',
    desc: list.length + '가지 색',
    base: list.map((x) => x.hex.toUpperCase()),
    c: list.map((x, i) => [x.name || '색 ' + (i + 1), ...makePair(x.hex.toUpperCase())]),
  };
}

// 캘린더 스타일: 배경 · 선 · 색감 (글씨체는 FONTS에서 따로 선택)
export const STYLES = [
  { id: 'simple', name: '심플', desc: '여백 많은 깔끔한 화이트', ink: '#26241F', sub: '#8A867E', line: '#E6E3DD', outer: '1px solid #DAD6CF', cellBg: '#FFFFFF', headBg: '#FAF9F7', radius: 12, sun: '#D2493F', sat: '#3F78C2', circle: 0.7, todayBg: '#FFF8E6', todayBadge: '#26241F', todayFg: '#FFFFFF' },
  { id: 'hand', name: '손글씨', desc: '줄노트 배경 + 진한 펜 테두리', ink: '#2B2A33', sub: '#7D7A86', line: '#D9D1C0', outer: '1.5px solid #3B3A44', cellBg: 'rgba(255,253,246,0.6)', headBg: 'transparent', radius: 0, sun: '#D2493F', sat: '#3F78C2', circle: 0.9, todayBg: 'rgba(255,236,150,0.45)', todayBadge: '#2B2A33', todayFg: '#FFFFFF' },
  { id: 'grid', name: '그리드', desc: '모눈종이 다이어리', ink: '#2F2B27', sub: '#6F6A62', line: '#CFCBC4', outer: '1px solid #CFCBC4', cellBg: 'rgba(255,255,255,0.55)', headBg: 'transparent', radius: 0, sun: '#D2493F', sat: '#3F78C2', circle: 0.85, todayBg: 'rgba(255,248,220,0.7)', todayBadge: '#2F2B27', todayFg: '#FFFFFF' },
  { id: 'vintage', name: '빈티지 페이퍼', desc: '크라프트지 + 이중 테두리', ink: '#4A3B2A', sub: '#8A7558', line: '#CDBFA6', outer: '3px double #A8957A', cellBg: 'rgba(251,246,236,0.5)', headBg: 'rgba(168,149,122,0.12)', radius: 0, sun: '#A8432F', sat: '#3E5F80', circle: 0.6, todayBg: 'rgba(214,180,120,0.25)', todayBadge: '#4A3B2A', todayFg: '#FBF6EC' },
  { id: 'night', name: '나이트', desc: '밤에 보기 편한 어두운 화면', dark: true, ink: '#ECE8DF', sub: '#9AA0B0', line: '#3A4052', outer: '1px solid #454B5F', cellBg: 'rgba(255,255,255,0.03)', headBg: 'rgba(255,255,255,0.04)', radius: 12, sun: '#FF8A80', sat: '#8AB4FF', circle: 0.35, todayBg: 'rgba(255,255,255,0.08)', todayBadge: '#ECE8DF', todayFg: '#1E2230' },
];

// 글씨체: scale = 글자 크기 보정 (손글씨 글꼴은 작아 보여서 키움)
// nudge: 할 일 칸 안에서 글자가 위아래 가운데에 오도록 내리는(+) / 올리는(-) 양 (em, 글씨체마다 실측)
export const FONTS = [
  { id: 'myeongjo', name: '나눔명조', desc: '기본 · 단정한 명조체', family: "'Nanum Myeongjo', serif", scale: 1, chip: 11.5, nudge: 0.098 },
  { id: 'batang', name: '고운바탕', desc: '부드러운 명조체', family: "'Gowun Batang', serif", scale: 1, chip: 11.5, nudge: -0.054 },
  { id: 'dodum', name: '고운돋움', desc: '깔끔한 고딕체', family: "'Gowun Dodum', sans-serif", scale: 1, chip: 11.5, nudge: -0.043 },
  { id: 'gaegu', name: '개구', desc: '동글동글 손글씨', family: "'Gaegu', cursive", scale: 1.15, chip: 12.5 },
  { id: 'pen', name: '나눔펜', desc: '다이어리 펜 손글씨', family: "'Nanum Pen Script', cursive", scale: 1.3, chip: 14, nudge: 0.045 },
];

export const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
export const WEEKDAYS = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
export const WEEKDAYS_KO = ['일', '월', '화', '수', '목', '금', '토'];

// 공휴일: 음력 명절 · 대체공휴일 · 선거일은 연도별 표로 관리
const HOLIDAY_TABLE = {
  2025: { '01-27': '임시공휴일', '01-28': '설날', '01-29': '설날', '01-30': '설날', '03-03': '대체공휴일', '05-05': '어린이날·부처님오신날', '05-06': '대체공휴일', '06-03': '대통령선거', '10-05': '추석', '10-06': '추석', '10-07': '추석', '10-08': '대체공휴일' },
  2026: { '02-16': '설날', '02-17': '설날', '02-18': '설날', '03-02': '대체공휴일', '05-24': '부처님오신날', '05-25': '대체공휴일', '06-03': '지방선거', '08-17': '대체공휴일', '09-24': '추석', '09-25': '추석', '09-26': '추석', '10-05': '대체공휴일' },
  2027: { '02-06': '설날', '02-07': '설날', '02-08': '설날', '02-09': '대체공휴일', '05-13': '부처님오신날', '08-16': '대체공휴일', '09-14': '추석', '09-15': '추석', '09-16': '추석', '10-04': '대체공휴일', '10-11': '대체공휴일', '12-27': '대체공휴일' },
};
const FIXED_HOLIDAYS = { '01-01': '신정', '03-01': '삼일절', '05-05': '어린이날', '06-06': '현충일', '08-15': '광복절', '10-03': '개천절', '10-09': '한글날', '12-25': '성탄절' };

export function holidayOf(year, md) {
  const t = HOLIDAY_TABLE[year];
  return (t && t[md]) || FIXED_HOLIDAYS[md] || '';
}
