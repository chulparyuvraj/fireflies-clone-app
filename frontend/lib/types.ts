export interface Participant {
  id: string;
  name: string;
  email?: string | null;
  avatar_color: string;
}

export interface TranscriptSegment {
  id: string;
  speaker_name: string;
  start_time: number;
  end_time: number;
  text: string;
  order_index: number;
}

export interface Topic {
  id: string;
  title: string;
  timestamp: number;
  order_index: number;
}

export interface ActionItem {
  id: string;
  meeting_id: string;
  text: string;
  assignee?: string | null;
  completed: boolean;
  created_at: string;
}

export interface Summary {
  overview: string;
}

export interface MeetingListItem {
  id: string;
  title: string;
  date: string;
  duration_seconds: number;
  participants: Participant[];
}

export interface MeetingDetail extends MeetingListItem {
  audio_url?: string | null;
  transcript_segments: TranscriptSegment[];
  summary?: Summary | null;
  topics: Topic[];
  action_items: ActionItem[];
}

export interface SearchHit {
  meeting_id: string;
  meeting_title: string;
  speaker_name: string;
  start_time: number;
  text: string;
}

export interface MeetingCreatePayload {
  title: string;
  date?: string;
  duration_seconds?: number;
  participant_names: string[];
  raw_transcript?: string;
  overview?: string;
}
