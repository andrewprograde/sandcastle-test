# Sandcastle Demo

This repo uses Sandcastle to run Pi/Codex agents in Docker sandboxes.

## Environment model

Use two env files:

- `.sandcastle/.env` — ignored by git. Keep this as a Sandcastle **manifest** of allowed keys. When using dotenvx, leave secret values blank here so Sandcastle falls back to decrypted `process.env` values.
- `.env.sandcastle` — encrypted by dotenvx and safe to commit. Put the real Sandcastle values here.

Do **not** commit `.env.keys`; it contains the private decryption key.

> Do not encrypt `.sandcastle/.env` directly. Sandcastle parses that file itself, so encrypted ciphertext values there would be passed through as env values. Instead, decrypt `.env.sandcastle` with dotenvx before starting Sandcastle.

## First-time setup

Install dependencies with pnpm:

```bash
corepack enable
corepack prepare pnpm@11.5.2 --activate
pnpm install
```

Create the local Sandcastle manifest:

```bash
cp .sandcastle/.env.example .sandcastle/.env
```

Create the plaintext env file you will encrypt:

```bash
cat > .env.sandcastle <<'EOF'
PI_CODING_AGENT_DIR=/home/agent/.pi/agent
PI_CODING_AGENT_SESSION_DIR=/home/agent/.pi/agent/sessions
PI_OAUTH_CALLBACK_HOST=0.0.0.0
SANDCASTLE_GIT_USER_NAME="Andrew Alanis"
SANDCASTLE_GIT_USER_EMAIL=andrew@progradtechlabs.com
GH_TOKEN=replace-with-your-github-token
EOF
```

Encrypt it with dotenvx:

```bash
pnpm exec dotenvx encrypt -f .env.sandcastle
```

This rewrites `.env.sandcastle` with encrypted values and creates `.env.keys` with `DOTENV_PRIVATE_KEY_SANDCASTLE`. Commit `.env.sandcastle`; never commit `.env.keys`.

To add or rotate a value later:

```bash
pnpm exec dotenvx set GH_TOKEN "replace-with-new-token" -f .env.sandcastle
```

## Rebuild the Sandcastle image

The Docker image includes Pi, pnpm, and dotenvx:

```bash
pnpm exec sandcastle docker build-image
```

## Run Sandcastle with dotenvx

For normal host-side decryption:

```bash
pnpm run sandcastle:dotenvx
```

If agents need to run `dotenvx` inside the Sandcastle container too, export the private key before starting so it can be passed into the container:

```bash
set -a
. ./.env.keys
set +a
pnpm run sandcastle:dotenvx
```

Inside a sandbox, dotenvx is available, so an agent can run commands like:

```bash
dotenvx run -f .env.sandcastle -- pnpm test
```

For CI or another machine, set the private key as a secret env var instead of using `.env.keys`:

```bash
DOTENV_PRIVATE_KEY_SANDCASTLE="<private-key>" pnpm run sandcastle:dotenvx
```

## Pi OAuth state

Pi/Codex OAuth state is persisted on the host under `.sandcastle/pi/` and bind-mounted to `~/.pi/agent` in the Sandcastle container. The directory is tracked with `.gitkeep`, but credentials and sessions inside it are ignored.
