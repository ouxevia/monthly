// Supabase 이메일 · 비밀번호 로그인 + 동기화
//
// planners 테이블에 사용자마다 한 줄(doc jsonb)로 플래너를 저장합니다. (형식은 store.js의 toRemote 참고)
// 저장할 때는 바뀐 칸만 apply_planner_ops 함수로 보내서, 두 기기가 서로 다른 항목을 고쳐도 합쳐집니다.
// 다른 기기의 변경은 Realtime 알림을 받으면 다시 읽어 옵니다.
// 테이블 · 함수 · 보안 규칙은 supabase.sql 참고.

// supabase-js (MIT) 를 저장소에 같이 넣어 둠: 외부 CDN이 막히거나 느려도 동작하도록
const SDK = new URL('./vendor/supabase-2.116.0.js', import.meta.url).href;

function loadSdk() {
  if (window.supabase && window.supabase.createClient) return Promise.resolve(window.supabase);
  return new Promise((resolve, reject) => {
    const el = document.createElement('script');
    el.src = SDK;
    el.onload = () => (window.supabase ? resolve(window.supabase) : reject(new Error('supabase-js를 불러오지 못했어요')));
    el.onerror = () => reject(new Error('supabase-js를 불러오지 못했어요'));
    document.head.appendChild(el);
  });
}

export async function initCloud(config, { onUser, onRemote, onError, onRecovery }) {
  const { createClient } = await loadSdk();
  const sb = createClient(config.url, config.anonKey, {
    auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true, flowType: 'implicit' },
  });

  let uid = null;
  let channel = null;
  let announced = false; // 첫 상태(로그인 안 됨 포함)는 꼭 한 번 알려야 화면이 넘어감

  async function fetchDoc() {
    if (!uid) return;
    const { data, error } = await sb.from('planners').select('doc').eq('user_id', uid).maybeSingle();
    if (error) { onError(error); return; }
    onRemote(data && data.doc ? data.doc : null);
  }

  function setUser(user) {
    const next = user ? user.id : null;
    if (announced && next === uid) return;
    announced = true;
    if (channel) { sb.removeChannel(channel); channel = null; }
    uid = next;
    onUser(user ? { uid: user.id, displayName: '', email: user.email || '', photoURL: '' } : null);
    if (!uid) return;
    channel = sb
      .channel('planner-' + uid)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'planners', filter: 'user_id=eq.' + uid }, () => fetchDoc())
      .subscribe();
    fetchDoc();
  }

  sb.auth.onAuthStateChange((event, session) => {
    // 비밀번호 재설정 메일의 링크로 들어온 경우: 새 비밀번호 입력받기
    if (event === 'PASSWORD_RECOVERY' && onRecovery) setTimeout(onRecovery, 0);
    // 콜백 안에서 바로 다른 Supabase 호출을 하면 멈출 수 있어서 한 박자 뒤에 처리
    setTimeout(() => setUser(session ? session.user : null), 0);
  });

  // 다른 탭에서 돌아왔을 때 놓친 변경 다시 읽기
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') fetchDoc(); });

  const { data } = await sb.auth.getSession();
  setUser(data && data.session ? data.session.user : null);

  async function rpc(ops) {
    const { error } = await sb.rpc('apply_planner_ops', { ops });
    if (error) throw error;
  }

  return {
    async signIn(email, password) {
      const { error } = await sb.auth.signInWithPassword({ email, password });
      if (error) throw error;
    },
    // 가입: 이메일 확인이 꺼져 있으면 바로 로그인되고 true, 확인 메일이 필요하면 false
    async signUp(email, password) {
      const { data, error } = await sb.auth.signUp({ email, password, options: { emailRedirectTo: location.origin + location.pathname } });
      if (error) throw error;
      return Boolean(data && data.session);
    },
    async sendPasswordReset(email) {
      const { error } = await sb.auth.resetPasswordForEmail(email, { redirectTo: location.origin + location.pathname });
      if (error) throw error;
    },
    async updatePassword(password) {
      const { error } = await sb.auth.updateUser({ password });
      if (error) throw error;
    },
    // 관리자에게 문의 보내기 / 내가 보낸 문의와 답변 보기
    async sendFeedback(row) {
      const { error } = await sb.from('feedback').insert(row);
      if (error) throw error;
    },
    async listFeedback() {
      if (!uid) return [];
      const { data, error } = await sb.from('feedback')
        .select('id, category, message, reply, replied_at, created_at')
        .order('created_at', { ascending: false })
        .limit(30);
      if (error) throw error;
      return data || [];
    },
    async signOut() {
      await sb.auth.signOut();
    },
    // 처음 로그인: 문서 전체 만들기
    async create(doc) {
      const ops = [{ path: ['v'], value: doc.v }];
      Object.keys(doc).forEach((g) => {
        if (g === 'v') return;
        Object.keys(doc[g]).forEach((k) => ops.push({ path: [g, k], value: doc[g][k] }));
      });
      await rpc(ops);
    },
    // 바뀐 칸만 보내기: ops = [{ path: [그룹, 키], value } | { path, del: true }]
    async update(ops) {
      if (ops.length) await rpc(ops);
    },
    async touchDevice(id, info) {
      await rpc([{ path: ['devices', id], value: info }]);
    },
  };
}
