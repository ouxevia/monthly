-- Exam Monthly · Supabase 설정
-- Supabase 대시보드 → SQL Editor → New query 에 이 파일 내용을 전부 붙여넣고 Run 하세요.

-- 1) 사용자마다 플래너 한 줄
create table if not exists public.planners (
  user_id uuid primary key default auth.uid() references auth.users (id) on delete cascade,
  doc jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

-- 2) 보안: 로그인한 본인 줄만 읽고 쓸 수 있음
alter table public.planners enable row level security;

drop policy if exists "own planner" on public.planners;
create policy "own planner" on public.planners
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- 3) 바뀐 칸만 합쳐서 저장하는 함수
--    ops 예: [{"path":["todos","t123"],"value":"{...}"}, {"path":["todos","t9"],"del":true}]
create or replace function public.apply_planner_ops(ops jsonb)
returns void
language plpgsql
security invoker
set search_path = public
as $$
declare
  op jsonb;
  p text[];
  d jsonb;
begin
  if auth.uid() is null then
    raise exception 'not signed in';
  end if;

  insert into public.planners (user_id) values (auth.uid()) on conflict (user_id) do nothing;
  select doc into d from public.planners where user_id = auth.uid() for update;

  for op in select * from jsonb_array_elements(ops) loop
    p := array(select jsonb_array_elements_text(op -> 'path'));
    if coalesce((op ->> 'del')::boolean, false) then
      d := d #- p;
    else
      if array_length(p, 1) = 2 and d -> p[1] is null then
        d := jsonb_set(d, array[p[1]], '{}'::jsonb, true);
      end if;
      d := jsonb_set(d, p, op -> 'value', true);
    end if;
  end loop;

  update public.planners set doc = d, updated_at = now() where user_id = auth.uid();
end;
$$;

grant execute on function public.apply_planner_ops(jsonb) to authenticated;

-- 4) 다른 기기 변경을 실시간으로 받기 (이미 추가돼 있으면 오류 없이 넘어감)
do $$
begin
  alter publication supabase_realtime add table public.planners;
exception when duplicate_object then null;
end $$;

-- 5) 관리자에게 문의 (건의사항 · 오류 신고)
--    사용자는 보내기만 하고, 로그인한 사용자는 자기가 보낸 문의와 답변만 볼 수 있음.
--    관리자는 대시보드 Table Editor → feedback 에서 모두 보고 reply 칸에 답변을 적으면 됨.
create table if not exists public.feedback (
  id bigint generated always as identity primary key,
  user_id uuid default auth.uid() references auth.users (id) on delete set null,
  email text check (email is null or char_length(email) <= 200),
  category text not null default '건의사항' check (char_length(category) <= 20),
  message text not null check (char_length(message) between 1 and 2000),
  device text check (device is null or char_length(device) <= 100),
  reply text,
  replied_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.feedback enable row level security;

drop policy if exists "send feedback" on public.feedback;
create policy "send feedback" on public.feedback
  for insert to anon, authenticated
  with check (
    reply is null and replied_at is null
    and ((auth.uid() is null and user_id is null) or user_id = auth.uid())
  );

drop policy if exists "read own feedback" on public.feedback;
create policy "read own feedback" on public.feedback
  for select to authenticated
  using (user_id = auth.uid());

grant insert on public.feedback to anon, authenticated;
grant select on public.feedback to authenticated;
