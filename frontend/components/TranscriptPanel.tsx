"use client";

import { useMemo, useRef, useState } from "react";
import { TranscriptSegment } from "@/lib/types";
import { formatTimestamp, initials } from "@/lib/format";

const COLORS = ["#6C5CE7", "#00B8D9", "#FF7452", "#36B37E", "#FFAB00", "#DE350B"];

function speakerColor(name: string) {
  let hash = 0;
  for (const ch of name) hash = (hash * 31 + ch.charCodeAt(0)) % COLORS.length;
  return COLORS[hash];
}

function highlight(text: string, query: string) {
  if (!query.trim()) return text;
  const parts = text.split(new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "ig"));
  return parts.map((part, i) =>
    part.toLowerCase() === query.toLowerCase() ? (
      <mark key={i} className="highlight-match">{part}</mark>
    ) : (
      <span key={i}>{part}</span>
    )
  );
}

export default function TranscriptPanel({
  segments,
  activeId,
  onSeek,
}: {
  segments: TranscriptSegment[];
  activeId: string | null;
  onSeek: (time: number) => void;
}) {
  const [query, setQuery] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  const filtered = useMemo(() => {
    if (!query.trim()) return segments;
    return segments.filter((s) => s.text.toLowerCase().includes(query.toLowerCase()));
  }, [segments, query]);

  return (
    <div className="flex h-full flex-col rounded-xl border border-[#e6e4f0] bg-white">
      <div className="border-b border-[#e6e4f0] p-3">
        <div className="relative">
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#a9a4c4]">🔍</span>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search within transcript..."
            className="w-full rounded-lg border border-[#e6e4f0] bg-[#f6f6fb] py-2 pl-9 pr-3 text-sm focus:border-[#5b4fe9] focus:outline-none"
          />
        </div>
        {query && (
          <p className="mt-1.5 text-[11px] text-[#8b84a8]">
            {filtered.length} match{filtered.length === 1 ? "" : "es"}
          </p>
        )}
      </div>

      <div ref={containerRef} className="flex-1 space-y-1 overflow-y-auto p-3">
        {filtered.length === 0 ? (
          <p className="py-10 text-center text-sm text-[#a9a4c4]">No matching lines.</p>
        ) : (
          filtered.map((seg) => (
            <button
              key={seg.id}
              onClick={() => onSeek(seg.start_time)}
              className={`flex w-full gap-3 rounded-lg p-2.5 text-left transition-colors hover:bg-[#f6f6fb] ${
                activeId === seg.id ? "transcript-line-active" : ""
              }`}
            >
              <div
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white"
                style={{ background: speakerColor(seg.speaker_name) }}
              >
                {initials(seg.speaker_name)}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline gap-2">
                  <span className="text-xs font-semibold text-[#17162b]">{seg.speaker_name}</span>
                  <span className="text-[11px] tabular-nums text-[#a9a4c4]">
                    {formatTimestamp(seg.start_time)}
                  </span>
                </div>
                <p className="mt-0.5 text-sm leading-relaxed text-[#3d3757]">
                  {highlight(seg.text, query)}
                </p>
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
}
