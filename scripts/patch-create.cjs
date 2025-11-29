
// scripts/patch-create.cjs
// In-place codemod for src/pages/Create.tsx to add:
// 1) FullPageSkeleton early return when appStep === "idle"
// 2) GeneratingSequence premium UI for appStep === "generating"
// 3) Missing imports for both components
//
// Usage (from project root):
//   node scripts/patch-create.cjs
//
// It will create a backup at src/pages/Create.backup.tsx before writing.

const fs = require("fs");
const path = require("path");

const FILE = path.join("src", "pages", "Create.tsx");
const BACKUP = path.join("src", "pages", "Create.backup.tsx");

function read(file) {
  try { return fs.readFileSync(file, "utf8"); } catch (e) { return null; }
}

function write(file, content) {
  fs.writeFileSync(file, content, "utf8");
}

function ensureImport(src, importLine, testRegex) {
  if (testRegex.test(src)) return src;
  // Insert after first import block
  const m = src.match(/^(import[\s\S]+?from\s+["'][^"']+["'];?\s*\r?\n)+/);
  if (m) {
    const end = m[0].length;
    return src.slice(0, end) + importLine + "\n" + src.slice(end);
  }
  // fallback: prepend
  return importLine + "\n" + src;
}

function insertAfterAnchor(src, anchorRegex, insertion, marker) {
  if (src.includes(marker)) return src;
  const m = anchorRegex.exec(src);
  if (!m) return src;
  const idx = m.index + m[0].length;
  return src.slice(0, idx) + "\n\n" + insertion + "\n" + src.slice(idx);
}

function replaceGeneratingSection(src) {
  // Case A: replace a known block under {appStep === "generating" && (...)} pattern
  const pattern = /\{?\s*appStep\s*===\s*["']generating["']\s*&&\s*\(([\s\S]*?)\)\s*\}?/m;
  if (pattern.test(src)) {
    return src.replace(pattern, (match, inner) => {
      const block = `{
  appStep === "generating" && (
    <div className="flex justify-center mt-20">
      <GeneratingSequence activeKey={genStep} sublabel={status} />
    </div>
  )
}`;
      return block;
    });
  }
  // Case B: inject before closing return </> or </main> etc.
  const returnClose = src.lastIndexOf("</");
  if (returnClose !== -1) {
    const insertion = `
  {/* Premium generating sequence */}
  {appStep === "generating" && (
    <div className="flex justify-center mt-20">
      <GeneratingSequence activeKey={genStep} sublabel={status} />
    </div>
  )}
`;
    // Try to find a safe spot before final closing tag
    const before = src.slice(0, returnClose);
    const after = src.slice(returnClose);
    return before + insertion + after;
  }
  return src;
}

(function main() {
  const src = read(FILE);
  if (!src) {
    console.error("Could not read", FILE);
    process.exit(1);
  }

  // Backup
  if (!fs.existsSync(BACKUP)) fs.writeFileSync(BACKUP, src, "utf8");

  let out = src;

  // 1) Ensure imports
  out = ensureImport(out, `import { FullPageSkeleton } from "../components/ui/FullPageSkeleton";`, /FullPageSkeleton/);
  out = ensureImport(out, `import { GeneratingSequence } from "../components/generation/GeneratingSequence";`, /GeneratingSequence/);

  // 2) Insert skeleton early return after the appStep+state block
  const stateAnchor = /const\s*\[\s*appStep\s*,\s*setAppStep\s*\]\s*=\s*useState<[^>]*>\([^)]*\);\s*[\r\n]+(?:const\s*\[[^\]]+\]\s*=\s*useState[^\n]*\n)*\s*const\s*\[\s*error\s*,\s*setError\s*\]\s*=\s*useState/;
  const skeletonInsertion = `// Show a polished skeleton while nothing is loaded yet
if (appStep === "idle") {
  return <FullPageSkeleton />;
} // __PawtraitSkeletonMarker__`;
  out = insertAfterAnchor(out, stateAnchor, skeletonInsertion, "__PawtraitSkeletonMarker__");

  // 3) Replace/inject generating sequence
  out = replaceGeneratingSection(out);

  // Save
  write(FILE, out);
  console.log("Patched:", FILE);
  console.log("Backup saved at:", BACKUP);
})();
