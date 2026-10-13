// Firebase Google 로그인 + Firestore 동기화
//
// users/{uid} 문서 하나에 플래너를 항목별 맵으로 저장하고 (형식은 store.js의 toRemote 참고),
// onSnapshot으로 다른 기기의 변경을 실시간으로 받아옵니다.
// 저장할 때는 바뀐 칸만 updateDoc으로 보내서, 두 기기가 서로 다른 항목을 고쳐도 합쳐집니다.

const SDK = 'https://www.gstatic.com/firebasejs/10.12.2/';

export async function initCloud(config, { onUser, onRemote, onError }) {
  const [{ initializeApp }, auth, fs] = await Promise.all([
    import(SDK + 'firebase-app.js'),
    import(SDK + 'firebase-auth.js'),
    import(SDK + 'firebase-firestore.js'),
  ]);

  const app = initializeApp(config);
  const authInst = auth.getAuth(app);
  const db = fs.getFirestore(app);
  let ref = null;
  let unsubscribe = null;

  auth.onAuthStateChanged(authInst, (user) => {
    if (unsubscribe) { unsubscribe(); unsubscribe = null; }
    ref = user ? fs.doc(db, 'users', user.uid) : null;
    onUser(user);
    if (!ref) return;
    unsubscribe = fs.onSnapshot(
      ref,
      (snap) => {
        // 내가 방금 보낸 변경이 되돌아온 것이면 무시 (서버 확인 후 다시 옴)
        if (snap.metadata.hasPendingWrites) return;
        onRemote(snap.exists() ? snap.data() : null);
      },
      (err) => onError(err),
    );
  });

  return {
    async signIn() {
      const provider = new auth.GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      try {
        await auth.signInWithPopup(authInst, provider);
      } catch (err) {
        if (err && (err.code === 'auth/popup-blocked' || err.code === 'auth/operation-not-supported-in-this-environment')) {
          await auth.signInWithRedirect(authInst, provider);
        } else if (!(err && (err.code === 'auth/popup-closed-by-user' || err.code === 'auth/cancelled-popup-request'))) {
          throw err;
        }
      }
    },
    signOut() {
      return auth.signOut(authInst);
    },
    // 처음 로그인: 문서 전체 만들기
    async create(doc) {
      if (!ref) return;
      await fs.setDoc(ref, doc, { merge: true });
    },
    // 바뀐 칸만 보내기: ops = [{ path: [그룹, 키], value } | { path, del: true }]
    async update(ops) {
      if (!ref || !ops.length) return;
      const args = [];
      ops.forEach((op) => {
        args.push(new fs.FieldPath(op.path[0], op.path[1]), op.del ? fs.deleteField() : op.value);
      });
      await fs.updateDoc(ref, ...args);
    },
    // 기기 목록은 따로 갱신 (플래너 내용과 섞이지 않게)
    async touchDevice(id, info) {
      if (!ref) return;
      await fs.setDoc(ref, { devices: { [id]: info } }, { merge: true });
    },
  };
}
