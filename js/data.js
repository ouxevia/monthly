// 테마 · 스타일 · 글씨체 · 공휴일 데이터

// 과목 색상 테마: 각 색은 [이름, 미완료(연함), 완료(짙음)]
export const THEMES = [
  { id: 'spring', name: '봄', desc: '벚꽃 · 새싹 · 개나리', c: [['벚꽃', '#F6CBD5', '#C9566F'], ['새싹', '#D5E8B5', '#5F8A2E'], ['개나리', '#F7E3A1', '#A8820F'], ['하늘', '#C8E1F4', '#3F7FB5'], ['라일락', '#DDD0EE', '#7E5BB0'], ['살구', '#F9D4BE', '#C0602F'], ['민트', '#C6EBDD', '#2B8565'], ['진달래', '#F1C4E4', '#A8418A']] },
  { id: 'summer', name: '여름', desc: '바다 · 수박 · 라임', c: [['바다', '#BFE3F2', '#1E7FAF'], ['수박', '#F8C6C6', '#C93A44'], ['라임', '#DDF0B0', '#5E8A12'], ['레몬', '#FBEEA6', '#A88600'], ['코랄', '#FDD2C0', '#D2532E'], ['청록', '#B8E8E2', '#14806F'], ['수국', '#D3D6F5', '#4E57B8'], ['망고', '#FCDDA8', '#C4731F']] },
  { id: 'autumn', name: '가을', desc: '단풍 · 은행 · 도토리', c: [['단풍', '#F4C7B5', '#B4472A'], ['은행', '#F6E2A4', '#A47C10'], ['도토리', '#E2D0BC', '#7D5A3A'], ['올리브', '#DCDDB8', '#6B6E2E'], ['와인', '#E8C3CA', '#7E2639'], ['호박', '#F8D3AE', '#C0601C'], ['갈대', '#E9DFC6', '#85703F'], ['가을하늘', '#C9D8E6', '#456A8C']] },
  { id: 'winter', name: '겨울', desc: '눈꽃 · 소나무 · 홀리', c: [['눈꽃', '#D3E3F1', '#3D6E9E'], ['소나무', '#C9DDD3', '#2F6B50'], ['홀리', '#EFC5C8', '#A3313B'], ['실버', '#DDE1E6', '#5E6A78'], ['오로라', '#CDEBE8', '#20786F'], ['겨울밤', '#DAD3EA', '#5E4A92'], ['촛불', '#F3E3B8', '#96761A'], ['네이비', '#C9CFE3', '#28356B']] },
  { id: 'mocha', name: '모카', desc: '모카 · 카라멜 · 말차', c: [['모카', '#E3CFC0', '#7B4E36'], ['크림', '#F2E6CC', '#977839'], ['카라멜', '#F0D2AE', '#A8642A'], ['말차', '#D6DFC0', '#5E7340'], ['로즈', '#EBCFCF', '#9A4D55'], ['차콜', '#D8D4D0', '#4A4440'], ['블루베리', '#D2D4E6', '#4C5280'], ['시나몬', '#EDC9B6', '#A04E30']] },
  { id: 'sunset', name: '석양', desc: '노을 · 핑크 · 보랏빛', c: [['노을', '#FBD3B5', '#CC5A24'], ['핑크', '#F8C9D4', '#C0405F'], ['보랏빛', '#DDCDEB', '#7447A3'], ['금빛', '#F7E2A6', '#A88010'], ['붉은해', '#F3C1BC', '#B8322C'], ['피치', '#FCDCCB', '#B9653A'], ['남보라', '#CFD0EA', '#3E4590'], ['자홍', '#EDC4E2', '#9A2F7E']] },
  { id: 'matcha', name: '말차딸기', desc: '말차 · 딸기 · 우유', c: [['딸기', '#F4C7D0', '#B85468'], ['말차', '#D7DAB3', '#4A6644'], ['우유', '#EDE4D3', '#8C7A5B'], ['체리', '#F2B9BF', '#A3263A'], ['쑥', '#CFDCC0', '#5E7A4A'], ['팥', '#E3C9C9', '#7A3E45'], ['호지차', '#E6D2BC', '#8A5A34'], ['바닐라', '#F5E9C2', '#9A7D22']] },
  { id: 'cherry', name: '체리라떼', desc: '체리 · 라떼 · 시나몬', c: [['체리', '#F0C2C2', '#9E2A33'], ['라떼', '#EAD9C6', '#87564B'], ['에스프레소', '#D9CBC4', '#4A2C24'], ['로즈', '#EDC9C3', '#A6584A'], ['시럽', '#F2D7B8', '#A0602A'], ['베리', '#E5C6D6', '#7E3560'], ['시나몬', '#E6CFC0', '#8C5A3C'], ['피스타치오', '#D9E2C4', '#66784A']] },
  { id: 'midnight', name: '미드나잇', desc: '밤하늘 · 달빛 · 별보라', c: [['밤하늘', '#CBD3E6', '#2E3E6E'], ['달빛', '#EDE7CF', '#85723A'], ['별보라', '#D8D0EC', '#5A4596'], ['새벽', '#C7E0E2', '#2B6F78'], ['은하', '#E2CFE6', '#7D3F86'], ['구름', '#D7DCE3', '#4E5A6B'], ['오로라', '#CFE8D6', '#2F7A4E'], ['샛별', '#F2D4C4', '#A04E32']] },
  { id: 'deepsea', name: '딥씨', desc: '심해 · 산호 · 아쿠아', c: [['심해', '#C6D2E2', '#1F3A5F'], ['산호', '#F7CFC4', '#B9503A'], ['해초', '#C9E2D4', '#2E6E52'], ['아쿠아', '#BFE7EE', '#147184'], ['진주', '#E9E3DA', '#7A6A55'], ['해파리', '#E1D1EE', '#6E4A9E'], ['모래', '#F1E3C1', '#94752A'], ['등대', '#F1C8C8', '#A4343C']] },
  { id: 'lavender', name: '라벤더필드', desc: '라벤더 · 연두 · 플럼', c: [['라벤더', '#DDD3F0', '#6A4FA8'], ['연두', '#DCEBC0', '#5A8429'], ['라일락', '#F0D0E3', '#A04680'], ['하늘', '#CFE0F3', '#3F6FA8'], ['레몬', '#F5EBB5', '#97800F'], ['세이지', '#D3DED1', '#506C55'], ['플럼', '#E2CBD9', '#6E2F57'], ['복숭아', '#F8D8C8', '#B85A33']] },
  { id: 'vintage', name: '빈티지노트', desc: '올리브 · 머스타드 · 버건디', c: [['올리브', '#DEDDB9', '#646A2C'], ['머스타드', '#F2DFA6', '#977312'], ['버건디', '#E7C4C6', '#7A2632'], ['틸', '#C7DEDA', '#2E6B66'], ['테라코타', '#EFCDBA', '#A2502C'], ['잉크', '#CBD2E2', '#2E3D66'], ['세피아', '#E5D6C3', '#6E5233'], ['로즈우드', '#E9CBD0', '#8E4655']] },
  { id: 'bluehour', name: '블루아워', desc: '코발트 · 피치 · 스카이', c: [['코발트', '#CBD9F0', '#2A4F9A'], ['피치', '#FAD7C4', '#BC5C33'], ['스카이', '#CFE7F5', '#246F9A'], ['라일락', '#DED5F0', '#5F4AA0'], ['앰버', '#F7E1A8', '#977010'], ['민트', '#CDEBDF', '#2C7D5E'], ['로즈', '#F3CCD6', '#B04462'], ['스틸', '#D5DCE4', '#475769']] },
];

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
