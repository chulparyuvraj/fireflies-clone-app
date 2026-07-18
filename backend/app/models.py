import datetime
import uuid

from sqlalchemy import (
    Column, String, Integer, Float, Boolean, ForeignKey, DateTime, Text, Table
)
from sqlalchemy.orm import relationship

from .database import Base


def gen_id():
    return str(uuid.uuid4())


# Many-to-many: meetings <-> participants
meeting_participants = Table(
    "meeting_participants",
    Base.metadata,
    Column("meeting_id", String, ForeignKey("meetings.id", ondelete="CASCADE"), primary_key=True),
    Column("participant_id", String, ForeignKey("participants.id", ondelete="CASCADE"), primary_key=True),
)


class Participant(Base):
    __tablename__ = "participants"

    id = Column(String, primary_key=True, default=gen_id)
    name = Column(String, nullable=False)
    email = Column(String, nullable=True)
    avatar_color = Column(String, default="#6C5CE7")  # used for avatar initials background

    meetings = relationship(
        "Meeting", secondary=meeting_participants, back_populates="participants"
    )


class Meeting(Base):
    __tablename__ = "meetings"

    id = Column(String, primary_key=True, default=gen_id)
    title = Column(String, nullable=False)
    date = Column(DateTime, nullable=False, default=datetime.datetime.utcnow)
    duration_seconds = Column(Integer, default=0)
    audio_url = Column(String, nullable=True)  # placeholder media source
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    participants = relationship(
        "Participant", secondary=meeting_participants, back_populates="meetings"
    )
    transcript_segments = relationship(
        "TranscriptSegment", back_populates="meeting",
        cascade="all, delete-orphan", order_by="TranscriptSegment.order_index"
    )
    summary = relationship(
        "Summary", back_populates="meeting", uselist=False, cascade="all, delete-orphan"
    )
    topics = relationship(
        "Topic", back_populates="meeting", cascade="all, delete-orphan",
        order_by="Topic.order_index"
    )
    action_items = relationship(
        "ActionItem", back_populates="meeting", cascade="all, delete-orphan",
        order_by="ActionItem.created_at"
    )


class TranscriptSegment(Base):
    __tablename__ = "transcript_segments"

    id = Column(String, primary_key=True, default=gen_id)
    meeting_id = Column(String, ForeignKey("meetings.id", ondelete="CASCADE"), nullable=False)
    speaker_name = Column(String, nullable=False)
    start_time = Column(Float, nullable=False)  # seconds
    end_time = Column(Float, nullable=False)
    text = Column(Text, nullable=False)
    order_index = Column(Integer, nullable=False)

    meeting = relationship("Meeting", back_populates="transcript_segments")


class Summary(Base):
    __tablename__ = "summaries"

    id = Column(String, primary_key=True, default=gen_id)
    meeting_id = Column(String, ForeignKey("meetings.id", ondelete="CASCADE"), nullable=False, unique=True)
    overview = Column(Text, nullable=False, default="")

    meeting = relationship("Meeting", back_populates="summary")


class Topic(Base):
    """Key topics / outline / chapters for a meeting."""
    __tablename__ = "topics"

    id = Column(String, primary_key=True, default=gen_id)
    meeting_id = Column(String, ForeignKey("meetings.id", ondelete="CASCADE"), nullable=False)
    title = Column(String, nullable=False)
    timestamp = Column(Float, default=0.0)  # jump point in the recording
    order_index = Column(Integer, nullable=False)

    meeting = relationship("Meeting", back_populates="topics")


class ActionItem(Base):
    __tablename__ = "action_items"

    id = Column(String, primary_key=True, default=gen_id)
    meeting_id = Column(String, ForeignKey("meetings.id", ondelete="CASCADE"), nullable=False)
    text = Column(String, nullable=False)
    assignee = Column(String, nullable=True)
    completed = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    meeting = relationship("Meeting", back_populates="action_items")
