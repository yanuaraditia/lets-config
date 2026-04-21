import { readFileSync, writeFileSync } from "fs";
import { resolve } from "path";

const root = resolve(import.meta.dir, "..");

interface PackageJson {
  version: string;
  [key: string]: unknown;
}

const rootPkg: PackageJson = JSON.parse(
  readFileSync(resolve(root, "package.json"), "utf8")
);
const { version } = rootPkg;

const packages = ["core", "vite", "react"];

for (const pkg of packages) {
  const pkgPath = resolve(root, "packages", pkg, "package.json");
  const pkgJson: PackageJson = JSON.parse(readFileSync(pkgPath, "utf8"));
  pkgJson.version = version;
  writeFileSync(pkgPath, JSON.stringify(pkgJson, null, 2) + "\n");
  console.log(`✔ packages/${pkg} → ${version}`);
}
