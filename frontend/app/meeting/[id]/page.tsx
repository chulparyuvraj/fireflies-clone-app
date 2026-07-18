"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { getMeeting, deleteMeeting } from "@/lib/api";
import { MeetingDetail } from "@/lib/types";
import { formatDate, formatDuration, initials } from "@/lib/format";
import MediaPlayer from "@/components/MediaPlayer";
import TranscriptPanel from "@/components/TranscriptPanel";
import SummaryPanel from "@/components/SummaryPanel";
import ActionItemsPanel from "@/components/ActionItemsPanel";
import EditMeetingModal from "@/components/EditMeetingModal";
import ConfirmDialog from "@/components/ConfirmDialog";
import { useToast } from "@/components/ToastProvider";

type Tab = "transcript" | "summary";

export default function MeetingDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const toast = useToast();

  const [meeting, setMeeting] = useState<MeetingDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [tab, setTab] = useState<Tab>("transcript");
  const [currentTime, setCurrentTime] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showDelete, setShowDelete] = useState(false);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getMeeting(params.id)
      .then((m) => {
        if (!cancelled) setMeeting(m);
      })
      .catch(() => !cancelled && setError(true))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [params.id]);

  // Fake playback: advances currentTime while "playing"
  useEffect(() => {
    if (playing && meeting) {
      intervalRef.current = setInterval(() => {
        setCurrentTime((t) => {
          const next = t + 1;
          if (next >= meeting.duration_seconds) {
            setPlaying(false);
            return meeting.duration_seconds;
          }
          return next;
        });
      }, 1000);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [playing, meeting]);

  const activeSegmentId = useMemo(() => {
    if (!meeting) return null;
    const seg = [...meeting.transcript_segments]
      .reverse()
      .find((s) => s.start_time <= currentTime);
    return seg?.id ?? null;
  }, [meeting, currentTime]);

  function handleSeek(t: number) {
    setCurrentTime(t);
  }

  async function handleDelete() {
    if (!meeting) return;
    try {
      await deleteMeeting(meeting.id);
      toast.show("Meeting deleted", "success");
      router.push("/");
    } catch {
      toast.show("Couldn't delete meeting", "error");
    }
  }

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#f6f6fb] text-sm text-[#8b84a8]">
        Loading meeting…
      </div>
    );
  }

  if (error || !meeting) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-3 bg-[#f6f6fb]">
        <p className="text-sm text-[#8b84a8]">Couldn&apos;t find that meeting.</p>
        <Link href="/" className="text-sm font-semibold text-[#5b4fe9] hover:underline">
          ← Back to meetings
        </Link>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col bg-[#f6f6fb]">
      {/* Header */}
      <header className="flex items-center justify-between border-b border-[#e6e4f0] bg-white px-8 py-4">
        <div className="min-w-0 flex-1">
          <Link href="/" className="text-xs font-medium text-[#8b84a8] hover:text-[#5b4fe9]">
            ← All meetings
          </Link>
          <h1 className="mt-1 truncate text-lg font-semibold text-[#17162b]">{meeting.title}</h1>
          <div className="mt-1 flex items-center gap-3 text-xs text-[#8b84a8]">
            <span>{formatDate(meeting.date)}</span>
            <span>·</span>
            <span>{formatDuration(meeting.duration_seconds)}</span>
            <span>·</span>
            <div className="flex -space-x-1.5">
              {meeting.participants.map((p) => (
                <div
                  key={p.id}
                  title={p.name}
                  className="flex h-5 w-5 items-center justify-center rounded-full border-2 border-white text-[9px] font-bold text-white"
                  style={{ background: p.avatar_color }}
                >
                  {initials(p.name)}
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="flex shrink-0 gap-2">
          <button
            onClick={() => setShowEdit(true)}
            className="rounded-lg border border-[#e6e4f0] px-3 py-2 text-sm font-medium text-[#17162b] hover:bg-[#f6f6fb]"
          >
            Edit
          </button>
          <button
            onClick={() => setShowDelete(true)}
            className="rounded-lg border border-[#e6e4f0] px-3 py-2 text-sm font-medium text-red-500 hover:bg-red-50"
          >
            Delete
          </button>
        </div>
      </header>

      {/* Body: 2-column layout */}
      <div className="grid min-h-0 flex-1 grid-cols-1 gap-4 overflow-hidden p-4 lg:grid-cols-[1fr_360px]">
        {/* Left: player + transcript/summary tabs */}
        <div className="flex min-h-0 flex-col gap-4">
          <MediaPlayer
            currentTime={currentTime}
            duration={meeting.duration_seconds}
            playing={playing}
            onSeek={handleSeek}
            onTogglePlay={() => setPlaying((p) => !p)}
          />

          <div className="flex gap-1 rounded-lg bg-[#f1efff] p-1">
            {(["transcript", "summary"] as Tab[]).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`flex-1 rounded-md px-3 py-1.5 text-xs font-semibold capitalize transition-colors ${
                  tab === t ? "bg-white text-[#5b4fe9] shadow-sm" : "text-[#6b6483]"
                }`}
              >
                {t === "transcript" ? "Transcript" : "Summary & outline"}
              </button>
            ))}
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto">
            {tab === "transcript" ? (
              <TranscriptPanel
                segments={meeting.transcript_segments}
                activeId={activeSegmentId}
                onSeek={handleSeek}
              />
            ) : (
              <SummaryPanel
                overview={meeting.summary?.overview ?? ""}
                topics={meeting.topics}
                onSeek={handleSeek}
              />
            )}
          </div>
        </div>

        {/* Right: action items sidebar */}
        <div className="min-h-0 overflow-y-auto">
          <ActionItemsPanel
            meetingId={meeting.id}
            items={meeting.action_items}
            onChange={(items) => setMeeting({ ...meeting, action_items: items })}
          />
        </div>
      </div>

      {showEdit && (
        <EditMeetingModal
          meeting={meeting}
          onClose={() => setShowEdit(false)}
          onSaved={(m) => {
            setMeeting(m);
            setShowEdit(false);
          }}
        />
      )}

      {showDelete && (
        <ConfirmDialog
          title="Delete meeting?"
          message={`"${meeting.title}" and its transcript, summary, and action items will be permanently deleted.`}
          confirmLabel="Delete"
          danger
          onCancel={() => setShowDelete(false)}
          onConfirm={handleDelete}
        />
      )}
    </div>
  );
}
