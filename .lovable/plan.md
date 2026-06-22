## Remove fake @ handles from the "Rooted in Calgary" tribe gallery

The fake usernames + locations live in `src/components/about/StoryWorldwideTribe.tsx` (used on the Our Story page). They render as a hover overlay on each bento image.

### Change

In `src/components/about/StoryWorldwideTribe.tsx`:

1. Delete the `TRIBE_META` array (the 8 fake `@handle` / city objects).
2. Replace it with a plain length-8 slot array so the bento grid still renders 8 tiles from the real category images.
3. Drop the hover overlay block that prints `member.username` and `member.location`.
4. Update each tile's `alt` text to a generic "Line of Judah community" (no fake handle).
5. Keep the small Instagram icon badge in the corner (brand mark, not a handle) and keep the bottom CTA strip with the real `@lineofjudah` follow link — that one is the actual brand handle.

Nothing else changes: the grid layout, bento sizing, grayscale-to-color hover, scroll reveal, and the "Follow the Movement" CTA all stay.

### Files

- `src/components/about/StoryWorldwideTribe.tsx` — edit only.
