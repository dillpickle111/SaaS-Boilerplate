#!/usr/bin/env python3
import argparse
import json
import os
import re
import sys
from dataclasses import dataclass, asdict
from typing import List, Optional, Tuple, Dict, Any
import subprocess

try:
    import pdfplumber  # type: ignore
except Exception as e:  # pragma: no cover
    pdfplumber = None

# Optional fallback for image extraction
try:
    import fitz  # PyMuPDF
except Exception:
    fitz = None


# Match question headers but avoid matching the answer section header
# Group1: from "Question ID <id>", Group2: from "ID: <id>" not followed by "Answer"
# Strict regex per spec
QID_RE = re.compile(r'(?:Question\s+ID|\bID)\s*[:\-]\s*([0-9a-f]{8})\b', re.I)
ANS_RE = re.compile(r'ID\s*:\s*([0-9a-f]{8})\s*Answer[\s\S]{0,300}?Correct\s*Answer\s*:\s*([A-D0-9\.\-/]+)', re.I)
CHOICES_RE = re.compile(r'(?m)^(?:\(?([A-D])\)?[\.)]\s+)(.+?)(?=\n\(?[A-D]\)?[\.)]\s+|\nID\s*:|\nCorrect\s*Answer|\Z)', re.S)
LABEL_RE = re.compile(r"\b(Assessment|Test|Domain|Skill|Difficulty)\b", re.I)
TOK_INLINE = re.compile(r'(?<![A-Za-z0-9])(?:\(?([A-D])\)?[.)])\s+', re.I)


def normalize_text(s: str) -> str:
    if not s:
        return ""
    # Preserve math minus sign, normalize spaces and smart punctuation
    s = s.replace("\u2013", "-").replace("\u2014", "-")
    s = s.replace("\u2018", "'").replace("\u2019", "'")
    s = s.replace("\u201c", '"').replace("\u201d", '"')
    s = re.sub(r"\s+", " ", s)
    return s.strip()


def map_difficulty(raw: str) -> str:
    r = (raw or "").strip().lower()
    if not r:
        return "Medium"
    # dots mapping: 1-3 dots → Easy/Medium/Hard
    dot_count = len([c for c in r if c in ("•", "●", "○", "·")])
    if dot_count == 1:
        return "Easy"
    if dot_count == 2:
        return "Medium"
    if dot_count >= 3:
        return "Hard"
    if r.startswith("e"):
        return "Easy"
    if r.startswith("h"):
        return "Hard"
    return "Medium"


@dataclass
class Choice:
    label: str
    text: str


@dataclass
class CBQuestion:
    id: str
    assessment: str
    test: str
    domain: Optional[str]
    skill: Optional[str]
    difficulty: str
    number: Optional[int]
    stem: str
    choices: Optional[List[Choice]]
    answer: Optional[str]
    rationale: Optional[str]
    images: List[str]
    pages: List[int]


def group_lines(words: List[Dict[str, Any]]) -> List[str]:
    if not words:
        return []
    # Group by line number, then join in x-order
    lines_map: Dict[int, List[Dict[str, Any]]] = {}
    for w in words:
        line_no = int(w.get("line_number") or 0)
        lines_map.setdefault(line_no, []).append(w)
    lines: List[str] = []
    for k in sorted(lines_map.keys()):
        segs = sorted(lines_map[k], key=lambda w: (w.get("x0", 0), w.get("x1", 0)))
        text = " ".join([w.get("text", "") for w in segs])
        text = re.sub(r"\s+", " ", text).strip()
        if text:
            lines.append(text)
    return lines


def extract_page_lines(pl_page) -> List[str]:
    words = pl_page.extract_words(x_tolerance=1.5, y_tolerance=3, keep_blank_chars=False)
    lines = group_lines(words)
    # Fallback: merge with extract_text lines (layout-aware)
    try:
        raw = pl_page.extract_text(layout=True) or ""
        txt_lines = [normalize_text(l) for l in raw.splitlines() if normalize_text(l)]
        # Avoid duplicates; append unique lines
        existing = set(lines)
        for l in txt_lines:
            if l not in existing:
                lines.append(l)
                existing.add(l)
    except Exception:
        pass
    return lines


def get_page_text(pl_page, pno: int, fitz_doc=None) -> str:
    # Gather text from both pdfplumber and fitz, then merge
    plumber_text = ""
    try:
        plumber_text = pl_page.extract_text(layout=True) or ""
    except Exception:
        plumber_text = ""

    fitz_text = ""
    if fitz_doc is not None:
        try:
            page = fitz_doc[pno - 1]
            blocks = page.get_text("blocks")  # list of (x0,y0,x1,y1, text, block_no, ...)
            blocks_sorted = sorted(blocks, key=lambda b: (b[1], b[0]))
            fitz_text = "\n".join([b[4] for b in blocks_sorted if b[4]])
        except Exception:
            fitz_text = ""

    page_text = plumber_text + ("\n" if plumber_text and fitz_text else "") + fitz_text
    # Normalize hyphenated line breaks word-\nword -> wordword
    page_text = re.sub(r"(\w)-\n(\w)", r"\1\2", page_text)
    return page_text


def build_document_text(math_path: str, rw_path: str) -> Dict[str, Dict[str, Any]]:
    docs: Dict[str, Dict[str, Any]] = {}
    for test_name, pdf_path in [("Math", math_path), ("Reading and Writing", rw_path)]:
        doc_str_parts: List[str] = []
        fitz_doc = None
        if fitz is not None:
            try:
                fitz_doc = fitz.open(pdf_path)
            except Exception:
                fitz_doc = None
        # First try pdftotext for robust text
        text_by_pages: List[str] = []
        try:
            proc = subprocess.run([
                'pdftotext', '-layout', pdf_path, '-'  # output to stdout with layout
            ], check=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
            raw = proc.stdout.decode('utf-8', errors='ignore')
            # Split by form feed to detect pages
            parts = raw.split('\f')
            for idx, part in enumerate(parts, start=1):
                if not part.strip():
                    continue
                text_by_pages.append(part)
        except Exception:
            text_by_pages = []

        if not text_by_pages:
            # Fallback to pdfplumber/PyMuPDF merge
            with pdfplumber.open(pdf_path) as pl:
                for pno, pl_page in enumerate(pl.pages, start=1):
                    marker = f"\n[[PAGE:{pno}]]\n"
                    doc_str_parts.append(marker)
                    txt = get_page_text(pl_page, pno, fitz_doc)
                    txt = normalize_text(txt)
                    doc_str_parts.append(txt + "\n")
        else:
            for pno, part in enumerate(text_by_pages, start=1):
                marker = f"\n[[PAGE:{pno}]]\n"
                doc_str_parts.append(marker)
                doc_str_parts.append(normalize_text(part) + "\n")
        full_text = "".join(doc_str_parts)
        docs[test_name] = {"text": full_text, "pdf_path": pdf_path}
    return docs


def slice_until(next_idx: int, items: List[Tuple[int, str]]) -> List[Tuple[int, str]]:
    return items[:next_idx]


def find_qid_matches(doc_text: str) -> List[Tuple[int, str]]:
    return [(m.start(), m.group(1)) for m in re.finditer(QID_RE, doc_text)]


def extract_labels(block_text: str) -> Tuple[Dict[str, str], List[str]]:
    meta: Dict[str, str] = {}
    to_strip: List[str] = []
    head = block_text[:1000]
    lines = [l for l in head.splitlines() if l.strip()]

    # Heuristic: composite label row followed by values row (seen in CB PDFs)
    composite_idx = None
    for idx, line in enumerate(lines):
        tokens = ["assessment", "test", "domain", "skill", "difficulty"]
        if all(t in line.lower() for t in tokens):
            composite_idx = idx
            break
    if composite_idx is not None:
        label_row = lines[composite_idx]
        # If everything is inline on one row, values are the tail after the last label (Difficulty)
        mlast = re.search(r"difficulty\b", label_row, re.I)
        inline_vals = label_row[mlast.end():].strip() if mlast else ""
        # Otherwise, next non-empty line is values row
        j = composite_idx + 1
        while j < len(lines) and not lines[j].strip():
            j += 1
        values_row = lines[j] if j < len(lines) else ""
        if not values_row or values_row.lower().startswith("assessment"):
            values_row = inline_vals
        to_strip.append(label_row)

        vals = values_row
        # Determine test
        if re.search(r"reading and writing", vals, re.I):
            meta["test"] = "Reading and Writing"
            parts = re.split(r"reading and writing", vals, flags=re.I)
            before = parts[0].strip()
            after = parts[1].strip() if len(parts) > 1 else ""
        elif re.search(r"\bmath\b", vals, re.I):
            meta["test"] = "Math"
            parts = re.split(r"\bmath\b", vals, flags=re.I)
            before = parts[0].strip()
            after = parts[1].strip() if len(parts) > 1 else ""
        else:
            before = vals
            after = ""

        # Assessment is before test; if contains SAT, normalize
        if "sat" in before.lower():
            meta["assessment"] = "SAT"
        elif before:
            meta["assessment"] = before

        # Domain lists to match
        math_domains = [
            "Algebra",
            "Advanced Math",
            "Problem-Solving and Data Analysis",
            "Geometry and Trigonometry",
        ]
        rw_domains = [
            "Information and Ideas",
            "Craft and Structure",
            "Expression of Ideas",
            "Standard English Conventions",
            "Command of Evidence",
            "Words in Context",
        ]
        domain_matched = None
        for d in (math_domains + rw_domains):
            if after.lower().startswith(d.lower()) or d.lower() in after.lower():
                domain_matched = d
                pos = after.lower().find(d.lower())
                rest = after[pos + len(d):].strip()
                break
        if domain_matched:
            meta["domain"] = domain_matched
            # Difficulty at tail if present
            mdiff = re.search(r"(Easy|Medium|Hard)$", rest, re.I)
            if mdiff:
                meta["difficulty"] = mdiff.group(1).title()
                skill = rest[: mdiff.start()].strip()
            else:
                # dots mapping
                dots = re.search(r"([•●○·]{1,5})$", rest)
                if dots:
                    meta["difficulty"] = map_difficulty(dots.group(1))
                    skill = rest[: dots.start()].strip()
                else:
                    skill = rest
            if skill:
                meta["skill"] = skill

    # Fallback simple label capture: capture next token(s) after label on same line
    for line in lines:
        m = re.search(r"\b(Assessment|Test|Domain|Skill|Difficulty)\b\s*:\s*(.+)$", line, re.I)
        if m:
            key, val = m.group(1), m.group(2)
            meta[key.lower()] = normalize_text(val)

    return meta, to_strip


def parse_choices_block(text: str) -> Optional[List[Choice]]:
    matches = list(re.finditer(CHOICES_RE, text))
    if not matches:
        return None
    extracted: Dict[str, str] = {}
    for m in matches:
        label = (m.group(1) or '').upper()
        body = normalize_text(m.group(2) or '')
        if not label or not body:
            continue
        if label in extracted:
            continue
        extracted[label] = body
    # Require 4 labels A-D to be MCQ
    if all(k in extracted for k in ['A','B','C','D']):
        return [Choice(label=k, text=extracted[k]) for k in ['A','B','C','D']]
    return None


def parse_choices_inline(qid: str, pre_text: str, debug: bool) -> Optional[List[Choice]]:
    # Insert sentinels to avoid eating answer/rationale blocks
    window_raw = pre_text.replace("\nID:", "\n§ID:").replace("\nCorrect Answer", "\n§Correct Answer")
    # Token detection string: replace NBSP/thin spaces and collapse spaces for robust detection
    window_det = (
        pre_text.replace("\u00A0", " ")
        .replace("\u2007", " ")
        .replace("\u202F", " ")
        .replace("\nID:", "\n§ID:")
        .replace("\nCorrect Answer", "\n§Correct Answer")
    )
    window_det = re.sub(r"[ \t]+", " ", window_det)

    # Find tokens on the original (with sentinels) to preserve indices
    tokens = [(m.group(1).upper(), m.start(), m.end()) for m in re.finditer(TOK_INLINE, window_raw)]
    if not tokens:
        return None

    # Pick first A->D in order, skipping duplicates
    order = ['A', 'B', 'C', 'D']
    indices: List[Tuple[str, int, int]] = []
    pos = 0
    for needed in order:
        found = None
        for lab, s, e in tokens:
            if lab == needed and s >= pos:
                found = (lab, s, e)
                pos = e
                break
        if not found:
            return None
        indices.append(found)

    # Slice between tokens in original window with sentinels
    slices: List[str] = []
    for i in range(4):
        _, s, e = indices[i]
        end = indices[i + 1][1] if i < 3 else len(window_raw)
        chunk = window_raw[e:end]
        # Hard-stop at sentinels
        stop = re.search(r"\n§(ID\s*:|Correct\s*Answer)", chunk, re.I)
        if stop:
            chunk = chunk[:stop.start()]
        # Cleanup
        chunk = re.sub(r"^[\s\.:\)\-]+", "", chunk)
        chunk = re.sub(r"(\w)-\n(\w)", r"\1\2", chunk)
        chunk = normalize_text(chunk)
        # Further guards
        if re.search(r"Correct\s*Answer|\n§ID:|\n§Correct\s*Answer", chunk, re.I):
            chunk = re.split(r"Correct\s*Answer|\n§ID:|\n§Correct\s*Answer", chunk, flags=re.I)[0]
        if len(chunk.strip()) < 2 or len(chunk) > 800:
            return None
        slices.append(chunk)

    # Debug log when fallback used
    if debug:
        dbg_dir = os.path.join("scripts", "data", "debug")
        os.makedirs(dbg_dir, exist_ok=True)
        with open(os.path.join(dbg_dir, f"choices_inline_{qid}.txt"), "w", encoding="utf-8") as f:
            f.write("WINDOW\n" + window_raw[:600] + "\n\n")
            f.write("TOKENS\n" + json.dumps(indices) + "\n\n")
            f.write("CHOICES\n" + json.dumps(slices, ensure_ascii=False, indent=2))

    return [Choice(label=lab, text=txt) for lab, txt in zip(order, slices)]


def extract_answer_and_rationale(qid: str, block_text: str) -> Tuple[Optional[str], Optional[str]]:
    if not block_text:
        return None, None
    ans_re = re.compile(ANSWER_RE_TMPL.format(qid=re.escape(qid)), re.I | re.M)
    m = ans_re.search(block_text)
    answer = m.group(1).strip().upper() if m else None
    # Rationale: after the match until next header
    rationale = None
    if m:
        after = block_text[m.end():]
        # Trim boilerplate like "Choice A/B/C is incorrect ..." and condense
        rationale = normalize_text(after)
    return answer, rationale


def export_images_for_pages(math_path: str, rw_path: str, imgdir: str, qid: str, page_range: List[int], test_name: str) -> List[str]:
    saved: List[str] = []
    os.makedirs(imgdir, exist_ok=True)
    qdir = os.path.join(imgdir, qid)
    os.makedirs(qdir, exist_ok=True)
    src_path = math_path if test_name == "Math" else rw_path

    if fitz is None:  # fallback: no images
        return saved
    try:
        doc = fitz.open(src_path)
        fig_idx = 1
        for pno in page_range:
            if pno - 1 < 0 or pno - 1 >= len(doc):
                continue
            page = doc[pno - 1]
            for img in page.get_images(full=True):
                xref = img[0]
                pix = fitz.Pixmap(doc, xref)
                if pix.n >= 5:  # CMYK or with alpha
                    pix = fitz.Pixmap(fitz.csRGB, pix)
                out_path = os.path.join(qdir, f"fig{fig_idx}.png")
                pix.save(out_path)
                saved.append(os.path.join("/qmedia", qid, f"fig{fig_idx}.png"))
                fig_idx += 1
        doc.close()
    except Exception:
        return saved
    return saved


def parse_pdf(math_path: str, rw_path: str, out_path: str, imgdir: str, debug: bool = False) -> List[CBQuestion]:
    if pdfplumber is None:
        raise RuntimeError("pdfplumber is required. Please install via: pip install pdfplumber pillow PyMuPDF")

    docs = build_document_text(math_path, rw_path)
    results: List[CBQuestion] = []
    debug_bounds: Dict[str, List[Dict[str, Any]]] = {"Math": [], "Reading and Writing": []}

    for test_name in ("Math", "Reading and Writing"):
        doc_text = docs[test_name]["text"]
        pdf_path = docs[test_name]["pdf_path"]
        # Find all QID headers across the entire document
        matches = list(find_qid_matches(doc_text))
        if not matches:
            print(f"[warn] No headers found in {pdf_path}", file=sys.stderr)
            continue
        # Build blocks between QIDs
        blocks: List[Tuple[str, int, int]] = []  # (qid, start, end)
        for i, (start, qid) in enumerate(matches):
            end = matches[i + 1][0] if i + 1 < len(matches) else len(doc_text)
            blocks.append((qid, start, end))

        # Deduplicate by QID, keep first occurrence, limit to 50
        seen = set()
        selected: List[Tuple[str, int, int]] = []
        for qid, s, e in blocks:
            if qid in seen:
                continue
            seen.add(qid)
            selected.append((qid, s, e))
            if len(selected) >= 50:
                break

        for qid, s, e in selected:
            raw_block = doc_text[s:e]
            # Pages spanned
            pgs = [int(m.group(1)) for m in re.finditer(r"\[\[PAGE:(\d+)\]\]", raw_block)]
            if not pgs:
                # derive from nearest markers around block bounds
                before = doc_text[:s]
                after = doc_text[e:]
                prev = re.findall(r"\[\[PAGE:(\d+)\]\]", before)
                nxt = re.findall(r"\[\[PAGE:(\d+)\]\]", after)
                if prev:
                    pgs.append(int(prev[-1]))
                if nxt:
                    pgs.append(int(nxt[0]))
            page_range = sorted(set(pgs))

            # Clean block text (remove page markers)
            clean_block = re.sub(r"\[\[PAGE:\d+\]\]", "\n", raw_block)

            if debug:
                debug_bounds[test_name].append({"id": qid, "start": s, "end": e, "pages": page_range})
                dbg_dir = os.path.join("scripts", "data", "debug")
                os.makedirs(dbg_dir, exist_ok=True)
                with open(os.path.join(dbg_dir, f"block_{qid}.txt"), "w", encoding="utf-8") as f:
                    f.write(clean_block[:600])

            # Extract metadata and remove the composite rows from stem region
            meta, to_strip = extract_labels(clean_block)
            assessment = meta.get("assessment", "SAT") or "SAT"
            test_val = meta.get("test", test_name) or test_name
            domain = meta.get("domain") or "Unknown"
            skill = meta.get("skill") or "Unknown"
            difficulty = map_difficulty(meta.get("difficulty", "") or "")

            # Number near header line
            header_line = clean_block.splitlines()[0] if clean_block else ""
            number = None
            mm = re.search(r"(Question\s+)?(\d{1,2})[\.)]", header_line, re.I)
            if mm:
                try:
                    number = int(mm.group(2))
                except Exception:
                    number = None

            # Answer and rationale via strict regex
            ans_match = re.search(ANS_RE, clean_block)
            answer = None
            rationale = None
            if ans_match and ans_match.group(1).lower() == qid.lower():
                answer = ans_match.group(2).strip().upper()
                rationale = normalize_text(clean_block[ans_match.end():])

            # Truncate block before answer section for stem/choices parsing
            until_answer = re.split(re.compile(rf"ID\s*:\s*{re.escape(qid)}\s*Answer", re.I), clean_block, maxsplit=1)[0]
            # Remove composite label rows from the top to avoid polluting stem
            for row in to_strip:
                until_answer = until_answer.replace(row, "\n")
            # Build stem and choices: remove captions, parse choices by block regex
            pre = "\n".join([l for l in until_answer.splitlines() if l.strip() and not re.match(r"^(Figure|Table)\b", l, re.I)])
            choices = parse_choices_block(pre)
            if not choices:
                choices = parse_choices_inline(qid, pre, debug)
            if choices:
                # Identify where the first choice starts by locating label A (robust start)
                mA = re.search(r'(?m)^\(?A\)?[\.)]\s+', pre)
                stem_text = pre[: mA.start()] if mA else pre
                stem = normalize_text(stem_text)
            else:
                stem = normalize_text(pre)

            if not stem:
                # Fallback to skill text as stem if nothing extracted
                stem = skill or "Problem"

            # Validation constraints
            if len(stem) > 2000:
                stem = stem[:2000].rstrip()
            # fill required fields if missing
            assessment = assessment or "SAT"
            test_val = test_val or test_name
            difficulty = difficulty or "Medium"
            if not stem:
                stem = "Problem"
            # normalize choices/answer
            if choices is not None and len(choices) != 4:
                # discard malformed MCQ
                choices = None
            if choices is not None and answer and answer not in {"A", "B", "C", "D"}:
                # try to coerce numeric answers to None for MCQ
                answer = None

            # Export images
            images = export_images_for_pages(math_path, rw_path, imgdir, qid, page_range, test_val)

            results.append(CBQuestion(
                id=qid,
                assessment=assessment,
                test=test_val,
                domain=domain,
                skill=skill,
                difficulty=difficulty,
                number=number,
                stem=stem,
                choices=choices,
                answer=answer,
                rationale=rationale,
                images=images,
                pages=page_range or [],
            ))

    return results


def main():
    parser = argparse.ArgumentParser(description="Extract structured SAT questions from College Board PDFs")
    parser.add_argument("--math", required=True, help="Absolute path to 50M PDF")
    parser.add_argument("--rw", required=True, help="Absolute path to 50RW PDF")
    parser.add_argument("--out", required=True, help="Output JSON path")
    parser.add_argument("--imgdir", required=True, help="Directory under public/ to write images (e.g., public/qmedia)")
    parser.add_argument("--debug", action="store_true", help="Write debug bounds and block snippets")
    args = parser.parse_args()

    math_pdf = os.path.abspath(args.math)
    rw_pdf = os.path.abspath(args.rw)
    out_path = os.path.abspath(args.out)
    imgdir = os.path.abspath(args.imgdir)

    os.makedirs(os.path.dirname(out_path), exist_ok=True)
    os.makedirs(imgdir, exist_ok=True)

    questions = parse_pdf(math_pdf, rw_pdf, out_path, imgdir, debug=args.debug)

    # Validation (fail fast)
    math_count = len([q for q in questions if q.test == "Math"]) 
    rw_count = len([q for q in questions if q.test == "Reading and Writing"]) 
    has_choices = sum(1 for q in questions if q.choices is not None and len(q.choices) == 4)
    if math_count != 50 or rw_count != 50 or len(questions) != 100 or has_choices < 90:
        # Print first 5 QIDs per doc for debugging
        docs = build_document_text(math_pdf, rw_pdf)
        math_ids = [m[1] for m in find_qid_matches(docs['Math']['text'])][:5]
        rw_ids = [m[1] for m in find_qid_matches(docs['Reading and Writing']['text'])][:5]
        print(f"[error] Parsed counts Math={math_count}, RW={rw_count}, Total={len(questions)}, MCQ>=4={has_choices} (expected 50/50/100 and MCQ>=90)", file=sys.stderr)
        print(f"First 5 Math QIDs: {math_ids}", file=sys.stderr)
        print(f"First 5 R&W QIDs: {rw_ids}", file=sys.stderr)
        sys.exit(1)

    # Serialize with required schema
    serializable = []
    for q in questions:
        item = asdict(q)
        # Convert Choice dataclass
        if q.choices is not None:
            item["choices"] = [asdict(c) for c in q.choices]
        serializable.append(item)

    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(serializable, f, ensure_ascii=False, indent=2)

    print(f"Math: {math_count}, R&W: {rw_count}, Total: {len(serializable)}")
    print(f"Wrote {len(serializable)} questions to {out_path}")


if __name__ == "__main__":
    main()


