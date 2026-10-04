#!/usr/bin/env python3
"""PreToolUse hook: block git commits that carry attribution trailers.

Commits are authored by the repo owner only (see CLAUDE.md). Exit code 2 blocks the
tool call and feeds stderr back to Claude.
"""
import json
import re
import sys

TRAILER = re.compile(r"(co-authored-by|signed-off-by)\s*:", re.IGNORECASE)
SIGNOFF_FLAG = re.compile(r"(^|\s)(-s|--signoff)(\s|$)")
GIT_COMMIT = re.compile(r"\bgit\b[^;&|]*\bcommit\b")


def main() -> int:
    try:
        payload = json.load(sys.stdin)
    except json.JSONDecodeError:
        return 0
    command = payload.get("tool_input", {}).get("command", "")
    if not GIT_COMMIT.search(command):
        return 0
    if TRAILER.search(command) or SIGNOFF_FLAG.search(command):
        print(
            "Blocked: commits in this repo must not contain Co-Authored-By, Signed-off-by "
            "or other attribution trailers (CLAUDE.md). Remove the trailer and retry.",
            file=sys.stderr,
        )
        return 2
    return 0


if __name__ == "__main__":
    sys.exit(main())
