import assert from "node:assert/strict";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { basename, dirname, join } from "node:path";
import { test } from "node:test";
import { serveDir } from "../src/serve.ts";

test("viewer only listens on loopback and blocks paths outside the output directory", async () => {
  const root = mkdtempSync(join(tmpdir(), "domain-blueprint-viewer-"));
  const privateFile = join(dirname(root), `${basename(root)}-private.txt`);
  writeFileSync(join(root, "viewer.html"), "<h1>viewer</h1>");
  writeFileSync(privateFile, "PRIVATE");
  let served: Awaited<ReturnType<typeof serveDir>> | undefined;
  try {
    served = await serveDir(root, 0);
    assert.match(served.url, /^http:\/\/127\.0\.0\.1:\d+\/viewer\.html$/);
    const page = await fetch(served.url);
    assert.equal(page.status, 200);
    assert.equal(await page.text(), "<h1>viewer</h1>");

    const traversal = await fetch(new URL(`/..%2F${basename(privateFile)}`, served.url));
    assert.equal(traversal.status, 403);
  } finally {
    served?.close();
    rmSync(root, { recursive: true, force: true });
    rmSync(privateFile, { force: true });
  }
});
