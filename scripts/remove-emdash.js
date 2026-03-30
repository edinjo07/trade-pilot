const fs = require("fs");
const path = require("path");
const root = path.resolve(__dirname, "..");
const exts = new Set([".ts", ".tsx", ".js", ".jsx", ".css", ".md", ".mjs"]);
const skip = new Set(["node_modules", ".next", ".git", "scripts"]);
let count = 0;

function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (!skip.has(entry.name)) walk(full);
    } else if (exts.has(path.extname(entry.name))) {
      const src = fs.readFileSync(full, "utf8");
      if (src.includes("\u2014")) {
        const replaced = src.replaceAll("\u2014", "");
        fs.writeFileSync(full, replaced, "utf8");
        count++;
        console.log("Fixed: " + full.replace(root + path.sep, ""));
      }
    }
  }
}

walk(root);
console.log("Done. Files updated: " + count);
