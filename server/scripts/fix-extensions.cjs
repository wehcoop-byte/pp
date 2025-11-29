// server/scripts/fix-extensions.cjs  (CommonJS-safe)
const fs = require("node:fs");
const path = require("node:path");

const ROOT = process.cwd();
const RX_REL = /from\s+["'](\.\.?(?:\/[^"']*)?)["']/g;

function walk(dir, out = []) {
  for (const name of fs.readdirSync(dir)) {
    const p = path.join(dir, name);
    const st = fs.statSync(p);
    const rel = path.relative(ROOT, p).replace(/\\/g, "/");
    if (st.isDirectory()) {
      // skip junk
      if (/(^|\/)(node_modules|dist|scripts)(\/|$)/.test(rel)) continue;
      walk(p, out);
    } else if (
      p.endsWith(".ts") &&
      !p.endsWith(".d.ts") &&          // don’t touch type defs
      !/(^|\/)node_modules(\/|$)/.test(rel)
    ) {
      out.push(p);
    }
  }
  return out;
}

const files = walk(ROOT);
let changed = 0;

for (const file of files) {
  let src = fs.readFileSync(file, "utf8");
  const updated = src.replace(RX_REL, (m, rel) => {
    // already has an extension? leave it
    if (/\.(js|mjs|cjs|json)$/.test(rel)) return m;
    return `from "${rel}.js"`;
  });
  if (updated !== src) {
    fs.writeFileSync(file, updated, "utf8");
    console.log("fixed:", path.relative(ROOT, file));
    changed++;
  }
}
console.log("done. files changed:", changed);
