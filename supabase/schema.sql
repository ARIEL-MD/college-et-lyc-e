-- =====================================================================
-- Schéma de la plateforme scolaire (Supabase / PostgreSQL)
-- À exécuter une seule fois dans : Supabase > SQL Editor > New query
-- =====================================================================

-- ---------- 1. Établissements ----------
create table if not exists public.schools (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  short_code text,
  type text not null,
  statut text,
  drena text,
  iep text,
  motto text,
  city text,
  district text,
  address text,
  phone text,
  email text,
  director_name text,
  current_academic_year text,
  logo_url text,
  stamp_url text,
  sms_sender_id text,
  sms_balance integer not null default 0,        -- en FCFA, modifié uniquement par le serveur
  sms_provider text not null default 'SIMULATOR',
  sms_auto_send_absence boolean not null default false,
  sms_auto_send_payment boolean not null default false,
  sms_auto_send_enrollment boolean not null default false,
  sms_auto_send_report_card boolean not null default false,
  sms_auto_send_unpaid_reminder boolean not null default false,
  subscription_plan text not null default 'STARTER',
  subscription_status text not null default 'ESSAI',
  max_students integer not null default 200,
  created_at timestamptz not null default now()
);

-- ---------- 2. Utilisateurs (profil lié au compte d'authentification) ----------
-- school_id est NULL pour le SUPER_ADMIN (le fondateur, qui voit toutes les écoles)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  school_id uuid references public.schools(id) on delete cascade,
  role text not null check (role in ('SUPER_ADMIN','DIRECTEUR','ADMIN','COMPTABLE','ENSEIGNANT')),
  name text not null,
  phone text,
  title text,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

-- Fonctions utilitaires pour les règles de sécurité
create or replace function public.my_school_id()
returns uuid language sql stable security definer set search_path = public as $$
  select school_id from public.profiles where id = auth.uid();
$$;

create or replace function public.my_role()
returns text language sql stable security definer set search_path = public as $$
  select role from public.profiles where id = auth.uid();
$$;

-- ---------- 3. Parents ----------
create table if not exists public.parents (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references public.schools(id) on delete cascade,
  first_name text not null,
  last_name text not null,
  phone text not null,
  secondary_phone text,
  email text,
  address text,
  profession text,
  relation text not null default 'AUTRE' check (relation in ('PERE','MERE','TUTEUR_LEGAL','AUTRE')),
  preferred_channel text not null default 'SMS' check (preferred_channel in ('SMS','APPEL')),
  notes text,
  created_at timestamptz not null default now()
);

-- ---------- 4. Classes et matières ----------
create table if not exists public.classes (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references public.schools(id) on delete cascade,
  name text not null,
  level text not null check (level in ('COLLEGE','LYCEE')),
  series text,
  capacity integer not null default 50,
  main_teacher_id uuid references public.profiles(id) on delete set null,
  room_number text,
  academic_year text not null,
  tuition_fee integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.subjects (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references public.schools(id) on delete cascade,
  name text not null,
  code text,
  coefficient numeric(4,2) not null default 1,
  level text,
  category text check (category in ('LITTERAIRE','SCIENTIFIQUE','LANGUE','AUTRE')),
  created_at timestamptz not null default now()
);

-- ---------- 5. Élèves ----------
create table if not exists public.students (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references public.schools(id) on delete cascade,
  matricule text not null,                        -- ex. CI-2026-0048
  first_name text not null,
  last_name text not null,
  gender text check (gender in ('M','F')),
  date_of_birth date,
  place_of_birth text,
  photo_url text,
  class_id uuid references public.classes(id) on delete set null,
  academic_year text not null,
  status text not null default 'INSCRIT'
    check (status in ('INSCRIT','REINSCRIT','TRANSFERE','SUSPENDU','ABANDON')),
  parent_id uuid references public.parents(id) on delete set null,
  address text,
  enrollment_date date not null default current_date,
  total_tuition integer not null default 0,
  paid_tuition integer not null default 0,
  unjustified_absences_count integer not null default 0,
  created_at timestamptz not null default now(),
  unique (school_id, matricule)
);

-- ---------- 6. Présences ----------
create table if not exists public.attendance (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references public.schools(id) on delete cascade,
  student_id uuid not null references public.students(id) on delete cascade,
  class_id uuid references public.classes(id) on delete set null,
  date date not null,
  period text not null check (period in ('MATIN','APRES_MIDI')),
  status text not null check (status in ('PRESENT','ABSENT','RETARD','JUSTIFIE')),
  arrival_time time,
  reason text,
  sms_sent boolean not null default false,
  recorded_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  unique (student_id, date, period)
);

-- ---------- 7. Notes ----------
create table if not exists public.grades (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references public.schools(id) on delete cascade,
  student_id uuid not null references public.students(id) on delete cascade,
  class_id uuid references public.classes(id) on delete set null,
  subject_id uuid not null references public.subjects(id) on delete cascade,
  term text not null check (term in ('TRIMESTRE_1','TRIMESTRE_2','TRIMESTRE_3')),
  evaluation_type text not null check (evaluation_type in ('INTERRO','DEVOIR_1','DEVOIR_2','COMPO')),
  score numeric(5,2) not null check (score >= 0),
  max_score numeric(5,2) not null default 20,
  coefficient numeric(4,2) not null default 1,
  eval_date date,
  teacher_id uuid references public.profiles(id) on delete set null,
  appreciation text,
  created_at timestamptz not null default now()
);

-- ---------- 8. Emploi du temps ----------
create table if not exists public.timetable_slots (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references public.schools(id) on delete cascade,
  class_id uuid not null references public.classes(id) on delete cascade,
  subject_id uuid references public.subjects(id) on delete set null,
  teacher_id uuid references public.profiles(id) on delete set null,
  day_of_week text not null check (day_of_week in ('LUNDI','MARDI','MERCREDI','JEUDI','VENDREDI','SAMEDI')),
  start_time time not null,
  end_time time not null,
  room text
);

-- ---------- 9. Finances ----------
create table if not exists public.fee_categories (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references public.schools(id) on delete cascade,
  name text not null,
  code text,
  default_amount integer not null default 0,
  is_mandatory boolean not null default false,
  description text
);

create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references public.schools(id) on delete cascade,
  receipt_number text not null,                   -- ex. REC-2026-00142
  student_id uuid not null references public.students(id) on delete restrict,
  amount integer not null check (amount > 0),     -- en FCFA
  fee_category_id uuid references public.fee_categories(id) on delete set null,
  fee_category_name text,
  payment_method text not null check (payment_method in
    ('ESPECES','ORANGE_MONEY','MTN_MOMO','MOOV_MONEY','WAVE','CARTE_BANCAIRE','CHEQUE','VIREMENT')),
  transaction_reference text,
  operator_transaction_id text,
  paid_at timestamptz not null default now(),
  recorded_by uuid references public.profiles(id) on delete set null,
  status text not null default 'VALIDE' check (status in ('VALIDE','ANNULE','REMBOURSE')),
  sms_sent boolean not null default false,
  remarks text,
  unique (school_id, receipt_number)
);

-- ---------- 10. SMS ----------
create table if not exists public.sms_templates (
  id uuid primary key default gen_random_uuid(),
  school_id uuid references public.schools(id) on delete cascade,  -- NULL = modèle système
  title text not null,
  category text not null,
  content text not null,
  variables text[] not null default '{}',
  is_system boolean not null default false
);

create table if not exists public.sms_messages (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references public.schools(id) on delete cascade,
  recipient_phone text not null,
  recipient_name text,
  student_id uuid references public.students(id) on delete set null,
  message text not null,
  carrier text,
  status text not null default 'EN_ATTENTE' check (status in ('LIVRE','ENVOYE','EN_ATTENTE','ECHOUE')),
  cost_fcfa integer not null default 20,
  segments integer not null default 1,
  trigger_type text not null default 'MANUEL',
  campaign_id uuid,
  provider_message_id text,                       -- identifiant renvoyé par l'opérateur
  failure_reason text,
  sent_at timestamptz not null default now(),
  delivered_at timestamptz
);

-- ---------- 11. Journal d'audit et support ----------
create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  school_id uuid references public.schools(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete set null,
  action text not null,
  entity_type text not null,
  entity_id text,
  details text,
  created_at timestamptz not null default now()
);

create table if not exists public.support_messages (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references public.schools(id) on delete cascade,
  sender_id uuid references public.profiles(id) on delete set null,
  sender_role text not null check (sender_role in ('CREATEUR','DIRECTEUR','ECOLE')),
  subject text,
  message text not null,
  category text not null default 'AUTRE',
  status text not null default 'OUVERT' check (status in ('OUVERT','EN_COURS','RESOLU')),
  created_at timestamptz not null default now()
);

-- =====================================================================
-- SÉCURITÉ : chaque utilisateur ne voit que les données de SON école.
-- Le SUPER_ADMIN voit tout.
-- =====================================================================

do $$
declare
  t text;
begin
  foreach t in array array[
    'parents','classes','subjects','students','attendance','grades',
    'timetable_slots','fee_categories','payments','sms_templates',
    'sms_messages','audit_logs','support_messages'
  ]
  loop
    execute format('alter table public.%I enable row level security', t);
    execute format('drop policy if exists "isolation_ecole" on public.%I', t);
    execute format($p$
      create policy "isolation_ecole" on public.%I
      for all
      using (public.my_role() = 'SUPER_ADMIN' or school_id = public.my_school_id())
      with check (public.my_role() = 'SUPER_ADMIN' or school_id = public.my_school_id())
    $p$, t);
  end loop;
end $$;

-- La table schools a sa propre clé (id) : un directeur ne voit que son école
alter table public.schools enable row level security;
drop policy if exists "ecole_lecture_modif" on public.schools;
create policy "ecole_lecture_modif" on public.schools for all
  using (public.my_role() = 'SUPER_ADMIN' or id = public.my_school_id())
  with check (public.my_role() = 'SUPER_ADMIN' or id = public.my_school_id());

-- La table profiles : chacun voit son propre profil et ceux de son école
alter table public.profiles enable row level security;
drop policy if exists "profil_lecture" on public.profiles;
create policy "profil_lecture" on public.profiles for select
  using (id = auth.uid() or public.my_role() = 'SUPER_ADMIN' or school_id = public.my_school_id());

-- Un utilisateur ne peut pas modifier son propre rôle ni son école
-- (les comptes sont créés et gérés par le directeur via le serveur)
drop policy if exists "profil_modif_directeur" on public.profiles;
create policy "profil_modif_directeur" on public.profiles for all
  using (public.my_role() in ('SUPER_ADMIN','DIRECTEUR') and (school_id = public.my_school_id() or public.my_role() = 'SUPER_ADMIN'))
  with check (public.my_role() in ('SUPER_ADMIN','DIRECTEUR') and (school_id = public.my_school_id() or public.my_role() = 'SUPER_ADMIN'));

-- Modèles SMS système (school_id NULL) : lisibles par tous les utilisateurs connectés
drop policy if exists "modeles_systeme_lecture" on public.sms_templates;
create policy "modeles_systeme_lecture" on public.sms_templates for select
  using (school_id is null and auth.uid() is not null);

-- Index pour accélérer les requêtes courantes
create index if not exists idx_students_school_class on public.students(school_id, class_id);
create index if not exists idx_payments_student on public.payments(student_id);
create index if not exists idx_attendance_student_date on public.attendance(student_id, date);
create index if not exists idx_grades_student on public.grades(student_id);
create index if not exists idx_sms_school_sent on public.sms_messages(school_id, sent_at desc);
