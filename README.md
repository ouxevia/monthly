# Exam Monthly · 시험 먼슬리 플래너

시험 계획을 먼슬리 캘린더에 정리하는 웹사이트입니다.
이메일 · 비밀번호로 로그인하면 아이패드 · 노트북 · 폰에서 같은 플래너가 실시간으로 동기화됩니다. (동기화 서버: Supabase 무료 요금제)

## 기능

- **먼슬리 캘린더**: 오른쪽 위 `‹ 2026 ›`로 연도, 1~12로 월 이동 · `오늘로`
- **TITLE**: 달마다 제목을 따로 저장
- **시험일 · D-day**: 시험을 여러 개 등록하면 각 날짜에 가장 가까운 다음 시험의 D-day 표시
- **할 일**
  - 칸 오른쪽 위 `+`로 추가, 칩을 누르면 수정 · 날짜 변경 · 삭제
  - 칩 앞 동그라미를 누르면 완료 (색이 짙어짐)
  - 칩을 드래그해서 다른 날짜로 이동 (터치는 길게 눌러서 끌기)
  - 한 칸에 7줄 이상 보이고, 넘치면 칸 안에서 스크롤
- **카테고리**: Category1(과목) → Category2(그 과목의 문제집). 과목을 골라야 그 과목의 문제집만 보임
- **테마**
  - 캘린더 스타일 5종: 심플 · 손글씨 · 그리드 · 빈티지 페이퍼 · 나이트
  - 과목 색상 13종: 봄 · 여름 · 가을 · 겨울 · 모카 · 석양 · 말차딸기 · 체리라떼 · 미드나잇 · 딥씨 · 라벤더필드 · 빈티지노트 · 블루아워
  - 글씨체 5종: 나눔명조(기본) · 고운바탕 · 고운돋움 · 개구 · 나눔펜
  - 나이트모드 버튼 (팝업까지 어둡게)
- **계정**: 이메일 · 비밀번호 로그인(회원가입 · 비밀번호 재설정) · 동기화 상태 · 로그인된 기기 목록 · 백업 파일 저장/불러오기

## 바로 실행해 보기

ES 모듈을 쓰기 때문에 `index.html`을 더블클릭하면 동작하지 않고, 간단한 웹서버로 열어야 합니다.

```bash
python3 -m http.server 8000
# 브라우저에서 http://localhost:8000
```

Supabase를 설정하기 전에는 로그인 없이 **이 기기(브라우저)에만 저장**하는 모드로 동작합니다.
이 모드에서 쓰던 데이터는 나중에 처음 로그인할 때 계정으로 그대로 옮겨집니다.

## Supabase 설정 (로그인 + 동기화, 무료)

1. https://supabase.com 에서 **Start your project** → GitHub 계정으로 가입
2. **New project** → 이름 `exam-monthly`, Database Password는 아무거나 길게(따로 쓸 일 없음),
   Region은 **Northeast Asia (Seoul)** → **Create new project** (1~2분 대기)
3. 왼쪽 메뉴 **SQL Editor** → **New query** → 이 저장소의 [`supabase.sql`](supabase.sql) 내용을 전부 붙여넣고 **Run**
4. 왼쪽 메뉴 **Authentication → URL Configuration**
   - **Site URL**: `https://<아이디>.github.io/monthly/`
   - **Redirect URLs**에 같은 주소 추가
5. (권장) **Authentication → Sign In / Providers → Email**에서 **Confirm email**을 끄고 **Save**
   → 가입하자마자 바로 로그인됨. 켜 두면 가입할 때 확인 메일의 링크를 한 번 눌러야 함
6. **Project Settings → API**(또는 상단 **Connect** 버튼)의 **Project URL**과 **anon public**(또는 publishable) 키를
   [`js/config.js`](js/config.js)에 붙여넣기

anon/publishable 키는 비밀번호가 아니라 공개용 키라서 저장소에 올라가도 괜찮습니다.
데이터는 3번의 보안 규칙(RLS)으로 보호됩니다 (로그인한 본인만 자기 플래너를 읽고 쓸 수 있음).

무료 요금제 참고:
- 7일 동안 아무도 접속하지 않으면 프로젝트가 일시정지됩니다. 대시보드에서 **Restore**를 누르면 데이터 그대로 다시 켜집니다.
- 기본 메일 발송(가입 확인 · 비밀번호 재설정)은 시간당 몇 통으로 제한돼 있습니다.

## GitHub Pages로 배포

1. 이 저장소의 **Settings → Pages → Build and deployment**
2. Source: **Deploy from a branch**, Branch: 사이트 파일이 있는 브랜치 / `(root)` → Save
3. 잠시 후 `https://<아이디>.github.io/monthly/`에서 열림
4. 이 주소를 Supabase의 Site URL · Redirect URLs에 넣기 (위 4번)

## 파일 구성

| 파일 | 내용 |
|---|---|
| `index.html` | 페이지 뼈대 · 글꼴 불러오기 |
| `css/style.css` | 화면 디자인 (스타일 · 나이트모드 · 칸 크기) |
| `js/app.js` | 화면 그리기, 버튼 동작, 드래그, 동기화 흐름 |
| `js/data.js` | 테마 13종 · 스타일 5종 · 글씨체 5종 · 공휴일 |
| `js/store.js` | 데이터 형식, 이 기기 저장, 동기화용 비교/합치기 |
| `js/cloud.js` | Supabase 이메일 · 비밀번호 로그인 · 저장 · 실시간 동기화 |
| `js/config.js` | Supabase 설정값 (직접 채우기) |
| `supabase.sql` | 테이블 · 보안 규칙 · 저장 함수 (SQL Editor에서 한 번 실행) |

## 동기화 방식 메모

- 사용자마다 `planners` 테이블 한 줄(`doc`)에 할 일 · 과목 · 문제집 · 시험 · 제목 · 설정을 항목별로 저장합니다.
- 바뀐 항목만 보내기 때문에, 두 기기에서 동시에 서로 다른 항목을 고쳐도 둘 다 반영됩니다.
  같은 항목을 동시에 고치면 나중에 저장된 쪽이 남습니다.
- 인터넷이 끊겨도 이 기기에 먼저 저장되고, 다시 연결되면 서버와 합쳐집니다.
- 공휴일 중 설날 · 추석 · 부처님오신날 · 대체공휴일은 2025~2027년만 들어 있습니다 (`js/data.js`의 `HOLIDAY_TABLE`에 추가 가능).
