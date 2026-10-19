// 테마 · 스타일 · 글씨체 · 공휴일 데이터

// 과목 색상 테마
// 테마마다 기준색 10개(과목 순서대로 배정)만 정하고, 미완료(연함) · 완료(짙음) 한 쌍은 자동으로 만듭니다.
//  - 미완료: 검은 글씨가 잘 보일 만큼 밝게 (기준색이 이미 밝으면 그대로)
//  - 완료: 흰 글씨가 잘 보일 만큼 진하게 (기준색이 이미 진하면 그대로)
// 결과 형식은 c: [[이름, 미완료색, 완료색], ...]

const RAINBOW = ['빨강', '주황', '노랑', '초록', '파랑', '남색', '보라', '분홍', '청록', '모카'];

const THEME_SOURCES = [
  // 영화 장면에서 뽑은 색감 (이웃한 과목끼리 잘 구분되도록 순서를 섞음)
  { id: 'mv-lalaland', group: 'movie', name: '라라랜드', desc: '보랏빛 밤하늘 · 노란 드레스 · 재즈 바', names: ['인디고 나이트', '미아 옐로', '로즈', '블루 아워', '레드 드레스', '라일락', '더스티 피치', '딥 틸', '안개', '밤하늘'], base: ['#2E3F7F', '#E3C04A', '#B66A73', '#4C6FB0', '#A8211F', '#7F86C0', '#C99A8E', '#1F3B4D', '#D8E0EA', '#0D1B2A'] },
  { id: 'mv-cmbyn', group: 'movie', name: '콜 미 바이 유어 네임', desc: '이탈리아 여름 · 수영장 · 살구', names: ['수영장 블루', '민트', '살구', '틸', '리넨', '올리브', '그레이 블루', '흙', '세이지', '크림'], base: ['#2F6FB6', '#A7D3A0', '#C47A5A', '#4E9393', '#D8C7A3', '#7A8F5E', '#A5B5B5', '#5B5145', '#8FBFA5', '#E8DCC0'] },
  { id: 'mv-joker', group: 'movie', name: '조커', desc: '계단 위 오렌지 수트 · 고담의 청록', names: ['계단 오렌지', '틸', '수트 레드', '안개 민트', '올리브 브라운', '머스타드', '청록', '회갈', '딥 틸', '그림자'], base: ['#C66B2A', '#2D4F52', '#8A3A2E', '#A9B7B0', '#4B4436', '#D6B24C', '#3F6B6A', '#5E5E52', '#1E3A40', '#0E1A24'] },
  { id: 'mv-enola', group: 'movie', name: '에놀라 홈즈', desc: '빅토리아 시대 숲 · 벽돌 · 가죽', names: ['벽돌', '골드', '올리브', '베이지', '다크 우드', '카멜', '모스', '스톤', '토피', '숲'], base: ['#8B3E2F', '#C9B26A', '#545021', '#D5B892', '#2A231A', '#B4875E', '#7A7330', '#9A9A93', '#8C6A3F', '#3A3A1E'] },
  { id: 'mv-spirited', group: 'movie', name: '센과 치히로', desc: '노을 진 바다 위를 달리는 열차', names: ['저녁 바다', '노을 금', '열차 와인', '코랄', '보랏빛 밤', '분홍 구름', '로즈', '라벤더', '앰버', '러스트'], base: ['#5F6E8E', '#EEB06A', '#7B3B3B', '#E07B6E', '#4A3E5E', '#F2D6C2', '#C2575A', '#6E5A82', '#D99A4E', '#9E4F30'] },
  { id: 'mv-coraline', group: 'movie', name: '코렐라인', desc: '파란 머리 · 비밀의 정원', names: ['블루', '레몬', '체리', '안개', '보라', '이끼', '하늘', '머스타드', '밤', '틸'], base: ['#1D4C6B', '#D9C24E', '#8E3B4A', '#8AA7A8', '#4A3B5E', '#6E7A3A', '#2D6E8A', '#C3B26A', '#10283E', '#4E8395'] },
  { id: 'mv-dune', group: 'movie', name: '듄', desc: '사막 · 스파이스 · 강철', names: ['스파이스', '스틸', '모래', '적갈', '사막 베이지', '러스트', '바위', '오렌지', '아이보리', '그림자'], base: ['#C0632E', '#3E4C59', '#E9B07A', '#5C2412', '#B79C7E', '#8E3E1E', '#6F6A6B', '#D9894A', '#E6D3BA', '#2B1A14'] },
  { id: 'mv-twilight', group: 'movie', name: '트와일라잇', desc: '비 오는 침엽수 숲 · 빨간 사과', names: ['숲 초록', '비 오는 하늘', '사과 레드', '이끼 안개', '블루 그레이', '전나무', '안개', '모스', '세이지', '밤숲'], base: ['#44605A', '#6E7C99', '#8E3B3F', '#9DB4AE', '#3B4A6B', '#2E4240', '#C9D6D2', '#4F5B3B', '#6A8A82', '#1B2B2B'] },
  { id: 'mv-potter', group: 'movie', name: '해리포터', desc: '기숙사 문장 · 양피지 · 호그와트 석벽', names: ['그리핀도르 레드', '슬리데린 그린', '래번클로 블루', '후플푸프 옐로', '마법 보라', '브론즈', '실버', '양피지', '석벽', '골드'], base: ['#740001', '#1A472A', '#0E1A40', '#ECB939', '#5D3F6A', '#946B2D', '#9EA3A8', '#E8D9B5', '#6E6A63', '#D3A625'] },
  { id: 'mv-midnight', group: 'movie', name: '미드나잇 인 파리', desc: '비 오는 밤 · 가로등 · 카페', names: ['밤의 블루', '가로등 골드', '와인', '세느 틸', '앤티크 로즈', '라벤더', '카페 브라운', '압생트', '비 오는 회색', '샴페인'], base: ['#1F2F5A', '#E0B04A', '#7A2335', '#3E7C82', '#C98C8C', '#9A8BB8', '#6B4A36', '#8DA35A', '#8C8F99', '#EAD9B0'] },
  { id: 'mv-bigfish', group: 'movie', name: '빅 피쉬', desc: '수선화 들판 · 강 · 서커스', names: ['수선화', '강물 블루', '서커스 레드', '풀밭', '라일락', '오렌지', '하늘', '스펙터 숲', '은빛 물고기', '빨간 머리'], base: ['#F2C53D', '#3F7EA6', '#B33A3A', '#6A9A4A', '#A99BC4', '#E08A3C', '#9CC6DE', '#2F4A3A', '#B8C2C4', '#A8522E'] },
  { id: 'mv-toystory', group: 'movie', name: '토이 스토리', desc: '우디 · 버즈 · 구름 벽지', names: ['우디 옐로', '우디 레드', '구름 하늘', '버즈 그린', '버즈 퍼플', '햄 핑크', '슬링키 브라운', '에일리언 민트', '피자 플래닛 블루', '라이트이어 오렌지'], base: ['#F2C12E', '#C0392B', '#6FB6E6', '#6BB33A', '#6E4C9E', '#F2A0B0', '#A8743E', '#8FD3C3', '#2E5FA8', '#F28C28'] },
  { id: 'mv-stranger', group: 'movie', name: '기묘한 이야기', desc: '80년대 네온 · 크리스마스 전구 · 뒤집힌 세계', names: ['타이틀 레드', '뒤집힌 세계', '전구 옐로', '80s 틸', '네온 퍼플', '일레븐 핑크', '와플 브라운', '밤의 숲', '호킨스 올리브', '안개 회색'], base: ['#C4161C', '#2B3A5C', '#E8B830', '#2E8C8A', '#6B3E8E', '#E79AAE', '#B07A3A', '#2F3E2E', '#7E8A4A', '#8A93A0'] },
  { id: 'mv-bridgerton', group: 'movie', name: '브리저튼', desc: '리젠시 시대 무도회 · 파우더 블루 · 로즈', names: ['파우더 블루', '로즈', '라벤더', '세이지', '샴페인 골드', '피치', '웨지우드 블루', '모브', '페더링턴 옐로', '아이보리'], base: ['#A9C4E0', '#E8AFC0', '#B9A6D8', '#A9C2A0', '#D9BE7A', '#F2B99A', '#4F78A8', '#9E6E8E', '#E8D35A', '#EFE6D2'] },
  { id: 'mv-howl', group: 'movie', name: '하울의 움직이는 성', desc: '파란 하늘 · 꽃밭 · 캘시퍼', names: ['하늘 블루', '캘시퍼 오렌지', '들판 그린', '꽃밭 핑크', '소피 블루', '하울 금발', '라벤더', '성 브라운', '청록 귀걸이', '구름'], base: ['#6FA8D6', '#E8742E', '#7FA650', '#E99AAE', '#3E5C8A', '#E2C25A', '#9D8EC4', '#7A5A44', '#3E8E86', '#D8E3EC'] },

  // 빨주노초파남보 + 분홍 (+ 청록 · 모카): 같은 무지개를 톤만 다르게
  { id: 'rb-pastel', group: 'rainbow', name: '파스텔', desc: '부드러운 파스텔 무지개', base: ['#F5A9A9', '#F9C99B', '#F7E08E', '#BCE2A8', '#A9D3F0', '#AEB9EC', '#CDB6EC', '#F5B9D6', '#A8DED8', '#D8C8B8'] },
  { id: 'rb-vivid', group: 'rainbow', name: '원색', desc: '쨍한 원색 무지개', base: ['#E8443A', '#F28C28', '#F5C518', '#3DAA4E', '#1E90E0', '#3949AB', '#8E44AD', '#EC4F98', '#12A89A', '#8D5A3B'] },
  { id: 'rb-vintage', group: 'rainbow', name: '빈티지', desc: '바랜 종이 느낌 무지개', base: ['#B5534A', '#C97B45', '#D2A63E', '#7F9455', '#4F8A9C', '#4A5D86', '#7A5C88', '#C07F8E', '#3F7A70', '#8A6A50'] },
  { id: 'rb-muted', group: 'rainbow', name: '톤다운', desc: '차분하게 가라앉은 무지개', base: ['#C98A86', '#D3A27F', '#D6C184', '#9AAE8A', '#88A8B8', '#8790B4', '#A592B2', '#D0A0B2', '#8DB5AE', '#B3A497'] },
  { id: 'rb-water', group: 'rainbow', name: '수채화', desc: '맑게 번진 물감 무지개', base: ['#EE7A74', '#F4AA64', '#F3D46E', '#8FCF86', '#6DBCE0', '#768FD2', '#A886CF', '#F095BD', '#6CCFC4', '#C69C7E'] },
  { id: 'rb-jewel', group: 'rainbow', name: '주얼톤', desc: '보석처럼 깊은 무지개', base: ['#A51E36', '#C55A1E', '#C99A1E', '#2E7D4F', '#1F639E', '#2E3584', '#5E2E85', '#A6336E', '#0F6E6A', '#6B3E26'] },

  // 여러 색이 섞인 조합
  { id: 'mx-blush', group: 'mix', name: '블러시 가든', desc: '블러시 · 로즈우드 · 세이지', names: ['블러시', '로즈우드', '세이지', '미스티 스카이', '미드나잇', '바닐라', '더스티 로즈', '모스', '라떼', '더스크'], base: ['#F7C8D3', '#B46A72', '#A8B58A', '#A8B7C6', '#2D3A47', '#F3E3C3', '#D9A5A0', '#6E7F5A', '#C9A68A', '#7A6E8E'] },
  { id: 'mx-butter', group: 'mix', name: '버터 & 버건디', desc: '버터밀크 · 파스텔 블루 · 버건디', names: ['버터밀크', '파스텔 블루', '올드 버건디', '세이지', '블러시', '카라멜', '네이비', '라벤더', '테라코타', '올리브'], base: ['#FFF1B5', '#C1DBE8', '#6B2E33', '#A8B58A', '#EDBFC0', '#C08552', '#3A4A6B', '#C3B5D9', '#C46A4A', '#8C8A5A'] },
  { id: 'mx-paris', group: 'mix', name: '파리 2026', desc: '오렌지 · 쿨 블루 · 카시스', names: ['오렌지 토파즈', '쿨 블루', '베르 소주', '카시스', '라임', '머스타드', '테라코타', '라일락', '네이비', '샌드'], base: ['#F47C3C', '#BFD8F5', '#AEB8A0', '#5A2C45', '#DCE85A', '#D9A93B', '#C2603F', '#B9A6D3', '#2E3B5E', '#D9C3A0'] },
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
const DEEP_MAX = 0.15; // 완료: 이 이하로 진해야 흰 글씨가 또렷함

// 기준색의 색상(hue)은 그대로 두고 밝기만 조절해서 [미완료색, 완료색]을 만듦
export function makePair(hex) {
  const [h, s, l] = hexToHsl(hex);
  let light = hex;
  if (luminance(hex) < LIGHT_MIN) {
    const ls = Math.min(s, 0.7); // 너무 형광처럼 보이지 않게
    for (let x = Math.max(l, 0.5); x <= 0.97; x += 0.01) {
      light = hslToHex(h, ls, x);
      if (luminance(light) >= LIGHT_MIN) break;
    }
  }
  let deep = hex;
  if (luminance(hex) > DEEP_MAX) {
    const ds = Math.min(s, 0.5); // 파스텔이 진해질 때 쨍해지지 않게
    for (let x = Math.min(l, 0.5); x >= 0.05; x -= 0.01) {
      deep = hslToHex(h, ds, x);
      if (luminance(deep) <= DEEP_MAX) break;
    }
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
  { id: 'rainbow', name: '레인보우', desc: '빨주노초파남보 + 분홍 순서' },
  { id: 'mix', name: '컬러 믹스', desc: '여러 색을 조화롭게 섞은 조합' },
];

export const THEMES = THEME_SOURCES.map((t) => ({
  id: t.id,
  group: t.group,
  name: t.name,
  desc: t.desc,
  base: t.base.slice(),
  c: t.base.map((hex, i) => [(t.names || RAINBOW)[i], ...makePair(hex)]),
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
  { id: 'night', name: '나이트', desc: '밤 공부용 어두운 화면', dark: true, ink: '#ECE8DF', sub: '#9AA0B0', line: '#3A4052', outer: '1px solid #454B5F', cellBg: 'rgba(255,255,255,0.03)', headBg: 'rgba(255,255,255,0.04)', radius: 12, sun: '#FF8A80', sat: '#8AB4FF', circle: 0.35, todayBg: 'rgba(255,255,255,0.08)', todayBadge: '#ECE8DF', todayFg: '#1E2230' },
];

// 글씨체: scale = 글자 크기 보정 (손글씨 글꼴은 작아 보여서 키움)
export const FONTS = [
  { id: 'myeongjo', name: '나눔명조', desc: '기본 · 단정한 명조체', family: "'Nanum Myeongjo', serif", scale: 1, chip: 11.5 },
  { id: 'batang', name: '고운바탕', desc: '부드러운 명조체', family: "'Gowun Batang', serif", scale: 1, chip: 11.5 },
  { id: 'dodum', name: '고운돋움', desc: '깔끔한 고딕체', family: "'Gowun Dodum', sans-serif", scale: 1, chip: 11.5 },
  { id: 'gaegu', name: '개구', desc: '동글동글 손글씨', family: "'Gaegu', cursive", scale: 1.15, chip: 12.5 },
  { id: 'pen', name: '나눔펜', desc: '다이어리 펜 손글씨', family: "'Nanum Pen Script', cursive", scale: 1.3, chip: 14 },
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
