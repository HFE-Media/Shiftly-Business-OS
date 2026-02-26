alter table companies enable row level security;
alter table company_members enable row level security;
alter table invites enable row level security;
alter table employees enable row level security;
alter table sites enable row level security;
alter table override_codes enable row level security;
alter table clock_entries enable row level security;
alter table shifts enable row level security;
alter table payroll_periods enable row level security;
alter table payroll_runs enable row level security;
alter table payroll_lines enable row level security;
alter table deductions enable row level security;
alter table accounts enable row level security;
alter table invoices enable row level security;
alter table invoice_items enable row level security;
alter table expenses enable row level security;
alter table transactions enable row level security;

create or replace function is_company_member(cid uuid) returns boolean language sql stable as $$
  select exists (select 1 from company_members cm where cm.company_id=cid and cm.user_id=auth.uid() and cm.active)
$$;
create or replace function has_role(cid uuid, roles app_role[]) returns boolean language sql stable as $$
  select exists (select 1 from company_members cm where cm.company_id=cid and cm.user_id=auth.uid() and cm.active and cm.role = any(roles))
$$;

create policy p_companies_read on companies for select using (is_company_member(id));
create policy p_companies_manage on companies for all using (has_role(id, array['Owner'::app_role,'Admin'::app_role])) with check (has_role(id, array['Owner'::app_role,'Admin'::app_role]));

create policy p_members_read on company_members for select using (is_company_member(company_id));
create policy p_members_manage on company_members for all using (has_role(company_id, array['Owner'::app_role,'Admin'::app_role])) with check (has_role(company_id, array['Owner'::app_role,'Admin'::app_role]));

create policy p_invites_all on invites for all using (has_role(company_id, array['Owner'::app_role,'Admin'::app_role])) with check (has_role(company_id, array['Owner'::app_role,'Admin'::app_role]));

create policy p_employees_select on employees for select using (
  has_role(company_id, array['Owner'::app_role,'Admin'::app_role,'PayrollManager'::app_role,'Supervisor'::app_role])
  or (has_role(company_id, array['Employee'::app_role]) and user_id = auth.uid())
);
create policy p_employees_manage on employees for all using (has_role(company_id, array['Owner'::app_role,'Admin'::app_role,'Supervisor'::app_role])) with check (has_role(company_id, array['Owner'::app_role,'Admin'::app_role,'Supervisor'::app_role]));

create policy p_sites_select on sites for select using (is_company_member(company_id));
create policy p_sites_manage on sites for all using (has_role(company_id, array['Owner'::app_role,'Admin'::app_role,'Supervisor'::app_role])) with check (has_role(company_id, array['Owner'::app_role,'Admin'::app_role,'Supervisor'::app_role]));

create policy p_override_manage on override_codes for all using (has_role(company_id, array['Owner'::app_role,'Admin'::app_role,'Supervisor'::app_role])) with check (has_role(company_id, array['Owner'::app_role,'Admin'::app_role,'Supervisor'::app_role]));

create policy p_clock_select on clock_entries for select using (
  has_role(company_id, array['Owner'::app_role,'Admin'::app_role,'PayrollManager'::app_role,'Supervisor'::app_role])
  or exists(select 1 from employees e where e.id = employee_id and e.user_id = auth.uid())
);
create policy p_clock_manage on clock_entries for all using (has_role(company_id, array['Owner'::app_role,'Admin'::app_role,'Supervisor'::app_role,'Employee'::app_role])) with check (has_role(company_id, array['Owner'::app_role,'Admin'::app_role,'Supervisor'::app_role,'Employee'::app_role]));

create policy p_shifts_select on shifts for select using (
  has_role(company_id, array['Owner'::app_role,'Admin'::app_role,'PayrollManager'::app_role,'Supervisor'::app_role])
  or exists(select 1 from employees e where e.id = employee_id and e.user_id = auth.uid())
);
create policy p_shifts_manage on shifts for all using (has_role(company_id, array['Owner'::app_role,'Admin'::app_role,'Supervisor'::app_role])) with check (has_role(company_id, array['Owner'::app_role,'Admin'::app_role,'Supervisor'::app_role]));

create policy p_payroll_periods on payroll_periods for all using (has_role(company_id, array['Owner'::app_role,'Admin'::app_role,'PayrollManager'::app_role])) with check (has_role(company_id, array['Owner'::app_role,'Admin'::app_role,'PayrollManager'::app_role]));
create policy p_payroll_runs on payroll_runs for all using (has_role(company_id, array['Owner'::app_role,'Admin'::app_role,'PayrollManager'::app_role])) with check (has_role(company_id, array['Owner'::app_role,'Admin'::app_role,'PayrollManager'::app_role]));
create policy p_payroll_lines_select on payroll_lines for select using (
  has_role(company_id, array['Owner'::app_role,'Admin'::app_role,'PayrollManager'::app_role])
  or exists(select 1 from employees e where e.id = employee_id and e.user_id = auth.uid())
);
create policy p_payroll_lines_manage on payroll_lines for all using (has_role(company_id, array['Owner'::app_role,'Admin'::app_role,'PayrollManager'::app_role])) with check (has_role(company_id, array['Owner'::app_role,'Admin'::app_role,'PayrollManager'::app_role]));

create policy p_deductions on deductions for all using (has_role(company_id, array['Owner'::app_role,'Admin'::app_role,'PayrollManager'::app_role])) with check (has_role(company_id, array['Owner'::app_role,'Admin'::app_role,'PayrollManager'::app_role]));
create policy p_accounts on accounts for all using (has_role(company_id, array['Owner'::app_role,'Admin'::app_role])) with check (has_role(company_id, array['Owner'::app_role,'Admin'::app_role]));
create policy p_invoices on invoices for all using (has_role(company_id, array['Owner'::app_role,'Admin'::app_role])) with check (has_role(company_id, array['Owner'::app_role,'Admin'::app_role]));
create policy p_invoice_items on invoice_items for all using (has_role(company_id, array['Owner'::app_role,'Admin'::app_role])) with check (has_role(company_id, array['Owner'::app_role,'Admin'::app_role]));
create policy p_expenses on expenses for all using (has_role(company_id, array['Owner'::app_role,'Admin'::app_role])) with check (has_role(company_id, array['Owner'::app_role,'Admin'::app_role]));
create policy p_transactions on transactions for all using (has_role(company_id, array['Owner'::app_role,'Admin'::app_role,'PayrollManager'::app_role])) with check (has_role(company_id, array['Owner'::app_role,'Admin'::app_role,'PayrollManager'::app_role]));
