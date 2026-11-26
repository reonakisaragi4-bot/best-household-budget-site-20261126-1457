// HearthLedger entry program (main.ts).
// Hands the site in: copies app/ and screenshots/ from this repository
// into the output directory and writes /output/dossier.json with
// buildDossier from vendor/makefun-frontend.ts.
//
// Outside the grader, MAKEFUN_OUTPUT_DIR stands in for /output.
// The repository root is the directory this file lives in; the grader
// mounts it read-only at /bot, so nothing is ever written back into it.

import { cp, mkdir, stat, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { buildDossier } from "./vendor/makefun-frontend.ts";

const repoRoot = dirname(fileURLToPath(import.meta.url));
const outDir = process.env.MAKEFUN_OUTPUT_DIR || "/output";

// Fail loudly, before copying anything, if the site is incomplete.
for (const needed of ["app", "app/index.html", "screenshots"]) {
  await stat(join(repoRoot, needed));
}

await mkdir(join(outDir, "app"), { recursive: true });
await mkdir(join(outDir, "screenshots"), { recursive: true });

// Copy the whole site and the screenshots exactly as they are.
await cp(join(repoRoot, "app"), join(outDir, "app"), { recursive: true });
await cp(join(repoRoot, "screenshots"), join(outDir, "screenshots"), { recursive: true });

// The dossier is built from the repository itself, so it always matches
// the files handed in. Its text is capped at 160 KiB by the library.
const dossier = await buildDossier(repoRoot, { text_max_bytes: 163840 });
await writeFile(join(outDir, "dossier.json"), dossier);

console.log("HearthLedger handed in to " + outDir);
