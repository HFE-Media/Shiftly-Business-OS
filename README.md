# Shiftly Business OS

Multi-tenant SaaS for employee management, attendance with geofence clocking, payroll, accounting, and analytics.

## Repo Structure

```
/
  apps/web
  supabase/sql
  supabase/functions
  supabase/storage
  firebase.json
  .firebaserc
  README.md
```

## 1) Supabase Setup (one command SQL setup)

1. Create a Supabase project.
2. In SQL editor, run files in order:
   - `supabase/sql/01_schema.sql`
   - `supabase/sql/02_policies.sql`
   - `supabase/sql/03_seed.sql`
3. Create Storage buckets:
   - `payslips` (private)
   - `invoice_pdfs` (private)
   - `employee_docs` (private)
4. Deploy edge functions:
   ```bash
   supabase functions deploy runPayroll
   supabase functions deploy verifyOverride
   supabase functions deploy signPayslipUrl
   ```
5. Set function secrets:
   ```bash
   supabase secrets set SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=...
   ```

### Demo users (create in Supabase Auth)
Create accounts then map their auth UUIDs in `03_seed.sql` placeholders:
- owner@democo.com / Password123!
- admin@democo.com / Password123!
- payroll@democo.com / Password123!
- supervisor@democo.com / Password123!
- employee@democo.com / Password123!

## 2) Frontend setup (one command local run)

Create `apps/web/.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_ANON_KEY
```

Run:

```bash
cd apps/web
npm install
npm run dev
```

Visit http://localhost:3000

## 3) Firebase Hosting

Build and export:

```bash
cd apps/web
npm run build
npx next export
```

Deploy:

```bash
firebase login
firebase use --add
firebase deploy --only hosting
```

## Core Features Implemented

- Multi-tenancy via `company_id` on tenant tables + RLS policies.
- Roles: Owner/Admin/PayrollManager/Supervisor/Employee.
- Clocking with GPS distance check + supervisor override code verification via edge function.
- Trigger-driven shift creation/closure and late/overtime calculation.
- Payroll run edge function computes pay, deductions, generates payslip PDFs, uploads to storage, creates accounting transaction.
- Accounting: invoices, expenses, ledger transactions + payroll posting.
- Dashboard analytics cards (revenue/expenses/payroll/profit).
- Reports pages for attendance/payroll summary.
- Sidebar-based mobile-first UI.
- Unit tests for geofence and payroll calculation.

## Notes

- `company_id` is auto-filled with trigger + current member context.
- For production, implement explicit company switcher and session-scoped company selection.
- For invite flow, current implementation stores invite token in DB and surfaces token in UI.
