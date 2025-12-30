## Setup notes

- Use mise from the GitHub release archive (`mise-v2025.12.12-linux-x64`) and place it in `~/.local/bin` when `mise.run` is unavailable.
- Install Deno 2.6.3 from the GitHub release (`deno-x86_64-unknown-linux-gnu.zip`) into `~/.local/bin/deno` because `deno.com` may be blocked.
- Install Bun 1.1.30 from the GitHub release (`bun-linux-x64-baseline.zip`) into `~/.local/bin/bun`.
- Extract Node.js 22.21.1 to `~/.local/node-v22.21.1/bin` and prepend this to `PATH` so `pnpm test` in `sql-storage/tests-node` can use `--experimental-strip-types` and `--experimental-sqlite`.
- Set `DENO_TLS_CA_STORE=system` to avoid TLS errors when Deno downloads npm packages through the registry proxy.
- Set `USE_MISE=0` while testing if the GitHub API is blocked; this skips `mise install` inside `sql-storage/integration.test.ts` and relies on the binaries above.

## Running tests

- Run the Deno suite (covers carify, funny-json, get-or-create, html, sql-storage):\
  `PATH="$HOME/.local/node-v22.21.1/bin:$HOME/.local/bin:$PATH" USE_MISE=0 DENO_TLS_CA_STORE=system deno test -A --lock=deno.lock`
- Run the Bun-specific text cleaner tests:\
  `PATH="$HOME/.local/node-v22.21.1/bin:$HOME/.local/bin:$PATH" bun test text-cleaner/mod.test.ts`
