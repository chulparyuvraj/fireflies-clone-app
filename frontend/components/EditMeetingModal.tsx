"use client";

import { useState } from "react";
import { updateMeeting } from "@/lib/api";
import { MeetingDetail } from "@/lib/types";
import { useToast } from "@/components/ToastProvider";

export default function EditMeetingModal({
  meeting,
  onClose,
  onSaved,
}: {
  meeting: MeetingDetail;
  onClose: () => void;
  onSaved: (m: MeetingDetail) => void;
}) {
  const [title, setTitle] = useState(meeting.title);
  const [participants, setParticipants] = useState(meeting.participants.map((p) => p.name).join(", "));
  const [saving, setSaving] = useState(false);
  const toast = useToast();

  async function handleSave() {
    if (!title.trim()) {
      toast.show("Title can't be empty", "error");
      return;
    }
    setSaving(true);
    try {
      const updated = await updateMeeting(meeting.id, {
        title: title.trim(),
        participant_names: participants.split(",").map((p) => p.trim()).filter(Boolean),
      });
      toast.show("Meeting updated", "success");
      onSaved(updated);
    } catch {
      toast.show("Couldn't save changes", "error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4" onClick={onClose}>
      <div className="w-full max-w-md rounded-xl bg-white shadow-xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-[#e6e4f0] px-6 py-4">
          <h3 className="text-base font-semibold text-[#17162b]">Edit meeting</h3>
          <button onClick={onClose} className="text-[#a9a4c4] hover:text-[#17162b]">✕</button>
        </div>
        <div className="space-y-4 px-6 py-5">
          <div>
            <label className="mb-1 block text-xs font-semibold text-[#6b6483]">Title</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-lg border border-[#e6e4f0] px-3 py-2 text-sm focus:border-[#5b4fe9] focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-[#6b6483]">Participants (comma-separated)</label>
            <input
              value={participants}
              onChange={(e) => setParticipants(e.target.value)}
              className="w-full rounded-lg border border-[#e6e4f0] px-3 py-2 text-sm focus:border-[#5b4fe9] focus:outline-none"
            />
          </div>
        </div>
        <div className="flex justify-end gap-2 border-t border-[#e6e4f0] px-6 py-4">
          <button onClick={onClose} className="rounded-lg border border-[#e6e4f0] px-4 py-2 text-sm font-medium hover:bg-[#f6f6fb]">
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="rounded-lg bg-[#5b4fe9] px-4 py-2 text-sm font-semibold text-white hover:bg-[#4a3fd6] disabled:opacity-60"
          >
            {saving ? "Saving…" : "Save changes"}
          </button>
        </div>
      </div>
    </div>
  );
}
