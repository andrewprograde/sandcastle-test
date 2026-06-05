FROM node:22-bookworm

# Install system dependencies
RUN apt-get update && apt-get install -y \
  git \
  curl \
  jq \
  && rm -rf /var/lib/apt/lists/*

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

# Rename the base image's "node" user to "agent" and align UID/GID.
RUN groupmod -o -g $AGENT_GID node && usermod -o -u $AGENT_UID -g $AGENT_GID -d /home/agent -m -l agent node

# Install pi coding agent (run as root before USER agent)
RUN npm install -g --ignore-scripts @earendil-works/pi-coding-agent

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
  && chown -R $AGENT_UID:$AGENT_GID /home/agent/.pi

USER ${AGENT_UID}:${AGENT_GID}

WORKDIR /home/agent

# In worktree sandbox mode, Sandcastle bind-mounts the git worktree at /home/agent/workspace
# and overrides the working directory to /home/agent/workspace at container start.
# Structure your Dockerfile so that /home/agent/workspace can serve as the project root.
ENTRYPOINT ["sleep", "infinity"]
