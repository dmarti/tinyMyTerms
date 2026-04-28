#!/usr/bin/env bash
# generate-zip.sh — produce a ready-to-deploy .well-known ZIP for a website operator
#
# Usage:
#   bash scripts/generate-zip.sh \
#     --tos-url https://example.com/terms \
#     --agreements SD-BASE,PDC-GOOD \
#     [--tos-file path/to/terms.html] \
#     [--output mysite-myterms.zip]
#
# Output: ZIP containing .well-known/myterms.json + blocklist(s)
# Install: unzip <output>.zip -d /your/site/root

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_DIR="$(dirname "$SCRIPT_DIR")"
TEMPLATE="$REPO_DIR/templates/myterms.json"
BLOCKLISTS_DIR="$REPO_DIR/blocklists"

TOS_URL=""
TOS_FILE=""
AGREEMENTS_ARG="SD-BASE"
OUTPUT="tinymyterms-deploy.zip"

while [[ $# -gt 0 ]]; do
  case "$1" in
    --tos-url)     TOS_URL="$2";       shift 2 ;;
    --tos-file)    TOS_FILE="$2";      shift 2 ;;
    --agreements)  AGREEMENTS_ARG="$2"; shift 2 ;;
    --output)      OUTPUT="$2";        shift 2 ;;
    *) echo "Unknown argument: $1" >&2; exit 1 ;;
  esac
done

if [[ -z "$TOS_URL" ]]; then
  echo "ERROR: --tos-url is required" >&2
  exit 1
fi

IFS=',' read -ra AGREEMENTS <<< "$AGREEMENTS_ARG"

EFFECTIVE_DATE="$(date -u '+%a, %d %b %Y %H:%M:%S +0000')"

if [[ -n "$TOS_FILE" && -f "$TOS_FILE" ]]; then
  TOS_HTML="$(cat "$TOS_FILE")"
else
  echo "INFO: no --tos-file provided; tos field will be empty (add HTML manually)"
  TOS_HTML=""
fi

TMPDIR="$(mktemp -d)"
trap 'rm -rf "$TMPDIR"' EXIT

mkdir -p "$TMPDIR/.well-known"

python3 - <<PYEOF
import json, sys

agreements = [
  {"id": a.strip(), "url": f"https://myterms.info/agreements/{a.strip()}"}
  for a in "${AGREEMENTS_ARG}".split(",")
]

data = {
  "effective_date": "${EFFECTIVE_DATE}",
  "agreements": agreements,
  "tos_url": "${TOS_URL}",
  "tos": """${TOS_HTML}"""
}

with open("${TMPDIR}/.well-known/myterms.json", "w") as f:
  json.dump(data, f, indent=2)

print("  wrote .well-known/myterms.json")
PYEOF

for agreement in "${AGREEMENTS[@]}"; do
  agreement="$(echo "$agreement" | tr -d '[:space:]')"
  src="$BLOCKLISTS_DIR/${agreement}.txt"
  if [[ -f "$src" ]]; then
    mkdir -p "$TMPDIR/blocklists"
    cp "$src" "$TMPDIR/blocklists/${agreement}.txt"
    echo "  included blocklists/${agreement}.txt"
  else
    echo "  WARNING: no blocklist found for $agreement" >&2
  fi
done

(cd "$TMPDIR" && zip -r - .) > "$OUTPUT"
echo ""
echo "Created: $OUTPUT"
echo "Deploy:  unzip $OUTPUT -d /path/to/your/site"
