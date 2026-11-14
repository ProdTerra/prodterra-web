import { copyFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const workerSource = join(projectRoot, "node_modules", "maplibre-gl", "dist", "maplibre-gl-worker.mjs");
const workerTargetDirectory = join(projectRoot, "public", "vendor");

mkdirSync(workerTargetDirectory, { recursive: true });
copyFileSync(workerSource, join(workerTargetDirectory, "maplibre-gl-worker.mjs"));
