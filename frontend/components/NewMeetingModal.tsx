"use client";

import { useState } from "react";
import { createMeeting } from "@/lib/api";
import { useToast } from "@/components/ToastProvider";

const SAMPLE = `Alex Chen [00:00:00]: Alright, thanks everyone for joining. Let's kick off the sync.
Priya Nair [00:00:08]: Sounds good. I'll start with the backend status.
Alex Chen [00:00:35]: Great, and let's make sure we assign owners before we wrap up.`;

export default function NewMeetingModal({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: () => void;
}) {
  const [mode, setMode] = useState<"form" | "paste" | "upload">("form");
  const [title, setTitle] = useState("");
  const [participants, setParticipants] = useState("");
  const [duration, setDuration] = useState(600);
  const [rawTranscript, setRawTranscript] = useState("");
  const [overview, setOverview] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const toast = useToast();

  async function handleFile(file: File) {
    const text = await file.text();
    setRawTranscript(text);
  }

  async function handleSubmit() {
    if (!title.trim()) {
      toast.show("Give the meeting a title first", "error");
      return;
    }
    setSubmitting(true);
    try {
      await createMeeting({
        title: title.trim(),
        duration_seconds: Number(duration) || 0,
        participant_names: participants
          .split(",")
          .map((p) => p.trim())
          .filter(Boolean),
        raw_transcript: mode === "form" ? undefined : rawTranscript || undefined,
        overview: overview || undefined,
      });
      toast.show("Meeting created", "success");
      onCreated();
    } catch {
      toast.show("Couldn't create the meeting", "error");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4" onClick={onClose}>
      <div
        className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-[#e6e4f0] px-6 py-4">
          <h3 className="text-base font-semibold text-[#17162b]">New meeting</h3>
          <button onClick={onClose} className="text-[#a9a4c4] hover:text-[#17162b]">✕</button>
        </div>

        <div className="px-6 pt-4">
          <div className="mb-4 flex gap-1 rounded-lg bg-[#f1efff] p-1">
            {(["form", "paste", "upload"] as const).map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`flex-1 rounded-md px-3 py-1.5 text-xs font-semibold capitalize transition-colors ${
                  mode === m ? "bg-white text-[#5b4fe9] shadow-sm" : "text-[#6b6483]"
                }`}
              >
                {m === "form" ? "Details only" : m === "paste" ? "Paste transcript" : "Upload file"}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-4 px-6 pb-6">
          <div>
            <label className="mb-1 block text-xs font-semibold text-[#6b6483]">Title</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Weekly Engineering Sync"
              className="w-full rounded-lg border border-[#e6e4f0] px-3 py-2 text-sm focus:border-[#5b4fe9] focus:outline-none"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-semibold text-[#6b6483]">Participants</label>
              <input
                value={participants}
                onChange={(e) => setParticipants(e.target.value)}
                placeholder="Alex Chen, Priya Nair"
                className="w-full rounded-lg border border-[#e6e4f0] px-3 py-2 text-sm focus:border-[#5b4fe9] focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-[#6b6483]">Duration (sec)</label>
              <input
                type="number"
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                className="w-full rounded-lg border border-[#e6e4f0] px-3 py-2 text-sm focus:border-[#5b4fe9] focus:outline-none"
              />
            </div>
          </div>

          {mode === "paste" && (
            <div>
              <div className="mb-1 flex items-center justify-between">
                <label className="block text-xs font-semibold text-[#6b6483]">
                  Transcript — one line per utterance: <code>Speaker [hh:mm:ss]: text</code>
                </label>
                <button
                  type="button"
                  onClick={() => setRawTranscript(SAMPLE)}
                  className="text-[11px] font-semibold text-[#5b4fe9] hover:underline"
                >
                  Use sample
                </button>
              </div>
              <textarea
                value={rawTranscript}
                onChange={(e) => setRawTranscript(e.target.value)}
                rows={6}
                placeholder={SAMPLE}
                className="w-full rounded-lg border border-[#e6e4f0] px-3 py-2 font-mono text-xs focus:border-[#5b4fe9] focus:outline-none"
              />
            </div>
          )}

          {mode === "upload" && (
            <div>
              <label className="mb-1 block text-xs font-semibold text-[#6b6483]">Transcript file (.txt / .vtt)</label>
              <input
                type="file"
                accept=".txt,.vtt,.json"
                onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
                className="w-full rounded-lg border border-dashed border-[#e6e4f0] px-3 py-6 text-sm text-[#6b6483]"
              />
              {rawTranscript && (
                <p className="mt-1 text-xs text-emerald-600">Loaded {rawTranscript.split("\n").length} lines.</p>
              )}
            </div>
          )}

          <div>
            <label className="mb-1 block text-xs font-semibold text-[#6b6483]">Summary overview (optional)</label>
            <textarea
              value={overview}
              onChange={(e) => setOverview(e.target.value)}
              rows={2}
              placeholder="Short summary of what was discussed..."
              className="w-full rounded-lg border border-[#e6e4f0] px-3 py-2 text-sm focus:border-[#5b4fe9] focus:outline-none"
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 border-t border-[#e6e4f0] px-6 py-4">
          <button onClick={onClose} className="rounded-lg border border-[#e6e4f0] px-4 py-2 text-sm font-medium text-[#17162b] hover:bg-[#f6f6fb]">
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="rounded-lg bg-[#5b4fe9] px-4 py-2 text-sm font-semibold text-white hover:bg-[#4a3fd6] disabled:opacity-60"
          >
            {submitting ? "Creating…" : "Create meeting"}
          </button>
        </div>
      </div>
    </div>
  );
}
