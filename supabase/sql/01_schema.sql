create extension if not exists pgcrypto;

create type app_role as enum ('Owner','Admin','PayrollManager','Supervisor','Employee');
create type pay_type as enum ('hourly','salary');
create type clock_type as enum ('in','out');
create type clock_method as enum ('gps','manual','override');
create type shift_status as enum ('open','closed','adjusted');
create type period_status as enum ('draft','finalised');
create type account_type as enum ('asset','liability','equity','income','expense');
create type invoice_status as enum ('draft','sent','paid');
create type deduction_type as enum ('fixed','percent');
create type tx_reference_type as enum ('invoice','expense','payroll','manual');

create table companies (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz not null default now()
);

create table company_members (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references companies(id) on delete cascade,
  user_id uuid not null,
  role app_role not null,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  unique (company_id, user_id)
);

create table invites (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references companies(id) on delete cascade,
  email text not null,
  role app_role not null,
  token text not null unique,
  status text not null default 'pending',
  created_at timestamptz not null default now()
);

create table employees (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references companies(id) on delete cascade,
  user_id uuid,
  employee_code text not null,
  full_name text not null,
  id_number text,
  job_title text,
  pay_type pay_type not null,
  pay_rate numeric(12,2) not null,
  bank_account_json jsonb default '{}'::jsonb,
  status text not null default 'active',
  expected_start_time time not null default '08:00',
  start_date date not null,
  created_at timestamptz not null default now(),
  unique(company_id, employee_code)
);

create table sites (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references companies(id) on delete cascade,
  name text not null,
  latitude double precision not null,
  longitude double precision not null,
  radius_m integer not null default 100,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table override_codes (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references companies(id) on delete cascade,
  code_hash text not null,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table clock_entries (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references companies(id) on delete cascade,
  employee_id uuid not null references employees(id) on delete cascade,
  site_id uuid not null references sites(id),
  type clock_type not null,
  ts timestamptz not null,
  latitude double precision not null,
  longitude double precision not null,
  accuracy_m numeric(10,2),
  method clock_method not null,
  override_by_user_id uuid,
  notes text,
  created_at timestamptz not null default now()
);

create table shifts (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references companies(id) on delete cascade,
  employee_id uuid not null references employees(id) on delete cascade,
  site_id uuid not null references sites(id),
  clock_in_id uuid references clock_entries(id),
  clock_out_id uuid references clock_entries(id),
  start_ts timestamptz not null,
  end_ts timestamptz,
  minutes_worked integer default 0,
  minutes_overtime integer default 0,
  late_minutes integer default 0,
  status shift_status not null default 'open',
  created_at timestamptz not null default now()
);

create table payroll_periods (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references companies(id) on delete cascade,
  name text not null,
  start_date date not null,
  end_date date not null,
  status period_status not null default 'draft',
  created_at timestamptz not null default now()
);

create table payroll_runs (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references companies(id) on delete cascade,
  payroll_period_id uuid not null references payroll_periods(id),
  run_by_user_id uuid not null,
  run_ts timestamptz not null default now(),
  status period_status not null default 'draft',
  totals_json jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table payroll_lines (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references companies(id) on delete cascade,
  payroll_run_id uuid not null references payroll_runs(id) on delete cascade,
  employee_id uuid not null references employees(id),
  hours_regular numeric(10,2) not null,
  hours_overtime numeric(10,2) not null,
  gross_pay numeric(12,2) not null,
  deductions numeric(12,2) not null,
  net_pay numeric(12,2) not null,
  breakdown_json jsonb not null default '{}'::jsonb,
  payslip_path text,
  created_at timestamptz not null default now()
);

create table deductions (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references companies(id) on delete cascade,
  employee_id uuid references employees(id),
  name text not null,
  type deduction_type not null,
  value numeric(12,2) not null,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table accounts (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references companies(id) on delete cascade,
  code text not null,
  name text not null,
  type account_type not null,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  unique(company_id, code)
);

create table invoices (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references companies(id) on delete cascade,
  invoice_no text not null,
  client_name text not null,
  client_email text,
  issue_date date not null,
  due_date date not null,
  status invoice_status not null default 'draft',
  subtotal numeric(12,2) not null,
  vat numeric(12,2) not null default 0,
  total numeric(12,2) not null,
  created_at timestamptz not null default now(),
  unique(company_id, invoice_no)
);

create table invoice_items (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references companies(id) on delete cascade,
  invoice_id uuid not null references invoices(id) on delete cascade,
  description text not null,
  qty numeric(10,2) not null,
  unit_price numeric(12,2) not null,
  line_total numeric(12,2) not null
);

create table expenses (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references companies(id) on delete cascade,
  supplier text not null,
  expense_date date not null,
  category text not null,
  subtotal numeric(12,2) not null,
  vat numeric(12,2) not null default 0,
  total numeric(12,2) not null,
  notes text,
  created_at timestamptz not null default now()
);

create table transactions (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references companies(id) on delete cascade,
  ts timestamptz not null default now(),
  debit_account_id uuid not null references accounts(id),
  credit_account_id uuid not null references accounts(id),
  amount numeric(12,2) not null,
  reference_type tx_reference_type not null,
  reference_id uuid,
  description text not null
);

create or replace function get_current_company_id() returns uuid language sql stable as $$
  select company_id from company_members where user_id = auth.uid() and active order by created_at asc limit 1
$$;

create or replace function bootstrap_company_for_owner(p_company_name text, p_user_id uuid)
returns uuid language plpgsql security definer as $$
declare v_company_id uuid;
begin
  insert into companies(name) values (p_company_name) returning id into v_company_id;
  insert into company_members(company_id, user_id, role, active) values (v_company_id, p_user_id, 'Owner', true);
  return v_company_id;
end;
$$;

create or replace function set_company_id_default() returns trigger language plpgsql as $$
begin
  if new.company_id is null then
    new.company_id := get_current_company_id();
  end if;
  return new;
end;
$$;

create or replace function handle_clock_shift() returns trigger language plpgsql as $$
declare
  v_open_shift shifts;
  v_expected time;
  v_worked int;
begin
  if new.type = 'in' then
    select expected_start_time into v_expected from employees where id = new.employee_id;
    insert into shifts(company_id, employee_id, site_id, clock_in_id, start_ts, late_minutes, status)
    values (
      new.company_id,
      new.employee_id,
      new.site_id,
      new.id,
      new.ts,
      greatest(extract(epoch from (new.ts::time - v_expected))/60,0)::int,
      'open'
    );
  else
    select * into v_open_shift from shifts where employee_id = new.employee_id and status='open' order by start_ts desc limit 1;
    if found then
      v_worked := greatest(extract(epoch from (new.ts - v_open_shift.start_ts))/60,0)::int;
      update shifts
      set clock_out_id = new.id,
          end_ts = new.ts,
          minutes_worked = v_worked,
          minutes_overtime = greatest(v_worked - 480, 0),
          status = 'closed'
      where id = v_open_shift.id;
    end if;
  end if;
  return new;
end;
$$;

create trigger trg_employees_company before insert on employees for each row execute function set_company_id_default();
create trigger trg_sites_company before insert on sites for each row execute function set_company_id_default();
create trigger trg_clock_company before insert on clock_entries for each row execute function set_company_id_default();
create trigger trg_payroll_period_company before insert on payroll_periods for each row execute function set_company_id_default();
create trigger trg_payroll_runs_company before insert on payroll_runs for each row execute function set_company_id_default();
create trigger trg_deductions_company before insert on deductions for each row execute function set_company_id_default();
create trigger trg_accounts_company before insert on accounts for each row execute function set_company_id_default();
create trigger trg_invoices_company before insert on invoices for each row execute function set_company_id_default();
create trigger trg_invoice_items_company before insert on invoice_items for each row execute function set_company_id_default();
create trigger trg_expenses_company before insert on expenses for each row execute function set_company_id_default();
create trigger trg_transactions_company before insert on transactions for each row execute function set_company_id_default();
create trigger trg_invites_company before insert on invites for each row execute function set_company_id_default();
create trigger trg_override_codes_company before insert on override_codes for each row execute function set_company_id_default();

create trigger trg_clock_to_shift after insert on clock_entries for each row execute function handle_clock_shift();
