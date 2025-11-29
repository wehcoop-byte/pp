# Premium loading & generation UX pack

Files included:
- `src/components/ui/LoadingSpinner.tsx` — brand spinner
- `src/components/ui/Skeleton.tsx` — skeleton primitives
- `src/components/ui/FullPageSkeleton.tsx` — page-level skeleton for Create
- `src/components/ui/ProgressRing.tsx` — animated SVG ring
- `src/components/generation/GeneratingSequence.tsx` — premium progress UI that mirrors your steps

## How to integrate

### 1) Suspense fallback (AppRoutes.tsx)
```tsx
import { LoadingSpinner } from "../components/ui/LoadingSpinner";

<Suspense fallback={
  <div className="w-full pt-20 text-center text-white/80">
    <LoadingSpinner size="md" />
    <p className="mt-4 text-sm opacity-70 font-body">Loading…</p>
  </div>
}>
  {/* routes */}
</Suspense>
```

### 2) Show a full-page skeleton on Create before anything loads
```tsx
import { FullPageSkeleton } from "../components/ui/FullPageSkeleton";

// Example:
if (appStep === "idle") {
  return <FullPageSkeleton />;
}
```

### 3) Replace your generation progress UI on the Create page
```tsx
import { GeneratingSequence } from "../components/generation/GeneratingSequence";

// inside Create.tsx:
{appStep === "generating" && (
  <div className="flex justify-center mt-20">
    <GeneratingSequence activeKey={genStep} sublabel={status} />
  </div>
)}
```

The `activeKey` should be one of: `PREPARING`, `GENERATING`, `FINISHING`, `READY`.
If your existing step keys differ, pass a custom `steps` prop with your labels/weights.

### 4) Optional: show the ring anywhere
```tsx
import { ProgressRing } from "../components/ui/ProgressRing";
<ProgressRing progress={42} />
```

No new dependencies. All styling via Tailwind and your brand CSS variables.
