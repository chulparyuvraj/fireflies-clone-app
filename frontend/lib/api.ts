import {
  ActionItem,
  MeetingCreatePayload,
  MeetingDetail,
  MeetingListItem,
  SearchHit,
} from "./types";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    cache: "no-store",
    ...options,
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`API error ${res.status}: ${body || res.statusText}`);
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}

export interface MeetingFilters {
  q?: string;
  participant?: string;
  sort?: "recent" | "oldest" | "title";
}

export function listMeetings(filters: MeetingFilters = {}): Promise<MeetingListItem[]> {
  const params = new URLSearchParams();
  if (filters.q) params.set("q", filters.q);
  if (filters.participant) params.set("participant", filters.participant);
  if (filters.sort) params.set("sort", filters.sort);
  const qs = params.toString();
  return request(`/api/meetings${qs ? `?${qs}` : ""}`);
}

export function getMeeting(id: string): Promise<MeetingDetail> {
  return request(`/api/meetings/${id}`);
}

export function createMeeting(payload: MeetingCreatePayload): Promise<MeetingDetail> {
  return request(`/api/meetings`, { method: "POST", body: JSON.stringify(payload) });
}

export function updateMeeting(
  id: string,
  payload: Partial<{ title: string; date: string; participant_names: string[] }>
): Promise<MeetingDetail> {
  return request(`/api/meetings/${id}`, { method: "PUT", body: JSON.stringify(payload) });
}

export function deleteMeeting(id: string): Promise<void> {
  return request(`/api/meetings/${id}`, { method: "DELETE" });
}

export function createActionItem(
  meetingId: string,
  payload: { text: string; assignee?: string; completed?: boolean }
): Promise<ActionItem> {
  return request(`/api/meetings/${meetingId}/action-items`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function updateActionItem(
  id: string,
  payload: Partial<{ text: string; assignee: string; completed: boolean }>
): Promise<ActionItem> {
  return request(`/api/action-items/${id}`, { method: "PUT", body: JSON.stringify(payload) });
}

export function deleteActionItem(id: string): Promise<void> {
  return request(`/api/action-items/${id}`, { method: "DELETE" });
}

export function globalSearch(q: string): Promise<SearchHit[]> {
  return request(`/api/search?q=${encodeURIComponent(q)}`);
}
