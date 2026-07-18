"use client";

import { Topic } from "@/lib/types";
import { formatTimestamp } from "@/lib/format";

export default function SummaryPanel({
  overview,
  topics,
  onSeek,
}: {
  overview: string;
  topics: Topic[];
  onSeek: (time: number) => void;
}) {
  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-[#e6e4f0] bg-white p-4">
        <h3 className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-[#17162b]">
          ✨ AI summary
        </h3>
        {overview ? (
          <p className="text-sm leading-relaxed text-[#3d3757]">{overview}</p>
        ) : (
          <p className="text-sm text-[#a9a4c4]">No summary generated for this meeting yet.</p>
        )}
      </div>

      <div className="rounded-xl border border-[#e6e4f0] bg-white p-4">
        <h3 className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-[#17162b]">
          📑 Outline
        </h3>
        {topics.length === 0 ? (
          <p className="text-sm text-[#a9a4c4]">No topics identified.</p>
        ) : (
          <ol className="space-y-2">
            {topics.map((t, i) => (
              <li key={t.id}>
                <button
                  onClick={() => onSeek(t.timestamp)}
                  className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-sm hover:bg-[#f6f6fb]"
                >
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#f1efff] text-[10px] font-bold text-[#5b4fe9]">
                    {i + 1}
                  </span>
                  <span className="flex-1 text-[#3d3757]">{t.title}</span>
                  <span className="shrink-0 text-[11px] tabular-nums text-[#a9a4c4]">
                    {formatTimestamp(t.timestamp)}
                  </span>
                </button>
              </li>
            ))}
          </ol>
        )}
      </div>
    </div>
  );
}
