// Yayın betiği: Changesets action'ı "publish" modunda bunu çalıştırır (pnpm release).
//
// Neden `changeset publish` değil: package.json'daki publishConfig.exports'u (geliştirmede
// src, yayında dist) sadece pnpm uygular. Paketi pnpm hazırlar (pnpm pack), npm sadece hazır
// .tgz'yi yükler; böylece içerik doğru olur, npm'in provenance ve trusted publishing'i çalışır.
//
// Kullanım: node scripts/release.mjs [--dry-run]
//   --dry-run: npm'e yüklemez, etiket ve GitHub sürümü açmaz; sadece ne olacağını gösterir.
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, rmSync } from "node:fs";
import path from "node:path";

const PKG_DIR = "packages/plonk";
const OUT_DIR = path.resolve(".release");
const dryRun = process.argv.includes("--dry-run");
const inCI = process.env.GITHUB_ACTIONS === "true";

const { name, version } = JSON.parse(
  readFileSync(`${PKG_DIR}/package.json`, "utf8"),
);
const tag = `${name}@${version}`;

const run = (cmd, args) => execFileSync(cmd, args, { stdio: "inherit" });

// Bu sürüm npm'de zaten var mı? Action değişiklik notu olmayan her push'ta yayın moduna
// geçer; o zaman sessizce çıkmalıyız.
function isPublished() {
  try {
    const out = execFileSync("npm", ["view", tag, "version"], {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    });
    return out.trim() === version;
  } catch {
    return false; // E404: ne paket ne sürüm var
  }
}

// CHANGELOG.md'den bu sürümün bölümü (GitHub sürüm notu için).
function releaseNotes() {
  const file = `${PKG_DIR}/CHANGELOG.md`;
  if (!existsSync(file)) return `Release ${tag}`;
  const text = readFileSync(file, "utf8");
  const start = text.indexOf(`## ${version}`);
  if (start === -1) return `Release ${tag}`;
  const rest = text.slice(start + `## ${version}`.length);
  const end = rest.search(/\n## /);
  return (end === -1 ? rest : rest.slice(0, end)).trim();
}

if (isPublished()) {
  console.log(`${tag} is already on npm, nothing to publish.`);
  process.exit(0);
}

rmSync(OUT_DIR, { recursive: true, force: true });
mkdirSync(OUT_DIR);
run("pnpm", ["--filter", name, "build"]);
run("pnpm", ["--filter", name, "pack", "--pack-destination", OUT_DIR]);

const tarball = path.join(OUT_DIR, `${name}-${version}.tgz`);
const publishArgs = ["publish", tarball, "--access", "public"];
if (inCI) publishArgs.push("--provenance");
if (dryRun) publishArgs.push("--dry-run");
run("npm", publishArgs);

if (dryRun) {
  console.log(`\nDry run: would tag ${tag} and create a GitHub release.`);
  console.log(releaseNotes());
  process.exit(0);
}

run("git", ["tag", tag]);
run("git", ["push", "origin", tag]);
if (inCI) {
  run("gh", [
    "release",
    "create",
    tag,
    "--title",
    tag,
    "--notes",
    releaseNotes(),
  ]);
}
console.log(`Published ${tag}.`);
