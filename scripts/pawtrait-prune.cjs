
// pawtrait-prune.cjs
// CommonJS variant for Windows/PowerShell. No shebang, no ESM.

const fs = require("fs");
const path = require("path");

function parseArgv(argv) {
  const out = {};
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith("--")) {
      const eq = a.indexOf("=");
      if (eq > -1) out[a.slice(2, eq)] = a.slice(eq + 1);
      else out[a.slice(2)] = true;
    }
  }
  return out;
}

const argv = parseArgv(process.argv);

function usage() {
  console.log(`
pawtrait-prune (CJS)
--------------------
Required:
  --root=src
  --entry=src/main.tsx,src/routes/AppRoutes.tsx

Optional:
  --out=cleanup-manifest.txt       # file to write list of unreferenced files
  --delete                         # actually delete the unreferenced files
  --include-ext=.ts,.tsx,.js,.jsx  # override scanned extensions
  --exclude-dirs=__tests__,stories # comma list of directories to always exclude from deletion
  --verbose                        # log details
`);
}

if (!argv.root || !argv.entry) {
  usage();
  process.exit(1);
}

const projectRoot = process.cwd();
const rootDir = path.resolve(projectRoot, String(argv.root));
const entries = String(argv.entry).split(",").map(e => path.resolve(projectRoot, e.trim()));
const verbose = !!argv.verbose;
const deleteMode = !!argv.delete;

const includeExt = (argv["include-ext"] ? String(argv["include-ext"]).split(",") : [".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs"]).map(s => s.trim().toLowerCase());
const excludeDirs = new Set((argv["exclude-dirs"] ? String(argv["exclude-dirs"]).split(",") : ["__tests__", "__mocks__", ".vite", "stories"]).map(s => s.trim()));

// Find all candidate files under rootDir
function listFiles(dir) {
  const acc = [];
  for (const name of fs.readdirSync(dir)) {
    const p = path.join(dir, name);
    const stat = fs.lstatSync(p);
    if (stat.isSymbolicLink()) continue;
    if (stat.isDirectory()) {
      if (excludeDirs.has(name) || name === "node_modules") continue;
      acc.push(...listFiles(p));
    } else {
      acc.push(p);
    }
  }
  return acc;
}

const allFiles = listFiles(rootDir);
const codeFiles = new Set(allFiles.filter(f => includeExt.includes(path.extname(f).toLowerCase())));

function resolveImport(fromFile, imp) {
  if (!imp.startsWith("./") && !imp.startsWith("../")) return null;
  const base = path.resolve(path.dirname(fromFile), imp);
  const candidates = [];

  candidates.push(base);
  for (const ext of includeExt) candidates.push(base + ext);
  for (const ext of includeExt) candidates.push(path.join(base, "index" + ext));

  for (const c of candidates) {
    if (codeFiles.has(c)) return c;
  }
  return null;
}

const importRe = /^\s*import\s+(?:.+?\s+from\s+)?["'`](.+?)["'`]\s*;?/gm;

function getImports(file) {
  let src;
  try { src = fs.readFileSync(file, "utf8"); } catch { return []; }
  const imps = [];
  let m;
  while ((m = importRe.exec(src))) imps.push(m[1]);
  return imps;
}

// Traverse
const reachable = new Set();
const queue = [...entries];

for (const e of entries) {
  if (!fs.existsSync(e)) {
    console.error(`Entry not found: ${e}`);
  }
}

while (queue.length) {
  const f = queue.shift();
  if (!f) break;
  const isCode = codeFiles.has(f);
  if (!isCode) continue;
  if (reachable.has(f)) continue;
  reachable.add(f);
  const imps = getImports(f);
  for (const imp of imps) {
    const r = resolveImport(f, imp);
    if (r && !reachable.has(r)) queue.push(r);
  }
}

const unref = [...codeFiles].filter(f => !reachable.has(f));
const keep = new Set(entries.map(e => path.resolve(e)));
const filteredUnref = unref.filter(f => !keep.has(path.resolve(f)));

const outPath = path.resolve(projectRoot, String(argv.out || "cleanup-manifest.txt"));
fs.writeFileSync(outPath, filteredUnref.map(p => path.relative(projectRoot, p)).join("\n"), "utf8");

console.log(`Reachable files: ${reachable.size}`);
console.log(`Unreferenced files (candidates): ${filteredUnref.length}`);
console.log(`Manifest written to: ${outPath}`);

if (deleteMode) {
  console.log("Deleting unreferenced files...");
  let count = 0;
  for (const f of filteredUnref) {
    try {
      fs.unlinkSync(f);
      if (verbose) console.log("Deleted", f);
      count++;
    } catch (e) {
      console.warn("Could not delete", f, e.message);
    }
  }
  console.log(`Deleted ${count} files.`);
} else {
  console.log("Dry run only. Re-run with --delete to actually remove files.");
}
