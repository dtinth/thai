## Setup notes

- Install mise (e.g., `curl https://mise.run | sh` or download `mise-v2025.12.12-linux-x64` to `~/.local/bin/mise`).
- Run `PATH="$HOME/.local/bin:$PATH" mise install` to provision Deno 2.6.3 and other tools from `.mise.toml`.
- If any domain is blocked (e.g., `dl.deno.land`), ask to unblock and rerun `mise install`.
- Keep Bun 1.1.30 and Node 22.21.1 available via mise or existing binaries for auxiliary tests.

## Running tests

- Preferred (with mise shims active): `PATH="$HOME/.local/bin:$PATH" mise exec -- deno test -A --lock=deno.lock`
- text-cleaner (Deno): `PATH="$HOME/.local/bin:$PATH" mise exec -- deno test -A text-cleaner/mod.test.ts`
