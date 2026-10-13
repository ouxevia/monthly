// Supabase 이메일 로그인 + 동기화
//
// planners 테이블에 사용자마다 한 줄(doc jsonb)로 플래너를 저장합니다. (형식은 store.js의 toRemote 참고)
// 저장할 때는 바뀐 칸만 apply_planner_ops 함수로 보내서, 두 기기가 서로 다른 항목을 고쳐도 합쳐집니다.
// 다른 기기의 변경은 Realtime 알림을 받으면 다시 읽어 옵니다.
// 테이블 · 함수 · 보안 규칙은 supabase.sql 참고.

const SDK = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.49.4/+esm';

export async function initCloud(config, { onUser, onRemote, onError }) {
  const { createClient } = await import(SDK);
  const sb = createClient(config.url, config.anonKey, {
    auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true, flowType: 'implicit' },
  });

  let uid = null;
  let channel = null;

  async function fetchDoc() {
    if (!uid) return;
    const { data, error } = await sb.from('planners').select('doc').eq('user_id', uid).maybeSingle();
    if (error) { onError(error); return; }
    onRemote(data && data.doc ? data.doc : null);
  }

  function setUser(user) {
    const next = user ? user.id : null;
    if (next === uid) return;
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

  sb.auth.onAuthStateChange((_event, session) => {
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
    // 로그인 링크(와 6자리 코드)를 이메일로 보내기
    async sendLoginEmail(email) {
      const redirect = location.origin + location.pathname;
      const { error } = await sb.auth.signInWithOtp({ email, options: { emailRedirectTo: redirect, shouldCreateUser: true } });
      if (error) throw error;
    },
    async verifyCode(email, token) {
      const { error } = await sb.auth.verifyOtp({ email, token, type: 'email' });
      if (error) throw error;
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
