#!/usr/bin/env bash
set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$repo_root/docs"

port="${PORT:-4000}"

bundle exec jekyll serve \
  --config _config.dev.yml \
  --host 127.0.0.1 \
  --port "$port" \
  --livereload
