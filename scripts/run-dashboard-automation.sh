#!/usr/bin/env bash

set -euo pipefail

if ! command -v node >/dev/null 2>&1; then
  if command -v brew >/dev/null 2>&1; then
    eval "$(brew shellenv)"
  elif [[ -x /opt/homebrew/bin/brew ]]; then
    eval "$(/opt/homebrew/bin/brew shellenv)"
  elif [[ -x /usr/local/bin/brew ]]; then
    eval "$(/usr/local/bin/brew shellenv)"
  fi
fi

if ! command -v node >/dev/null 2>&1; then
  echo "Node.js is not available. Install it with Homebrew or ensure the automation runs in a shell that loads Homebrew."
  exit 1
fi

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"

cd "${REPO_ROOT}"
node ./scripts/sync-and-deploy.mjs
