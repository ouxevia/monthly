// 데이터 모델 · 로컬 저장
//
// 플래너 데이터 전체를 하나의 객체로 다룹니다.
// - 로그인 전/Supabase 미설정: localStorage에만 저장
// - 로그인 후: Supabase planners 테이블에 저장하고 localStorage는 캐시로 사용

const LS_PREFIX = 'exam-monthly:v1:';
const DEVICE_KEY = 'exam-monthly:device-id';

export function defaultData() {
  const subjects = ['국어', '수학', '영어', '과학', '사회'].map((name, i) => ({ id: newId('s'), name, color: i, order: i }));
  return {
    version: 1,
    titles: {},
    subjects,
    books: [],
    todos: [],
    exams: [],
    settings: { themeId: 'rb-pastel', styleId: 'grid', prevStyle: 'grid', fontId: 'myeongjo', showGoal: true, showAbbr: true, sortBySubject: false, colorMode: 'subject', customThemes: '[]' },
    devices: {},
    updatedAt: 0,
  };
}

// 저장된 데이터가 오래된 형식이거나 일부가 비어 있어도 안전하게 채워 넣음
export function normalize(raw) {
  const base = defaultData();
  if (!raw || typeof raw !== 'object') return base;
  const d = {
    version: 1,
    titles: obj(raw.titles),
    subjects: arr(raw.subjects).filter((s) => s && s.id),
    books: arr(raw.books).filter((b) => b && b.id),
    todos: arr(raw.todos).filter((t) => t && t.id && t.date),
    exams: arr(raw.exams).filter((e) => e && e.id && e.date),
    settings: { ...base.settings, ...obj(raw.settings) },
    devices: obj(raw.devices),
    updatedAt: Number(raw.updatedAt) || 0,
  };
  d.subjects.forEach((s, i) => { if (typeof s.color !== 'number') s.color = i % 8; });
  ['subjects', 'books', 'todos'].forEach((c) => d[c].forEach((x, i) => { if (typeof x.order !== 'number') x.order = i; }));
  return d;
}

export function loadLocal(scope) {
  try {
    const txt = localStorage.getItem(LS_PREFIX + scope);
    return txt ? normalize(JSON.parse(txt)) : null;
  } catch (e) {
    return null;
  }
}

export function saveLocal(scope, data) {
  try {
    localStorage.setItem(LS_PREFIX + scope, JSON.stringify(data));
  } catch (e) {
    // 저장 공간이 없거나 사파리 개인정보 보호 모드: 메모리에서만 유지
  }
}

// undefined 값이 섞이지 않도록 JSON 왕복으로 정리
export function toPlain(data) {
  return JSON.parse(JSON.stringify(data));
}

export function newId(prefix) {
  return prefix + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

export function deviceId() {
  try {
    let id = localStorage.getItem(DEVICE_KEY);
    if (!id) {
      id = newId('d');
      localStorage.setItem(DEVICE_KEY, id);
    }
    return id;
  } catch (e) {
    return 'd-session';
  }
}

export function deviceName() {
  const ua = navigator.userAgent;
  let dev = 'PC';
  if (/iPad/.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1)) dev = 'iPad';
  else if (/iPhone/.test(ua)) dev = 'iPhone';
  else if (/Android/.test(ua)) dev = /Mobile/.test(ua) ? 'Android 폰' : 'Android 태블릿';
  else if (/Macintosh/.test(ua)) dev = 'Mac';
  else if (/Windows/.test(ua)) dev = 'Windows';
  let br = '브라우저';
  if (/Edg\//.test(ua)) br = 'Edge';
  else if (/Whale/.test(ua)) br = 'Whale';
  else if (/SamsungBrowser/.test(ua)) br = 'Samsung Internet';
  else if (/Chrome|CriOS/.test(ua)) br = 'Chrome';
  else if (/Firefox|FxiOS/.test(ua)) br = 'Firefox';
  else if (/Safari/.test(ua)) br = 'Safari';
  return dev + ' · ' + br;
}

function obj(v) { return v && typeof v === 'object' && !Array.isArray(v) ? { ...v } : {}; }
function arr(v) { return Array.isArray(v) ? v.slice() : []; }

// ---------------------------------------------------------------- 동기화용 형식
//
// 서버(Supabase planners.doc)에는 항목별 맵으로 저장합니다.
//   { v: 2, todos: { <id>: '<JSON>' }, subjects: {...}, books: {...}, exams: {...},
//     titles: { '2026-5': '제목' }, settings: { themeId: ... }, devices: { <id>: {...} } }
// 항목 하나를 JSON 문자열 한 칸으로 두면 문서 색인 수가 적게 유지되고,
// 서로 다른 기기에서 다른 항목을 고쳐도 덮어쓰지 않고 합쳐집니다.

const COLLS = ['subjects', 'books', 'todos', 'exams'];
const MAPS = ['titles', 'settings'];

function stable(o) {
  return JSON.stringify(o, Object.keys(o).sort());
}

export function toRemote(data) {
  const r = { v: 2 };
  COLLS.forEach((c) => {
    r[c] = {};
    data[c].forEach((x) => { r[c][x.id] = stable(x); });
  });
  r.titles = { ...data.titles };
  r.settings = { ...data.settings };
  return r;
}

export function fromRemote(doc) {
  const raw = { titles: doc.titles, settings: doc.settings, devices: doc.devices };
  COLLS.forEach((c) => {
    const list = [];
    Object.values(doc[c] || {}).forEach((s) => {
      try { list.push(typeof s === 'string' ? JSON.parse(s) : s); } catch (e) { /* 깨진 항목은 건너뜀 */ }
    });
    list.sort((a, b) => (a.order || 0) - (b.order || 0) || (a.id < b.id ? -1 : 1));
    raw[c] = list;
  });
  return normalize(raw);
}

// base → cur 로 바뀐 칸 목록: [{ path: [그룹, 키], value } | { path, del: true }]
export function diffRemote(base, cur) {
  const ops = [];
  [...COLLS, ...MAPS].forEach((g) => {
    const a = (base && base[g]) || {};
    const b = cur[g] || {};
    new Set([...Object.keys(a), ...Object.keys(b)]).forEach((k) => {
      if (!(k in b)) ops.push({ path: [g, k], del: true });
      else if (a[k] !== b[k]) ops.push({ path: [g, k], value: b[k] });
    });
  });
  return ops;
}

export function applyOps(doc, ops) {
  const d = JSON.parse(JSON.stringify(doc || {}));
  ops.forEach(({ path: [g, k], value, del }) => {
    d[g] = d[g] || {};
    if (del) delete d[g][k];
    else d[g][k] = value;
  });
  return d;
}
