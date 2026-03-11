#!/usr/bin/env python3
"""
Tool: generate_jlpt_questions.py

Mục đích:
- Gọi JLPT Grammar/Vocabulary API (https://jlpt-grammar-api.vercel.app)
- Sinh câu hỏi trắc nghiệm (multiple choice) dạng JLPT mock (vocab / grammar)
- Lưu kết quả thành JSON để dùng làm data mẫu cho module JLPT Mock Exam.

Cấu trúc JSON output (mỗi phần tử trong danh sách là một câu hỏi):
[
  {
    "level": "N5",
    "question_type": "VOCAB",
    "section_code": "LANGUAGE_VOCAB",
    "group_code": "VOCAB_MEANING",
    "question_index": 1,
    "stem_text": "日本語",
    "context_text": null,
    "difficulty": "EASY",
    "options": [
      { "key": "A", "content_text": "Tiếng Nhật", "is_correct": true },
      { "key": "B", "content_text": "Tiếng Anh", "is_correct": false },
      { "key": "C", "content_text": "Tiếng Trung", "is_correct": false },
      { "key": "D", "content_text": "Tiếng Hàn", "is_correct": false }
    ],
    "correct_option_key": "A",
    "source": {
      "provider": "jlpt-grammar-api",
      "raw_id": "..."
    }
  }
]

Script này chỉ dùng thư viện chuẩn (urllib) để tránh thêm dependency mới.
"""

from __future__ import annotations

import argparse
import json
import random
import sys
import typing as t
from dataclasses import dataclass
from urllib.error import HTTPError, URLError
from urllib.request import urlopen

API_BASE_URL = "https://jlpt-grammar-api.vercel.app/api"


@dataclass
class QuestionOption:
    key: str
    content_text: str
    is_correct: bool


def _fetch_json(path: str) -> t.Any:
    url = f"{API_BASE_URL}{path}"
    try:
        with urlopen(url) as resp:
            charset = resp.headers.get_content_charset() or "utf-8"
            data = resp.read().decode(charset)
            return json.loads(data)
    except HTTPError as e:
        raise RuntimeError(f"HTTP error when fetching {url}: {e.code} {e.reason}") from e
    except URLError as e:
        raise RuntimeError(f"Network error when fetching {url}: {e.reason}") from e
    except json.JSONDecodeError as e:
        raise RuntimeError(f"Failed to parse JSON from {url}: {e}") from e


def fetch_vocabulary(level: str) -> list[dict]:
    """
    Lấy danh sách từ vựng cho một level (N5, N4, ...) từ JLPT API.

    API docs (tóm tắt từ search):
    - GET /api/vocabulary/:level
      → [{ "word": "...", "romaji_reading": "...", "part_of_speech": "...", "meaning": "...", "level": "N5" }, ...]
    """
    path = f"/vocabulary/{level.lower()}"
    data = _fetch_json(path)
    if not isinstance(data, list):
        raise RuntimeError(f"Unexpected vocabulary payload for level {level}: expected list, got {type(data)}")
    return data


def fetch_grammar(level: str) -> list[dict]:
    """
    Lấy danh sách grammar cho một level từ JLPT API.

    API docs (tóm tắt từ search):
    - GET /api/grammar/:level
      → [{ "id": 1, "grammar_point": "...", "meaning": "...", "level": "N5", ... }, ...]
    """
    path = f"/grammar/{level.lower()}"
    data = _fetch_json(path)
    if not isinstance(data, list):
        raise RuntimeError(f"Unexpected grammar payload for level {level}: expected list, got {type(data)}")
    return data


def _pick_distractors(
    items: list[str],
    correct_value: str,
    max_distractors: int,
) -> list[str]:
    pool = [v for v in items if v and v != correct_value]
    # Loại trùng lặp để tránh cùng một distractor nhiều lần
    pool = list(dict.fromkeys(pool))
    random.shuffle(pool)
    return pool[:max_distractors]


def build_vocab_questions(
    level: str,
    vocab_items: list[dict],
    num_options: int = 4,
) -> list[dict]:
    """
    Tạo câu hỏi multiple-choice từ danh sách vocab.

    - stem_text: từ tiếng Nhật (field "word")
    - options: nghĩa (field "meaning") + distractors từ từ khác
    """
    if num_options < 2:
        raise ValueError("num_options must be >= 2")

    all_meanings = [str(item.get("meaning", "")).strip() for item in vocab_items]
    questions: list[dict] = []

    for idx, item in enumerate(vocab_items, start=1):
        word = str(item.get("word", "")).strip()
        meaning = str(item.get("meaning", "")).strip()

        if not word or not meaning:
            # Bỏ qua bản ghi thiếu dữ liệu quan trọng
            continue

        distractor_meanings = _pick_distractors(
            all_meanings,
            correct_value=meaning,
            max_distractors=max(0, num_options - 1),
        )
        option_values = [meaning] + distractor_meanings
        random.shuffle(option_values)

        option_keys = ["A", "B", "C", "D"][: len(option_values)]
        options: list[QuestionOption] = []
        correct_key = None

        for key, text in zip(option_keys, option_values):
            is_correct = text == meaning
            if is_correct:
                correct_key = key
            options.append(QuestionOption(key=key, content_text=text, is_correct=is_correct))

        if correct_key is None:
            # Trong trường hợp hiếm hoi meaning trống hoặc bị loại hết
            continue

        question = {
            "level": level.upper(),
            "question_type": "VOCAB",
            "section_code": "LANGUAGE_VOCAB",
            "group_code": "VOCAB_MEANING",
            "question_index": idx,
            "stem_text": word,
            "context_text": None,
            "difficulty": "EASY",
            "options": [
                {
                    "key": opt.key,
                    "content_text": opt.content_text,
                    "is_correct": opt.is_correct,
                }
                for opt in options
            ],
            "correct_option_key": correct_key,
            "source": {
                "provider": "jlpt-grammar-api",
                "raw_id": item.get("id"),
                "raw": {
                    "word": word,
                    "meaning": meaning,
                    "romaji_reading": item.get("romaji_reading"),
                    "part_of_speech": item.get("part_of_speech"),
                },
            },
        }
        questions.append(question)

    return questions


def build_grammar_questions(
    level: str,
    grammar_items: list[dict],
    num_options: int = 4,
) -> list[dict]:
    """
    Tạo câu hỏi multiple-choice từ danh sách grammar.

    - stem_text: điểm ngữ pháp (field "grammar_point")
    - options: nghĩa (field "meaning") + distractors từ grammar khác
    """
    if num_options < 2:
        raise ValueError("num_options must be >= 2")

    all_meanings = [str(item.get("meaning", "")).strip() for item in grammar_items]
    questions: list[dict] = []

    for idx, item in enumerate(grammar_items, start=1):
        # API thực tế trả field "grammar" chứ không phải "grammar_point"
        grammar_point = str(item.get("grammar", "")).strip()
        meaning = str(item.get("meaning", "")).strip()

        if not grammar_point or not meaning:
            continue

        distractor_meanings = _pick_distractors(
            all_meanings,
            correct_value=meaning,
            max_distractors=max(0, num_options - 1),
        )
        option_values = [meaning] + distractor_meanings
        random.shuffle(option_values)

        option_keys = ["A", "B", "C", "D"][: len(option_values)]
        options: list[QuestionOption] = []
        correct_key = None

        for key, text in zip(option_keys, option_values):
            is_correct = text == meaning
            if is_correct:
                correct_key = key
            options.append(QuestionOption(key=key, content_text=text, is_correct=is_correct))

        if correct_key is None:
            continue

        question = {
            "level": level.upper(),
            "question_type": "GRAMMAR",
            "section_code": "LANGUAGE_GRAMMAR_READING",
            "group_code": "GRAMMAR_MEANING",
            "question_index": idx,
            "stem_text": grammar_point,
            "context_text": None,
            "difficulty": "MEDIUM",
            "options": [
                {
                    "key": opt.key,
                    "content_text": opt.content_text,
                    "is_correct": opt.is_correct,
                }
                for opt in options
            ],
            "correct_option_key": correct_key,
            "source": {
                "provider": "jlpt-grammar-api",
                "raw_id": item.get("id"),
                "raw": {
                    "grammar_point": grammar_point,
                    "meaning": meaning,
                },
            },
        }
        questions.append(question)

    return questions


def _jlpt_section_config(level: str) -> list[dict]:
    """
    Trả về cấu hình 3 section của đề JLPT mock theo level.

    Dựa trên bảng thời lượng trong JLPT_MOCK_EXAM_SPEC.md (rút gọn).
    """
    lvl = level.upper()
    if lvl == "N5":
        return [
            {
                "code": "LANGUAGE_VOCAB",
                "title_vi": "Kiến thức ngôn ngữ (Từ vựng)",
                "duration_minutes": 25,
                "order_index": 1,
            },
            {
                "code": "LANGUAGE_GRAMMAR_READING",
                "title_vi": "Ngữ pháp + Đọc hiểu",
                "duration_minutes": 50,
                "order_index": 2,
            },
            {
                "code": "LISTENING",
                "title_vi": "Nghe hiểu",
                "duration_minutes": 30,
                "order_index": 3,
            },
        ]
    if lvl == "N4":
        return [
            {
                "code": "LANGUAGE_VOCAB",
                "title_vi": "Kiến thức ngôn ngữ (Từ vựng)",
                "duration_minutes": 30,
                "order_index": 1,
            },
            {
                "code": "LANGUAGE_GRAMMAR_READING",
                "title_vi": "Ngữ pháp + Đọc hiểu",
                "duration_minutes": 60,
                "order_index": 2,
            },
            {
                "code": "LISTENING",
                "title_vi": "Nghe hiểu",
                "duration_minutes": 35,
                "order_index": 3,
            },
        ]
    if lvl == "N3":
        return [
            {
                "code": "LANGUAGE_VOCAB",
                "title_vi": "Kiến thức ngôn ngữ (Từ vựng)",
                "duration_minutes": 30,
                "order_index": 1,
            },
            {
                "code": "LANGUAGE_GRAMMAR_READING",
                "title_vi": "Ngữ pháp + Đọc hiểu",
                "duration_minutes": 70,
                "order_index": 2,
            },
            {
                "code": "LISTENING",
                "title_vi": "Nghe hiểu",
                "duration_minutes": 40,
                "order_index": 3,
            },
        ]
    if lvl == "N2":
        return [
            {
                "code": "LANGUAGE_GRAMMAR_READING",
                "title_vi": "Ngôn ngữ (Từ vựng, Ngữ pháp) + Đọc hiểu",
                "duration_minutes": 105,
                "order_index": 1,
            },
            {
                "code": "LISTENING",
                "title_vi": "Nghe hiểu",
                "duration_minutes": 50,
                "order_index": 2,
            },
            {
                "code": "EXTRA",
                "title_vi": "Phần bổ sung (không dùng)",
                "duration_minutes": 0,
                "order_index": 3,
            },
        ]
    if lvl == "N1":
        return [
            {
                "code": "LANGUAGE_GRAMMAR_READING",
                "title_vi": "Ngôn ngữ (Từ vựng, Ngữ pháp) + Đọc hiểu",
                "duration_minutes": 110,
                "order_index": 1,
            },
            {
                "code": "LISTENING",
                "title_vi": "Nghe hiểu",
                "duration_minutes": 60,
                "order_index": 2,
            },
            {
                "code": "EXTRA",
                "title_vi": "Phần bổ sung (không dùng)",
                "duration_minutes": 0,
                "order_index": 3,
            },
        ]
    # Fallback chung nếu level lạ
    return [
        {
            "code": "LANGUAGE_VOCAB",
            "title_vi": "Kiến thức ngôn ngữ (Từ vựng)",
            "duration_minutes": 30,
            "order_index": 1,
        },
        {
            "code": "LANGUAGE_GRAMMAR_READING",
            "title_vi": "Ngữ pháp + Đọc hiểu",
            "duration_minutes": 60,
            "order_index": 2,
        },
        {
            "code": "LISTENING",
            "title_vi": "Nghe hiểu",
            "duration_minutes": 40,
            "order_index": 3,
        },
    ]


def parse_args(argv: list[str]) -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description=(
            "Sinh dữ liệu câu hỏi JLPT mock (vocab / grammar) từ JLPT Grammar API "
            "và lưu thành JSON."
        )
    )
    parser.add_argument(
        "--level",
        type=str,
        required=True,
        help="Cấp độ JLPT (vd: N5, N4, N3, N2, N1). API hiện tại chủ yếu hỗ trợ N5/N4.",
    )
    parser.add_argument(
        "--types",
        type=str,
        default="vocab,grammar",
        help="Loại câu hỏi muốn sinh, phân tách bằng dấu phẩy: vocab,grammar (mặc định: vocab,grammar).",
    )
    parser.add_argument(
        "--num-options",
        type=int,
        default=4,
        help="Số lượng phương án lựa chọn / câu (2–4, mặc định 4).",
    )
    parser.add_argument(
        "--limit",
        type=int,
        default=0,
        help="Giới hạn số câu / loại (0 = dùng toàn bộ dữ liệu từ API).",
    )
    parser.add_argument(
        "--format",
        type=str,
        default="flat",
        choices=["flat", "exam"],
        help=(
            "Định dạng JSON output: "
            "'flat' = list câu hỏi đơn, "
            "'exam' = 1 object đề JLPT mock có 3 phần thi. (mặc định: flat)"
        ),
    )
    parser.add_argument(
        "-o",
        "--output",
        type=str,
        required=True,
        help="Đường dẫn file JSON output (ví dụ: dataset/jlpt_n5_questions.json).",
    )
    return parser.parse_args(argv)


def main(argv: list[str]) -> int:
    args = parse_args(argv)
    level = args.level.upper()
    types = {t.strip().lower() for t in args.types.split(",") if t.strip()}

    if args.num_options < 2 or args.num_options > 4:
        print("num-options phải trong khoảng 2–4.", file=sys.stderr)
        return 1

    random.seed()  # dùng seed hệ thống

    vocab_questions: list[dict] = []
    grammar_questions: list[dict] = []

    try:
        if "vocab" in types:
            vocab_items = fetch_vocabulary(level)
            if args.limit and args.limit > 0:
                vocab_items = vocab_items[: args.limit]
            vocab_questions = build_vocab_questions(level, vocab_items, num_options=args.num_options)

        if "grammar" in types:
            grammar_items = fetch_grammar(level)
            if args.limit and args.limit > 0:
                grammar_items = grammar_items[: args.limit]
            grammar_questions = build_grammar_questions(level, grammar_items, num_options=args.num_options)
    except RuntimeError as e:
        print(f"Lỗi khi lấy dữ liệu từ JLPT API: {e}", file=sys.stderr)
        return 1

    all_questions: list[dict] = [*vocab_questions, *grammar_questions]

    if not all_questions:
        print("Không sinh được câu hỏi nào từ dữ liệu API. Vui lòng kiểm tra lại cấu hình / level.", file=sys.stderr)
        return 1

    # Chọn format output
    if args.format == "flat":
        payload: t.Any = all_questions
    else:
        # exam: gom thành 1 đề JLPT mock có 3 phần thi
        sections_cfg = _jlpt_section_config(level)
        sections_out: list[dict] = []

        for sec in sections_cfg:
            code = sec["code"]
            if code == "LANGUAGE_VOCAB":
                qs = [q for q in vocab_questions if q.get("section_code") == "LANGUAGE_VOCAB"]
            elif code == "LANGUAGE_GRAMMAR_READING":
                qs = [q for q in grammar_questions if q.get("section_code") == "LANGUAGE_GRAMMAR_READING"]
            else:
                # LISTENING / EXTRA: hiện chưa có nguồn câu hỏi nghe → để trống
                qs = []

            sections_out.append(
                {
                    "code": code,
                    "title_vi": sec["title_vi"],
                    "duration_minutes": sec["duration_minutes"],
                    "order_index": sec["order_index"],
                    "questions": qs,
                }
            )

        payload = {
            "level": level,
            "exam_type": "JLPT_MOCK",
            "title": f"JLPT {level} Mock Test (Auto-generated)",
            "sections": sections_out,
        }

    output_path = args.output
    try:
        with open(output_path, "w", encoding="utf-8") as f:
            json.dump(payload, f, ensure_ascii=False, indent=2)
    except OSError as e:
        print(f"Lỗi khi ghi file JSON ra {output_path}: {e}", file=sys.stderr)
        return 1

    if args.format == "flat":
        print(f"Đã sinh {len(all_questions)} câu hỏi JLPT ({level}) và lưu vào: {output_path}")
    else:
        print(
            f"Đã sinh đề JLPT mock ({level}) với "
            f"{len(vocab_questions)} câu vocab, {len(grammar_questions)} câu grammar và lưu vào: {output_path}"
        )
    return 0


if __name__ == "__main__":
    raise SystemExit(main(sys.argv[1:]))

