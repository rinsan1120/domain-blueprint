import assert from "node:assert/strict";
import { test } from "node:test";
import type { Model } from "../src/model.ts";
import { apiMapD2, logicalD2, physicalD2 } from "../src/render.ts";

const model: Model = {
  domains: {
    string: { kind: "primitive" },
    status: { kind: "state", logical: "string", values: ["todo", "done"] },
  },
  entities: {
    tasks: { attributes: { id: { domain: "string", pk: true }, status: { domain: "status" } } },
  },
  screens: { S01: { name: "Tasks", entities: ["tasks"], onLoad: "html_tasks", references: ["tasks_list"] } },
  navigation: [{ from: "S01", on: "save", to: "S01", call: "tasks_patch" }],
  api: {
    tasks_list: { kind: "api", method: "GET", path: "/api/tasks", operation: "list", entity: "tasks", success: 200 },
    tasks_patch: { kind: "api", method: "PATCH", path: "/api/tasks/{id}", operation: "patch", entity: "tasks", success: 200 },
    html_tasks: { kind: "html", method: "GET", path: "/tasks", operation: "load", entity: "tasks", success: 200 },
  },
};

test("logicalD2 renders tables with primary keys", () => {
  const out = logicalD2(model);
  assert.match(out, /id: string \{constraint: primary_key\}/);
  assert.match(out, /status: string/);
});

test("physicalD2 maps logical types through typeMap", () => {
  const out = physicalD2(model, { string: "TEXT" });
  assert.match(out, /id: TEXT \{constraint: primary_key\}/);
});

test("apiMapD2 links screens to endpoints and endpoints to entities", () => {
  const out = apiMapD2(model);
  assert.match(out, /S01 -> tasks_patch: "save"/);
  assert.match(out, /tasks_patch -> tasks/);
  assert.match(out, /S01 -> tasks_list: "参照"/);
  assert.match(out, /S01 -> html_tasks: "初期表示"/);
});
