# Using Your Own Supabase Project

This project is wired for Supabase auth + database via `@supabase/supabase-js`. Follow these steps to point it at **your own** Supabase project instead of the bundled Lovable Cloud one.

## 1. Create / pick a Supabase project
Go to https://supabase.com/dashboard → New project (or use an existing one).

## 2. Run the schema
Open **SQL Editor** in your Supabase dashboard, paste the contents of [`supabase/schema.sql`](./supabase/schema.sql), and run it. This creates all enums, tables, RLS policies, and the signup trigger.

## 3. Grab your keys
**Project Settings → API**:
- `Project URL` → `VITE_SUPABASE_URL` / `SUPABASE_URL`
- `anon` (or `publishable`) key → `VITE_SUPABASE_PUBLISHABLE_KEY` / `SUPABASE_PUBLISHABLE_KEY`
- `service_role` key → `SUPABASE_SERVICE_ROLE_KEY` (server-only — never commit, never prefix with `VITE_`)
- Project ref (from URL) → `VITE_SUPABASE_PROJECT_ID` / `SUPABASE_PROJECT_ID`

## 4. Fill in `.env`
Copy [`.env.example`](./.env.example) → `.env` and paste your values.

> The frontend Supabase client lives at `src/integrations/supabase/client.ts` and reads `VITE_SUPABASE_URL` + `VITE_SUPABASE_PUBLISHABLE_KEY` — no code changes needed.

## 5. Configure Auth
In Supabase dashboard → **Authentication → URL Configuration**, add your dev + prod URLs to **Site URL** and **Redirect URLs** (e.g. `http://localhost:8080`).

Optionally disable "Confirm email" for faster local testing (**Auth → Providers → Email**).

## 6. Create your admin
1. Register through the app (you'll get the `patient` role).
2. In SQL Editor:
   ```sql
   INSERT INTO public.user_roles (user_id, role)
   VALUES ('PASTE-YOUR-AUTH-USER-UUID', 'admin');
   ```
   (Find your user UUID under **Authentication → Users**.)
3. Reload — you'll now see the admin dashboard and can promote doctors from there.

## Regenerating TypeScript types (optional)
`src/integrations/supabase/types.ts` was generated from the bundled project. To regenerate against yours:
```bash
npx supabase gen types typescript --project-id YOUR_PROJECT_REF > src/integrations/supabase/types.ts
```
