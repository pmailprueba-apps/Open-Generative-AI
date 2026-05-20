#!/usr/bin/env bash
set -euo pipefail

# Base directory containing all projects
BASE_DIR="/Users/macbook/Proyectos"

# Repo to clone
REPO_URL="https://github.com/anthropics/skills.git"

# Directories to exclude (hidden or system dirs)
EXCLUDE=(".git" ".agents" "\.DS_Store" "node_modules" "__pycache__" "mcp-servers" "marketingskills" "common" "docs" "REPOS" "BACKUPS" "cloned-repos")

# Function to check if a directory is in the exclude list
is_excluded() {
  local name="$1"
  for ex in "${EXCLUDE[@]}"; do
    if [[ "$name" == "$ex" ]]; then
      return 0
    fi
  done
  return 1
}

# Iterate over each entry in BASE_DIR
for entry in "$BASE_DIR"/*; do
  if [[ -d "$entry" ]]; then
    dir_name=$(basename "$entry")
    if is_excluded "$dir_name"; then
      echo "Skipping excluded directory: $dir_name"
      continue
    fi
    echo "Processing project: $dir_name"
    TARGET="$entry/skills"
    # If the target already exists, skip or update? We'll skip to avoid re-cloning.
    if [[ -d "$TARGET" ]]; then
      echo "  -> skills folder already exists, skipping"
      continue
    fi
    mkdir -p "$TARGET"
    git clone "$REPO_URL" "$TARGET"
    echo "  -> cloned into $TARGET"
  fi
done

echo "All done."
