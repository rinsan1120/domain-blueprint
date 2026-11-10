import { readFileSync } from "node:fs";
import { dirname, isAbsolute, resolve } from "node:path";
import type { I18n, RenderKind } from "./render.ts";

export type View = { key: string; label: string; kind: RenderKind; layout?: "elk" | "dagre"; source?: string };

export type BlueprintConfig = {
  title: string;
  model: string;
  schema: string;
  outDir: string;
  views: View[];
  typeMap: Record<string, string>;
  api: { pathPrefix?: string; crudVerbs?: string[] };
  i18n: Partial<I18n>;
  adapters: string[];
  // Code-driven pipeline: extractors produce the auto graph, which is merged with the
  // manual presentation to build the model that the views render.
  extractors: string[];
  auto: string;
  presentation: string;
};

export type ResolvedConfig = BlueprintConfig & { configDir: string; configPath: string };

const DEFAULT_VIEWS: View[] = [
  { key: "logical", label: "論理ER図", kind: "logical" },
  { key: "physical", label: "物理ER図", kind: "physical", layout: "dagre" },
  { key: "flow", label: "業務フロー", kind: "flow" },
  { key: "nav", label: "画面遷移図", kind: "nav" },
  { key: "api", label: "API連携図", kind: "api", layout: "elk" },
];

export function loadConfig(configPath: string): ResolvedConfig {
  const absolute = resolve(configPath);
  const raw = JSON.parse(readFileSync(absolute, "utf8")) as Partial<BlueprintConfig>;
  return {
    title: raw.title ?? "設計図",
    model: raw.model ?? "domain-model.json",
    schema: raw.schema ?? "domain-model.schema.json",
    outDir: raw.outDir ?? "generated",
    views: raw.views ?? DEFAULT_VIEWS,
    typeMap: raw.typeMap ?? {},
    api: raw.api ?? {},
    i18n: raw.i18n ?? {},
    adapters: raw.adapters ?? [],
    extractors: raw.extractors ?? [],
    auto: raw.auto ?? "generated/graph.auto.json",
    presentation: raw.presentation ?? "presentation.json",
    configDir: dirname(absolute),
    configPath: absolute,
  };
}

export function resolveConfigPath(config: ResolvedConfig, path: string): string {
  return isAbsolute(path) ? path : resolve(config.configDir, path);
}
