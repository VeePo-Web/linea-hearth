Remove the bottom counter stats section from `BrandFilmHero.tsx`.

The section at lines 181-201 displays three animated counters:
- "X believers"
- "X cities"
- "X countries"

These are the "community" stat tags the user wants gone. The change is a single deletion of that motion.div block (and optionally the counter state/useEffect code if no longer needed).