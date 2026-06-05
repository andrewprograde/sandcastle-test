FROM node:22-bookworm AS node_runtime
FROM ghcr.io/astral-sh/uv:latest AS uv_runtime
FROM python:3-bookworm

# Install system dependencies
RUN apt-get update && apt-get install -y \
  build-essential \
  ca-certificates \
  git \
  curl \
  jq \
  && rm -rf /var/lib/apt/lists/*

# Copy Node 22 from the official Node image. Sandcastle/Pi tooling is Node-based,
# while the final image is Python-first for PyPI/uv projects.
COPY --from=node_runtime /usr/local/bin/node /usr/local/bin/node
COPY --from=node_runtime /usr/local/lib/node_modules /usr/local/lib/node_modules
RUN ln -sf ../lib/node_modules/npm/bin/npm-cli.js /usr/local/bin/npm \
  && ln -sf ../lib/node_modules/npm/bin/npx-cli.js /usr/local/bin/npx \
  && ln -sf ../lib/node_modules/corepack/dist/corepack.js /usr/local/bin/corepack

# Install uv/uvx for Python dependency management.
COPY --from=uv_runtime /uv /usr/local/bin/uv
COPY --from=uv_runtime /uvx /usr/local/bin/uvx

# Keep baseline Python packaging tools current for plain PyPI/pip workflows.
RUN python -m pip install --upgrade pip setuptools wheel

# Install GitHub CLI
RUN curl -fsSL https://cli.github.com/packages/githubcli-archive-keyring.gpg \
  | dd of=/usr/share/keyrings/githubcli-archive-keyring.gpg \
  && echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/githubcli-archive-keyring.gpg] https://cli.github.com/packages stable main" \
  | tee /etc/apt/sources.list.d/github-cli.list > /dev/null \
  && apt-get update && apt-get install -y gh \
  && rm -rf /var/lib/apt/lists/*

# Build-args for UID/GID alignment: sandcastle docker build-image
# defaults these to the host user's UID/GID so image-built files
# and bind-mounted files share an owner without runtime chown.
ARG AGENT_UID=1000
ARG AGENT_GID=1000

# Create the agent user and align UID/GID with the host user.
RUN if ! getent group "$AGENT_GID" > /dev/null; then groupadd -o -g "$AGENT_GID" agent; fi \
  && useradd -o -u "$AGENT_UID" -g "$AGENT_GID" -d /home/agent -m -s /bin/bash agent

# Install pnpm plus global agent tooling (run as root before USER agent).
ENV PNPM_HOME=/usr/local/share/pnpm
ENV COREPACK_HOME=/usr/local/share/corepack
ENV PATH=$PNPM_HOME/bin:$PNPM_HOME:$PATH

RUN mkdir -p "$PNPM_HOME/bin" "$COREPACK_HOME" \
  && corepack enable \
  && corepack prepare pnpm@11.5.2 --activate \
  && pnpm config set global-bin-dir "$PNPM_HOME/bin" \
  && pnpm add --global --ignore-scripts @earendil-works/pi-coding-agent @dotenvx/dotenvx \
  && chown -R "$AGENT_UID:$AGENT_GID" "$PNPM_HOME" "$COREPACK_HOME"

# Git identity for agent-created commits is configured at runtime by
# .sandcastle/main.mts using these optional environment variables.
ENV SANDCASTLE_GIT_USER_NAME="" \
  SANDCASTLE_GIT_USER_EMAIL=""

# Pi stores subscription OAuth credentials in auth.json under PI_CODING_AGENT_DIR.
# The Sandcastle script bind-mounts .sandcastle/pi here so ChatGPT/Codex OAuth
# tokens and Pi sessions survive container restarts without being committed.
ENV PI_CODING_AGENT_DIR=/home/agent/.pi/agent \
  PI_CODING_AGENT_SESSION_DIR=/home/agent/.pi/agent/sessions \
  PI_OAUTH_CALLBACK_HOST=0.0.0.0

RUN mkdir -p "$PI_CODING_AGENT_SESSION_DIR" \
  && chown -R "$AGENT_UID:$AGENT_GID" /home/agent/.pi

USER ${AGENT_UID}:${AGENT_GID}

WORKDIR /home/agent

# In worktree sandbox mode, Sandcastle bind-mounts the git worktree at /home/agent/workspace
# and overrides the working directory to /home/agent/workspace at container start.
# Structure your Dockerfile so that /home/agent/workspace can serve as the project root.
ENTRYPOINT ["sleep", "infinity"]
