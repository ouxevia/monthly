// 내 글씨체: 사용자가 올린 폰트 파일
//
// - 파일은 Supabase Storage 'fonts' 버킷의 <내 계정 id>/ 폴더에 저장 (본인만 읽고 쓸 수 있음, supabase.sql 6번)
// - 글씨체 목록(이름 · 크기 보정값)은 플래너 설정(settings.customFonts)에 들어가서 내 기기들끼리 동기화
// - 한 번 받은 파일은 이 기기의 IndexedDB에 보관 → 다시 받지 않고, 오프라인에서도 그 글씨체로 보임

const DB_NAME = 'exam-monthly-fonts';
const STORE = 'files';
const SAMPLE = '풀이국어수학공부';
// 나눔명조(기본 글씨체)의 한글 글자 높이 비율: 올린 글씨체를 이 크기에 맞춤
const REF_INK = 0.955;

function openDb() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => req.result.createObjectStore(STORE);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function tx(mode, fn) {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const t = db.transaction(STORE, mode);
    const req = fn(t.objectStore(STORE));
    t.oncomplete = () => resolve(req && req.result);
    t.onerror = () => reject(t.error);
  });
}

export const cacheGet = (key) => tx('readonly', (s) => s.get(key)).catch(() => null);
export const cachePut = (key, buf) => tx('readwrite', (s) => s.put(buf, key)).catch(() => null);
export const cacheDel = (key) => tx('readwrite', (s) => s.delete(key)).catch(() => null);

export const familyOf = (id) => 'UserFont-' + id;

// 폰트 파일을 이 페이지에서 쓸 수 있게 등록 (같은 글씨체는 한 번만)
const registered = new Map();
export async function registerFont(id, buf) {
  if (registered.has(id)) return registered.get(id);
  const face = new FontFace(familyOf(id), buf, { display: 'swap' });
  const p = face.load().then(() => { document.fonts.add(face); return true; });
  registered.set(id, p);
  try { return await p; } catch (e) { registered.delete(id); throw e; }
}
export const isRegistered = (id) => registered.has(id);

// 할 일 칸(높이 16px, 글자 12px)에 그렸을 때와 같은 조건으로 4배 크기 캔버스에 그려서
// 한글 글자 높이(→ 크기 보정)와 위아래 치우침(→ 가운데 맞춤 보정)을 잼
export function measureFont(family) {
  const size = 48;
  const H = 64;
  const c = document.createElement('canvas');
  c.width = 700;
  c.height = H;
  const x = c.getContext('2d', { willReadFrequently: true });
  x.font = `${size}px "${family}"`;
  const m = x.measureText(SAMPLE);
  const base = H / 2 + (m.fontBoundingBoxAscent - m.fontBoundingBoxDescent) / 2;
  x.fillStyle = '#000';
  x.fillText(SAMPLE, 4, base);
  const d = x.getImageData(0, 0, c.width, H).data;
  let top = -1;
  let bottom = -1;
  for (let j = 0; j < H; j++) {
    for (let i = 0; i < c.width; i++) {
      if (d[(j * c.width + i) * 4 + 3] > 128) { if (top < 0) top = j; bottom = j; break; }
    }
  }
  if (top < 0) return { scale: 1, chip: 11.5, nudge: 0 };
  const ink = (bottom - top + 1) / size;
  const k = Math.min(1.35, Math.max(0.8, REF_INK / ink));
  const nudge = ((H - 1 - bottom) - top) / 2 / size;
  return { scale: Math.round(k * 100) / 100, chip: Math.round(11.5 * k * 2) / 2, nudge: Math.round(nudge * 1000) / 1000 };
}

// 예전에 사이트에 기본으로 넣었던 글씨체: 같은 파일을 올리면 원래 이름과 선택을 그대로 이어 줌
export const LEGACY = [
  { match: /myoeun\s*-?\s*heullim/i, id: 'myoeun-heullim', name: '그리운 묘은 흘림' },
  { match: /myoeun\s*-?\s*ddobak/i, id: 'myoeun-ddobak', name: '그리운 묘은 또박' },
  { match: /study_?ham|haemi/i, id: 'haemi', name: '그리운 햄이' },
];
