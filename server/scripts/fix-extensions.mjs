// node server/scripts/fix-extensions.cjs
import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd(); // run from /server
const RX_REL = /from\s+["'](\.\.?(?:\/[^"']*)?)["']/g;

function walk(dir, out=[]) {
  for (const name of fs.readdirSync(dir)) {
    const p = path.join(dir, name);
    const st = fs.statSync(p);
    if (st.isDirectory()) walk(p, out);
    else if (p.endsWith(".ts")) out.push(p);
  }
  return out;
}

const files = walk(path.join(ROOT));
let changed = 0;

for (const file of files) {
  let src = fs.readFileSync(file, "utf8");
  let updated = src.replace(RX_REL, (m, rel) => {
    if (rel.endsWith(".js") || rel.endsWith(".json")) return m; // already has ext
    // keep type-only imports untouched? NodeNext still wants .js, but type-only will erase on emit.
    // Safe default: append .js
    return `from "${rel}.js"`;
  });
  if (updated !== src) {
    fs.writeFileSync(file, updated, "utf8");
    console.log("fixed:", path.relative(ROOT, file));
    changed++;
  }
}
console.log("done. files changed:", changed);
