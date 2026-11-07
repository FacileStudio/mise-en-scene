#!/usr/bin/env bash
#
# Facile Studio installer. Canonical shape lives in Wiki/CLI-STANDARD.md.
# mise-en-scene ships no binary, so this registers the AI agent skill only. The message
# vocabulary matches every other Facile installer.
# Every statement sits inside a function and main() is the last line, so a
# download truncated mid-flight executes nothing at all.

set -euo pipefail

NAME="mise-en-scene"
REPO="FacileStudio/mise-en-scene"
BRANCH="main"
SKILL="mise-en-scene"
FILES="SKILL.md references/craft.md references/framing.md references/motion.md references/bento.md"

# --- output -----------------------------------------------------------------

setup_colors() {
  if [ -t 1 ] && [ -z "${NO_COLOR:-}" ] && [ "${TERM:-dumb}" != "dumb" ]; then
    C_INFO=$'\033[36m' C_OK=$'\033[32m' C_WARN=$'\033[33m' C_ERR=$'\033[31m'
    C_DIM=$'\033[2m' C_OFF=$'\033[0m'
  else
    C_INFO="" C_OK="" C_WARN="" C_ERR="" C_DIM="" C_OFF=""
  fi
}

info() { printf '%s▸%s %s\n' "$C_INFO" "$C_OFF" "$*"; }
ok()   { printf '%s✓%s %s\n' "$C_OK" "$C_OFF" "$*"; }
warn() { printf '%s!%s %s\n' "$C_WARN" "$C_OFF" "$*" >&2; }
hint() { printf '  %s%s%s\n' "$C_DIM" "$*" "$C_OFF"; }
die()  { printf '%s✗%s %s\n' "$C_ERR" "$C_OFF" "$*" >&2; exit 1; }

usage() {
  cat <<USAGE
Install the $NAME AI agent skill.

Usage:
  install.sh [options]

Options:
  -l, --local       Install from this checkout instead of $BRANCH on GitHub
  -h, --help        Show this help

Environment:
  NO_COLOR          Disable colored output
USAGE
}

# --- steps ------------------------------------------------------------------

parse_args() {
  LOCAL=0
  while [ $# -gt 0 ]; do
    case "$1" in
      -l|--local) LOCAL=1; shift ;;
      -h|--help) usage; exit 0 ;;
      *) die "unknown option: $1 — run install.sh --help" ;;
    esac
  done
}

fetch_skill() {
  WORK="$(mktemp -d)"
  trap 'rm -rf "$WORK"' EXIT
  mkdir -p "$WORK/references"
  if [ "$LOCAL" -eq 1 ]; then
    local here
    here="$(CDPATH='' cd -- "$(dirname -- "$0")" && pwd)"
    [ -f "$here/skill/SKILL.md" ] || die "--local needs a $NAME checkout — $here has no skill/SKILL.md"
    info "Installing from $here"
    cp -R "$here/skill/." "$WORK/"
    return
  fi

  command -v curl >/dev/null 2>&1 || die "curl not found — install curl first"
  info "Fetching skill"
  local file
  for file in $FILES; do
    curl -fsSL -o "$WORK/$file" "https://raw.githubusercontent.com/$REPO/$BRANCH/skill/$file" ||
      die "cannot download $file from $REPO"
    [ -s "$WORK/$file" ] || die "the downloaded $file is empty"
  done
}

# An installed skill is a plain file on disk, so anything — a person, an agent "tidying up" —
# can rewrite it in place, and nothing announces that it happened. It did: the skill installed
# on one machine had been cut from 274 lines to 56, losing every spacing rule, and matched no
# revision this repo ever published. Say out loud what is being replaced.
report_drift() {
  local installed="$1" incoming="$2"
  [ -f "$installed" ] || return 0
  cmp -s "$installed" "$incoming" && return 0

  local had want
  had="$(wc -l <"$installed" | tr -d ' ')"
  want="$(wc -l <"$incoming" | tr -d ' ')"
  warn "replacing a modified skill at $installed ($had lines → $want)"
  [ "$had" -lt "$want" ] &&
    hint "the installed copy was shorter than the published one — local edits are being discarded"
  return 0
}

register_skill() {
  INSTALLED=0

  if command -v claude >/dev/null 2>&1; then
    mkdir -p "$HOME/.claude/skills/$SKILL"
    report_drift "$HOME/.claude/skills/$SKILL/SKILL.md" "$WORK/SKILL.md"
    cp -R "$WORK/." "$HOME/.claude/skills/$SKILL/"
    ok "Claude Code skill installed"
    INSTALLED=1
  fi

  if command -v codex >/dev/null 2>&1; then
    mkdir -p "$HOME/.codex/$SKILL"
    cp -R "$WORK/references" "$HOME/.codex/$SKILL/"
    inject_block "$HOME/.codex/AGENTS.md" "$WORK/SKILL.md"
    ok "Codex skill installed"
    INSTALLED=1
  fi
}

inject_block() {
  local file="$1" content="$2" start="<!-- $SKILL:start -->" end="<!-- $SKILL:end -->"
  local tmp
  tmp="$(mktemp)"
  if [ -f "$file" ]; then
    awk -v s="$start" -v e="$end" '
      $0 == s { skip = 1; next }
      $0 == e { skip = 0; next }
      !skip   { print }
    ' "$file" >"$tmp"
    [ -s "$tmp" ] && printf '\n' >>"$tmp"
  fi
  {
    printf '%s\n' "$start"
    cat "$content"
    printf '%s\n' "$end"
  } >>"$tmp"
  mv "$tmp" "$file"
}

report() {
  if [ "$INSTALLED" -eq 0 ]; then
    warn "no supported AI tool found on your PATH (claude, codex)"
    hint "install one, then run this script again"
    exit 1
  fi
  info "Update anytime by running this script again"
}

# --- main -------------------------------------------------------------------

main() {
  # Colours before args: parse_args can die(), and die() dereferences $C_ERR
  # under `set -u`.
  setup_colors
  parse_args "$@"
  info "Installing $NAME"
  fetch_skill
  register_skill
  report
}

main "$@"
