import { execSync } from "node:child_process";

Deno.test("bun", async () => {
  execSync("mise install", { stdio: "inherit", cwd: "tests-bun" });
  execSync("mise exec -- bun install", { stdio: "inherit", cwd: "tests-bun" });
  execSync("mise exec -- bun test", { stdio: "inherit", cwd: "tests-bun" });
});

Deno.test("node", async () => {
  execSync("mise install", { stdio: "inherit", cwd: "tests-node" });
  execSync("mise exec -- pnpm install", {
    stdio: "inherit",
    cwd: "tests-node",
  });
  execSync("mise exec -- pnpm test", { stdio: "inherit", cwd: "tests-node" });
});
