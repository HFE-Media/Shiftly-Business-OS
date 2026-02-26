-- Demo users must be created in Supabase Auth first. Map IDs below after creation.
insert into companies(id,name) values ('00000000-0000-0000-0000-000000000001','DemoCo') on conflict do nothing;

-- Replace user ids with actual auth.users ids.
insert into company_members(company_id,user_id,role,active) values
('00000000-0000-0000-0000-000000000001','11111111-1111-1111-1111-111111111111','Owner',true),
('00000000-0000-0000-0000-000000000001','22222222-2222-2222-2222-222222222222','Admin',true),
('00000000-0000-0000-0000-000000000001','33333333-3333-3333-3333-333333333333','PayrollManager',true),
('00000000-0000-0000-0000-000000000001','44444444-4444-4444-4444-444444444444','Supervisor',true),
('00000000-0000-0000-0000-000000000001','55555555-5555-5555-5555-555555555555','Employee',true)
on conflict do nothing;

insert into employees(id,company_id,user_id,employee_code,full_name,job_title,pay_type,pay_rate,status,start_date,expected_start_time) values
('10000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000001','55555555-5555-5555-5555-555555555555','EMP-001','John Worker','Technician','hourly',12,'active',current_date - 200,'08:00'),
('10000000-0000-0000-0000-000000000002','00000000-0000-0000-0000-000000000001',null,'EMP-002','Lerato Dube','Sales','hourly',15,'active',current_date - 120,'08:30'),
('10000000-0000-0000-0000-000000000003','00000000-0000-0000-0000-000000000001',null,'EMP-003','Maria Khan','Operations','salary',20,'active',current_date - 100,'08:00')
on conflict do nothing;

insert into sites(id,company_id,name,latitude,longitude,radius_m,active) values
('20000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000001','HQ',-26.2041,28.0473,120,true),
('20000000-0000-0000-0000-000000000002','00000000-0000-0000-0000-000000000001','Warehouse',-26.1841,28.0273,150,true)
on conflict do nothing;

insert into payroll_periods(id,company_id,name,start_date,end_date,status) values
('30000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000001','Jan 2026',date '2026-01-01',date '2026-01-31','draft')
on conflict do nothing;

insert into accounts(id,company_id,code,name,type,active) values
('40000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000001','1000','Bank','asset',true),
('40000000-0000-0000-0000-000000000002','00000000-0000-0000-0000-000000000001','5000','Payroll Expense','expense',true),
('40000000-0000-0000-0000-000000000003','00000000-0000-0000-0000-000000000001','4100','Sales Revenue','income',true)
on conflict do nothing;

insert into invoices(company_id,invoice_no,client_name,client_email,issue_date,due_date,status,subtotal,vat,total)
values ('00000000-0000-0000-0000-000000000001','INV-1001','Acme Corp','ops@acme.com',current_date-5,current_date+20,'paid',3000,450,3450)
on conflict do nothing;

insert into expenses(company_id,supplier,expense_date,category,subtotal,vat,total,notes)
values ('00000000-0000-0000-0000-000000000001','Fuel Station',current_date-2,'Transport',200,30,230,'Vehicle fuel')
on conflict do nothing;
