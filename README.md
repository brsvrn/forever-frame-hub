# MemoryWedding

MemoryWedding is a Turkish digital invitation platform with RSVP, guest media uploads,
live invitation themes, QR sharing, and event dashboards.

## Stack

- TanStack Start, React 19, and TypeScript
- Tailwind CSS 4 and Framer Motion
- Supabase Auth, Postgres, Row Level Security, and Storage

## Local setup

1. Install Node.js 22 or newer.
2. Install dependencies with `npm ci`.
3. Copy `.env.example` to `.env.local` and fill in your Supabase values.
4. Apply the migrations in `supabase/migrations` to a local Supabase project.
5. Start the app with `npm run dev`.

Never put a service-role key in a `VITE_` variable. `SUPABASE_SERVICE_ROLE_KEY` is
server-only and is required only by trusted jobs such as the retention cleaner.

## Quality checks

- `npm run typecheck` checks TypeScript without emitting files.
- `npm run lint` checks code style and common mistakes.
- `npm run build` creates the production bundle.
- `npm run check` runs all three checks in order.

## Database and authorization

The core migration creates user-owned invitations and RSVP policies. The product schema
migration adds packages, themes, administration records, guest uploads, storage policies,
and retention fields. Administrative access is authorized with the database-backed
`admin` role through `has_role`; hiding UI elements is never treated as authorization.

Create the first administrator from a trusted SQL console by changing that user's
`public.user_roles.role` value from `user` to `admin`. Do not add email allowlists or
service-role credentials to browser code.

Guest uploads accept only the image/video formats listed in the product migration and are
limited to 100 MB per file. Database and Storage policies require a published invitation.

## Deployment

This repository is connected to Lovable. Keep pushed history linear and do not force-push,
rebase, amend, or squash commits that Lovable has already synchronized.
