import { existsSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const projectRoot = process.cwd();

function patchExcalidrawImports() {
  const prodDir = join(
    projectRoot,
    "node_modules",
    "@excalidraw",
    "excalidraw",
    "dist",
    "prod",
  );

  if (!existsSync(prodDir)) return 0;

  const files = readdirSync(prodDir).filter((file) => file.endsWith(".js"));
  let patchedFiles = 0;

  for (const file of files) {
    const fullPath = join(prodDir, file);
    const source = readFileSync(fullPath, "utf8");
    const next = source.replace(/roughjs\/bin\/([a-z]+)(?=["'])/g, "roughjs/bin/$1.js");

    if (next !== source) {
      writeFileSync(fullPath, next, "utf8");
      patchedFiles += 1;
    }
  }

  return patchedFiles;
}

const patched = patchExcalidrawImports();
console.log(
  patched > 0
    ? `Patched roughjs imports in ${patched} Excalidraw file(s).`
    : "No Excalidraw roughjs import patch needed.",
);
