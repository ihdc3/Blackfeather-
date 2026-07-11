---
name: Single-owner admin gating with Clerk
description: How to restrict write actions to one owner account in a single-author app (e.g. a personal blog) without building full multi-user roles.
---

For apps with public read access but a single owner who should be the only one able to write (create/edit/delete/upload), prefer Clerk sign-in gated by an `ADMIN_EMAIL` env var over building a roles/permissions system.

**Why:** These apps have no real multi-user concept — adding a roles table or permission system is overkill. Comparing the authenticated Clerk user's verified email against a single `ADMIN_EMAIL` env var (set via `requestEnvVars`, not a secret) is enough and is easy to reason about.

**How to apply:**
- Set up Clerk via `setupClerkWhitelabelAuth()` (see clerk-auth skill) even though there's no real "user accounts" feature — it's just the auth rail.
- Ask the user for their intended admin email via `requestEnvVars` (non-secret, shared env).
- Server-side: an Express middleware calls `getAuth(req)` then `clerkClient.users.getUser(userId)` to check `emailAddresses` against `ADMIN_EMAIL` (case-insensitive). Apply this middleware to every write route (create/update/delete posts, PATCH settings, upload-URL requests). Read (GET) routes stay public/unauthenticated.
- Frontend: hide write-only nav links/pages behind `<Show when="signed-in">`, and wrap write-only pages in a friendly "sign in required" gate — but treat this as UX only. The real security boundary is the backend email check, since anyone can sign up for a Clerk account (there's no invite-only gate in code) and a signed-in-but-wrong-email user will still get a 403 from the backend.
