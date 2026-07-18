"""
Parses plain-text transcripts into structured segments.

Expected line format (one utterance per line):

    Speaker Name [00:00:12]: What they said.

Lines that don't match the pattern are skipped. Each segment's end_time
is inferred from the start_time of the next segment (or +5s for the last one).
"""
import re
from typing import List, Dict

LINE_RE = re.compile(r"^\s*([^\[]+?)\s*\[(\d{1,2}:\d{2}(?::\d{2})?)\]\s*:\s*(.+)$")


def _to_seconds(ts: str) -> float:
    parts = [int(p) for p in ts.split(":")]
    while len(parts) < 3:
        parts.insert(0, 0)
    h, m, s = parts
    return float(h * 3600 + m * 60 + s)


def parse_transcript(raw: str) -> List[Dict]:
    segments = []
    for line in raw.splitlines():
        line = line.strip()
        if not line:
            continue
        match = LINE_RE.match(line)
        if not match:
            continue
        speaker, ts, text = match.groups()
        segments.append({
            "speaker_name": speaker.strip(),
            "start_time": _to_seconds(ts),
            "text": text.strip(),
        })

    for i, seg in enumerate(segments):
        if i + 1 < len(segments):
            seg["end_time"] = segments[i + 1]["start_time"]
        else:
            seg["end_time"] = seg["start_time"] + 5.0
        seg["order_index"] = i

    return segments
