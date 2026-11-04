// 테마 · 스타일 · 글씨체 · 공휴일 데이터

// 과목 색상 테마
// 테마마다 기준색 10개(과목 순서대로 배정)만 정하고, 미완료(연함) · 완료(짙음) 한 쌍은 자동으로 만듭니다.
//  - 미완료: 검은 글씨가 잘 보일 만큼 밝게 (기준색이 이미 밝으면 그대로)
//  - 완료: 흰 글씨가 잘 보일 만큼 진하게 (기준색이 이미 진하면 그대로)
// 결과 형식은 c: [[이름, 미완료색, 완료색], ...]

const RAINBOW = ['빨강', '주황', '노랑', '초록', '파랑', '남색', '보라', '분홍', '청록', '모카'];

const THEME_SOURCES = [
  // 영화 장면 사진의 분위기(대표 색 계열)는 살리고, 같은 계열 안에서 밝기 · 색감을 벌려 겹치지 않게
  { id: 'mv-enola', group: 'movie', name: '에놀라 홈즈', names: ['들판 골드', '이끼 올리브', '청록 숲', '벽돌 레드', '테라코타', '티 로즈', '다크 브라운', '로즈 리넨', '세이지 그레이', '흐린 하늘'], base: ['#C9A447', '#6E7A3A', '#3E6A50', '#9E4434', '#C4743E', '#B8807C', '#4A3424', '#E3C9B8', '#8E9A88', '#8AA4B8'] },
  { id: 'mv-bigfish', group: 'movie', name: '빅 피쉬', names: ['수선화', '잎 그린', '세이지', '서커스 코랄', '네이비 수트', '바이올렛', '웜 실버', '하늘', '빨간 머리', '넥타이 레드'], base: ['#E2C238', '#5E8E34', '#9AAE84', '#E0887A', '#2E3866', '#9A88C8', '#B8B0A8', '#8EC0DE', '#D8904A', '#8E2E34'] },
  { id: 'mv-midnight', group: 'movie', name: '미드나잇 인 파리', names: ['보랏빛 밤', '블루', '라벤더 하늘', '민트 크림', '가로등 옐로', '살구', '레드', '와인 브라운', '젖은 돌', '센강 틸'], base: ['#2A2A4E', '#3E5E9A', '#B4B0E0', '#CFE4D6', '#F0BC4A', '#E39A68', '#C2443A', '#6A2A2E', '#8A8E96', '#3E7E86'] },
  { id: 'mv-potter', group: 'movie', name: '해리포터', names: ['차콜 그레이', '딥 버건디', '그리핀도르 레드', '버니시드 골드', '촛불 앰버', '다크 틸', '슬리데린 그린', '양피지', '플럼', '석벽 그레이'], base: ['#30373E', '#7A2038', '#B03A36', '#C49B4C', '#DC7A34', '#0A5458', '#2E5A3E', '#E2D0C0', '#5E4A6E', '#8A8680'] },
  { id: 'mv-spirited', group: 'movie', name: '센과 치히로', names: ['차콜', '핑크', '틸', '다크 와인', '등불 오렌지', '머스타드', '그린', '라벤더', '분홍 피치', '연올리브'], base: ['#2E2A2A', '#E04A6A', '#0E4E66', '#4E2A34', '#E8804A', '#E0A83A', '#6CB04E', '#9A82A6', '#EEB4B4', '#B8BA80'] },
  { id: 'mv-cmbyn', group: 'movie', name: '콜 미 바이 유어 네임', names: ['수영장 블루', '딥 틸', '아쿠아', '민트', '올리브 세이지', '올리브', '살구', '레몬', '토프', '하늘 화이트'], base: ['#2F6FB6', '#1E4A50', '#6EB4C0', '#8ECFA8', '#A8AE7A', '#6E7E3E', '#E8A070', '#E8D468', '#8A7466', '#DCE6EE'] },
  { id: 'mv-lalaland', group: 'movie', name: '라라랜드', names: ['바이올렛', '라일락 핑크', '모브 로즈', '피치 핑크', '하늘', '머스타드', '레드', '로열 블루', '다크 그린', '노을 오렌지'], base: ['#7E5EB8', '#D8B0D8', '#B86E8A', '#F0B8B8', '#A8C8E0', '#D4AE3A', '#B0322E', '#2A4C96', '#2E4A38', '#E88A3A'] },
  { id: 'mv-queens', group: 'movie', name: '퀸스 갬빗', names: ['레드', '체스 블랙', '브라운', '오렌지 탠', '바이올렛 모브', '크림', '틸 소파', '하늘빛 블루', '세이지', '올리브 머스타드'], base: ['#9E2E38', '#1E2228', '#8A5A40', '#D07A42', '#8A6A98', '#E6DAC0', '#2E6870', '#6E9EC0', '#8E9E84', '#B0A040'] },
  { id: 'mv-dune', group: 'movie', name: '듄', names: ['스파이스 오렌지', '모래', '녹빛 레드', '다크 퍼플 브라운', '웜 그레이', '청록 하늘', '라벤더', '웜 차콜', '프레멘 블루', '사막 장미'], base: ['#C8743A', '#DDBB8E', '#B04A30', '#4A2E3E', '#9A9290', '#A0CCD8', '#A890B8', '#4A3E3C', '#3E6AA8', '#B87A84'] },
  { id: 'mv-bridgerton', group: 'movie', name: '브리저튼', names: ['파우더 블루', '틸 블루', '로즈', '피치', '라벤더', '플럼', '앤티크 골드', '세이지', '크림 옐로', '브라운'], base: ['#94B2D4', '#3E7E9E', '#D49098', '#EDB89A', '#B898D0', '#6A3E5E', '#B89040', '#9AB49A', '#EEE2B8', '#6A5440'] },
  { id: 'mv-coraline', group: 'movie', name: '코렐라인', names: ['파란 머리', '보랏빛 밤', '녹청', '하늘', '우비 옐로', '오커', '와인', '코랄 체리', '피치', '숲 그린'], base: ['#1E4E8E', '#2A2440', '#5E7A74', '#7EA8C8', '#D8B83A', '#A87A34', '#6E3240', '#D0504A', '#E0BFA4', '#4E7A4A'] },
  { id: 'mv-wicked', group: 'movie', name: '위키드', names: ['블러시', '글린다 핑크', '마젠타', '라벤더', '엘파바 그린', '라임', '에메랄드', '금빛', '하늘', '차콜'], base: ['#EDCFC8', '#E496B0', '#C03A7A', '#B4A0D4', '#5E8A3A', '#B0C860', '#2E6A4A', '#C8A040', '#A8C8E0', '#3E3E44'] },

  // 도시 분위기
  { id: 'ct-london', group: 'city', name: '런던', names: ['공중전화 레드', '담쟁이 다홍', '플럼 버건디', '카멜', '돌담 베이지', '스틸 블루', '템스 하늘', '가로등 블랙', '공원 그린', '템스 틸'], base: ['#D2303A', '#D8603E', '#5E1E3E', '#B88A5A', '#D4C8B0', '#5E7E9E', '#9CB8D0', '#3A3230', '#4E7A4E', '#3E6E78'] },
  { id: 'ct-paris', group: 'city', name: '파리', names: ['오스만 크림', '아연 지붕', '세느 블루', '마카롱 핑크', '라벤더', '테라스 다홍', '크루아상', '마로니에 그린', '밤의 네이비', '자두'], base: ['#E8DCC4', '#9A9692', '#4E6E8E', '#E8A8B4', '#A898C4', '#C8503E', '#D08A3A', '#5E7A4E', '#1E2A44', '#5A2250'] },
  { id: 'ct-rome', group: 'city', name: '로마', names: ['테라코타', '오커', '레몬', '트래버틴', '사이프러스', '올리브', '바티칸 블루', '피스타치오', '키안티 레드', '노을 로즈'], base: ['#C0623E', '#C98E36', '#EAD860', '#DCD0B4', '#3E5E3E', '#8A8A4E', '#3A5A9A', '#9ECBA0', '#7E2236', '#E09A9A'] },
  { id: 'ct-newyork', group: 'city', name: '뉴욕', names: ['옐로 캡', '브라운스톤', '벽돌 다홍', '브로드웨이 레드', '센트럴파크', '허드슨 블루', '스틸 그레이', '자유의 여신', '미드나잇', '콘크리트'], base: ['#F2C230', '#5A3A3E', '#B8553A', '#C8283A', '#4E7A44', '#3E5E80', '#8E949C', '#7EB8A4', '#222030', '#C8C4BA'] },
  { id: 'ct-la', group: 'city', name: 'LA', names: ['선셋 오렌지', '핑크 노을', '야자수', '퍼시픽 블루', '청록 하늘', '할리우드 골드', '데저트 세이지', '부겐빌레아', '라벤더 하늘', '밤바다'], base: ['#F08A4E', '#F2A0A8', '#4E8A5A', '#2E7EB0', '#8ED0D8', '#E2B84A', '#A8B898', '#C83E7A', '#B4A6D8', '#1E3A5A'] },
  { id: 'ct-florence', group: 'city', name: '피렌체', names: ['두오모 테라코타', '석양 오렌지', '투스칸 옐로', '대리석 크림', '두오모 그린', '사이프러스', '아르노 강', '와인', '로즈 마블', '다크 올리브 브라운'], base: ['#B85A3A', '#E8904A', '#E0BC52', '#E8E0CE', '#3E7A5A', '#3E4A2E', '#7E9EA0', '#742838', '#DCA4A0', '#5A4A2A'] },
  { id: 'ct-tokyo', group: 'city', name: '도쿄', names: ['벚꽃', '도리이 레드', '네온 핑크', '말차', '인디고', '네온 시안', '후지 블루', '유자', '콘크리트', '등나무'], base: ['#F2BCC8', '#D0402E', '#E2508E', '#8EAA5A', '#2E3E6E', '#3EB0C8', '#6E8EB8', '#F0CC4A', '#A8A8A8', '#A88EC8'] },
  { id: 'ct-berlin', group: 'city', name: '베를린', names: ['콘크리트', '그래피티 옐로', '그래피티 핑크', '장벽 블루', '테크노 블랙', '티어가르텐', '벽돌', '샌드스톤', '페트롤', '녹슨 철'], base: ['#8E8E8C', '#F0C834', '#E25A8A', '#3E6EA8', '#1E1E22', '#5A7A4A', '#A8503E', '#D6C29A', '#2E5E66', '#8A5A2E'] },
  { id: 'ct-sydney', group: 'city', name: '시드니', names: ['하버 블루', '오페라하우스', '본다이 아쿠아', '샌드', '유칼립투스', '자카란다', '핑크 산호', '선샤인', '레드 센터', '밤바다'], base: ['#1E6EA8', '#F0EEE6', '#5EC4C8', '#E8CFA0', '#8AAE9A', '#9E86D0', '#F09098', '#F2C84E', '#B8502E', '#2A2A5A'] },
  { id: 'ct-seoul', group: 'city', name: '서울', names: ['단청 레드', '단청 그린', '한강 블루', '남산 그레이', '벚꽃', '은행잎', '진분홍', '쪽빛', '기와 차콜', '백자'], base: ['#B83A30', '#3E8A6A', '#4E7EAE', '#9A9EA6', '#F2C4CC', '#EDC23E', '#D0507E', '#2A3E6E', '#3E3A36', '#EEEAE0'] },

  // 여행지 · 영화 · 문구점에서 골라 담은 추천 조합
  { id: 'pk-santorini', group: 'pick', name: '산토리니', names: ['에게해 블루', '레몬', '부겐빌레아', '올리브', '하늘', '테라코타', '라벤더', '모래', '보랏빛 바다', '화이트 워시'], base: ['#1F5FA8', '#E8C547', '#C2417A', '#7C8A4E', '#9CCBEA', '#C0643E', '#9C8CC4', '#D8B888', '#2E2E6A', '#DDE4E8'] },
  { id: 'pk-kyoto', group: 'pick', name: '교토의 가을', names: ['단풍 레드', '은행 옐로', '말차', '쪽빛', '감 오렌지', '등나무', '기와 그레이', '연분홍', '청록 이끼', '나무 브라운'], base: ['#B83A2E', '#E2B33C', '#7E9A4E', '#2E4A72', '#E07E3C', '#8E78B0', '#6E7076', '#E8A8B0', '#3E6A5A', '#6E4A3A'] },
  { id: 'pk-aurora', group: 'pick', name: '아이슬란드 오로라', names: ['오로라 그린', '밤하늘', '핑크 오로라', '빙하 블루', '퍼플', '이끼', '노을', '온천 아쿠아', '화산석', '라벤더 눈'], base: ['#3EBF8E', '#1E2A4E', '#D46EA8', '#8EC8DE', '#7A5EB4', '#8AA05A', '#E89A6E', '#5EC4C0', '#4A4A50', '#E0DCEC'] },
  { id: 'pk-marrakech', group: 'pick', name: '마라케시', names: ['마조렐 블루', '사프란', '민트티', '장미 핑크', '테라코타', '타일 청록', '장밋빛 모래', '향신료 진홍', '대추 브라운', '하늘'], base: ['#2E4FB0', '#E8A23A', '#7EB89A', '#E094B0', '#B85A36', '#1E7E86', '#DCAE96', '#9E2238', '#5A3A20', '#9CC0DE'] },
  { id: 'pk-budapest', group: 'pick', name: '그랜드 부다페스트 호텔', names: ['멘들스 핑크', '벨보이 퍼플', '머스타드', '스노우 블루', '엘리베이터 레드', '민트', '라일락', '초콜릿', '청록', '피스타치오'], base: ['#E8A0B0', '#5E3A6E', '#D8A83E', '#A8C4DE', '#B8323E', '#8EC4B0', '#C4B4DC', '#5A3A2E', '#4E9AA8', '#C8D4A8'] },
  { id: 'pk-jeju', group: 'pick', name: '제주', names: ['감귤', '제주 바다', '동백', '유채꽃', '오름 그린', '수국', '현무암', '민트 하늘', '해녀 남색', '모래'], base: ['#F08A2E', '#2E8AB0', '#C0323E', '#EAC83E', '#6E9A4E', '#8E86C8', '#4A4A4E', '#8ED0C8', '#2E3A6E', '#DCCBA8'] },
  { id: 'pk-forest', group: 'pick', name: '리틀 포레스트', names: ['토마토', '들깨 그린', '호박', '겨울 하늘', '고구마 퍼플', '꽃분홍', '밤 브라운', '논 초록', '밤하늘', '막걸리 크림'], base: ['#D04A3A', '#6E8A4A', '#E2963E', '#9AB4C8', '#8A5E86', '#E4A0A8', '#6E4630', '#C4C460', '#2E3A52', '#E2D8BE'] },
  { id: 'pk-provence', group: 'pick', name: '프로방스', names: ['라벤더', '해바라기', '지중해 블루', '로즈', '올리브', '테라코타', '시냇물', '포도 와인', '세이지', '석회암'], base: ['#9A84C8', '#EAC23E', '#3A72B0', '#D88A9A', '#7A8A4A', '#C2683E', '#6EB0B8', '#6E2A44', '#A8B8A0', '#D6C6A8'] },
  { id: 'pk-nordic', group: 'pick', name: '노르딕', names: ['피오르 블루', '링곤베리', '버터', '숲', '오로라 민트', '모브', '라이트 우드', '블루베리', '안개', '차콜'], base: ['#3E6E96', '#B8324A', '#EAD08A', '#3E5E4A', '#8ECDB8', '#A88AA8', '#C8A07A', '#4A4A8A', '#B8C2C8', '#3E4048'] },
  { id: 'pk-stationery', group: 'pick', name: '문구점', names: ['형광 핑크', '레몬', '민트', '하늘', '라벤더', '피치', '그린', '코랄', '네이비 펜', '연필 그레이'], base: ['#F08AA8', '#F2D45A', '#7ED0B8', '#84B8EA', '#B49ADE', '#F4A882', '#8CC46A', '#F07A6A', '#2E3E7A', '#8A8A8E'] },

  // 빨주노초파남보 + 분홍 (+ 청록 · 모카): 같은 무지개를 톤만 다르게
  { id: 'rb-pastel', group: 'rainbow', name: '파스텔', base: ['#F5A9A9', '#F9C99B', '#F7E08E', '#BCE2A8', '#A9D3F0', '#AEB9EC', '#CDB6EC', '#F5B9D6', '#A8DED8', '#D8C8B8'] },
  { id: 'rb-vivid', group: 'rainbow', name: '원색', base: ['#E8443A', '#F28C28', '#F5C518', '#3DAA4E', '#1E90E0', '#3949AB', '#8E44AD', '#EC4F98', '#12A89A', '#8D5A3B'] },
  { id: 'rb-vintage', group: 'rainbow', name: '빈티지', base: ['#B5534A', '#C97B45', '#D2A63E', '#7F9455', '#4F8A9C', '#4A5D86', '#7A5C88', '#C07F8E', '#3F7A70', '#8A6A50'] },
  { id: 'rb-muted', group: 'rainbow', name: '톤다운', base: ['#C98A86', '#D3A27F', '#D6C184', '#9AAE8A', '#88A8B8', '#8790B4', '#A592B2', '#D0A0B2', '#8DB5AE', '#B3A497'] },
  { id: 'rb-water', group: 'rainbow', name: '수채화', base: ['#EE7A74', '#F4AA64', '#F3D46E', '#8FCF86', '#6DBCE0', '#768FD2', '#A886CF', '#F095BD', '#6CCFC4', '#C69C7E'] },
  { id: 'rb-jewel', group: 'rainbow', name: '주얼톤', base: ['#A51E36', '#C55A1E', '#C99A1E', '#2E7D4F', '#1F639E', '#2E3584', '#5E2E85', '#A6336E', '#0F6E6A', '#6B3E26'] },

  // 여러 색이 섞인 조합
  { id: 'mx-blush', group: 'mix', name: '블러시 가든', names: ['블러시', '로즈우드', '세이지', '미스티 스카이', '딥 틸', '바닐라', '더스티 피치', '라벤더', '라떼', '더스크'], base: ['#F7C8D3', '#B46A72', '#A8B58A', '#A8B7C6', '#1E4A4E', '#F3E3C3', '#D9A08E', '#B0A0D0', '#C9A68A', '#7A6E8E'] },
  { id: 'mx-butter', group: 'mix', name: '버터 & 버건디', names: ['버터밀크', '파스텔 블루', '올드 버건디', '세이지', '블러시', '카라멜', '네이비', '라벤더', '테라코타', '올리브'], base: ['#FFF1B5', '#C1DBE8', '#6B2E33', '#A8B58A', '#EDBFC0', '#C08552', '#3A4A6B', '#C3B5D9', '#C46A4A', '#8C8A5A'] },
  { id: 'mx-retro', group: 'mix', name: '레트로 팝', names: ['오텀 라벤더', '라임에이드', '토마토 잼', '퓨어 선', '모네 연못', '버블검', '스카이', '틸', '체리', '크림'], base: ['#D1CAEA', '#D6D35F', '#C45F3F', '#F4D242', '#898E46', '#F29CC3', '#80B0E8', '#008471', '#B23A48', '#EFE3C2'] },
  { id: 'mx-baby', group: 'mix', name: '베이비 팝', names: ['베이비 라벤더', '블루 스카이', '수선화', '나이트', '피치', '양귀비', '푸크시아', '풀장', '세이지', '모카'], base: ['#DBC0E8', '#A3C1E2', '#F7E289', '#252D45', '#FBB28B', '#F76F54', '#EA5E8B', '#47B5A8', '#9FA88E', '#A47A5E'] },
  { id: 'mx-spring', group: 'mix', name: '봄 정원', names: ['라일락 그레이', '새잎', '굿 서프', '골드 벨벳', '핑크', '파피', '버터 옐로', '완두꽃', '라벤더', '민트'], base: ['#D3C2CD', '#849E15', '#92A2A8', '#B28622', '#F3B3BD', '#D8560E', '#F4DA7A', '#5B6FB8', '#B7A6D6', '#9ED3C0'] },
  { id: 'mx-pantone', group: 'mix', name: '클래식', names: ['트랜스패런트 옐로', '셉터 레드', '세룰리안', '포팅 소일', '샴브레이', '에스프레소', '글레이셔', '세이지', '포레스트', '코랄'], base: ['#F5EFC6', '#8C1D24', '#A5BCDE', '#7A5446', '#79A3C3', '#3A2119', '#D2E2EC', '#9EA98A', '#3E5E45', '#E0806A'] },
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
    base: list.map((x) => x.hex.toUpperCase()),
    c: list.map((x, i) => [x.name || '색 ' + (i + 1), ...makePair(x.hex.toUpperCase())]),
  };
}

// 캘린더 스타일: 배경 · 선 · 색감 (글씨체는 FONTS에서 따로 선택)
export const STYLES = [
  { id: 'simple', name: '심플', desc: '여백 많은 깔끔한 화이트', ink: '#26241F', sub: '#8A867E', line: '#E6E3DD', outer: '1px solid #DAD6CF', cellBg: '#FFFFFF', headBg: '#FAF9F7', radius: 12, sun: '#D2493F', sat: '#3F78C2', todayBg: '#FFF8E6', todayBadge: '#26241F', todayFg: '#FFFFFF' },
  { id: 'hand', name: '손글씨', desc: '줄노트 배경 + 진한 펜 테두리', ink: '#2B2A33', sub: '#7D7A86', line: '#D9D1C0', outer: '1.5px solid #3B3A44', cellBg: 'rgba(255,253,246,0.6)', headBg: 'transparent', radius: 0, sun: '#D2493F', sat: '#3F78C2', todayBg: 'rgba(255,236,150,0.45)', todayBadge: '#2B2A33', todayFg: '#FFFFFF' },
  { id: 'grid', name: '그리드', desc: '모눈종이 다이어리', ink: '#2F2B27', sub: '#6F6A62', line: '#CFCBC4', outer: '1px solid #CFCBC4', cellBg: 'rgba(255,255,255,0.55)', headBg: 'transparent', radius: 0, sun: '#D2493F', sat: '#3F78C2', todayBg: 'rgba(255,248,220,0.7)', todayBadge: '#2F2B27', todayFg: '#FFFFFF' },
  { id: 'vintage', name: '빈티지 페이퍼', desc: '크라프트지 + 이중 테두리', ink: '#4A3B2A', sub: '#8A7558', line: '#CDBFA6', outer: '3px double #A8957A', cellBg: 'rgba(251,246,236,0.5)', headBg: 'rgba(168,149,122,0.12)', radius: 0, sun: '#A8432F', sat: '#3E5F80', todayBg: 'rgba(214,180,120,0.25)', todayBadge: '#4A3B2A', todayFg: '#FBF6EC' },
  { id: 'night', name: '나이트', desc: '밤에 보기 편한 어두운 화면', dark: true, ink: '#ECE8DF', sub: '#9AA0B0', line: '#3A4052', outer: '1px solid #454B5F', cellBg: 'rgba(255,255,255,0.03)', headBg: 'rgba(255,255,255,0.04)', radius: 12, sun: '#FF8A80', sat: '#8AB4FF', todayBg: 'rgba(255,255,255,0.08)', todayBadge: '#ECE8DF', todayFg: '#1E2230' },
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
