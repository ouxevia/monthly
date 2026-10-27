import { THEMES, THEME_GROUPS, STYLES, FONTS, MONTH_NAMES, WEEKDAYS, WEEKDAYS_KO, holidayOf, inkOn, makePair, buildCustomTheme } from './data.js';
import { supabaseConfig, isCloudConfigured } from './config.js';
import { defaultData, normalize, loadLocal, saveLocal, toPlain, newId, deviceId, deviceName, toRemote, fromRemote, diffRemote, applyOps } from './store.js';

// ---------------------------------------------------------------- 상태

const now = new Date();
const S = {
  phase: 'boot', // boot | login | loading | app
  mode: isCloudConfigured ? 'cloud' : 'local',
  cloud: null,
  user: null,
  scope: 'local',
  data: defaultData(),
  sync: 'local', // local | syncing | synced | error
  lastSync: 0,
  loginError: '',
  login: { mode: 'login', email: '', busy: false, info: '' },
  deviceRegistered: false,
  base: null, // 서버에 마지막으로 반영된 상태 (toRemote 형식)
  creating: false,
  pendingRender: false,
  ui: {
    year: now.getFullYear(),
    month: now.getMonth() + 1,
    modal: null, // todo | category | theme | exam | account
    draft: null,
    catSubject: null,
    themeTab: 'style',
    returnToTodo: false,
  },
};
const LOCAL_STARTED_KEY = 'exam-monthly:local-started';
const OFFLINE_KEY = 'exam-monthly:offline'; // 서버는 있지만 로그인 없이 쓰기로 고른 기기
// 폰처럼 좁은 화면: 칸에는 색 막대만, 날짜를 누르면 아래에 그날 할 일 목록
const COMPACT_MQ = window.matchMedia('(max-width: 700px)');
const isCompact = () => COMPACT_MQ.matches;
const $app = document.getElementById('app');

// ---------------------------------------------------------------- 유틸

const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const pad = (n) => String(n).padStart(2, '0');
const keyOf = (y, m, d) => `${y}-${pad(m)}-${pad(d)}`;
const todayKey = () => { const t = new Date(); return keyOf(t.getFullYear(), t.getMonth() + 1, t.getDate()); };
const dayNum = (k) => { const [y, m, d] = k.split('-').map(Number); return Date.UTC(y, m - 1, d) / 864e5; };
const ddayText = (n) => (n === 0 ? 'D-day' : 'D-' + n);
const dateLabel = (k) => { const [y, m, d] = k.split('-').map(Number); return `${y}.${pad(m)}.${pad(d)} (${WEEKDAYS_KO[new Date(y, m - 1, d).getDay()]})`; };
const byId = (list, id) => list.find((x) => x.id === id) || null;

function relTime(ts) {
  if (!ts) return '';
  const diff = Math.max(0, Date.now() - ts) / 1000;
  if (diff < 60) return '방금 전';
  if (diff < 3600) return Math.floor(diff / 60) + '분 전';
  if (diff < 86400) return Math.floor(diff / 3600) + '시간 전';
  if (diff < 86400 * 30) return Math.floor(diff / 86400) + '일 전';
  const d = new Date(ts);
  return `${d.getFullYear()}.${pad(d.getMonth() + 1)}.${pad(d.getDate())}`;
}

const ICON = {
  plus: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>',
  check: '<svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12l5 5 9-10"/></svg>',
  close: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>',
  x: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>',
  pencil: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 20h4L19 9l-4-4L4 16v4z"/><path d="M13.5 6.5l4 4"/></svg>',
  left: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 6l-6 6 6 6"/></svg>',
  right: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 6l6 6-6 6"/></svg>',
  exam: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/><path d="M9 15l2 2 4-4"/></svg>',
  tag: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 12l-8 8-9-9V3h8z"/><circle cx="7.5" cy="7.5" r="1.5"/></svg>',
  layout: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 9h18M9 9v11"/></svg>',
  palette: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3a9 9 0 100 18c1.1 0 1.5-.8 1.5-1.5 0-.9-.7-1.3-.7-2.2 0-.8.7-1.3 1.5-1.3H17a4 4 0 004-4c0-5-4-9-9-9z"/><circle cx="7.5" cy="11" r="1"/><circle cx="10.5" cy="7" r="1"/><circle cx="15" cy="7.5" r="1"/></svg>',
  font: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 20L10 4h1l6 16M6.5 14h8"/><path d="M17 20h4"/></svg>',
  printer: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 9V3h12v6"/><rect x="3" y="9" width="18" height="8" rx="2"/><path d="M6 14h12v7H6z"/></svg>',
  gear: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 00.3 1.8l.1.1a2 2 0 11-2.8 2.8l-.1-.1a1.7 1.7 0 00-1.8-.3 1.7 1.7 0 00-1 1.5V21a2 2 0 11-4 0v-.1a1.7 1.7 0 00-1.1-1.5 1.7 1.7 0 00-1.8.3l-.1.1a2 2 0 11-2.8-2.8l.1-.1a1.7 1.7 0 00.3-1.8 1.7 1.7 0 00-1.5-1H3a2 2 0 110-4h.1a1.7 1.7 0 001.5-1.1 1.7 1.7 0 00-.3-1.8l-.1-.1a2 2 0 112.8-2.8l.1.1a1.7 1.7 0 001.8.3H9a1.7 1.7 0 001-1.5V3a2 2 0 114 0v.1a1.7 1.7 0 001 1.5 1.7 1.7 0 001.8-.3l.1-.1a2 2 0 112.8 2.8l-.1.1a1.7 1.7 0 00-.3 1.8V9a1.7 1.7 0 001.5 1H21a2 2 0 110 4h-.1a1.7 1.7 0 00-1.5 1z"/></svg>',
  eye: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/></svg>',
  mail: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>',
  refresh: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 11a8 8 0 10-2.3 5.7"/><path d="M20 4v7h-7"/></svg>',
  moon: '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12.8A9 9 0 1111.2 3a7 7 0 009.8 9.8z"/></svg>',
};

// ---------------------------------------------------------------- 테마

const settings = () => S.data.settings;
// 사용자가 만든 팔레트는 settings.customThemes 에 JSON 문자열로 저장 (동기화 비교가 간단하도록)
function customPalettes() {
  try {
    const list = JSON.parse(settings().customThemes || '[]');
    return Array.isArray(list) ? list.filter((p) => p && p.id) : [];
  } catch (e) {
    return [];
  }
}
function saveCustomPalettes(list) { settings().customThemes = JSON.stringify(list); }
const allThemes = () => customPalettes().map(buildCustomTheme).concat(THEMES);
const findTheme = (id) => allThemes().find((t) => t.id === id) || null;
// 없어진 테마를 고르고 있었으면 기본 테마로
const curTheme = () => findTheme(settings().themeId) || findTheme('rb-pastel') || THEMES[0];
// 색 개수가 테마마다 달라서 순번은 항상 나머지로 맞춤
const tc = (th, i) => th.c[((i % th.c.length) + th.c.length) % th.c.length];
// 날짜별 할 일 목록: 직접 정한 순서(order)대로, 과목순 정렬을 켜면 과목 순서가 먼저
function todosByDay() {
  const map = {};
  S.data.todos.forEach((t) => { (map[t.date] = map[t.date] || []).push(t); });
  const rank = {};
  const bySubject = settings().sortBySubject === true;
  if (bySubject) S.data.subjects.forEach((s, i) => { rank[s.id] = i; });
  const r = (t) => (t.subjectId in rank ? rank[t.subjectId] : 1e9);
  Object.keys(map).forEach((k) => map[k].sort((a, b) => (bySubject ? r(a) - r(b) : 0) || (a.order || 0) - (b.order || 0)));
  return map;
}
const abbrOf = (s) => (s ? (s.abbr || Array.from(s.name || '')[0] || '') : '');
const curStyle = () => STYLES.find((s) => s.id === settings().styleId) || STYLES[2];
const curFont = () => FONTS.find((f) => f.id === settings().fontId) || FONTS[0];
const isNight = () => curStyle().id === 'night';

function colorOf(subjectId) {
  const s = byId(S.data.subjects, subjectId);
  if (!s) return ['', '#E4E2DE', '#77736C'];
  return tc(curTheme(), s.color);
}

function applyTheme() {
  const st = curStyle();
  const f = curFont();
  const th = curTheme();
  const r = document.documentElement.style;
  const set = (k, v) => r.setProperty(k, v);
  set('--ink', st.ink); set('--sub', st.sub); set('--line', st.line); set('--outer', st.outer);
  set('--cell-bg', st.cellBg); set('--head-bg', st.headBg); set('--radius', st.radius + 'px');
  set('--sun', st.sun); set('--sat', st.sat); set('--circle', st.circle);
  set('--today-bg', st.todayBg); set('--today-badge', st.todayBadge); set('--today-fg', st.todayFg);
  set('--font', f.family); set('--k', f.scale); set('--chip-fs', f.chip + 'px');
  set('--accent-light', tc(th, 0)[1]); set('--accent-deep', tc(th, 0)[2]); set('--month-on', tc(th, 3)[1]); set('--month-on-ink', inkOn(tc(th, 3)[1]));
  set('--drop', tc(th, 3)[1]);
  document.body.className = 'st-' + st.id + (st.dark ? ' dark' : '');
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute('content', st.dark ? '#1E2230' : '#FDFCF9');
}

// ---------------------------------------------------------------- 저장 · 동기화

let saveTimer = null;
let saving = false;
const BASE_PREFIX = 'exam-monthly:v1:base:';

function saveBase() {
  try { localStorage.setItem(BASE_PREFIX + S.scope, JSON.stringify(S.base)); } catch (e) { /* 무시 */ }
}
function loadBase(scope) {
  try { const t = localStorage.getItem(BASE_PREFIX + scope); return t ? JSON.parse(t) : null; } catch (e) { return null; }
}

function commit(opts) {
  S.data.updatedAt = Date.now();
  saveLocal(S.scope, S.data);
  if (S.mode === 'cloud' && S.user && S.cloud) scheduleCloudSave();
  if (!opts || opts.render !== false) render();
}

function scheduleCloudSave(delay) {
  S.sync = 'syncing';
  updateSyncBadge();
  clearTimeout(saveTimer);
  saveTimer = setTimeout(flushCloudSave, delay == null ? 600 : delay);
}

// 서버에 반영된 상태(S.base)와 지금 데이터를 비교해서 바뀐 칸만 보냄
async function flushCloudSave() {
  saveTimer = null;
  if (!S.cloud || !S.user || !S.base) return; // 서버 문서를 받기 전이면 받은 뒤에 저장
  if (saving) { scheduleCloudSave(300); return; }
  const ops = diffRemote(S.base, toRemote(S.data));
  if (!ops.length) {
    S.sync = 'synced';
    S.lastSync = Date.now();
    updateSyncBadge();
    return;
  }
  const prev = S.base;
  const next = applyOps(prev, ops);
  S.base = next;
  saveBase();
  saving = true;
  try {
    await S.cloud.update(ops);
    if (!saveTimer) { S.sync = 'synced'; S.lastSync = Date.now(); }
  } catch (err) {
    console.error('[sync]', err);
    if (S.base === next) { S.base = prev; saveBase(); }
    S.sync = 'error';
  }
  saving = false;
  updateSyncBadge();
}

function syncLabel(short) {
  if (S.mode === 'local' || !S.user) return short ? '이 기기에 저장' : '이 기기에만 저장 중 (로그인 없이 사용)';
  if (S.sync === 'syncing') return short ? '동기화 중' : '동기화 중…';
  if (S.sync === 'error') return short ? '동기화 실패' : '동기화에 실패했어요 · 인터넷 연결을 확인하세요';
  return short ? '동기화됨' : '모든 기기에 동기화됨' + (S.lastSync ? ' · 마지막 ' + relTime(S.lastSync) : '');
}
function syncDot() {
  if (S.mode === 'local' || !S.user) return '#9AA0B0';
  return S.sync === 'syncing' ? '#E0A526' : S.sync === 'error' ? '#D2493F' : '#3FA46A';
}
function updateSyncBadge() {
  document.querySelectorAll('[data-sync-text]').forEach((el) => { el.textContent = syncLabel(el.dataset.syncText === 'short'); });
  document.querySelectorAll('[data-sync-dot]').forEach((el) => { el.style.background = syncDot(); });
}

// ---------------------------------------------------------------- 시작

async function boot() {
  bindEvents();
  if (S.mode === 'local') {
    S.scope = 'local';
    S.data = loadLocal('local') || defaultData();
    let started = false;
    try { started = localStorage.getItem(LOCAL_STARTED_KEY) === '1'; } catch (e) { /* 무시 */ }
    S.phase = started ? 'app' : 'login';
    applyTheme();
    render();
    return;
  }

  // 로그인 화면에서도 마지막으로 쓰던 스타일을 보여주기
  const last = loadLocal('last');
  if (last) S.data.settings = last.settings;
  let offline = false;
  try { offline = localStorage.getItem(OFFLINE_KEY) === '1'; } catch (e) { /* 무시 */ }
  if (offline) {
    // 지난번에 "로그인 없이 쓰기"를 골랐으면 바로 캘린더로 (로그인된 상태면 onUser가 계정으로 바꿔 줌)
    S.offline = true;
    S.scope = 'local';
    S.data = loadLocal('local') || S.data;
    S.phase = 'app';
  }
  applyTheme();
  render();
  // 서버가 느리거나 장애일 때 "불러오는 중"에 멈추지 않도록 10초 뒤 로그인 화면으로
  const slow = setTimeout(() => {
    if (S.phase !== 'boot') return;
    S.loginError = '동기화 서버(Supabase)에 연결이 늦어지고 있어요. 잠시 후 새로고침하거나, 아래에서 이 기기에 먼저 써 두세요.';
    S.phase = 'login';
    render();
  }, 10000);
  try {
    const { initCloud } = await import('./cloud.js');
    S.cloud = await initCloud(supabaseConfig, { onUser, onRemote, onError: onCloudError, onRecovery });
  } catch (err) {
    console.error('[supabase]', err);
    S.loginError = '동기화 서버(Supabase)에 연결하지 못했어요. 인터넷 연결을 확인하거나 잠시 후 새로고침하세요. (' + (err.message || err) + ')';
    if (S.phase === 'boot') S.phase = 'login';
    render();
  }
  clearTimeout(slow);
}

function onUser(user) {
  // 로그인 없이 이 기기에서 쓰는 중이면 그대로 둠
  if (!user && S.offline) { render(); return; }
  if (user) {
    S.offline = false;
    try { localStorage.removeItem(OFFLINE_KEY); } catch (e) { /* 무시 */ }
  }
  if (!user) {
    S.user = null;
    S.base = null;
    S.phase = 'login';
    S.sync = 'local';
    S.ui.modal = null;
    render();
    return;
  }
  S.user = { uid: user.uid, name: user.displayName || (user.email || '').split('@')[0], email: user.email || '', photo: user.photoURL || '' };
  S.scope = user.uid;
  S.deviceRegistered = false;
  S.loginError = '';
  S.base = loadBase(user.uid);
  const cached = loadLocal(user.uid);
  if (cached) {
    S.data = cached;
    S.phase = 'app';
  } else {
    S.phase = 'loading';
  }
  S.sync = 'syncing';
  applyTheme();
  render();
}

function onRemote(doc) {
  if (!S.user) return;
  const wasLoading = S.phase !== 'app';
  if (!doc || !doc.v) {
    // 처음 로그인: 이 기기에 있던 데이터(캐시 또는 로그인 없이 쓰던 데이터)로 서버 문서를 만듦
    if (S.creating) return;
    S.creating = true;
    S.data = loadLocal(S.scope) || loadLocal('local') || defaultData();
    const full = toRemote(S.data);
    S.base = full;
    saveBase();
    saveLocal(S.scope, S.data);
    S.cloud.create(full)
      .then(() => { S.sync = 'synced'; S.lastSync = Date.now(); })
      .catch((err) => { console.error('[sync]', err); S.sync = 'error'; S.base = null; })
      .finally(() => { S.creating = false; updateSyncBadge(); });
  } else {
    // 아직 서버에 못 보낸 이 기기의 변경을 서버 최신 상태 위에 다시 얹음
    const pending = S.base ? diffRemote(S.base, toRemote(S.data)) : [];
    const remote = JSON.parse(JSON.stringify(doc));
    const devices = remote.devices || {};
    delete remote.devices;
    S.base = remote;
    S.data = fromRemote(applyOps(remote, pending));
    S.data.devices = devices;
    saveBase();
    saveLocal(S.scope, S.data);
    saveLocal('last', S.data);
    if (pending.length) scheduleCloudSave(0);
    else if (!saveTimer && !saving) { S.sync = 'synced'; S.lastSync = Date.now(); }
    if (!S.deviceRegistered) {
      S.deviceRegistered = true;
      S.cloud.touchDevice(deviceId(), { name: deviceName(), lastSeen: Date.now() }).catch((err) => console.error('[device]', err));
    }
  }
  S.phase = 'app';
  applyTheme();
  if (wasLoading) render();
  else { renderSoft(); updateSyncBadge(); }
}

function onCloudError(err) {
  console.error('[firestore]', err);
  S.sync = 'error';
  if (S.phase === 'loading') {
    S.data = loadLocal(S.scope) || defaultData();
    S.phase = 'app';
    render();
  } else {
    updateSyncBadge();
  }
}

// ---------------------------------------------------------------- 렌더

function render() {
  S.pendingRender = false;
  const scrollY = window.scrollY;
  const calScroll = document.querySelector('.cal-scroll');
  const calScrollX = calScroll ? calScroll.scrollLeft : 0;
  const modalBody = document.querySelector('.modal-scroll');
  const modalScrollY = modalBody ? modalBody.scrollTop : 0;
  const cellScroll = {};
  document.querySelectorAll('.cell[data-date] .todos').forEach((el) => { if (el.scrollTop) cellScroll[el.parentElement.dataset.date] = el.scrollTop; });

  let html;
  if (S.phase === 'boot' || S.phase === 'loading') html = `<div class="boot">${S.phase === 'loading' ? '플래너를 불러오는 중…' : '불러오는 중…'}</div>`;
  else if (S.phase === 'login') html = viewLogin();
  else html = viewApp() + viewModal();
  $app.innerHTML = html;

  window.scrollTo(0, scrollY);
  const cs = document.querySelector('.cal-scroll');
  if (cs) cs.scrollLeft = calScrollX;
  const mb = document.querySelector('.modal-scroll');
  if (mb) mb.scrollTop = modalScrollY;
  fitCalendar();
  Object.keys(cellScroll).forEach((k) => {
    const el = document.querySelector(`.cell[data-date="${k}"] .todos`);
    if (el) el.scrollTop = cellScroll[k];
  });
}

// 다른 기기에서 변경이 들어왔을 때: 입력 중이면 끝날 때까지 기다렸다가 다시 그림
function renderSoft() {
  const a = document.activeElement;
  if (a && $app.contains(a) && (a.tagName === 'INPUT' || a.tagName === 'TEXTAREA')) {
    S.pendingRender = true;
    return;
  }
  render();
}

function viewLogin() {
  const th = curTheme();
  let cells = '';
  for (let i = 0; i < 21; i++) {
    const on = i % 5 === 1 || i % 7 === 4;
    cells += `<span style="background:${on ? tc(th, i)[1] : 'var(--login-cell)'}"></span>`;
  }
  const L = S.login;
  let body;
  if (!isCloudConfigured) {
    body = `<p class="hint center">아직 동기화 서버(Supabase) 설정 전이에요.<br>지금은 이 기기에만 저장하는 모드로 시작할 수 있어요.</p>
       <button class="btn btn-lg btn-primary" data-act="start-local">이 기기에서 시작하기</button>
       <p class="hint small center">로그인 · 동기화 설정 방법은 README의 "Supabase 설정"을 참고하세요.</p>`;
  } else {
    const signup = L.mode === 'signup';
    body = `<div class="tabs login-tabs" role="tablist">
         <button class="tab${signup ? '' : ' on'}" role="tab" aria-selected="${!signup}" data-act="login-mode" data-mode="login">로그인</button>
         <button class="tab${signup ? ' on' : ''}" role="tab" aria-selected="${signup}" data-act="login-mode" data-mode="signup">회원가입</button>
       </div>
       <div class="field-group">
         <label class="field-label" for="login-email">이메일</label>
         <input id="login-email" class="field" type="email" inputmode="email" autocomplete="email" placeholder="name@email.com" value="${esc(L.email)}">
       </div>
       <div class="field-group">
         <label class="field-label" for="login-pw">비밀번호${signup ? ' (6자 이상)' : ''}</label>
         <input id="login-pw" class="field" type="password" autocomplete="${signup ? 'new-password' : 'current-password'}" placeholder="비밀번호" data-enter="${signup ? 'signup' : 'login'}">
       </div>
       ${signup ? `<div class="field-group">
         <label class="field-label" for="login-pw2">비밀번호 확인</label>
         <input id="login-pw2" class="field" type="password" autocomplete="new-password" placeholder="한 번 더 입력" data-enter="signup">
       </div>` : ''}
       <button class="btn btn-lg btn-primary" data-act="${signup ? 'signup' : 'login'}"${L.busy ? ' disabled' : ''}>${L.busy ? '잠시만요…' : signup ? '가입하고 시작하기' : '로그인'}</button>
       ${L.info ? `<p class="hint small center">${esc(L.info)}</p>` : ''}
       ${S.loginError && (!S.cloud || /서버/.test(S.loginError)) ? '<div class="row-wrap" style="justify-content:center"><button class="btn btn-sm" data-act="reload">새로고침</button></div>' : ''}
       ${signup ? '<p class="hint small center">폰 · 패드 · 노트북에서 같은 이메일과 비밀번호로 로그인하면 플래너가 동기화돼요.</p>'
         : '<button class="link-btn" data-act="forgot-pw" style="align-self:center">비밀번호를 잊었어요</button>'}`;
  }
  return `<main class="login">
    <section class="login-intro">
      <h1 class="login-title">Exam Monthly</h1>
      <p class="login-sub">시험 계획을 먼슬리 캘린더에.<br>아이패드, 노트북, 폰 어디서든 같은 계획을 이어서.</p>
      <div class="login-mini" aria-hidden="true">${cells}</div>
    </section>
    <section class="card login-card">
      <h2>시작하기</h2>
      ${body}
      ${S.loginError ? `<p class="error-text">${esc(S.loginError)}</p>` : ''}
      ${isCloudConfigured ? `<div class="login-or"><span></span>또는<span></span></div>
      <button class="btn" data-act="start-local">로그인 없이 이 기기에서 쓰기</button>
      <p class="hint small center" style="margin:-8px 0 0">기기 저장 모드: 이 브라우저에만 저장돼요. 나중에 로그인하면<br>처음 만드는 계정으로 그대로 옮겨져요.</p>` : ''}
      <div class="login-foot">
        <span>화면 스타일</span>
        <button class="btn btn-sm" data-act="toggle-night" aria-pressed="${isNight()}">${ICON.moon}${isNight() ? '나이트모드 끄기' : '나이트모드'}</button>
      </div>
    </section>
  </main>`;
}

function viewApp() {
  const { year: y, month: m } = S.ui;
  const user = S.user || { name: '내 플래너', photo: '' };
  const initial = (user.name || 'M').charAt(0).toUpperCase();
  const title = S.data.titles[y + '-' + m] || '';
  const showGoal = settings().showGoal !== false;

  return `<div class="page">
    <header class="top">
      <div class="title-row">
        <h1 class="month-title">${MONTH_NAMES[m - 1]}</h1>
        ${showGoal ? `<div class="title-wrap">
          <label class="title-label" for="title-input">GOAL :</label>
          <input id="title-input" class="title-input" data-input="title" value="${esc(title)}" placeholder="이번 달 목표를 적어보세요" maxlength="60" autocomplete="off">
        </div>` : ''}
      </div>
      <div class="top-right">
        <nav class="month-nav" aria-label="달 이동">
          <button class="icon-btn nav-arrow" data-act="prev-month" aria-label="이전 달">${ICON.left}</button>
          <span class="year-text">${y}</span>
          <button class="icon-btn nav-arrow" data-act="next-month" aria-label="다음 달">${ICON.right}</button>
          <button class="today-link" data-act="go-today">오늘</button>
        </nav>
        <button class="btn btn-sm" data-act="open-settings" aria-label="환경설정">${ICON.gear}<span class="btn-label">환경설정</span></button>
        <button class="btn btn-sm refresh-btn" data-act="refresh" title="최신 버전으로 새로고침" aria-label="새로고침">${ICON.refresh}<span class="btn-label">새로고침</span></button>
        <button class="btn account-pill" data-act="open-account">
          ${avatar(user, initial, 'avatar-sm')}
          <span class="account-name">${esc(user.name)}</span>
          <span class="sync-dot" data-sync-dot style="background:${syncDot()}"></span>
          <span class="sub-text" data-sync-text="short">${esc(syncLabel(true))}</span>
        </button>
      </div>
    </header>
    ${viewCalendar()}
    ${viewLegend()}
  </div>
  ${S.ui.modal === 'settings' && S.ui.setTab === 'export' ? `<div class="print-host" aria-hidden="true">${viewPrintSheet()}</div>` : ''}`;
}

function avatar(user, initial, cls) {
  if (user && user.photo) return `<img class="${cls}" src="${esc(user.photo)}" alt="" referrerpolicy="no-referrer">`;
  return `<span class="${cls}" aria-hidden="true">${esc(initial)}</span>`;
}

function viewCalendar() {
  const { year: y, month: m } = S.ui;
  const today = todayKey();
  const exams = S.data.exams.slice().sort((a, b) => (a.date < b.date ? -1 : 1));
  const nearest = (k) => exams.find((e) => e.date >= k) || null;

  const first = new Date(y, m - 1, 1).getDay();
  const nd = new Date(y, m, 0).getDate();
  const cells = [];
  for (let i = 0; i < first; i++) cells.push(0);
  for (let d = 1; d <= nd; d++) cells.push(d);
  while (cells.length % 7) cells.push(0);
  const rows = cells.length / 7;

  const todosByDate = todosByDay();

  const compact = isCompact();
  const sel = selectedDate();
  let html = `<div class="cal-scroll"><div class="cal weeks-${rows}${compact ? ' compact' : ''}${S.ui.slide ? ' slide-' + S.ui.slide : ''}" data-rows="${rows}" role="grid" aria-label="${y}년 ${m}월">`;
  html += '<div class="cal-head" role="row">' + WEEKDAYS.map((w, i) => `<div class="wd${i === 0 ? ' sun' : i === 6 ? ' sat' : ''}" role="columnheader">${w}</div>`).join('') + '</div>';
  for (let r = 0; r < rows; r++) {
    html += '<div class="cal-row" role="row">';
    for (let c = 0; c < 7; c++) {
      const d = cells[r * 7 + c];
      if (!d) { html += '<div class="cell empty" role="gridcell"></div>'; continue; }
      const k = keyOf(y, m, d);
      const hol = holidayOf(y, k.slice(5));
      const ex = nearest(k);
      const dd = ex ? dayNum(ex.date) - dayNum(k) : null;
      const numCls = c === 0 || hol ? ' sun' : c === 6 ? ' sat' : '';
      if (compact) {
        const list = todosByDate[k] || [];
        const bars = list.slice(0, 4).map((t) => { const col = colorOf(t.subjectId); return `<i style="background:${t.done ? col[2] : col[1]}"></i>`; }).join('');
        html += `<button class="cell cell-compact${k === today ? ' today' : ''}${k === sel ? ' sel' : ''}" data-date="${k}" data-act="sel-date" role="gridcell" aria-label="${m}월 ${d}일${hol ? ' ' + esc(hol) : ''}, 할 일 ${list.length}개" aria-pressed="${k === sel}">
          <span class="num${numCls}">${d}</span>
          ${ex ? `<span class="dday${dd === 0 ? ' on' : ''}">${dd === 0 ? 'D-day' : 'D-' + dd}</span>` : ''}
          <span class="bars">${bars}</span>
          ${list.length > 4 ? `<span class="more-n">+${list.length - 4}</span>` : ''}
        </button>`;
        continue;
      }
      const todos = (todosByDate[k] || []).map(viewChip).join('');
      html += `<div class="cell${k === today ? ' today' : ''}" data-date="${k}" role="gridcell">
        <div class="cell-head">
          <span class="num${numCls}">${d}</span>
          ${k === today ? '<span class="today-badge">오늘</span>' : ''}
          ${hol ? `<span class="hol">${esc(hol)}</span>` : ''}
          ${ex ? `<span class="dday${dd === 0 ? ' on' : ''}" title="${esc(ex.name)}까지">${ddayText(dd)}${dd === 0 ? ` <small>${esc(ex.name)}</small>` : ''}</span>` : ''}
          <span class="sp"></span>
          <button class="add-btn" data-act="open-add" data-date="${k}" aria-label="${m}월 ${d}일 할 일 추가">${ICON.plus}</button>
        </div>
        <div class="todos">${todos}</div>
      </div>`;
    }
    html += '</div>';
  }
  html += '</div></div>';
  if (compact) html += viewDayPanel(sel, todosByDate[sel] || [], nearest(sel));
  return html;
}

// 지금 보고 있는 달 안에서 선택된 날짜 (기본: 오늘, 다른 달이면 1일)
function selectedDate() {
  const { year: y, month: m } = S.ui;
  const prefix = `${y}-${pad(m)}-`;
  if (S.ui.selDate && S.ui.selDate.startsWith(prefix)) return S.ui.selDate;
  const t = todayKey();
  return t.startsWith(prefix) ? t : prefix + '01';
}

function viewDayPanel(k, list, ex) {
  const [y, m, d] = k.split('-').map(Number);
  const hol = holidayOf(y, k.slice(5));
  const wd = WEEKDAYS_KO[new Date(y, m - 1, d).getDay()];
  const dd = ex ? dayNum(ex.date) - dayNum(k) : null;
  const items = list.map((t) => viewChip(t).replace('class="chip', 'class="chip chip-lg')).join('') || '<p class="hint" style="margin:4px 0">이 날은 아직 할 일이 없어요.</p>';
  return `<section class="day-panel" data-date="${k}" aria-label="${m}월 ${d}일 할 일">
    <div class="day-head">
      <span class="day-title">${m}월 ${d}일 (${wd})</span>
      ${hol ? `<span class="hol">${esc(hol)}</span>` : ''}
      ${ex ? `<span class="dday${dd === 0 ? ' on' : ''}">${ddayText(dd)} · ${esc(ex.name)}</span>` : ''}
      <span class="sp"></span>
      <button class="btn btn-sm" data-act="open-add" data-date="${k}">${ICON.plus}할 일</button>
    </div>
    <div class="day-list">${items}</div>
  </section>`;
}

// 화면 높이에 맞춰 캘린더 칸 높이 조절 (할 일 7줄은 항상 보장)
function fitCalendar() {
  const cal = document.querySelector('.cal');
  if (!cal) return;
  const rows = Number(cal.dataset.rows) || 6;
  const head = 32;
  const top = cal.getBoundingClientRect().top + window.scrollY;
  if (cal.classList.contains('compact')) {
    const h = Math.round(Math.min(78, Math.max(54, (window.innerHeight * 0.58 - top - head) / rows)));
    cal.style.setProperty('--row-h', h + 'px');
    return;
  }
  const legend = document.querySelector('.legend');
  const below = (legend ? legend.offsetHeight : 20) + 40;
  const chipH = parseFloat(getComputedStyle(cal).getPropertyValue('--chip-h')) || 16;
  const min = Math.ceil(24 + 3 + 7 * chipH + 6 * 2 + 14); // 할 일 7줄이 항상 보이는 높이
  const h = Math.max(min, Math.floor((window.innerHeight - top - head - below) / rows));
  cal.style.setProperty('--row-h', h + 'px');
}

function viewChip(t) {
  const col = colorOf(t.subjectId);
  const book = byId(S.data.books, t.bookId);
  const subject = byId(S.data.subjects, t.subjectId);
  const label = [subject ? subject.name : '', book ? book.name : '', t.text].filter(Boolean).join(' · ');
  const bg = t.done ? col[2] : col[1];
  return `<div class="chip${t.done ? ' done' : ''}" data-id="${t.id}" style="background:${bg};color:${inkOn(bg)}" title="${esc(label)}">
    <button class="chip-check" data-act="toggle-done" data-id="${t.id}" aria-label="${esc(label)} ${t.done ? '완료 취소' : '완료로 표시'}" aria-pressed="${t.done}">${t.done ? ICON.check : ''}</button>
    <button class="chip-text" data-act="open-todo" data-id="${t.id}">${subject && settings().showAbbr !== false ? `<span class="abbr">(${esc(abbrOf(subject))})</span> ` : ''}${book ? `<b>${esc(book.name)}</b> ` : ''}${esc(t.text || (subject ? subject.name : ''))}</button>
  </div>`;
}

// ---------------------------------------------------------------- A4 인쇄용 한 장

const SHEET_W = 1123; // A4 가로 297mm (96dpi)
const SHEET_H = 794;  // A4 세로 210mm

function viewPrintSheet() {
  const { year: y, month: m } = S.ui;
  // 나이트모드는 인쇄하면 잉크가 많이 들어서 흰 배경(심플)으로 출력
  // 글씨만 버전: 형광펜(색 배경) 없이 흑백으로
  const mono = S.ui.exportMode === 'mono';
  const st = mono
    ? { id: 'simple', ink: '#1F1F1F', sub: '#666666', line: '#B5B5B5', outer: '1px solid #8A8A8A', cellBg: '#FFFFFF', headBg: '#F4F4F4', radius: 0, sun: '#1F1F1F', sat: '#1F1F1F', circle: 0 }
    : isNight() ? STYLES.find((x) => x.id === 'simple') : curStyle();
  const exams = S.data.exams.slice().sort((a, b) => (a.date < b.date ? -1 : 1));
  const nearest = (k) => exams.find((e) => e.date >= k) || null;
  const first = new Date(y, m - 1, 1).getDay();
  const nd = new Date(y, m, 0).getDate();
  const cells = [];
  for (let i = 0; i < first; i++) cells.push(0);
  for (let d = 1; d <= nd; d++) cells.push(d);
  while (cells.length % 7) cells.push(0);
  const rows = cells.length / 7;
  const PAD = 28, HEAD = 62, WD = 22, LEG = 22, GAP = 8;
  const rowH = Math.floor((SHEET_H - PAD * 2 - HEAD - WD - LEG - GAP * 2) / rows);
  const LINE = 13;
  const maxLines = Math.max(1, Math.floor((rowH - 24) / LINE));

  const todosByDate = todosByDay();

  let grid = '<div class="ps-head-row">' + WEEKDAYS.map((w, i) => `<div class="ps-wd" style="color:${i === 0 ? st.sun : i === 6 ? st.sat : st.ink}">${w}</div>`).join('') + '</div>';
  for (let r = 0; r < rows; r++) {
    grid += '<div class="ps-row">';
    for (let c = 0; c < 7; c++) {
      const d = cells[r * 7 + c];
      if (!d) { grid += `<div class="ps-cell" style="height:${rowH}px"></div>`; continue; }
      const k = keyOf(y, m, d);
      const hol = holidayOf(y, k.slice(5));
      const ex = nearest(k);
      const dd = ex ? dayNum(ex.date) - dayNum(k) : null;
      const list = todosByDate[k] || [];
      const over = list.length > maxLines;
      const shown = over ? list.slice(0, maxLines - 1) : list;
      const chips = shown.map((t) => {
        const col = colorOf(t.subjectId);
        const book = byId(S.data.books, t.bookId);
        const subject = byId(S.data.subjects, t.subjectId);
        const ab = subject && settings().showAbbr !== false ? `(${esc(abbrOf(subject))}) ` : '';
        const look = mono ? 'background:transparent;color:#1F1F1F' : `background:${t.done ? col[2] : col[1]};color:${inkOn(t.done ? col[2] : col[1])}`;
        return `<div class="ps-chip${mono ? ' mono' : ''}" style="${look}"><span class="ps-check">${t.done ? '✓' : '○'}</span>${ab}${book ? `<b>${esc(book.name)}</b> ` : ''}${esc(t.text || (subject ? subject.name : ''))}</div>`;
      }).join('') + (over ? `<div class="ps-more">+${list.length - shown.length}개 더</div>` : '');
      grid += `<div class="ps-cell" style="height:${rowH}px">
        <div class="ps-cell-head">
          <span class="ps-num" style="color:${c === 0 || hol ? st.sun : c === 6 ? st.sat : st.ink}">${d}</span>
          ${hol ? `<span class="ps-hol" style="color:${st.sun}">${esc(hol)}</span>` : ''}
          ${ex ? `<span class="ps-dday" style="color:${dd === 0 ? st.sun : st.ink}">${ddayText(dd)}</span>` : ''}
        </div>
        ${chips}
      </div>`;
    }
    grid += '</div>';
  }

  const monthExams = exams.filter((e) => e.date.startsWith(`${y}-${pad(m)}`));
  const legend = S.data.subjects.map((s) => {
    if (mono) return `<span class="ps-lg">(${esc(abbrOf(s))}) ${esc(s.name)}</span>`;
    const c = colorOf(s.id);
    return `<span class="ps-lg"><i style="background:${c[1]}"></i><i style="background:${c[2]}"></i>${esc(s.name)}</span>`;
  }).join('');
  const vars = `--font:${curFont().family};--ink:${st.ink};--sub:${st.sub};--line:${st.line};--outer:${st.outer};--cell-bg:${st.cellBg};--head-bg:${st.headBg};--radius:${st.radius}px;--accent-light:${curTheme().c[0][1]};--circle:${st.circle}`;

  return `<div class="print-sheet st-${st.id}" style="width:${SHEET_W}px;height:${SHEET_H}px;padding:${PAD}px;${vars}">
    <div class="ps-header" style="height:${HEAD}px">
      <div class="ps-month">${MONTH_NAMES[m - 1]}</div>
      <div class="ps-title">${settings().showGoal !== false ? `<span class="ps-title-label">GOAL :</span> ${esc(S.data.titles[y + '-' + m] || '')}` : ''}</div>
      <div class="ps-exams">${monthExams.map((e) => `<span>${esc(e.name)} · ${Number(e.date.slice(5, 7))}/${Number(e.date.slice(8))}</span>`).join('')}</div>
    </div>
    <div class="ps-cal">${grid}</div>
    <div class="ps-legend">${legend}<span class="ps-mark">○ 미완료 · ✓ 완료</span></div>
  </div>`;
}

function loadScriptOnce(src, globalName) {
  if (window[globalName]) return Promise.resolve(window[globalName]);
  return new Promise((resolve, reject) => {
    const el = document.createElement('script');
    el.src = src;
    el.onload = () => (window[globalName] ? resolve(window[globalName]) : reject(new Error(globalName + ' 없음')));
    el.onerror = () => reject(new Error(src + ' 를 불러오지 못했어요'));
    document.head.appendChild(el);
  });
}

async function makeExportImage() {
  const job = {};
  S.ui.export = job;
  try {
    const h2c = await loadScriptOnce(new URL('./vendor/html2canvas-1.4.1.min.js', import.meta.url).href, 'html2canvas');
    if (document.fonts && document.fonts.ready) await document.fonts.ready;
    const el = document.querySelector('.print-host .print-sheet');
    if (!el || S.ui.export !== job) return;
    const canvas = await h2c(el, {
      scale: 2.5, // 약 2800 x 1985 px (인쇄용으로 충분한 해상도)
      useCORS: true,
      logging: false,
      backgroundColor: '#FFFFFF',
      windowWidth: SHEET_W + 100,
      windowHeight: SHEET_H + 100,
      scrollX: 0,
      scrollY: 0,
      onclone: (doc) => {
        const host = doc.querySelector('.print-host');
        if (host) host.classList.add('capturing');
      },
    });
    const blob = await new Promise((res) => canvas.toBlob(res, 'image/png'));
    if (S.ui.export !== job) return;
    if (!blob) throw new Error('이미지를 만들지 못했어요');
    job.blob = blob;
    job.url = URL.createObjectURL(blob);
  } catch (err) {
    console.error('[export]', err);
    job.error = '이미지를 만들지 못했어요. "인쇄 · PDF"로 저장해 보세요. (' + (err.message || err) + ')';
  }
  if (S.ui.modal === 'settings' && S.ui.setTab === 'export' && S.ui.export === job) render();
}

function viewLegend() {
  const items = S.data.subjects.map((s) => {
    const c = colorOf(s.id);
    return `<span class="lg"><span class="sw" style="background:${c[1]}"></span><span class="sw" style="background:${c[2]}"></span>${esc(s.name)}</span>`;
  }).join('');
  return `<footer class="legend">
    <span class="sub-text">Category1</span>${items}
    <span class="sub-text legend-help">옆으로 밀기 = 다음 달 · 칩 드래그 = 날짜 이동 · 순서 바꾸기 (터치는 길게 눌러서) · 동그라미 = 완료 · 왼쪽 칸 미완료 / 오른쪽 칸 완료</span>
  </footer>`;
}

// ---------------------------------------------------------------- 팝업

function viewModal() {
  const m = S.ui.modal;
  if (!m) return '';
  let inner = '';
  if (m === 'todo') inner = viewTodoModal();
  else if (m === 'settings') inner = viewSettingsModal();
  else if (m === 'account') inner = viewAccountModal();
  return `<div class="overlay${m === 'account' ? ' overlay-top' : ''}" data-act="overlay">${inner}</div>`;
}

function modalHead(title, closeAct) {
  return `<div class="modal-head"><h2>${title}</h2><button class="icon-btn" data-act="${closeAct || 'close-modal'}" aria-label="닫기">${ICON.close}</button></div>`;
}

function viewTodoModal() {
  const dr = S.ui.draft;
  const [, mm, dd] = dr.date.split('-').map(Number);
  const col = colorOf(dr.subjectId);
  const subjects = S.data.subjects.map((s) => {
    const c = colorOf(s.id);
    const on = dr.subjectId === s.id;
    return `<button class="pill" data-act="pick-subject" data-id="${s.id}" aria-pressed="${on}" style="background:${on ? c[2] : c[1]};border-color:${on ? c[2] : c[1]};color:${inkOn(on ? c[2] : c[1])}">${esc(s.name)}</button>`;
  }).join('') || '<span class="hint">등록된 과목이 없어요. 카테고리에서 과목을 추가하세요.</span>';

  let books;
  if (!dr.subjectId) {
    books = '<div class="notice">먼저 Category1에서 과목을 선택하면, 그 과목의 문제집만 보여요.</div>';
  } else {
    const list = S.data.books.filter((b) => b.subjectId === dr.subjectId);
    books = '<div class="row-wrap">' + list.map((b) => {
      const on = dr.bookId === b.id;
      return `<button class="tag-btn${on ? ' on' : ''}" data-act="pick-book" data-id="${b.id}" aria-pressed="${on}" style="${on ? `background:${col[1]};border-color:${col[2]};color:${inkOn(col[1])}` : ''}">${esc(b.name)}</button>`;
    }).join('') + (list.length ? '' : '<span class="hint">이 과목에 등록된 문제집이 없어요.</span>') +
      '<button class="link-btn" data-act="open-category-from-todo">+ 문제집 관리</button></div>';
  }

  const book = byId(S.data.books, dr.bookId);
  return `<div class="modal" role="dialog" aria-modal="true" aria-label="할 일">
    ${modalHead(`${mm}월 ${dd}일 · ${dr.id ? '할 일 수정' : '할 일 추가'}`)}
    <div class="modal-scroll">
      <div class="field-group">
        <label class="field-label" for="todo-date">날짜 (바꾸면 그 날짜로 이동)</label>
        <input id="todo-date" class="field" type="date" value="${dr.date}" data-input="draft-date" style="width:200px">
      </div>
      <div class="field-group">
        <span class="field-label">Category1 · 과목</span>
        <div class="row-wrap">${subjects}</div>
      </div>
      <div class="field-group">
        <span class="field-label">Category2 · 문제집</span>
        ${books}
      </div>
      <div class="field-group">
        <label class="field-label" for="todo-text">내용 · 범위</label>
        <input id="todo-text" class="field" value="${esc(dr.text)}" data-input="draft-text" placeholder="예: p.258 ~ 279 / 06단원 / 38~40번" maxlength="80" autocomplete="off">
      </div>
      <div class="preview-row">
        <span class="field-label">미리보기</span>
        <span class="preview-chip" style="background:${dr.done ? col[2] : col[1]};color:${inkOn(dr.done ? col[2] : col[1])}"><b>${esc(book ? book.name : '')}</b> <span data-preview-text>${esc(dr.text || (dr.subjectId ? '' : '과목을 선택하세요'))}</span></span>
        <span class="sp"></span>
        <button class="btn btn-sm" data-act="toggle-draft-done">${dr.done ? '완료 취소' : '완료로 표시'}</button>
      </div>
    </div>
    <div class="modal-foot">
      ${dr.id ? '<button class="btn danger" data-act="delete-todo" style="margin-right:auto">삭제</button>' : ''}
      <button class="btn" data-act="close-modal">취소</button>
      <button class="btn btn-primary" data-act="save-todo"${dr.subjectId ? '' : ' disabled title="과목을 먼저 선택하세요"'}>저장</button>
    </div>
  </div>`;
}

// ---------------------------------------------------------------- 환경설정

const SET_TABS = [
  ['exam', '시험일', 'exam'],
  ['category', '카테고리', 'tag'],
  ['style', '캘린더 스타일', 'layout'],
  ['color', '과목 색상', 'palette'],
  ['font', '글씨체', 'font'],
  ['display', '화면 표시', 'eye'],
  ['export', 'A4 저장 · 인쇄', 'printer'],
  ['contact', '관리자에게 문의', 'mail'],
];
const CONTACT_CATS = ['건의사항', '오류 신고', '질문', '기타'];
const PENDING_TABS = ['style', 'color', 'font', 'display'];

function pendingOf() {
  if (!S.ui.pending) {
    const st = settings();
    S.ui.pending = { styleId: st.styleId, prevStyle: st.prevStyle, themeId: st.themeId, fontId: st.fontId, showGoal: st.showGoal !== false, showAbbr: st.showAbbr !== false, sortBySubject: st.sortBySubject === true };
  }
  return S.ui.pending;
}

function pendingChanged() {
  const p = S.ui.pending;
  if (!p) return false;
  const st = settings();
  return p.styleId !== st.styleId || p.themeId !== st.themeId || p.fontId !== st.fontId || p.showGoal !== (st.showGoal !== false) || p.showAbbr !== (st.showAbbr !== false) || p.sortBySubject !== (st.sortBySubject === true);
}

function pickMark(isPending, isCurrent) {
  if (isPending && isCurrent) return '<em>사용 중</em>';
  if (isPending) return '<em class="em-new">선택됨</em>';
  if (isCurrent) return '<em class="em-old">지금 사용 중</em>';
  return '';
}

function viewSettingsModal() {
  const tab = S.ui.setTab || 'exam';
  const nav = SET_TABS.map(([id, name, icon]) => `<button class="set-tab${tab === id ? ' on' : ''}" role="tab" aria-selected="${tab === id}" data-act="set-tab" data-tab="${id}">${ICON[icon]}<span>${name}</span></button>`).join('');
  let body = '';
  if (tab === 'exam') body = examBody();
  else if (tab === 'category') body = categoryBody();
  else if (tab === 'style') body = styleBody();
  else if (tab === 'color') body = colorBody();
  else if (tab === 'font') body = fontBody();
  else if (tab === 'display') body = displayBody();
  else if (tab === 'contact') body = contactBody();
  else body = exportBody();

  let foot;
  if (tab === 'color' && S.ui.palEdit) {
    foot = `<span class="hint small">저장하면 내 팔레트에 추가돼요</span>
      <button class="btn" data-act="pal-cancel">취소</button>
      <button class="btn btn-primary" data-act="pal-save">팔레트 저장</button>`;
  } else if (PENDING_TABS.includes(tab)) {
    foot = `<span class="hint small">고른 다음 <b>설정</b>을 눌러야 적용돼요</span>
      <button class="btn" data-act="close-modal">취소</button>
      <button class="btn btn-primary" data-act="apply-settings"${pendingChanged() ? '' : ' disabled'}>설정</button>`;
  } else if (tab === 'contact') {
    const c = contactState();
    foot = `<span class="hint small">관리자만 볼 수 있어요</span>
      <button class="btn btn-primary" data-act="send-contact"${c.busy ? ' disabled' : ''}>${c.busy ? '보내는 중…' : '보내기'}</button>`;
  } else if (tab === 'export') {
    const ex = S.ui.export || {};
    foot = `<button class="btn" data-act="export-print">${ICON.printer}인쇄 · PDF</button>
      <button class="btn btn-primary" data-act="export-save"${ex.blob ? '' : ' disabled'}>이미지 저장</button>`;
  } else {
    foot = `<span class="hint small">바로 저장돼요</span><button class="btn btn-primary" data-act="close-modal">닫기</button>`;
  }
  const title = SET_TABS.find((t) => t[0] === tab)[1];
  return `<div class="modal modal-xl settings-modal" role="dialog" aria-modal="true" aria-label="환경설정">
    <div class="modal-head"><h2>환경설정 <span class="hint small">· ${title}</span></h2><button class="icon-btn" data-act="close-modal" aria-label="닫기">${ICON.close}</button></div>
    <div class="set-layout">
      <nav class="set-nav" role="tablist" aria-label="환경설정 메뉴">${nav}</nav>
      <div class="set-body modal-scroll">${body}</div>
    </div>
    <div class="modal-foot">${foot}</div>
  </div>`;
}

function examBody() {
  const today = todayKey();
  const rows = S.data.exams.slice().sort((a, b) => (a.date < b.date ? -1 : 1)).map((e) => {
    const diff = dayNum(e.date) - dayNum(today);
    return `<div class="exam-row${diff < 0 ? ' past' : ''}">
      <span class="exam-dday">${diff < 0 ? '종료' : ddayText(diff)}</span>
      <span class="exam-info"><span>${esc(e.name)}</span><span class="hint small">${dateLabel(e.date)}</span></span>
      <button class="icon-btn" data-act="delete-exam" data-id="${e.id}" aria-label="${esc(e.name)} 삭제">${ICON.x}</button>
    </div>`;
  }).join('') || '<div class="notice">아직 등록된 시험이 없어요. 아래에서 시험을 추가하면 캘린더에 D-day가 표시돼요.</div>';
  return `<p class="hint small" style="margin:0">캘린더의 각 날짜에는 그 날 이후 가장 가까운 시험의 D-day가 표시돼요.</p>
    <div class="exam-list">${rows}</div>
    <div class="exam-add">
      <div class="field-group grow"><label class="field-label" for="exam-name">시험 이름</label><input id="exam-name" class="field" data-enter="add-exam" placeholder="예: 2학기 기말고사" maxlength="30" autocomplete="off"></div>
      <div class="field-group"><label class="field-label" for="exam-date">날짜</label><input id="exam-date" class="field" type="date" data-enter="add-exam"></div>
      <button class="btn" data-act="add-exam">추가</button>
    </div>`;
}

function categoryBody() {
  const subId = S.ui.catSubject;
  const sub = byId(S.data.subjects, subId);
  const th = curTheme();
  const subjects = S.data.subjects.map((s) => {
    const c = colorOf(s.id);
    const n = S.data.books.filter((b) => b.subjectId === s.id).length;
    return `<div class="list-row${s.id === subId ? ' sel' : ''}">
      <button class="list-main" data-act="cat-select" data-id="${s.id}" aria-pressed="${s.id === subId}">
        <span class="sw" style="background:${c[1]}"></span><span class="sw sw-overlap" style="background:${c[2]}"></span>
        <span class="list-name">${esc(s.name)}</span><span class="hint small">문제집 ${n}</span>
      </button>
      <button class="icon-btn sm" data-act="rename-subject" data-id="${s.id}" aria-label="${esc(s.name)} 이름 바꾸기">${ICON.pencil}</button>
      <button class="icon-btn sm" data-act="delete-subject" data-id="${s.id}" aria-label="${esc(s.name)} 삭제">${ICON.x}</button>
    </div>`;
  }).join('') || '<span class="hint">아직 과목이 없어요.</span>';

  let right;
  if (!sub) {
    right = '<span class="hint">왼쪽에서 과목을 고르면, 그 과목의 문제집을 등록할 수 있어요.</span>';
  } else {
    const swatches = th.c.map((c, i) => `<button class="color-sw${sub.color % th.c.length === i ? ' on' : ''}" data-act="subject-color" data-i="${i}" style="background:${c[1]};border-color:${c[2]}" aria-label="${esc(c[0])} 색으로 바꾸기" title="${esc(c[0])}"></button>`).join('');
    const books = S.data.books.filter((b) => b.subjectId === sub.id).map((b) => `<div class="list-row book-row">
        <span class="list-name">${esc(b.name)}</span>
        <button class="icon-btn sm" data-act="rename-book" data-id="${b.id}" aria-label="${esc(b.name)} 이름 바꾸기">${ICON.pencil}</button>
        <button class="icon-btn sm" data-act="delete-book" data-id="${b.id}" aria-label="${esc(b.name)} 삭제">${ICON.x}</button>
      </div>`).join('') || '<span class="hint">아직 등록된 문제집이 없어요.</span>';
    right = `<div class="color-row"><span class="hint small">과목 색</span>${swatches}</div>${books}`;
  }
  const tint = sub ? colorOf(sub.id)[1] + (isNight() ? '22' : '55') : 'var(--soft)';
  return `<div class="cat-grid">
      <section class="cat-panel">
        <h3>Category1 <span class="hint small">과목 · 색은 과목 색상 테마에서 자동 지정</span></h3>
        <div class="cat-list">${subjects}</div>
        <div class="add-row">
          <input class="field" data-enter="add-subject" id="new-subject" placeholder="새 과목 (예: 한국사)" maxlength="20" aria-label="새 과목 이름" autocomplete="off">
          <button class="btn" data-act="add-subject">추가</button>
        </div>
      </section>
      <section class="cat-panel" style="background:${tint}">
        <h3>Category2 <span class="hint small">${sub ? esc(sub.name) + '의 문제집' : '과목을 먼저 선택하세요'}</span></h3>
        <div class="cat-list">${right}</div>
        <div class="add-row">
          <input class="field" data-enter="add-book" id="new-book" placeholder="새 문제집 (예: 마더텅)" maxlength="30" aria-label="새 문제집 이름" autocomplete="off"${sub ? '' : ' disabled'}>
          <button class="btn" data-act="add-book"${sub ? '' : ' disabled'}>추가</button>
        </div>
      </section>
    </div>`;
}

function styleBody() {
  const p = pendingOf();
  const th = findTheme(p.themeId) || curTheme();
  return '<div class="pick-grid cols-3">' + STYLES.map((s) => {
    let mini = '';
    for (let z = 0; z < 21; z++) {
      const col = z % 7;
      mini += `<span class="mini-cell" style="border-color:${s.line}"><span style="color:${col === 0 ? s.sun : col === 6 ? s.sat : s.ink}">${z + 3}</span><i style="background:${z % 3 === 0 ? tc(th, z)[2] : tc(th, z)[1]}"></i><i style="background:${z % 2 === 0 ? tc(th, z + 3)[1] : 'transparent'}"></i></span>`;
    }
    const on = p.styleId === s.id;
    return `<button class="pick-card${on ? ' on' : ''}" data-act="pick-style" data-id="${s.id}" aria-pressed="${on}">
      <span class="style-preview st-${s.id}" style="color:${s.ink}">
        <span class="sp-title">May <span>GOAL : 중간고사</span></span>
        <span class="mini-cal" style="border:${s.outer};border-radius:${s.radius}px;background:${s.cellBg}">${mini}</span>
      </span>
      <span class="pick-name">${esc(s.name)} <small>${esc(s.desc)}</small>${pickMark(on, settings().styleId === s.id)}</span>
    </button>`;
  }).join('') + '</div>';
}

function colorBody() {
  if (S.ui.palEdit) return paletteEditor();
  const p = pendingOf();
  const card = (t, custom) => {
    const on = p.themeId === t.id;
    const sw = t.c.map((c) => `<span class="swatch-pair" title="${esc(c[0])}"><i style="background:${c[1]}"></i><i style="background:${c[2]}"></i></span>`).join('');
    return `<div class="pick-card pal-card${on ? ' on' : ''}">
      <button class="pal-pick" data-act="pick-theme" data-id="${t.id}" aria-pressed="${on}">
        <span class="pick-name">${esc(t.name)} <small>${esc(t.desc)}</small>${pickMark(on, settings().themeId === t.id)}</span>
        <span class="swatch-row" style="grid-template-columns:repeat(${Math.max(10, t.c.length)}, minmax(0, 1fr))">${sw}</span>
      </button>
      ${custom ? `<div class="pal-tools"><button class="btn btn-sm" data-act="pal-edit" data-id="${t.id}">${ICON.pencil}편집</button><button class="btn btn-sm danger" data-act="pal-delete" data-id="${t.id}">삭제</button></div>`
        : `<div class="pal-tools"><button class="btn btn-sm" data-act="pal-copy" data-id="${t.id}">${ICON.plus}이 색으로 내 팔레트 만들기</button></div>`}
    </div>`;
  };
  const custom = allThemes().filter((t) => t.group === 'custom');
  return THEME_GROUPS.map((g) => {
    const list = g.id === 'custom' ? custom : THEMES.filter((t) => t.group === g.id);
    const add = g.id === 'custom' ? `<button class="pick-card pal-new" data-act="pal-new">${ICON.plus}<span>새 팔레트 만들기</span><small>색을 직접 골라 추가해요</small></button>` : '';
    return `<h3 class="pick-group">${esc(g.name)} <small>${esc(g.desc)}</small></h3><div class="pick-grid cols-4">${list.map((t) => card(t, g.id === 'custom')).join('')}${add}</div>`;
  }).join('');
}

function paletteEditor() {
  const ed = S.ui.palEdit;
  const presets = THEMES.map((t) => `<option value="${t.id}">${esc(t.name)} (${(THEME_GROUPS.find((g) => g.id === t.group) || {}).name || ''})</option>`).join('');
  const rows = ed.colors.map((c, i) => {
    const [light, deep] = makePair(c.hex);
    return `<div class="pal-row">
      <span class="pal-no">${i + 1}</span>
      <input type="color" class="pal-color" value="${esc(c.hex)}" data-input="pal-hex" data-i="${i}" aria-label="${i + 1}번 색 고르기">
      <input class="field pal-cname" value="${esc(c.name)}" data-input="pal-cname" data-i="${i}" placeholder="색 이름 (선택)" maxlength="12" aria-label="${i + 1}번 색 이름">
      <span class="pal-preview"><span style="background:${light};color:${inkOn(light)}">미완료</span><span style="background:${deep};color:${inkOn(deep)}">완료</span></span>
      <button class="icon-btn sm" data-act="pal-remove" data-i="${i}" aria-label="${i + 1}번 색 빼기"${ed.colors.length <= 1 ? ' disabled' : ''}>${ICON.x}</button>
    </div>`;
  }).join('');
  return `<div class="pal-editor">
    <div class="pal-top">
      <div class="field-group grow"><label class="field-label" for="pal-name">팔레트 이름</label><input id="pal-name" class="field" data-input="pal-name" value="${esc(ed.name)}" maxlength="20" placeholder="예: 내 시험기간 색"></div>
      <div class="field-group"><label class="field-label" for="pal-from">기존 테마 색 불러오기</label>
        <select id="pal-from" class="field" data-input="pal-from"><option value="">선택…</option>${presets}</select></div>
    </div>
    <p class="hint small" style="margin:0">색을 고르면 미완료(연한 색)와 완료(짙은 색)가 자동으로 만들어져요. 과목은 위에서부터 순서대로 색을 받아요.</p>
    <div class="pal-list">${rows}</div>
    <button class="btn pal-add" data-act="pal-add"${ed.colors.length >= 16 ? ' disabled' : ''}>${ICON.plus}색 추가 <small>(${ed.colors.length}/16)</small></button>
  </div>`;
}

function fontBody() {
  const p = pendingOf();
  const th = findTheme(p.themeId) || curTheme();
  return '<div class="pick-grid cols-2">' + FONTS.map((f) => {
    const on = p.fontId === f.id;
    const k = f.scale;
    return `<button class="pick-card font-card${on ? ' on' : ''}" data-act="pick-font" data-id="${f.id}" aria-pressed="${on}" style="font-family:${f.family}">
      <span class="pick-name" style="font-size:${Math.round(20 * k)}px">${esc(f.name)} <small style="font-size:${Math.round(12 * k)}px">${esc(f.desc)}</small>${pickMark(on, settings().fontId === f.id)}</span>
      <span style="font-size:${Math.round(22 * k)}px">May · GOAL : 1학기 중간고사 대비</span>
      <span class="row-wrap">
        <span style="font-size:${Math.round(16 * k)}px;font-weight:700">D-12</span>
        <span class="sample-chip" style="font-size:${Math.round(12 * k)}px;background:${tc(th, 0)[1]};color:${inkOn(tc(th, 0)[1])}"><b>쎈</b> 06단원</span>
        <span class="sample-chip" style="font-size:${Math.round(12 * k)}px;background:${tc(th, 1)[2]};color:${inkOn(tc(th, 1)[2])}"><b>RPM</b> p.109~119</span>
        <span class="sample-chip" style="font-size:${Math.round(12 * k)}px;background:${tc(th, 2)[1]};color:${inkOn(tc(th, 2)[1])}"><b>모의고사</b> 38~40번</span>
      </span>
    </button>`;
  }).join('') + '</div>';
}

function displayBody() {
  const p = pendingOf();
  const night = p.styleId === 'night';
  const sw = (act, on, title, desc) => `<button class="switch-row" data-act="${act}" role="switch" aria-checked="${on}">
      <span class="switch-text"><span>${title}</span><span class="hint small">${desc}</span></span>
      <span class="switch${on ? ' on' : ''}" aria-hidden="true"><i></i></span>
    </button>`;
  return `<div class="switch-list">
    ${sw('toggle-goal', p.showGoal, 'GOAL (이번 달 목표) 표시', '끄면 캘린더 위의 GOAL 칸과 인쇄용 A4에서 목표가 숨겨져요. 적어 둔 목표는 지워지지 않아요.')}
    ${sw('toggle-abbr', p.showAbbr, '과목 약자 표시', '할 일 앞에 (수) (영)처럼 과목 첫 글자를 붙여요. 약자는 환경설정 → 카테고리에서 과목 이름 옆 연필을 눌러 바꿀 수 있어요.')}
    ${sw('toggle-sort-subject', p.sortBySubject, '과목 순서대로 정렬', '하루 칸 안의 할 일을 카테고리의 과목 순서(국어 → 수학 → …)대로 모아서 보여 줘요. 같은 과목 안에서는 직접 끌어서 바꾼 순서를 따라요.')}
    ${sw('toggle-night', night, '나이트모드', '밤 공부용 어두운 화면 · 팝업까지 어두워져요. 끄면 원래 쓰던 캘린더 스타일로 돌아가요.')}
  </div>`;
}

function contactState() {
  if (!S.ui.contact) S.ui.contact = { category: CONTACT_CATS[0], message: '', email: S.user ? S.user.email : '', busy: false, done: '', error: '', list: null, listError: '' };
  return S.ui.contact;
}

async function loadContactList() {
  const c = contactState();
  if (!S.cloud || !S.user) return;
  try {
    c.list = await S.cloud.listFeedback();
    c.listError = '';
  } catch (err) {
    console.error('[feedback]', err);
    c.listError = '보낸 문의를 불러오지 못했어요.';
  }
  if (S.ui.modal === 'settings' && S.ui.setTab === 'contact') renderSoft();
}

function contactBody() {
  const c = contactState();
  const cats = CONTACT_CATS.map((k) => `<button class="btn btn-sm cat-chip${c.category === k ? ' on' : ''}" data-act="contact-cat" data-cat="${esc(k)}" aria-pressed="${c.category === k}">${esc(k)}</button>`).join('');
  let list = '';
  if (!S.user) {
    list = '<p class="hint small" style="margin:0">로그인하면 내가 보낸 문의와 관리자 답변을 여기에서 볼 수 있어요.</p>';
  } else if (c.listError) {
    list = `<p class="hint small" style="margin:0">${esc(c.listError)}</p>`;
  } else if (!c.list) {
    list = '<p class="hint small" style="margin:0">불러오는 중…</p>';
  } else if (!c.list.length) {
    list = '<p class="hint small" style="margin:0">아직 보낸 문의가 없어요.</p>';
  } else {
    list = c.list.map((f) => {
      const d = new Date(f.created_at);
      return `<div class="fb-row">
        <div class="fb-head"><span class="fb-cat">${esc(f.category)}</span><span class="hint small">${d.getFullYear()}.${pad(d.getMonth() + 1)}.${pad(d.getDate())}</span>
          <span class="fb-state${f.reply ? ' done' : ''}">${f.reply ? '답변 완료' : '답변 대기'}</span></div>
        <div class="fb-msg">${esc(f.message)}</div>
        ${f.reply ? `<div class="fb-reply"><b>관리자 답변</b>${esc(f.reply)}</div>` : ''}
      </div>`;
    }).join('');
  }
  return `<p class="hint" style="margin:0">건의사항, 불편한 점, 오류를 자유롭게 남겨 주세요. 관리자가 확인하고 답변을 달면 아래 <b>내가 보낸 문의</b>에서 볼 수 있어요.</p>
    <div class="field-group"><span class="field-label">종류</span><div class="row-wrap">${cats}</div></div>
    <div class="field-group">
      <label class="field-label" for="contact-msg">내용</label>
      <textarea id="contact-msg" class="field contact-text" data-input="contact-msg" maxlength="2000" rows="6" placeholder="예: 주간 보기도 있으면 좋겠어요 / 아이패드에서 드래그가 잘 안 돼요">${esc(c.message)}</textarea>
    </div>
    <div class="field-group">
      <label class="field-label" for="contact-email">답변 받을 이메일 (선택)</label>
      <input id="contact-email" class="field" type="email" data-input="contact-email" value="${esc(c.email)}" placeholder="name@email.com" autocomplete="email">
    </div>
    ${c.done ? `<div class="notice notice-ok">${esc(c.done)}</div>` : ''}
    ${c.error ? `<p class="error-text" style="text-align:left">${esc(c.error)}</p>` : ''}
    <div class="field-group"><span class="field-label">내가 보낸 문의</span>${list}</div>`;
}

function exportBody() {
  const { year: y, month: m } = S.ui;
  const ex = S.ui.export || {};
  const preview = ex.url
    ? `<img class="export-img" src="${ex.url}" alt="${y}년 ${m}월 A4 미리보기">`
    : `<div class="notice export-wait">${ex.error ? esc(ex.error) : 'A4 이미지를 만드는 중…'}</div>`;
  const mode = S.ui.exportMode === 'mono' ? 'mono' : 'color';
  const seg = [['color', '컬러'], ['mono', '글씨만 (흑백)']].map(([id, name]) => `<button class="tab${mode === id ? ' on' : ''}" role="tab" aria-selected="${mode === id}" data-act="export-mode" data-mode="${id}">${name}</button>`).join('');
  return `<div class="tabs export-tabs" role="tablist">${seg}</div>
    ${preview}
    <p class="hint small" style="margin:0">${mode === 'mono' ? '형광펜(색 배경) 없이 글씨만 흑백으로 뽑아요. 과목은 (수) (영)처럼 약자로 구분돼요. ' : ''}${y}년 ${m}월을 A4 가로 한 장으로 만들어요. 칸에 다 안 들어가는 할 일은 "+N개 더"로 표시돼요.${isNight() ? ' 나이트모드는 잉크 절약을 위해 흰 배경으로 저장돼요.' : ''}</p>`;
}

function viewAccountModal() {
  const user = S.user;
  const devices = Object.entries(S.data.devices || {}).sort((a, b) => (b[1].lastSeen || 0) - (a[1].lastSeen || 0)).map(([id, d]) =>
    `<div class="device-row"><span>${id === deviceId() ? '이 기기 · ' : ''}${esc(d.name)}</span><span class="hint small">${id === deviceId() ? '지금 사용 중' : relTime(d.lastSeen)}</span></div>`).join('');
  const cloud = S.mode === 'cloud' && user;
  return `<div class="modal modal-sm" role="dialog" aria-modal="true" aria-label="계정">
    <div class="account-head">
      ${avatar(user || { name: '이 기기' }, user ? (user.name || 'M').charAt(0).toUpperCase() : '·', 'avatar-lg')}
      <span class="account-info"><span>${esc(user ? user.name : '로그인 없이 사용 중')}</span><span class="hint small">${esc(user ? user.email : '데이터가 이 브라우저에만 저장돼요')}</span></span>
      <button class="icon-btn" data-act="close-modal" aria-label="닫기">${ICON.close}</button>
    </div>
    <div class="sync-box">
      <span class="sync-line"><span class="sync-dot" data-sync-dot style="background:${syncDot()}"></span><span data-sync-text="long">${esc(syncLabel(false))}</span></span>
      <span class="hint small">${cloud ? '할 일, 카테고리, 시험일, 테마 설정이 모든 기기에 자동 저장돼요.' : 'Supabase를 설정하면 이메일 로그인으로 여러 기기에서 같은 플래너를 쓸 수 있어요.'}</span>
      ${cloud ? '<button class="btn" data-act="sync-now">지금 동기화</button>' : ''}
    </div>
    ${cloud && devices ? `<div class="field-group"><span class="field-label">로그인된 기기</span>${devices}</div>` : ''}
    <div class="field-group">
      <span class="field-label">백업</span>
      <div class="row-wrap">
        <button class="btn btn-sm" data-act="export">백업 파일 저장</button>
        <label class="btn btn-sm file-btn">백업 불러오기<input type="file" accept="application/json,.json" data-input="import" hidden></label>
      </div>
    </div>
    ${cloud ? '<button class="btn danger" data-act="logout">로그아웃</button>' : ''}
    ${S.mode === 'cloud' && !user ? '<button class="btn btn-primary" data-act="go-login">로그인해서 동기화하기</button>' : ''}
  </div>`;
}

// ---------------------------------------------------------------- 동작

function openModal(name, extra) {
  Object.assign(S.ui, { modal: name }, extra || {});
  render();
  const first = document.querySelector('.modal [autofocus]');
  if (first) first.focus();
}

function openSettings(tab, opts) {
  const o = opts || {};
  S.ui.palEdit = null;
  if (!o.keepPending) S.ui.pending = null;
  const extra = { setTab: tab };
  if ('returnToTodo' in o) extra.returnToTodo = o.returnToTodo;
  if (o.catSubject) extra.catSubject = o.catSubject;
  if (tab === 'category' && !S.ui.catSubject && !o.catSubject) extra.catSubject = S.data.subjects[0] ? S.data.subjects[0].id : null;
  if (tab === 'export') extra.export = {};
  openModal('settings', extra);
  if (tab === 'export') setTimeout(makeExportImage, 30);
  if (tab === 'contact') { contactState().done = ''; contactState().error = ''; loadContactList(); }
}

function closeModal() {
  if (S.ui.export && S.ui.export.url) URL.revokeObjectURL(S.ui.export.url);
  S.ui.export = null;
  S.ui.pending = null;
  S.ui.palEdit = null;
  S.ui.modal = null;
  S.ui.draft = null;
  render();
}

const actions = {
  login: async () => {
    const f = readLoginForm();
    if (!f) return;
    await loginTask(async () => { await S.cloud.signIn(f.email, f.pw); }, (err) =>
      /invalid login|credentials/i.test(err.message || '') ? '이메일 또는 비밀번호가 맞지 않아요.'
        : /not confirmed/i.test(err.message || '') ? '가입 확인 메일의 링크를 먼저 눌러 주세요. (스팸함도 확인)'
          : '로그인하지 못했어요. (' + (err.message || err) + ')');
  },
  signup: async () => {
    const f = readLoginForm();
    if (!f) return;
    const pw2 = document.getElementById('login-pw2');
    if (f.pw.length < 6) { S.loginError = '비밀번호는 6자 이상으로 해 주세요.'; render(); return; }
    if (pw2 && pw2.value !== f.pw) { S.loginError = '비밀번호 확인이 달라요.'; render(); return; }
    await loginTask(async () => {
      const loggedIn = await S.cloud.signUp(f.email, f.pw);
      if (!loggedIn) S.login = { mode: 'login', email: f.email, busy: false, info: '가입 확인 메일을 보냈어요. 메일의 링크를 누른 뒤 여기서 로그인하세요.' };
    }, (err) => /already/i.test(err.message || '') ? '이미 가입된 이메일이에요. 로그인 탭에서 로그인하세요.'
      : '가입하지 못했어요. (' + (err.message || err) + ')');
  },
  reload: () => location.reload(),
  'go-login': () => {
    S.offline = false;
    try { localStorage.removeItem(OFFLINE_KEY); } catch (e) { /* 무시 */ }
    S.ui.modal = null;
    S.phase = 'login';
    S.loginError = S.cloud ? '' : '동기화 서버에 아직 연결되지 않았어요. 새로고침 후 다시 시도해 주세요.';
    render();
  },
  'login-mode': (el) => { S.login = { mode: el.dataset.mode, email: currentEmail(), busy: false, info: '' }; S.loginError = ''; render(); },
  'forgot-pw': async () => {
    const email = currentEmail();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { S.loginError = '위에 이메일을 먼저 입력해 주세요.'; render(); return; }
    await loginTask(async () => {
      await S.cloud.sendPasswordReset(email);
      S.login.info = '비밀번호 재설정 메일을 보냈어요. 메일의 링크를 이 기기에서 눌러 주세요.';
    }, (err) => '메일을 보내지 못했어요. (' + (err.message || err) + ')');
  },
  'start-local': () => {
    if (S.mode === 'cloud') {
      // 서버 설정은 돼 있지만 지금은 로그인 없이 이 기기에만 저장 (나중에 첫 로그인 때 계정으로 옮겨짐)
      S.offline = true;
      try { localStorage.setItem(OFFLINE_KEY, '1'); } catch (e) { /* 무시 */ }
      S.scope = 'local';
      S.data = loadLocal('local') || S.data;
      applyTheme();
      S.phase = 'app';
      render();
      return;
    }
    try { localStorage.setItem(LOCAL_STARTED_KEY, '1'); } catch (e) { /* 무시 */ }
    S.phase = 'app';
    render();
  },
  logout: async () => {
    if (!confirm('로그아웃할까요? 이 기기에 저장된 사본은 다음 로그인 때 다시 동기화돼요.')) return;
    S.ui.modal = null;
    await S.cloud.signOut();
  },
  'sync-now': () => scheduleCloudSave(0),
  'contact-cat': (el) => { contactState().category = el.dataset.cat; render(); },
  'send-contact': async () => {
    const c = contactState();
    const message = (c.message || '').trim();
    if (message.length < 2) { c.error = '내용을 적어 주세요.'; c.done = ''; render(); return; }
    if (!S.cloud) { c.error = '지금은 서버에 연결되어 있지 않아서 보낼 수 없어요. 인터넷 연결을 확인한 뒤 새로고침해 주세요.'; render(); return; }
    c.busy = true; c.error = ''; c.done = '';
    render();
    try {
      await S.cloud.sendFeedback({ category: c.category, message, email: (c.email || '').trim() || null, device: deviceName() });
      c.message = '';
      c.done = '보냈어요! 소중한 의견 고마워요.';
      loadContactList();
    } catch (err) {
      console.error('[feedback]', err);
      c.error = /relation|does not exist|schema cache/i.test(err.message || '')
        ? '문의 기능이 아직 서버에 준비되지 않았어요. (관리자: supabase.sql의 5번을 실행해 주세요)'
        : '보내지 못했어요. 잠시 후 다시 시도해 주세요. (' + (err.message || err) + ')';
    }
    c.busy = false;
    render();
  },
  'sel-date': (el) => { S.ui.selDate = el.dataset.date; render(); },
  'prev-month': () => shiftMonth(-1),
  'next-month': () => shiftMonth(1),
  'prev-year': () => { S.ui.year -= 1; render(); },
  'next-year': () => { S.ui.year += 1; render(); },
  'go-month': (el) => { S.ui.month = Number(el.dataset.m); render(); },
  refresh: async () => {
    // 홈 화면 앱처럼 주소창이 없을 때를 위한 새로고침: 저장된 사본 대신 최신 파일을 다시 받아옴
    const btn = document.querySelector('.refresh-btn');
    if (btn) btn.disabled = true;
    const files = ['./', 'index.html', 'css/style.css', 'js/app.js', 'js/data.js', 'js/store.js', 'js/cloud.js', 'js/config.js'];
    try {
      await Promise.all(files.map((f) => fetch(new URL('../' + f, import.meta.url), { cache: 'reload' }).catch(() => null)));
    } catch (e) { /* 무시 */ }
    location.reload();
  },
  'go-today': () => { const t = new Date(); S.ui.year = t.getFullYear(); S.ui.month = t.getMonth() + 1; render(); },
  'open-add': (el) => openModal('todo', { draft: { id: null, date: el.dataset.date, subjectId: null, bookId: null, text: '', done: false } }),
  'open-todo': (el) => {
    const t = byId(S.data.todos, el.dataset.id);
    if (t) openModal('todo', { draft: { ...t } });
  },
  'toggle-done': (el) => {
    const t = byId(S.data.todos, el.dataset.id);
    if (!t) return;
    t.done = !t.done;
    commit();
  },
  'pick-subject': (el) => {
    const dr = S.ui.draft;
    if (dr.subjectId !== el.dataset.id) { dr.subjectId = el.dataset.id; dr.bookId = null; }
    render();
  },
  'pick-book': (el) => {
    const dr = S.ui.draft;
    dr.bookId = dr.bookId === el.dataset.id ? null : el.dataset.id;
    render();
  },
  'toggle-draft-done': () => { S.ui.draft.done = !S.ui.draft.done; render(); },
  'save-todo': () => {
    const dr = S.ui.draft;
    if (!dr || !dr.subjectId) return;
    const clean = { id: dr.id || newId('t'), date: dr.date, subjectId: dr.subjectId, bookId: dr.bookId || null, text: (dr.text || '').trim(), done: !!dr.done, order: dr.order || Date.now() };
    const i = S.data.todos.findIndex((t) => t.id === clean.id);
    if (i >= 0) {
      const moved = S.data.todos[i].date !== clean.date;
      if (moved) { clean.order = Date.now(); S.data.todos.splice(i, 1); S.data.todos.push(clean); } else S.data.todos[i] = clean;
    } else {
      S.data.todos.push(clean);
    }
    S.ui.modal = null;
    S.ui.draft = null;
    commit();
  },
  'delete-todo': () => {
    const id = S.ui.draft && S.ui.draft.id;
    if (!id || !confirm('이 할 일을 삭제할까요?')) return;
    S.data.todos = S.data.todos.filter((t) => t.id !== id);
    S.ui.modal = null;
    S.ui.draft = null;
    commit();
  },
  'open-settings': (el) => openSettings((el && el.dataset.tab) || S.ui.setTab || 'exam'),
  'set-tab': (el) => openSettings(el.dataset.tab, { keepPending: true }),
  'open-category-from-todo': () => openSettings('category', { returnToTodo: true, catSubject: S.ui.draft.subjectId }),
  'apply-settings': () => {
    const p = S.ui.pending;
    if (!p) return;
    const st = settings();
    st.styleId = p.styleId;
    if (p.styleId !== 'night') st.prevStyle = p.styleId;
    else if (p.prevStyle && p.prevStyle !== 'night') st.prevStyle = p.prevStyle;
    st.themeId = p.themeId;
    st.fontId = p.fontId;
    st.showGoal = p.showGoal;
    st.showAbbr = p.showAbbr;
    st.sortBySubject = p.sortBySubject;
    applyTheme();
    S.ui.pending = null;
    S.ui.modal = null;
    commit();
  },
  'cat-select': (el) => { S.ui.catSubject = el.dataset.id; render(); },
  'add-subject': () => {
    const input = document.getElementById('new-subject');
    const name = input.value.trim();
    if (!name) { input.focus(); return; }
    const n = curTheme().c.length;
    const used = new Set(S.data.subjects.map((s) => s.color % n));
    let color = 0;
    while (used.has(color) && color < n) color++;
    if (color === n) color = S.data.subjects.length % n;
    const s = { id: newId('s'), name, color, order: Date.now() };
    S.data.subjects.push(s);
    S.ui.catSubject = s.id;
    commit();
    const again = document.getElementById('new-subject');
    if (again) again.focus();
  },
  'rename-subject': (el) => {
    const s = byId(S.data.subjects, el.dataset.id);
    const name = s && prompt('과목 이름', s.name);
    if (!name || !name.trim()) return;
    s.name = name.trim();
    const ab = prompt('할 일 앞에 붙는 과목 약자 (비워 두면 첫 글자)', s.abbr || '');
    if (ab !== null) {
      const v = ab.trim().replace(/[()]/g, '').slice(0, 3);
      if (v) s.abbr = v; else delete s.abbr;
    }
    commit();
  },
  'delete-subject': (el) => {
    const s = byId(S.data.subjects, el.dataset.id);
    if (!s) return;
    const nTodo = S.data.todos.filter((t) => t.subjectId === s.id).length;
    const msg = `'${s.name}' 과목을 삭제할까요?\n이 과목의 문제집도 함께 삭제돼요.` + (nTodo ? `\n이 과목으로 등록된 할 일 ${nTodo}개도 함께 삭제돼요.` : '');
    if (!confirm(msg)) return;
    S.data.subjects = S.data.subjects.filter((x) => x.id !== s.id);
    S.data.books = S.data.books.filter((b) => b.subjectId !== s.id);
    S.data.todos = S.data.todos.filter((t) => t.subjectId !== s.id);
    if (S.ui.catSubject === s.id) S.ui.catSubject = S.data.subjects[0] ? S.data.subjects[0].id : null;
    if (S.ui.draft && S.ui.draft.subjectId === s.id) { S.ui.draft.subjectId = null; S.ui.draft.bookId = null; }
    commit();
  },
  'subject-color': (el) => {
    const s = byId(S.data.subjects, S.ui.catSubject);
    if (!s) return;
    s.color = Number(el.dataset.i);
    commit();
  },
  'add-book': () => {
    const input = document.getElementById('new-book');
    const name = input.value.trim();
    if (!name || !S.ui.catSubject) { input.focus(); return; }
    S.data.books.push({ id: newId('b'), subjectId: S.ui.catSubject, name, order: Date.now() });
    commit();
    const again = document.getElementById('new-book');
    if (again) again.focus();
  },
  'rename-book': (el) => {
    const b = byId(S.data.books, el.dataset.id);
    const name = b && prompt('문제집 이름', b.name);
    if (!name || !name.trim()) return;
    b.name = name.trim();
    commit();
  },
  'delete-book': (el) => {
    const b = byId(S.data.books, el.dataset.id);
    if (!b || !confirm(`'${b.name}' 문제집을 삭제할까요?\n이 문제집으로 등록된 할 일은 과목만 남아요.`)) return;
    S.data.books = S.data.books.filter((x) => x.id !== b.id);
    S.data.todos.forEach((t) => { if (t.bookId === b.id) t.bookId = null; });
    if (S.ui.draft && S.ui.draft.bookId === b.id) S.ui.draft.bookId = null;
    commit();
  },
  'pick-style': (el) => {
    const p = pendingOf();
    if (el.dataset.id !== 'night') p.prevStyle = el.dataset.id;
    p.styleId = el.dataset.id;
    render();
  },
  'pick-theme': (el) => { pendingOf().themeId = el.dataset.id; render(); },
  'pick-font': (el) => { pendingOf().fontId = el.dataset.id; render(); },
  'pal-new': () => {
    const th = findTheme(pendingOf().themeId) || curTheme();
    S.ui.palEdit = { id: null, name: '', colors: th.base.slice(0, 10).map((hex, i) => ({ name: th.c[i][0], hex })) };
    render();
  },
  'pal-copy': (el) => {
    const th = findTheme(el.dataset.id);
    if (!th) return;
    S.ui.palEdit = { id: null, name: th.name + ' (내 팔레트)', colors: th.base.map((hex, i) => ({ name: th.c[i][0], hex })) };
    render();
  },
  'pal-edit': (el) => {
    const pal = customPalettes().find((x) => x.id === el.dataset.id);
    if (!pal) return;
    S.ui.palEdit = JSON.parse(JSON.stringify(pal));
    render();
  },
  'pal-add': () => {
    const ed = S.ui.palEdit;
    if (!ed || ed.colors.length >= 16) return;
    const last = ed.colors[ed.colors.length - 1];
    const seed = ['#F5A9A9', '#F9C99B', '#F7E08E', '#BCE2A8', '#A9D3F0', '#AEB9EC', '#CDB6EC', '#F5B9D6'];
    ed.colors.push({ name: '', hex: seed[ed.colors.length % seed.length] === (last && last.hex) ? '#C9C9C9' : seed[ed.colors.length % seed.length] });
    render();
    const list = document.querySelector('.pal-list');
    if (list) list.lastElementChild.scrollIntoView({ block: 'nearest' });
  },
  'pal-remove': (el) => {
    const ed = S.ui.palEdit;
    if (!ed || ed.colors.length <= 1) return;
    ed.colors.splice(Number(el.dataset.i), 1);
    render();
  },
  'pal-cancel': () => { S.ui.palEdit = null; render(); },
  'pal-save': () => {
    const ed = S.ui.palEdit;
    if (!ed) return;
    const list = customPalettes();
    const name = (ed.name || '').trim() || '내 팔레트 ' + (list.length + 1);
    const pal = { id: ed.id || newId('pal'), name, colors: ed.colors.map((c) => ({ name: (c.name || '').trim(), hex: c.hex })) };
    const i = list.findIndex((x) => x.id === pal.id);
    if (i >= 0) list[i] = pal; else list.push(pal);
    saveCustomPalettes(list);
    S.ui.palEdit = null;
    pendingOf().themeId = pal.id; // 바로 골라 둠 → "설정"을 누르면 적용
    if (settings().themeId === pal.id) applyTheme();
    commit();
  },
  'pal-delete': (el) => {
    const pal = customPalettes().find((x) => x.id === el.dataset.id);
    if (!pal || !confirm(`'${pal.name}' 팔레트를 삭제할까요?`)) return;
    saveCustomPalettes(customPalettes().filter((x) => x.id !== pal.id));
    if (settings().themeId === pal.id) settings().themeId = 'rb-pastel';
    if (S.ui.pending && S.ui.pending.themeId === pal.id) S.ui.pending.themeId = settings().themeId;
    applyTheme();
    commit();
  },
  'toggle-abbr': () => { const p = pendingOf(); p.showAbbr = !p.showAbbr; render(); },
  'toggle-sort-subject': () => { const p = pendingOf(); p.sortBySubject = !p.sortBySubject; render(); },
  'toggle-goal': () => { const p = pendingOf(); p.showGoal = !p.showGoal; render(); },
  'toggle-night': () => {
    if (S.phase !== 'app') {
      // 로그인 화면의 나이트모드 버튼: 바로 적용
      const st = settings();
      if (st.styleId === 'night') st.styleId = st.prevStyle && st.prevStyle !== 'night' ? st.prevStyle : 'grid';
      else { st.prevStyle = st.styleId; st.styleId = 'night'; }
      applyTheme();
      saveLocal('last', S.data);
      render();
      return;
    }
    const p = pendingOf();
    if (p.styleId === 'night') p.styleId = p.prevStyle && p.prevStyle !== 'night' ? p.prevStyle : 'grid';
    else { p.prevStyle = p.styleId; p.styleId = 'night'; }
    render();
  },
  'add-exam': () => {
    const name = document.getElementById('exam-name');
    const date = document.getElementById('exam-date');
    if (!name.value.trim()) { name.focus(); return; }
    if (!date.value) { date.focus(); return; }
    S.data.exams.push({ id: newId('e'), name: name.value.trim(), date: date.value });
    commit();
  },
  'delete-exam': (el) => {
    const e = byId(S.data.exams, el.dataset.id);
    if (!e || !confirm(`'${e.name}'을(를) 삭제할까요?`)) return;
    S.data.exams = S.data.exams.filter((x) => x.id !== e.id);
    commit();
  },
  'open-account': () => openModal('account'),
  'export-mode': (el) => {
    if (S.ui.exportMode === el.dataset.mode) return;
    S.ui.exportMode = el.dataset.mode;
    if (S.ui.export && S.ui.export.url) URL.revokeObjectURL(S.ui.export.url);
    S.ui.export = {};
    render();
    setTimeout(makeExportImage, 30);
  },
  'export-print': () => window.print(),
  'export-save': async () => {
    const ex = S.ui.export;
    if (!ex || !ex.blob) return;
    const name = `exam-monthly-${S.ui.year}-${pad(S.ui.month)}${S.ui.exportMode === 'mono' ? '-text' : ''}.png`;
    // 아이패드 · 폰: 공유 창에서 "이미지 저장"으로 사진 앱에 저장
    try {
      const file = new File([ex.blob], name, { type: 'image/png' });
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({ files: [file], title: name });
        return;
      }
    } catch (err) {
      if (err && err.name === 'AbortError') return;
    }
    const a = document.createElement('a');
    a.href = ex.url;
    a.download = name;
    document.body.appendChild(a);
    a.click();
    a.remove();
  },
  export: () => {
    const blob = new Blob([JSON.stringify(toPlain(S.data), null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `exam-monthly-backup-${todayKey()}.json`;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 0);
  },
  'close-modal': () => {
    if (S.ui.modal === 'settings' && S.ui.returnToTodo && S.ui.draft) {
      S.ui.modal = 'todo';
      S.ui.returnToTodo = false;
      S.ui.pending = null;
      render();
      return;
    }
    closeModal();
  },
  overlay: (el, e) => { if (e.target === el) actions['close-modal'](); },
};

function currentEmail() {
  const el = document.getElementById('login-email');
  return (el ? el.value : S.login.email).trim();
}

function readLoginForm() {
  const email = currentEmail();
  const pwEl = document.getElementById('login-pw');
  const pw = pwEl ? pwEl.value : '';
  S.login.email = email;
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { S.loginError = '이메일 주소를 확인해 주세요.'; render(); return null; }
  if (!pw) { S.loginError = '비밀번호를 입력해 주세요.'; render(); return null; }
  if (!S.cloud) { S.loginError = '서버에 연결하는 중이에요. 잠시 후 다시 눌러 주세요.'; render(); return null; }
  return { email, pw };
}

async function loginTask(fn, message) {
  S.loginError = '';
  S.login.info = '';
  S.login.busy = true;
  render();
  try {
    await fn();
  } catch (err) {
    console.error(err);
    S.loginError = /fetch|network|load failed/i.test(err.message || '')
      ? '서버에 연결할 수 없어요. (Supabase 장애이거나 인터넷 문제) 잠시 후 다시 시도하거나, 로그인 없이 먼저 써 두세요.'
      : message(err);
  }
  S.login.busy = false;
  if (S.phase === 'login') render();
}

// 비밀번호 재설정 메일 링크로 들어왔을 때
async function onRecovery() {
  const pw = prompt('새 비밀번호를 입력하세요 (6자 이상)');
  if (!pw) return;
  if (pw.length < 6) { alert('비밀번호는 6자 이상이어야 해요. 재설정 메일을 다시 받아 주세요.'); return; }
  try {
    await S.cloud.updatePassword(pw);
    alert('비밀번호를 바꿨어요.');
  } catch (err) {
    alert('비밀번호를 바꾸지 못했어요: ' + (err.message || err));
  }
}

async function importBackup(file) {
  try {
    const parsed = JSON.parse(await file.text());
    if (!parsed || !Array.isArray(parsed.todos) || !Array.isArray(parsed.subjects)) throw new Error('형식이 맞지 않아요');
    if (!confirm('백업 파일로 지금 데이터를 모두 바꿀까요?')) return;
    const devices = S.data.devices;
    S.data = normalize(parsed);
    S.data.devices = devices;
    applyTheme();
    commit();
  } catch (err) {
    alert('백업 파일을 불러오지 못했어요: ' + err.message);
  }
}

// ---------------------------------------------------------------- 이벤트

let suppressClick = false;
let lastDragEnd = 0;

// 다음 달 / 이전 달로 넘기기 (연도도 함께 넘어감)
function shiftMonth(delta) {
  let m = S.ui.month + delta;
  let y = S.ui.year;
  if (m > 12) { m = 1; y += 1; }
  if (m < 1) { m = 12; y -= 1; }
  S.ui.month = m;
  S.ui.year = y;
  S.ui.slide = delta > 0 ? 'next' : 'prev';
  render();
  S.ui.slide = null;
}

// 캘린더를 옆으로 쓸면 달 넘기기
function bindSwipe() {
  let start = null;
  document.addEventListener('touchstart', (e) => {
    const sc = e.target.closest && e.target.closest('.cal-scroll');
    if (!sc || S.ui.modal || e.touches.length !== 1) { start = null; return; }
    const t = e.touches[0];
    start = { x: t.clientX, y: t.clientY, at: Date.now(), sc, left: sc.scrollLeft };
  }, { passive: true });
  document.addEventListener('touchend', (e) => {
    if (!start) return;
    const s0 = start;
    start = null;
    const t = e.changedTouches[0];
    const dx = t.clientX - s0.x;
    const dy = t.clientY - s0.y;
    if (document.body.classList.contains('is-dragging') || Date.now() - lastDragEnd < 400) return;
    if (Math.abs(dx) < 70 || Math.abs(dy) > Math.abs(dx) * 0.6 || Date.now() - s0.at > 900) return;
    // 좁은 화면에서 캘린더가 옆으로 스크롤될 때는, 끝까지 간 상태에서 한 번 더 밀어야 넘어감
    const sc = s0.sc;
    if (sc.scrollWidth > sc.clientWidth + 2) {
      if (Math.abs(sc.scrollLeft - s0.left) > 2) return;
      const atEnd = sc.scrollLeft + sc.clientWidth >= sc.scrollWidth - 2;
      const atStart = sc.scrollLeft <= 2;
      if ((dx < 0 && !atEnd) || (dx > 0 && !atStart)) return;
    }
    shiftMonth(dx < 0 ? 1 : -1);
  }, { passive: true });
}

function bindEvents() {
  document.addEventListener('click', (e) => {
    if (suppressClick) { e.preventDefault(); e.stopPropagation(); return; }
    const el = e.target.closest('[data-act]');
    if (!el || !$app.contains(el) || el.disabled) return;
    const fn = actions[el.dataset.act];
    if (fn) fn(el, e);
  }, true);

  document.addEventListener('input', (e) => {
    const el = e.target;
    const kind = el.dataset && el.dataset.input;
    if (kind === 'title') {
      S.data.titles[S.ui.year + '-' + S.ui.month] = el.value;
      commit({ render: false });
    } else if (kind === 'pal-name' && S.ui.palEdit) {
      S.ui.palEdit.name = el.value;
    } else if (kind === 'pal-cname' && S.ui.palEdit) {
      S.ui.palEdit.colors[Number(el.dataset.i)].name = el.value;
    } else if (kind === 'pal-hex' && S.ui.palEdit) {
      S.ui.palEdit.colors[Number(el.dataset.i)].hex = el.value;
      const row = el.closest('.pal-row');
      const [light, deep] = makePair(el.value);
      const spans = row ? row.querySelectorAll('.pal-preview span') : [];
      if (spans[0]) { spans[0].style.background = light; spans[0].style.color = inkOn(light); }
      if (spans[1]) { spans[1].style.background = deep; spans[1].style.color = inkOn(deep); }
    } else if (kind === 'contact-msg') {
      contactState().message = el.value;
    } else if (kind === 'contact-email') {
      contactState().email = el.value;
    } else if (kind === 'draft-text' && S.ui.draft) {
      S.ui.draft.text = el.value;
      const p = document.querySelector('[data-preview-text]');
      if (p) p.textContent = el.value || (S.ui.draft.subjectId ? '' : '과목을 선택하세요');
    }
  });

  document.addEventListener('change', (e) => {
    const el = e.target;
    const kind = el.dataset && el.dataset.input;
    if (kind === 'draft-date' && S.ui.draft && el.value) { S.ui.draft.date = el.value; render(); }
    if (kind === 'pal-from' && S.ui.palEdit && el.value) {
      const th = findTheme(el.value);
      if (th) { S.ui.palEdit.colors = th.base.map((hex, i) => ({ name: th.c[i][0], hex })); render(); }
    }
    if (kind === 'import' && el.files && el.files[0]) importBackup(el.files[0]);
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && S.ui.modal) { actions['close-modal'](); return; }
    const typing = e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA');
    if (S.phase === 'app' && !S.ui.modal && !typing && (e.key === 'ArrowLeft' || e.key === 'ArrowRight')) {
      shiftMonth(e.key === 'ArrowRight' ? 1 : -1);
      return;
    }
    if (e.key === 'Enter' && !e.isComposing) {
      const el = e.target;
      if (el.dataset && el.dataset.enter) { e.preventDefault(); actions[el.dataset.enter](el, e); }
      else if (el.id === 'todo-text') { e.preventDefault(); actions['save-todo'](); }
      else if (el.dataset && el.dataset.input === 'title') el.blur();
    }
  });

  document.addEventListener('focusout', () => {
    setTimeout(() => {
      const a = document.activeElement;
      if (S.pendingRender && !(a && (a.tagName === 'INPUT' || a.tagName === 'TEXTAREA'))) render();
    }, 0);
  });

  bindDrag();
  bindSwipe();
  let resizeTimer = null;
  window.addEventListener('resize', () => { clearTimeout(resizeTimer); resizeTimer = setTimeout(fitCalendar, 120); });
  const onMq = () => { if (S.phase === 'app') renderSoft(); };
  if (COMPACT_MQ.addEventListener) COMPACT_MQ.addEventListener('change', onMq); else COMPACT_MQ.addListener(onMq);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(fitCalendar);
}

// 드래그로 날짜 이동: 마우스는 바로, 터치는 길게 눌러서 시작
function bindDrag() {
  let drag = null;
  const LONG_PRESS = 350;
  const MOVE_TOL = 8;

  const cleanup = () => {
    if (!drag) return;
    clearTimeout(drag.timer);
    if (drag.ghost) drag.ghost.remove();
    if (drag.chip) drag.chip.classList.remove('dragging');
    document.querySelectorAll('.cell.drop').forEach((c) => c.classList.remove('drop'));
    clearMark();
    document.body.classList.remove('is-dragging');
    drag = null;
  };

  const clearMark = () => document.querySelectorAll('.chip.drop-before, .chip.drop-after').forEach((c) => c.classList.remove('drop-before', 'drop-after'));

  // 놓을 칸 안에서 몇 번째 자리에 들어갈지 (끌고 있는 칩은 빼고 셈)
  const placeIn = (target, y) => {
    clearMark();
    const chips = target ? [...target.querySelectorAll('.chip')].filter((c) => c !== drag.chip) : [];
    let index = chips.findIndex((c) => { const r = c.getBoundingClientRect(); return y < r.top + r.height / 2; });
    if (index < 0) index = chips.length;
    if (chips.length) chips[Math.min(index, chips.length - 1)].classList.add(index < chips.length ? 'drop-before' : 'drop-after');
    drag.index = index;
    drag.others = chips.map((c) => c.dataset.id);
  };

  const start = () => {
    const r = drag.chip.getBoundingClientRect();
    const ghost = drag.chip.cloneNode(true);
    ghost.classList.add('drag-ghost');
    ghost.style.width = r.width + 'px';
    document.body.appendChild(ghost);
    drag.ghost = ghost;
    drag.offX = drag.x - r.left;
    drag.offY = drag.y - r.top;
    drag.started = true;
    drag.chip.classList.add('dragging');
    document.body.classList.add('is-dragging');
    move(drag.x, drag.y);
    if (navigator.vibrate) navigator.vibrate(10);
  };

  const move = (x, y) => {
    drag.ghost.style.transform = `translate(${x - drag.offX}px, ${y - drag.offY}px)`;
    const cell = document.elementFromPoint(x, y);
    const target = cell && cell.closest('.cell[data-date], .day-panel[data-date]');
    const k = target ? target.dataset.date : null;
    if (k !== drag.over) {
      document.querySelectorAll('.cell.drop').forEach((c) => c.classList.remove('drop'));
      if (target && target.classList.contains('cell')) target.classList.add('drop');
      drag.over = k;
    }
    placeIn(target, y);
    if (y < 50) window.scrollBy(0, -14);
    else if (y > window.innerHeight - 50) window.scrollBy(0, 14);
  };

  document.addEventListener('pointerdown', (e) => {
    const chip = e.target.closest('.chip');
    if (!chip || e.target.closest('.chip-check') || (e.pointerType === 'mouse' && e.button !== 0)) return;
    drag = { id: chip.dataset.id, chip, x: e.clientX, y: e.clientY, started: false, over: null, touch: e.pointerType !== 'mouse' };
    if (drag.touch) drag.timer = setTimeout(() => { if (drag && !drag.started) start(); }, LONG_PRESS);
  });

  document.addEventListener('pointermove', (e) => {
    if (!drag) return;
    if (!drag.started) {
      const dist = Math.hypot(e.clientX - drag.x, e.clientY - drag.y);
      if (dist > MOVE_TOL) {
        if (drag.touch) cleanup(); // 길게 누르기 전에 움직이면 스크롤로 판단
        else start();
      }
      return;
    }
    e.preventDefault();
    move(e.clientX, e.clientY);
  });

  document.addEventListener('touchmove', (e) => { if (drag && drag.started) e.preventDefault(); }, { passive: false });
  document.addEventListener('contextmenu', (e) => { if (drag) e.preventDefault(); });

  document.addEventListener('pointerup', () => {
    if (!drag) return;
    if (drag.started) {
      suppressClick = true;
      lastDragEnd = Date.now();
      setTimeout(() => { suppressClick = false; }, 0);
      const { id, over, index, others } = drag;
      cleanup();
      const t = byId(S.data.todos, id);
      if (!t || !over) return;
      const ids = (others || []).slice();
      ids.splice(index || 0, 0, id);
      const before = (todosByDay()[over] || []).map((x) => x.id).join();
      if (over === t.date && ids.join() === before) return; // 제자리에 놓음
      // 칸이 접혀 칩이 안 보이면(폰 달력) 맨 뒤에 붙임
      if (!others || (!others.length && over !== t.date && (todosByDay()[over] || []).length)) {
        t.date = over;
        t.order = Date.now();
      } else {
        t.date = over;
        const stamp = Date.now();
        ids.forEach((x, i) => { const item = byId(S.data.todos, x); if (item) item.order = stamp + i; });
      }
      commit();
      return;
    }
    cleanup();
  });

  document.addEventListener('pointercancel', cleanup);
}

window.__examMonthlyStarted = true;
boot();
