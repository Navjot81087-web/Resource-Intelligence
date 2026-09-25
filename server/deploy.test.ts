import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";

describe("deployment readiness", () => {
  it("does not leave unresolved Vite analytics placeholders in the HTML shell", () => {
    const htmlPath = path.resolve(process.cwd(), "client/index.html");
    const html = fs.readFileSync(htmlPath, "utf8");

    expect(html).not.toContain("%VITE_ANALYTICS_ENDPOINT%");
    expect(html).not.toContain("%VITE_ANALYTICS_WEBSITE_ID%");
  });
});
