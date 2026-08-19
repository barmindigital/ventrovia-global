import "server-only";
import brandFastPath from "@/data/brand-operations/fast-path-to-brand-safe.json";
import brandHealthManifest from "@/data/brand-operations/manifest.json";

const datasets = {
  "brand-health-manifest": brandHealthManifest,
  "brand-fast-path": brandFastPath,
} as const;

export function brandHealthDataset(name: string) {
  if (!Object.hasOwn(datasets, name)) return null;
  return datasets[name as keyof typeof datasets];
}
