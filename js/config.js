// Firebase 설정
// ------------------------------------------------------------
// Google 로그인과 기기 간 동기화를 쓰려면 Firebase 콘솔에서 만든
// 웹 앱 설정값을 아래에 붙여넣으세요. (README.md의 "Firebase 설정" 참고)
//
// 비워 두면 로그인 없이 "이 기기에만 저장" 모드로 동작합니다.
export const firebaseConfig = {
  apiKey: '',
  authDomain: '',
  projectId: '',
  storageBucket: '',
  messagingSenderId: '',
  appId: '',
};

export const isFirebaseConfigured = Boolean(firebaseConfig.apiKey && firebaseConfig.projectId);
