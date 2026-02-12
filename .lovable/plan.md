

# World-Class Admin Panel Upgrade

## Current State Audit

**What exists:**
- Admin login page with sign-in/sign-up tabs (sign-up is a security risk -- anyone can create accounts)
- Dashboard with basic stat cards (product/category counts)
- Products list page (table view, search, delete) -- but NO create/edit product page exists (`/admin/products/new` and `/admin/products/:id` routes are linked but never built)
- Categories page (CRUD via dialog modal -- functional)
- Admin layout with sidebar (Dashboard, Products, Categories)
- Auth via `user_roles` table with `has_role()` security definer function -- solid RLS foundation
- `product-images` storage bucket (public) exists
- Product schema includes: name, slug, price, sale_price, description, material, care_instructions, fit_type, fabric_composition, model_info, ministry_statement, weight_gsm, common_questions, status (draft/active/archived), is_featured, is_on_sale, flash_sale_ends_at, category_id
- Related tables: `product_variants` (size, color, style, sku, stock_quantity, price_adjustment), `product_images` (image_url, alt_text, display_order, is_primary)

**Critical problems:**
1. Sign-up tab on admin login -- anyone can create an account (must remove)
2. No product create/edit form exists -- the core workflow is broken
3. No image upload flow despite storage bucket existing
4. No order management in admin
5. No admin route for `/admin/products/new` or `/admin/products/:id` in App.tsx
6. Admin URL `/admin/login` is discoverable -- needs to be obscured
7. No session timeout or activity logging
8. No bulk actions on products
9. Dashboard is mostly placeholder -- no real analytics

## Implementation Plan

This is a large upgrade broken into phases. Phase 1 focuses on the highest-impact items: security hardening, the product creation/editing workflow, and image management.

---

### Phase 1A: Security Hardening

**1. Remove Sign-Up Tab from Admin Login**
- File: `src/pages/admin/AdminLogin.tsx`
- Remove the entire Tabs component and sign-up form
- Keep only the sign-in form
- Admin users are created manually via database (inserting into `user_roles`)
- This prevents unauthorized account creation

**2. Obscure Admin Route**
- File: `src/App.tsx`
- Change `/admin/login` to a non-guessable path like `/ops-portal/login`
- Change `/admin`, `/admin/products`, `/admin/categories` to `/ops-portal`, `/ops-portal/products`, `/ops-portal/categories`
- Update all internal links and navigation references
- Files affected: `AdminLayout.tsx`, `AdminLogin.tsx`, `ProtectedRoute.tsx`, `AdminDashboard.tsx`, `AdminProducts.tsx`
- The path `/admin` will show 404 -- invisible to the world

**3. Session Security**
- Add auto-logout after 30 minutes of inactivity in `AdminLayout.tsx`
- Track mouse/keyboard activity, reset timer on interaction
- On timeout, call `signOut()` and redirect to login

---

### Phase 1B: Product Create/Edit Form (The Core Workflow)

This is the most critical missing piece. The owner needs to add a product in under 3 minutes with zero confusion.

**New files to create:**
- `src/pages/admin/AdminProductForm.tsx` -- the full create/edit page

**New route to add in `src/App.tsx`:**
- `/ops-portal/products/new` -- create mode
- `/ops-portal/products/:productId/edit` -- edit mode (loads existing data)

**Form Architecture (stepped wizard, not one giant form):**

The form uses a clean tabbed layout with 4 sections, visible at once on desktop as tabs across the top. This prevents the "wall of inputs" problem.

```text
Tab 1: BASICS
  - Product name (auto-generates slug)
  - Slug (editable, shown as URL preview)
  - Category (dropdown from existing categories)
  - Description (textarea, rich but simple)
  - Ministry statement (textarea, brand-specific)
  - Status (draft / active / archived radio group)

Tab 2: PRICING + VARIANTS
  - Base price (number input with currency prefix)
  - Sale price (optional, enables "on sale" toggle)
  - Is featured toggle
  - Flash sale end date (optional date picker)
  - Variants section:
    - Table of existing variants
    - "Add Variant" button opens inline row
    - Each variant: size, color, style, SKU (auto-generated suggestion), stock quantity, price adjustment
    - Delete variant with confirmation
    - Bulk size generator: click "Generate Sizes" to auto-create S/M/L/XL/XXL variants

Tab 3: IMAGES
  - Drag-and-drop upload zone (uploads to product-images bucket)
  - Image grid showing uploaded images with:
    - Drag to reorder (display_order)
    - Star icon to set primary image
    - Delete button
    - Alt text input (inline edit)
  - Maximum 10 images
  - File validation: jpg/png/webp, max 5MB each
  - Automatic image optimization guidance (size recommendations shown)

Tab 4: DETAILS
  - Material (text input)
  - Fabric composition (text input)
  - Weight GSM (number input)
  - Fit type (dropdown: slim / regular / relaxed / oversized)
  - Care instructions (textarea)
  - Model info (text, e.g., "Model is 6'1, wearing size L")
  - Common questions (repeatable field group: question + answer pairs)
```

**Save behavior:**
- "Save as Draft" button -- saves with status "draft"
- "Publish" button -- saves with status "active"
- Auto-save indicator (optional, future enhancement)
- After save, redirect to products list with success toast
- Unsaved changes warning on navigation away

**Edit mode:**
- Same form, pre-populated with existing data
- Loads product + variants + images in parallel
- "Update" button replaces "Publish"

---

### Phase 1C: Image Upload System

**Upload flow:**
1. User drops/selects files
2. Files are validated client-side (type, size)
3. Each file is uploaded to `product-images` bucket with path: `{productId}/{uuid}.{ext}`
4. On upload success, insert row into `product_images` table
5. Show upload progress per file
6. Support reordering via drag handle

**Technical details:**
- Use `supabase.storage.from('product-images').upload()` directly
- Generate public URL via `supabase.storage.from('product-images').getPublicUrl()`
- No edge function needed -- direct client upload with RLS (admin-only insert policy already exists)

---

### Phase 1D: Admin Products List Upgrade

**Enhancements to `AdminProducts.tsx`:**
- Add product thumbnail in the table (first image from `product_images`)
- Fix "Add Product" link to point to new form route
- Fix "Edit" link to point to edit form route
- Add status filter tabs (All / Active / Draft / Archived)
- Add category filter dropdown
- Add bulk select + bulk status change
- Add product count badge

---

### Phase 1E: Dashboard Upgrade

**Enhancements to `AdminDashboard.tsx`:**
- Add recent orders section (latest 5 orders with status)
- Add low stock alerts (variants with stock_quantity < 5)
- Add quick links that actually work (point to new routes)
- Add "recent products" list (last 5 added)

---

### Phase 1F: Orders Management (New Page)

**New files:**
- `src/pages/admin/AdminOrders.tsx` -- order list with filters
- `src/pages/admin/AdminOrderDetail.tsx` -- single order view with status updates

**AdminOrders features:**
- Table: order number, customer name, email, total, payment status, fulfillment status, date
- Filters: payment status, fulfillment status, date range
- Search by customer email or order ID
- Click row to view detail

**AdminOrderDetail features:**
- Order summary: items, prices, discounts, shipping, totals
- Customer info: name, email, phone
- Shipping address display
- Payment status badge
- Fulfillment status with update dropdown (unfulfilled -> fulfilled -> shipped -> delivered)
- Tracking number + URL input fields
- Admin notes textarea
- Order timeline (created, paid, shipped, delivered timestamps)

**New nav item in AdminLayout sidebar: "Orders" with ShoppingBag icon**

**New routes in App.tsx:**
- `/ops-portal/orders`
- `/ops-portal/orders/:orderId`

---

## File Change Summary

### New Files (6)
1. `src/pages/admin/AdminProductForm.tsx` -- product create/edit wizard
2. `src/pages/admin/AdminOrders.tsx` -- orders list
3. `src/pages/admin/AdminOrderDetail.tsx` -- order detail view
4. `src/components/admin/ImageUploader.tsx` -- reusable drag-drop image upload component
5. `src/components/admin/VariantManager.tsx` -- variant table with add/edit/delete
6. `src/hooks/useImageUpload.ts` -- image upload hook (handles progress, validation, storage)

### Modified Files (6)
1. `src/App.tsx` -- add new admin routes, rename `/admin` to `/ops-portal`
2. `src/pages/admin/AdminLogin.tsx` -- remove sign-up tab, update route references
3. `src/pages/admin/AdminProducts.tsx` -- add thumbnails, filters, fix links
4. `src/pages/admin/AdminDashboard.tsx` -- add recent orders, low stock, fix links
5. `src/components/admin/AdminLayout.tsx` -- add Orders nav item, update route paths
6. `src/components/admin/ProtectedRoute.tsx` -- update redirect path

### No Database Changes Required
All tables already exist with proper RLS policies. The `product-images` storage bucket is already configured as public. The `user_roles` table with `has_role()` function is already in place.

---

## UX Design Principles Applied

**Speed of listing creation (under 3 minutes):**
- Tab 1 (Basics) has only 6 fields -- name, slug (auto), category, description, ministry, status
- Owner types name, picks category, writes a sentence of description, clicks "Save as Draft"
- Product exists. They can come back to add images and variants later
- No required fields block the save except name, slug, and price

**Clarity:**
- Each tab is labeled with what it contains
- Form validation shows inline errors, not modal alerts
- Status is always visible in the header area
- "Draft" vs "Active" is crystal clear

**Editorial quality of the UI:**
- Same typography system as the rest of the admin (tracking-wider uppercase labels, light font weights)
- Generous spacing (24px between form groups, 48px between tabs)
- Cards for grouped content (pricing card, variant card, image card)
- Minimal borders, clean backgrounds

**Security:**
- Route is hidden (`/ops-portal` not `/admin`)
- No sign-up form -- admin accounts created manually
- Session timeout after 30 minutes of inactivity
- All mutations go through RLS (admin role required)

