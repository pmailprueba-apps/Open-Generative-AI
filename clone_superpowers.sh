#!/usr/bin/env bash
set -euo pipefail

BASE_DIR="/Users/macbook/Proyectos"
REPO_URL="https://github.com/obra/superpowers.git"
TARGET_SUBDIR=".agents/raz"

# Directories to exclude (system or hidden)
EXCLUDE=(".git" ".agents" "\.DS_Store" "node_modules" "__pycache__" "mcp-servers" "marketingskills" "common" "docs" "BACKUPS" "cloned-repos")

is_excluded() {
  local name="$1"
  for ex in "${EXCLUDE[@]}"; do
    if [[ "$name" == "$ex" ]]; then
      return 0
    fi
  done
  return 1
}

for entry in "$BASE_DIR"/*; do
  if [[ -d "$entry" ]]; then
    dir_name=$(basename "$entry")
    if is_excluded "$dir_name"; then
      echo "Skipping excluded directory: $dir_name"
      continue
    fi
    echo "Processing project: $dir_name"
    TARGET="$entry/$TARGET_SUBDIR"
    if [[ -d "$TARGET" ]]; then
      echo "  -> $TARGET already exists, skipping"
      continue
    fi
    mkdir -p "$TARGET"
    git clone "$REPO_URL" "$TARGET"
    echo "  -> cloned into $TARGET"
  fi
done

echo "All done."
