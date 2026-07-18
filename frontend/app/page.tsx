"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { listMeetings, deleteMeeting, MeetingFilters } from "@/lib/api";
import { MeetingListItem } from "@/lib/types";
import { formatDate, formatDuration, initials } from "@/lib/format";
import { useToast } from "@/components/ToastProvider";
import NewMeetingModal from "@/components/NewMeetingModal";
import ConfirmDialog from "@/components/ConfirmDialog";

const AVATAR_COLORS = ["#6C5CE7", "#00B8D9", "#FF7452", "#36B37E", "#FFAB00"];

export default function DashboardPage() {
  const [meetings, setMeetings] = useState<MeetingListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [participant, setParticipant] = useState("");
  const [sort, setSort] = useState<MeetingFilters["sort"]>("recent");
  const [showNewModal, setShowNewModal] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<MeetingListItem | null>(null);
  const toast = useToast();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await listMeetings({ q: query || undefined, participant: participant || undefined, sort });
      setMeetings(data);
    } catch {
      toast.show("Couldn't load meetings. Is the backend running?", "error");
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, participant, sort]);

  useEffect(() => {
    const t = setTimeout(load, 200); // debounce search
    return () => clearTimeout(t);
  }, [load]);

  const allParticipants = Array.from(
    new Map(meetings.flatMap((m) => m.participants).map((p) => [p.name, p])).values()
  );

  async function handleDelete() {
    if (!pendingDelete) return;
    try {
      await deleteMeeting(pendingDelete.id);
      toast.show(`Deleted "${pendingDelete.title}"`, "success");
      setPendingDelete(null);
      load();
    } catch {
      toast.show("Couldn't delete meeting", "error");
    }
  }

  return (
    <div className="min-h-screen bg-[#f6f6fb]">
      {/* Top bar */}
      <header className="sticky top-0 z-10 flex items-center justify-between border-b border-[#e6e4f0] bg-white/80 px-8 py-4 backdrop-blur">
        <div>
          <h1 className="text-lg font-semibold text-[#17162b]">Meetings</h1>
          <p className="text-sm text-[#8b84a8]">{meetings.length} meeting{meetings.length === 1 ? "" : "s"}</p>
        </div>
        <button
          onClick={() => setShowNewModal(true)}
          className="flex items-center gap-2 rounded-lg bg-[#5b4fe9] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#4a3fd6]"
        >
          <span className="text-base leading-none">+</span> New meeting
        </button>
      </header>

      <div className="px-8 py-6">
        {/* Search + filters */}
        <div className="mb-5 flex flex-wrap items-center gap-3">
          <div className="relative min-w-[260px] flex-1">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#a9a4c4]">
              🔍
            </span>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search meetings by title..."
              className="w-full rounded-lg border border-[#e6e4f0] bg-white py-2.5 pl-9 pr-3 text-sm text-[#17162b] placeholder:text-[#a9a4c4] focus:border-[#5b4fe9] focus:outline-none focus:ring-2 focus:ring-[#5b4fe9]/20"
            />
          </div>
          <select
            value={participant}
            onChange={(e) => setParticipant(e.target.value)}
            className="rounded-lg border border-[#e6e4f0] bg-white px-3 py-2.5 text-sm text-[#17162b] focus:border-[#5b4fe9] focus:outline-none"
          >
            <option value="">All participants</option>
            {allParticipants.map((p) => (
              <option key={p.name} value={p.name}>{p.name}</option>
            ))}
          </select>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as MeetingFilters["sort"])}
            className="rounded-lg border border-[#e6e4f0] bg-white px-3 py-2.5 text-sm text-[#17162b] focus:border-[#5b4fe9] focus:outline-none"
          >
            <option value="recent">Most recent</option>
            <option value="oldest">Oldest first</option>
            <option value="title">Title A–Z</option>
          </select>
        </div>

        {/* Meetings list */}
        {loading ? (
          <div className="grid gap-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-20 animate-pulse rounded-xl bg-white/60" />
            ))}
          </div>
        ) : meetings.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-[#e6e4f0] bg-white py-20 text-center">
            <div className="mb-3 text-4xl">🪶</div>
            <p className="font-medium text-[#17162b]">No meetings yet</p>
            <p className="mt-1 text-sm text-[#8b84a8]">Create your first meeting to see it here.</p>
            <button
              onClick={() => setShowNewModal(true)}
              className="mt-4 rounded-lg bg-[#5b4fe9] px-4 py-2 text-sm font-semibold text-white hover:bg-[#4a3fd6]"
            >
              + New meeting
            </button>
          </div>
        ) : (
          <div className="grid gap-3">
            {meetings.map((m) => (
              <div
                key={m.id}
                className="group flex items-center gap-4 rounded-xl border border-[#e6e4f0] bg-white px-5 py-4 shadow-sm transition-shadow hover:shadow-md"
              >
                <Link href={`/meeting/${m.id}`} className="flex min-w-0 flex-1 items-center gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-[#f1efff] text-lg">
                    🎙️
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold text-[#17162b] group-hover:text-[#5b4fe9]">
                      {m.title}
                    </p>
                    <div className="mt-1 flex items-center gap-3 text-xs text-[#8b84a8]">
                      <span>{formatDate(m.date)}</span>
                      <span>·</span>
                      <span>{formatDuration(m.duration_seconds)}</span>
                    </div>
                  </div>
                  <div className="hidden shrink-0 -space-x-2 sm:flex">
                    {m.participants.slice(0, 4).map((p, i) => (
                      <div
                        key={p.id}
                        title={p.name}
                        className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white text-[10px] font-bold text-white"
                        style={{ background: p.avatar_color || AVATAR_COLORS[i % AVATAR_COLORS.length] }}
                      >
                        {initials(p.name)}
                      </div>
                    ))}
                    {m.participants.length > 4 && (
                      <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-[#e6e4f0] text-[10px] font-bold text-[#5b4fe9]">
                        +{m.participants.length - 4}
                      </div>
                    )}
                  </div>
                </Link>
                <button
                  onClick={() => setPendingDelete(m)}
                  className="shrink-0 rounded-lg px-2 py-2 text-[#a9a4c4] opacity-0 transition-opacity hover:bg-red-50 hover:text-red-500 group-hover:opacity-100"
                  title="Delete meeting"
                >
                  🗑️
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {showNewModal && (
        <NewMeetingModal
          onClose={() => setShowNewModal(false)}
          onCreated={() => {
            setShowNewModal(false);
            load();
          }}
        />
      )}

      {pendingDelete && (
        <ConfirmDialog
          title="Delete meeting?"
          message={`"${pendingDelete.title}" and its transcript, summary, and action items will be permanently deleted.`}
          confirmLabel="Delete"
          danger
          onCancel={() => setPendingDelete(null)}
          onConfirm={handleDelete}
        />
      )}
    </div>
  );
}
