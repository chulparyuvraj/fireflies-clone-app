"use client";

import { formatTimestamp } from "@/lib/format";

export default function MediaPlayer({
  currentTime,
  duration,
  playing,
  onSeek,
  onTogglePlay,
}: {
  currentTime: number;
  duration: number;
  playing: boolean;
  onSeek: (t: number) => void;
  onTogglePlay: () => void;
}) {
  const pct = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="rounded-xl border border-[#e6e4f0] bg-white p-4">
      <div className="mb-3 flex h-24 items-center justify-center rounded-lg bg-gradient-to-br from-[#f1efff] to-[#e6e4f0]">
        <div className="flex items-end gap-[3px]">
          {Array.from({ length: 40 }).map((_, i) => {
            const active = (i / 40) * 100 < pct;
            const h = 6 + ((i * 37) % 24);
            return (
              <div
                key={i}
                style={{ height: `${h}px` }}
                className={`w-[3px] rounded-full transition-colors ${active ? "bg-[#5b4fe9]" : "bg-[#c9c5e0]"}`}
              />
            );
          })}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={onTogglePlay}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#5b4fe9] text-white hover:bg-[#4a3fd6]"
        >
          {playing ? "⏸" : "▶"}
        </button>

        <span className="w-12 shrink-0 text-right text-xs tabular-nums text-[#6b6483]">
          {formatTimestamp(currentTime)}
        </span>

        <input
          type="range"
          min={0}
          max={Math.max(duration, 1)}
          value={currentTime}
          onChange={(e) => onSeek(Number(e.target.value))}
          className="h-1.5 flex-1 cursor-pointer appearance-none rounded-full bg-[#e6e4f0] accent-[#5b4fe9]"
        />

        <span className="w-12 shrink-0 text-xs tabular-nums text-[#6b6483]">
          {formatTimestamp(duration)}
        </span>
      </div>
      <p className="mt-2 text-center text-[11px] text-[#a9a4c4]">
        Placeholder player — click any transcript line to jump the seek bar to that timestamp.
      </p>
    </div>
  );
}
