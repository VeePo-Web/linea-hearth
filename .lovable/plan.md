# Admin: Newsletter Subscribers & Ambassadors Pages

The dashboard already shows counts for "Newsletter Subscribers" and "Pending Ambassadors" but the cards aren't clickable and no list view exists for either. Add two dedicated admin pages and make the dashboard cards link to them.

## What's there today

- `src/pages/admin/AdminDashboard.tsx` — counts only, cards not wrapped in `<Link>`
- `newsletter_subscribers` table — `email`, `source`, `subscribed_at` (admin SELECT/DELETE policies already in place)
- `ambassador_applications` table — full app fields incl. socials, `status`, `admin_notes` (admin SELECT/UPDATE/DELETE policies already in place)
- No `AdminSubscribers.tsx` or `AdminAmbassadors.tsx` exists yet

## Plan

### 1. New page: `src/pages/admin/AdminSubscribers.tsx`
Route: `/ops-portal/subscribers`

- Header: "Newsletter Subscribers" + total count
- Search box (filters by email substring, client-side)
- Source filter chip row (All / homepage / footer / checkout — derived from distinct values)
- Table: Email · Source · Subscribed (relative date) · Actions (Copy email, Delete)
- "Export CSV" button → downloads filtered rows
- Sorted by `subscribed_at` desc, paginated 50/page
- Empty state when 0 results

### 2. New page: `src/pages/admin/AdminAmbassadors.tsx`
Route: `/ops-portal/ambassadors`

- Header: "Ambassador Applications" + status counts (Pending / Approved / Rejected)
- Status filter tabs (Pending default, Approved, Rejected, All)
- Search box (name or email)
- Table: Name · Email · Location · Followers · Submitted · Status badge
- Click row → opens side drawer (Sheet) with full application: socials (clickable IG/TikTok/YouTube/Twitter links), content types, "Why represent", "Faith in content", "Content frequency", admin notes textarea, Approve / Reject buttons
- Approve/Reject updates `status`, `reviewed_at = now()`, `reviewed_by = auth.uid()`
- Sorted by `created_at` desc

### 3. Wire up dashboard
- Wrap both stat cards (`Newsletter Subscribers`, `Pending Ambassadors`) in `<Link>` to the new routes
- Add hover state to match existing "Needs Fulfillment" card pattern

### 4. Register routes in `src/App.tsx`
Add lazy imports + two `<Route>` entries following the same `OpsPortalGate > ProtectedRoute requireAdmin > PageTransition` pattern as the other admin routes.

## Out of scope
- No schema/RLS changes (existing admin policies are sufficient)
- No bulk email send / marketing trigger from these pages
- No CSV import for subscribers
