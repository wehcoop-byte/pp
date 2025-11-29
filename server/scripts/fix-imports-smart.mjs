import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const RX = /from\s+["'](\.\.?(?:\/[^"']*)?)["']/g;

function walk(dir, out=[]) {
  for (const name of fs.readdirSync(dir)) {
    const p = path.join(dir, name);
    const st = fs.statSync(p);
    const rel = path.relative(ROOT, p).replace(/\\/g, "/");
    if (st.isDirectory()) {
      if (/(^|\/)(node_modules|dist|scripts)(\/|$)/.test(rel)) continue;
      walk(p, out);
    } else if (p.endsWith(".ts") && !p.endsWith(".d.ts")) {
      out.push(p);
    }
  }
  return out;
}

function maybeFixSpecifier(fileAbs, spec) {
  // Only relative paths
  if (!spec.startsWith("./") && !spec.startsWith("../")) return spec;

  // Already a JSON/MJS/CJS? leave it
  if (/\.(json|mjs|cjs)$/.test(spec)) return spec;

  // If it ends with .js, check if it actually refers to a directory that needs /index.js
  if (spec.endsWith(".js")) {
    const base = path.resolve(path.dirname(fileAbs), spec.slice(0, -3)); // drop .js
    // If there's a directory with index.ts|tsx, fix to /index.js
    const idxTs = ["index.ts", "index.tsx"].map(n => path.join(base, n));
    if (idxTs.some(fs.existsSync)) {
      return spec.replace(/\.js$/, "/index.js");
    }
    // Otherwise leave as-is (points to foo.ts -> foo.js)
    return spec;
  }

  // If no extension at all, add .js (good NodeNext practice)
  // but if it points to a directory, prefer /index.js
  const absNoExt = path.resolve(path.dirname(fileAbs), spec);
  if (fs.existsSync(absNoExt) && fs.statSync(absNoExt).isDirectory()) {
    const idx = ["index.ts", "index.tsx"].map(n => path.join(absNoExt, n));
    if (idx.some(fs.existsSync)) return spec.replace(/\/?$/, "/index.js");
  }
  return `${spec}.js`;
}

const files = walk(ROOT);
let changed = 0;

for (const file of files) {
  let src = fs.readFileSync(file, "utf8");
  let dirty = false;
  const updated = src.replace(RX, (m, spec) => {
    const fixed = maybeFixSpecifier(file, spec);
    if (fixed !== spec) dirty = true;
    return `from "${fixed}"`;
  });
  if (dirty) {
    fs.writeFileSync(file, updated, "utf8");
    console.log("fixed:", path.relative(ROOT, file));
    changed++;
  }
}
console.log("done. files changed:", changed);
