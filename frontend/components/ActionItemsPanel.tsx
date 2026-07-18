"use client";

import { useState } from "react";
import { ActionItem } from "@/lib/types";
import { createActionItem, deleteActionItem, updateActionItem } from "@/lib/api";
import { useToast } from "@/components/ToastProvider";

export default function ActionItemsPanel({
  meetingId,
  items,
  onChange,
}: {
  meetingId: string;
  items: ActionItem[];
  onChange: (items: ActionItem[]) => void;
}) {
  const [newText, setNewText] = useState("");
  const [newAssignee, setNewAssignee] = useState("");
  const [adding, setAdding] = useState(false);
  const toast = useToast();

  async function handleAdd() {
    if (!newText.trim()) return;
    setAdding(true);
    try {
      const item = await createActionItem(meetingId, {
        text: newText.trim(),
        assignee: newAssignee.trim() || undefined,
      });
      onChange([...items, item]);
      setNewText("");
      setNewAssignee("");
    } catch {
      toast.show("Couldn't add action item", "error");
    } finally {
      setAdding(false);
    }
  }

  async function toggleComplete(item: ActionItem) {
    const updated = await updateActionItem(item.id, { completed: !item.completed });
    onChange(items.map((i) => (i.id === item.id ? updated : i)));
  }

  async function handleDelete(item: ActionItem) {
    await deleteActionItem(item.id);
    onChange(items.filter((i) => i.id !== item.id));
  }

  const completedCount = items.filter((i) => i.completed).length;

  return (
    <div className="rounded-xl border border-[#e6e4f0] bg-white p-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="flex items-center gap-1.5 text-sm font-semibold text-[#17162b]">✅ Action items</h3>
        {items.length > 0 && (
          <span className="text-[11px] text-[#a9a4c4]">{completedCount}/{items.length} done</span>
        )}
      </div>

      <div className="space-y-1.5">
        {items.map((item) => (
          <div key={item.id} className="group flex items-start gap-2 rounded-lg px-1.5 py-1.5 hover:bg-[#f6f6fb]">
            <input
              type="checkbox"
              checked={item.completed}
              onChange={() => toggleComplete(item)}
              className="mt-1 h-4 w-4 shrink-0 accent-[#5b4fe9]"
            />
            <div className="min-w-0 flex-1">
              <p className={`text-sm ${item.completed ? "text-[#a9a4c4] line-through" : "text-[#3d3757]"}`}>
                {item.text}
              </p>
              {item.assignee && (
                <span className="text-[11px] text-[#8b84a8]">@{item.assignee}</span>
              )}
            </div>
            <button
              onClick={() => handleDelete(item)}
              className="shrink-0 text-[#c9c5e0] opacity-0 transition-opacity hover:text-red-500 group-hover:opacity-100"
            >
              ✕
            </button>
          </div>
        ))}
        {items.length === 0 && (
          <p className="py-2 text-sm text-[#a9a4c4]">No action items yet.</p>
        )}
      </div>

      <div className="mt-3 space-y-2 border-t border-[#e6e4f0] pt-3">
        <input
          value={newText}
          onChange={(e) => setNewText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAdd()}
          placeholder="Add an action item..."
          className="w-full rounded-lg border border-[#e6e4f0] px-3 py-2 text-sm focus:border-[#5b4fe9] focus:outline-none"
        />
        <div className="flex gap-2">
          <input
            value={newAssignee}
            onChange={(e) => setNewAssignee(e.target.value)}
            placeholder="Assignee (optional)"
            className="flex-1 rounded-lg border border-[#e6e4f0] px-3 py-1.5 text-xs focus:border-[#5b4fe9] focus:outline-none"
          />
          <button
            onClick={handleAdd}
            disabled={adding || !newText.trim()}
            className="rounded-lg bg-[#5b4fe9] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#4a3fd6] disabled:opacity-50"
          >
            Add
          </button>
        </div>
      </div>
    </div>
  );
}
