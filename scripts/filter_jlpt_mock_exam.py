#!/usr/bin/env python3
"""
Filter (cap) questions per section for JLPT mock exam JSON.

Input JSON format is the same as dataset/*.json used by ingest_jlpt_dataset.js:
{
  "level": "N5",
  "exam_type": "...",
  "title": "...",
  "sections": [
    {
      "code": "LANGUAGE_VOCAB",
      "title_vi": "...",
      "duration_minutes": 25,
      "order_index": 1,
      "questions": [ ... ]
    },
    ...
  ]
}

This script keeps:
- Only sections whose code is in allowed codes (LANGUAGE_VOCAB, LANGUAGE_GRAMMAR_READING, LISTENING)
- For each allowed section code, keeps only the first N questions if cap is provided
  (deterministic: preserves original ordering)

Additionally (optional):
- Can cap questions per mondai (group_code) within a section via --mondai-caps.
  This is useful to keep a JLPT-like structure where each "問題" contains only a
  small number of questions.
"""

from __future__ import annotations

import argparse
import json
from typing import Any


ALLOWED_CODES = {"LANGUAGE_VOCAB", "LANGUAGE_GRAMMAR_READING", "LISTENING"}


def _parse_caps(raw: str) -> dict[str, int]:
    # Accept:
    # 1) JSON: {"LANGUAGE_VOCAB":35,"LISTENING":24}
    # 2) Compact: LANGUAGE_VOCAB:35,LISTENING:24 (useful when quoting is painful on Windows shells)
    try:
        obj = json.loads(raw)
        if not isinstance(obj, dict):
            raise ValueError("caps JSON must be an object")

        out: dict[str, int] = {}
        for k, v in obj.items():
            out[str(k)] = int(v)
        return out
    except Exception:
        pass

    # Fallback parser: key:value pairs
    out: dict[str, int] = {}
    parts = [p.strip() for p in raw.split(",") if p.strip()]
    if not parts:
        raise SystemExit("Invalid --caps: empty")

    for p in parts:
        if ":" in p:
            k, v = p.split(":", 1)
        elif "=" in p:
            k, v = p.split("=", 1)
        else:
            raise SystemExit(f"Invalid --caps pair: {p} (expected key:value)")

        out[k.strip()] = int(v.strip())

    return out


def _parse_mondai_caps(raw: str) -> dict[str, dict[str, int]]:
    """
    Parse mondai caps mapping:

    Accept:
    1) JSON:
       {"LANGUAGE_GRAMMAR_READING":{"GRAMMAR_SENTENCE_1":10},"LANGUAGE_VOCAB":{"KANJI_READ":12}}
    2) Compact:
       LANGUAGE_GRAMMAR_READING.GRAMMAR_SENTENCE_1:10,LANGUAGE_VOCAB.KANJI_READ:12
    """
    raw = (raw or "").strip()
    if not raw:
        return {}

    try:
        obj = json.loads(raw)
        if not isinstance(obj, dict):
            raise ValueError("mondai-caps JSON must be an object")
        out: dict[str, dict[str, int]] = {}
        for sec, m in obj.items():
            if not isinstance(m, dict):
                raise ValueError("mondai-caps value must be an object per section")
            out[str(sec)] = {str(k): int(v) for k, v in m.items()}
        return out
    except Exception:
        pass

    out: dict[str, dict[str, int]] = {}
    parts = [p.strip() for p in raw.split(",") if p.strip()]
    if not parts:
        raise SystemExit("Invalid --mondai-caps: empty")

    for p in parts:
        if ":" in p:
            k, v = p.split(":", 1)
        elif "=" in p:
            k, v = p.split("=", 1)
        else:
            raise SystemExit(f"Invalid --mondai-caps pair: {p} (expected key:value)")

        k = k.strip()
        v_int = int(v.strip())
        if "." not in k:
            raise SystemExit(
                f"Invalid --mondai-caps key: {k} (expected SECTION_CODE.MONDAI_CODE)"
            )
        sec_code, mondai_code = k.split(".", 1)
        sec_code = sec_code.strip()
        mondai_code = mondai_code.strip()
        out.setdefault(sec_code, {})[mondai_code] = v_int

    return out


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--input", required=True)
    ap.add_argument("--output", required=True)
    ap.add_argument(
        "--caps",
        required=True,
        help='JSON like {"LANGUAGE_VOCAB":35,"LANGUAGE_GRAMMAR_READING":32,"LISTENING":24}',
    )
    ap.add_argument(
        "--mondai-caps",
        default="",
        help=(
            "Optional cap by group_code (mondai) within a section. "
            'JSON like {"LANGUAGE_GRAMMAR_READING":{"GRAMMAR_SENTENCE_1":10}} '
            "or compact like LANGUAGE_GRAMMAR_READING.GRAMMAR_SENTENCE_1:10"
        ),
    )
    args = ap.parse_args()

    with open(args.input, "r", encoding="utf-8") as f:
        payload: dict[str, Any] = json.load(f)

    caps = _parse_caps(args.caps)
    mondai_caps = _parse_mondai_caps(args.mondai_caps)

    out_sections: list[dict[str, Any]] = []
    for s in payload.get("sections", []):
        code = s.get("code")
        if code not in ALLOWED_CODES:
            continue

        questions = list(s.get("questions", []) or [])

        # First, cap by mondai (group_code) if configured for this section.
        sec_m_caps = mondai_caps.get(str(code), {})
        if sec_m_caps:
            kept: list[dict[str, Any]] = []
            used: dict[str, int] = {}
            for q in questions:
                g = (q.get("group_code") or "").strip()
                if not g:
                    # Keep uncategorized questions as-is.
                    kept.append(q)
                    continue
                cap_g = sec_m_caps.get(g)
                if cap_g is None:
                    # Not specified => keep all of this mondai
                    kept.append(q)
                    continue
                if cap_g < 0:
                    raise SystemExit(f"Invalid mondai cap for {code}.{g}: {cap_g}")
                used[g] = used.get(g, 0)
                if used[g] >= cap_g:
                    continue
                used[g] += 1
                kept.append(q)
            questions = kept

        cap = caps.get(code)
        if cap is not None:
            if cap < 0:
                raise SystemExit(f"Invalid cap for {code}: {cap}")
            questions = questions[:cap]

        out_sections.append(
            {
                **s,
                "questions": questions,
            }
        )

    payload_out = {**payload, "sections": out_sections}

    with open(args.output, "w", encoding="utf-8") as f:
        json.dump(payload_out, f, ensure_ascii=False, indent=2)

    print(
        json.dumps(
            {
                "level": payload_out.get("level"),
                "sections": [
                    (s.get("code"), len(s.get("questions", []) or [])) for s in payload_out.get("sections", [])
                ],
                "totalQuestions": sum(len(s.get("questions", []) or []) for s in payload_out.get("sections", [])),
            },
            ensure_ascii=False,
        )
    )


if __name__ == "__main__":
    main()

