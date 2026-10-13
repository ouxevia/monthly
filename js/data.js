// 테마 · 스타일 · 글씨체 · 공휴일 데이터

// 과목 색상 테마
// 테마마다 기준색 8개(과목 순서대로 배정)만 정하고, 미완료(연함) · 완료(짙음) 한 쌍은 자동으로 만듭니다.
//  - 밝은 기준색: 미완료 = 기준색, 완료 = 같은 색 계열에서 더 짙게
//  - 어두운 기준색: 미완료 = 같은 색 계열에서 밝게, 완료 = 기준색
// 결과 형식은 c: [[이름, 미완료색, 완료색], ...]

const RAINBOW = ['빨강', '주황', '노랑', '초록', '파랑', '남색', '보라', '분홍'];

const THEME_SOURCES = [
  // 빨주노초파남보 + 분홍: 같은 무지개를 톤만 다르게
  { id: 'rb-pastel', group: 'rainbow', name: '파스텔', desc: '부드러운 파스텔 무지개', base: ['#F5A9A9', '#F9C99B', '#F7E08E', '#BCE2A8', '#A9D3F0', '#AEB9EC', '#CDB6EC', '#F5B9D6'] },
  { id: 'rb-vivid', group: 'rainbow', name: '원색', desc: '쨍한 원색 무지개', base: ['#E8443A', '#F28C28', '#F5C518', '#3DAA4E', '#1E90E0', '#3949AB', '#8E44AD', '#EC4F98'] },
  { id: 'rb-vintage', group: 'rainbow', name: '빈티지', desc: '바랜 종이 느낌 무지개', base: ['#B5534A', '#C97B45', '#D2A63E', '#7F9455', '#4F8A9C', '#4A5D86', '#7A5C88', '#C07F8E'] },
  { id: 'rb-muted', group: 'rainbow', name: '톤다운', desc: '차분하게 가라앉은 무지개', base: ['#C98A86', '#D3A27F', '#D6C184', '#9AAE8A', '#88A8B8', '#8790B4', '#A592B2', '#D0A0B2'] },
  { id: 'rb-water', group: 'rainbow', name: '수채화', desc: '맑게 번진 물감 무지개', base: ['#EE7A74', '#F4AA64', '#F3D46E', '#8FCF86', '#6DBCE0', '#768FD2', '#A886CF', '#F095BD'] },
  { id: 'rb-jewel', group: 'rainbow', name: '주얼톤', desc: '보석처럼 깊은 무지개', base: ['#A51E36', '#C55A1E', '#C99A1E', '#2E7D4F', '#1F639E', '#2E3584', '#5E2E85', '#A6336E'] },

  // 여러 색이 섞인 조합
  { id: 'mx-blush', group: 'mix', name: '블러시 가든', desc: '블러시 · 로즈우드 · 세이지', names: ['블러시', '로즈우드', '세이지', '미스티 스카이', '미드나잇', '바닐라', '더스티 로즈', '모스'], base: ['#F7C8D3', '#B46A72', '#A8B58A', '#A8B7C6', '#2D3A47', '#F3E3C3', '#D9A5A0', '#6E7F5A'] },
  { id: 'mx-butter', group: 'mix', name: '버터 & 버건디', desc: '버터밀크 · 파스텔 블루 · 버건디', names: ['버터밀크', '파스텔 블루', '올드 버건디', '세이지', '블러시', '카라멜', '네이비', '라벤더'], base: ['#FFF1B5', '#C1DBE8', '#6B2E33', '#A8B58A', '#EDBFC0', '#C08552', '#3A4A6B', '#C3B5D9'] },
  { id: 'mx-paris', group: 'mix', name: '파리 2026', desc: '오렌지 · 쿨 블루 · 카시스', names: ['오렌지 토파즈', '쿨 블루', '베르 소주', '카시스', '라임', '머스타드', '테라코타', '라일락'], base: ['#F47C3C', '#BFD8F5', '#AEB8A0', '#5A2C45', '#DCE85A', '#D9A93B', '#C2603F', '#B9A6D3'] },
  { id: 'mx-retro', group: 'mix', name: '레트로 팝', desc: '라벤더 · 라임에이드 · 토마토', names: ['오텀 라벤더', '라임에이드', '토마토 잼', '퓨어 선', '모네 연못', '버블검', '스카이', '틸'], base: ['#D1CAEA', '#D6D35F', '#C45F3F', '#F4D242', '#898E46', '#F29CC3', '#80B0E8', '#008471'] },
  { id: 'mx-baby', group: 'mix', name: '베이비 팝', desc: '라벤더 · 피치 · 풀장', names: ['베이비 라벤더', '블루 스카이', '수선화', '나이트', '피치', '양귀비', '푸크시아', '풀장'], base: ['#DBC0E8', '#A3C1E2', '#F7E289', '#252D45', '#FBB28B', '#F76F54', '#EA5E8B', '#47B5A8'] },
  { id: 'mx-spring', group: 'mix', name: '봄 정원', desc: '새잎 · 골드 · 핑크', names: ['라일락 그레이', '새잎', '굿 서프', '골드 벨벳', '핑크', '파피', '버터 옐로', '완두꽃'], base: ['#D3C2CD', '#849E15', '#92A2A8', '#B28622', '#F3B3BD', '#D8560E', '#F4DA7A', '#5B6FB8'] },
  { id: 'mx-pantone', group: 'mix', name: '클래식', desc: '옐로 · 레드 · 세룰리안 · 브라운', names: ['트랜스패런트 옐로', '셉터 레드', '세룰리안', '포팅 소일', '샴브레이', '에스프레소', '글레이셔', '세이지'], base: ['#F5EFC6', '#8C1D24', '#A5BCDE', '#7A5446', '#79A3C3', '#3A2119', '#D2E2EC', '#9EA98A'] },
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

export function makePair(hex) {
  const [h, s, l] = hexToHsl(hex);
  if (l < 0.4) return [hslToHex(h, Math.min(1, s * 0.75), 0.72), hex];
  if (l > 0.75) return [hex, hslToHex(h, Math.min(s, 0.55), 0.52)]; // 파스텔 → 차분한 중간 톤
  return [hex, hslToHex(h, s, Math.max(0.22, l - 0.2))];
}

// 배경색 위에서 읽기 좋은 글자색 (진한 글씨 또는 흰 글씨)
export function inkOn(hex) {
  const n = parseInt(String(hex).slice(1), 16);
  const lin = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); };
  const L = 0.2126 * lin((n >> 16) & 255) + 0.7152 * lin((n >> 8) & 255) + 0.0722 * lin(n & 255);
  return L > 0.36 ? '#2F2B27' : '#FFFFFF';
}

export const THEME_GROUPS = [
  { id: 'custom', name: '내 팔레트', desc: '직접 고른 색으로 만든 조합' },
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
