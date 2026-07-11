# Pet Store Pickup Website

Public product display and pickup reservation website for a pet store. The customer-facing and admin UI are in English. There is no online payment.

## What is included

- Next.js App Router
- Tailwind CSS
- Supabase Auth
- Supabase database schema and RLS policies
- Product catalog with variants
- Cart, wishlist, pickup checkout, customer orders
- Admin dashboard, product management, order status management, wishlist demand report
- Supabase-hosted product catalog and product images

## First setup

1. Install dependencies:

```bash
npm install
```

2. Copy `.env.example` to `.env.local`.

3. Create a Supabase project.

4. Run `supabase/schema.sql` in the Supabase SQL editor.

5. Add these values to `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

6. Start the website:

```bash
npm run dev
```

## Make yourself admin

After signing up, open Supabase SQL editor and run:

```sql
update public.profiles
set role = 'admin'
where id = (
  select id
  from auth.users
  where email = 'your-email@example.com'
);
```

## Deploy to Vercel

1. Push this project to GitHub.
2. Import the GitHub repo into Vercel.
3. Add the same environment variables in Vercel.
4. In Supabase Auth settings, add your Vercel production URL as an allowed redirect URL.
5. Deploy and test product browsing, login, cart, wishlist, checkout, orders, and admin pages.
