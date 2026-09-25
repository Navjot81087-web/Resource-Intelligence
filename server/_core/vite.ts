import express, { type Express } from "express";
import fs from "fs";
import { type Server } from "http";
import { nanoid } from "nanoid";
import path from "path";
import { createServer as createViteServer } from "vite";
import viteConfig from "../../vite.config";

const projectRoot = process.cwd();
const distPublicDir = path.resolve(projectRoot, "dist", "public");
const clientIndexPath = path.resolve(projectRoot, "client", "index.html");

export async function setupVite(app: Express, server: Server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true as const,
  };

  const vite = await createViteServer({
    ...viteConfig,
    configFile: false,
    server: serverOptions,
    appType: "custom",
  });

  app.use(vite.middlewares);
  app.use("*", async (req, res, next) => {
    const url = req.originalUrl;

    try {
      let template = await fs.promises.readFile(clientIndexPath, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e as Error);
      next(e);
    }
  });
}

export function serveStatic(app: Express) {
  if (!fs.existsSync(distPublicDir)) {
    console.error(
      `Could not find the build directory: ${distPublicDir}, make sure to build the client first`
    );
  }

  app.use(express.static(distPublicDir));

  app.use("*", (_req, res) => {
    res.sendFile(path.resolve(distPublicDir, "index.html"));
  });
}
