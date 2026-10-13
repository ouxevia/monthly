// Supabase 설정
// ------------------------------------------------------------
// 로그인과 기기 간 동기화를 쓰려면 Supabase 대시보드에서
// Project Settings → API (또는 Connect 버튼)에 있는 값 두 개를 아래에 붙여넣으세요.
// (README.md의 "Supabase 설정" 참고)
//
// 비워 두면 로그인 없이 "이 기기에만 저장" 모드로 동작합니다.
export const supabaseConfig = {
  url: 'https://xelwmluwcisilzxqupbr.supabase.co',
  anonKey: 'sb_publishable_SVIcvOgd3HN4Ux1Ywy812Q_QTQwGG2F', // 공개용(publishable) 키
};

export const isCloudConfigured = Boolean(supabaseConfig.url && supabaseConfig.anonKey);
