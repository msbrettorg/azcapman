from __future__ import annotations

import re
from pathlib import Path
from collections import defaultdict

ROOT = Path(__file__).resolve().parents[1]
DOCS_DIR = ROOT / "docs"

FOOTNOTE_RE = re.compile(r"^\[\^([^\]]+)\]:\s*(.*)")
LINK_RE = re.compile(r"\[([^\]]+)\]\((https?://[^)]+)\)")


def extract_citations(md_path: Path):
    citations = []  # list of (id, url, label)
    for line in md_path.read_text(encoding="utf-8", errors="ignore").splitlines():
        m = FOOTNOTE_RE.match(line.strip())
        if not m:
            continue
        fid, rest = m.groups()
        url = None
        label = None
        m_link = LINK_RE.search(rest)
        if m_link:
            label, url = m_link.groups()
        else:
            # bare URL
            parts = rest.split()
            for p in parts:
                if p.startswith("http://") or p.startswith("https://"):
                    url = p
                    break
        if url:
            citations.append((fid, url, label or fid))
    return citations


def main():
    md_files = sorted(
        [
            p
            for p in DOCS_DIR.rglob("*.md")
            if "_site" not in p.parts and "AGENTS.md" not in p.name
        ]
    )

    url_map = defaultdict(list)  # url -> list of (file_rel, footnote_id, label)

    for md in md_files:
        rel = md.relative_to(ROOT).as_posix()
        for fid, url, label in extract_citations(md):
            url_map[url].append((rel, fid, label))

    matrix_path = DOCS_DIR / "operations" / "support-and-reference" / "citation-matrix.md"
    matrix_path.parent.mkdir(parents=True, exist_ok=True)

    lines = []
    lines.append("---")
    lines.append("title: Citation traceability matrix")
    lines.append("parent: Support & Reference")
    lines.append("nav_order: 4")
    lines.append("---")
    lines.append("")
    lines.append("# Citation traceability matrix")
    lines.append("")
    lines.append(
        "This matrix lists Microsoft documentation links used as citations across the quota and capacity references, along with the files and footnote identifiers that reference them."
    )
    lines.append("")
    lines.append("| citation | used in |")
    lines.append("| --- | --- |")

    for url in sorted(url_map.keys()):
        uses = url_map[url]
        # Pick first non-empty label as the citation label
        label = next((lbl for _, _, lbl in uses if lbl), url)
        files_desc = "; ".join(f"{rel} (^{fid})" for rel, fid, _ in uses)
        lines.append(f"| [{label}]({url}) | {files_desc} |")

    lines.append("")
    lines.append(
        "**Source**: [Microsoft style guide](https://learn.microsoft.com/en-us/style-guide/)"
    )

    matrix_path.write_text("\n".join(lines), encoding="utf-8")


if __name__ == "__main__":
    main()
