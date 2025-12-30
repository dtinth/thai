import { execSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const useMiseEnv = Deno.env.get("USE_MISE");
const useMise = useMiseEnv !== "0";
const miseExec = useMise ? "mise exec -- " : "";
const rootDir = dirname(fileURLToPath(import.meta.url));
const testsBunDir = join(rootDir, "tests-bun");
const testsNodeDir = join(rootDir, "tests-node");

function run(command: string, cwd: string) {
  execSync(`${miseExec}${command}`, { stdio: "inherit", cwd });
}

function setup(cwd: string) {
  if (useMise) {
    execSync("mise install", { stdio: "inherit", cwd });
  } else {
    console.warn(
      `Skipping mise install in ${cwd} (USE_MISE=0); assuming tools are available`,
    );
  }
}

Deno.test("bun", async () => {
  setup(testsBunDir);
  run("bun install", testsBunDir);
  run("bun test", testsBunDir);
});

Deno.test("node", async () => {
  setup(testsNodeDir);
  run("corepack enable", testsNodeDir);
  run("pnpm install", testsNodeDir);
  run("pnpm test", testsNodeDir);
});
