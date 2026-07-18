import datetime
from typing import List, Optional

from pydantic import BaseModel, ConfigDict


class ParticipantBase(BaseModel):
    name: str
    email: Optional[str] = None
    avatar_color: Optional[str] = "#6C5CE7"


class ParticipantOut(ParticipantBase):
    model_config = ConfigDict(from_attributes=True)
    id: str


class TranscriptSegmentBase(BaseModel):
    speaker_name: str
    start_time: float
    end_time: float
    text: str
    order_index: int


class TranscriptSegmentOut(TranscriptSegmentBase):
    model_config = ConfigDict(from_attributes=True)
    id: str


class TopicBase(BaseModel):
    title: str
    timestamp: float = 0.0
    order_index: int


class TopicOut(TopicBase):
    model_config = ConfigDict(from_attributes=True)
    id: str


class ActionItemBase(BaseModel):
    text: str
    assignee: Optional[str] = None
    completed: bool = False


class ActionItemCreate(ActionItemBase):
    pass


class ActionItemUpdate(BaseModel):
    text: Optional[str] = None
    assignee: Optional[str] = None
    completed: Optional[bool] = None


class ActionItemOut(ActionItemBase):
    model_config = ConfigDict(from_attributes=True)
    id: str
    meeting_id: str
    created_at: datetime.datetime


class SummaryOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    overview: str


class MeetingListOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    title: str
    date: datetime.datetime
    duration_seconds: int
    participants: List[ParticipantOut] = []


class MeetingDetailOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    title: str
    date: datetime.datetime
    duration_seconds: int
    audio_url: Optional[str] = None
    participants: List[ParticipantOut] = []
    transcript_segments: List[TranscriptSegmentOut] = []
    summary: Optional[SummaryOut] = None
    topics: List[TopicOut] = []
    action_items: List[ActionItemOut] = []


class MeetingCreate(BaseModel):
    title: str
    date: Optional[datetime.datetime] = None
    duration_seconds: Optional[int] = 0
    participant_names: List[str] = []
    # raw transcript text, one line per utterance in the form:
    # "Speaker Name [00:00:00]: text..."   -- parsed on the server
    raw_transcript: Optional[str] = None
    overview: Optional[str] = ""


class MeetingUpdate(BaseModel):
    title: Optional[str] = None
    date: Optional[datetime.datetime] = None
    participant_names: Optional[List[str]] = None


class SearchHit(BaseModel):
    meeting_id: str
    meeting_title: str
    speaker_name: str
    start_time: float
    text: str
