import datetime
import random
from typing import List, Optional

from sqlalchemy import or_
from sqlalchemy.orm import Session

from . import models, schemas
from .transcript_parser import parse_transcript

AVATAR_COLORS = ["#6C5CE7", "#00B8D9", "#FF7452", "#36B37E", "#FFAB00", "#FF5630", "#8777D9"]


def get_or_create_participant(db: Session, name: str) -> models.Participant:
    existing = db.query(models.Participant).filter(models.Participant.name == name).first()
    if existing:
        return existing
    p = models.Participant(name=name, avatar_color=random.choice(AVATAR_COLORS))
    db.add(p)
    db.flush()
    return p


def list_meetings(
    db: Session,
    q: Optional[str] = None,
    participant: Optional[str] = None,
    date_from: Optional[datetime.datetime] = None,
    date_to: Optional[datetime.datetime] = None,
    sort: str = "recent",
) -> List[models.Meeting]:
    query = db.query(models.Meeting)

    if q:
        query = query.filter(models.Meeting.title.ilike(f"%{q}%"))
    if participant:
        query = query.join(models.Meeting.participants).filter(
            models.Participant.name.ilike(f"%{participant}%")
        )
    if date_from:
        query = query.filter(models.Meeting.date >= date_from)
    if date_to:
        query = query.filter(models.Meeting.date <= date_to)

    if sort == "oldest":
        query = query.order_by(models.Meeting.date.asc())
    elif sort == "title":
        query = query.order_by(models.Meeting.title.asc())
    else:
        query = query.order_by(models.Meeting.date.desc())

    return query.distinct().all()


def get_meeting(db: Session, meeting_id: str) -> Optional[models.Meeting]:
    return db.query(models.Meeting).filter(models.Meeting.id == meeting_id).first()


def create_meeting(db: Session, payload: schemas.MeetingCreate) -> models.Meeting:
    meeting = models.Meeting(
        title=payload.title,
        date=payload.date or datetime.datetime.utcnow(),
        duration_seconds=payload.duration_seconds or 0,
    )
    db.add(meeting)
    db.flush()

    for name in payload.participant_names:
        p = get_or_create_participant(db, name)
        meeting.participants.append(p)

    if payload.raw_transcript:
        segments = parse_transcript(payload.raw_transcript)
        for seg in segments:
            db.add(models.TranscriptSegment(meeting_id=meeting.id, **seg))

        existing_names = {p.name for p in meeting.participants}
        for name in {s["speaker_name"] for s in segments}:
            if name not in existing_names:
                meeting.participants.append(get_or_create_participant(db, name))

        if segments:
            meeting.duration_seconds = max(meeting.duration_seconds, int(segments[-1]["end_time"]))

    db.add(models.Summary(meeting_id=meeting.id, overview=payload.overview or ""))

    db.commit()
    db.refresh(meeting)
    return meeting


def update_meeting(db: Session, meeting: models.Meeting, payload: schemas.MeetingUpdate) -> models.Meeting:
    if payload.title is not None:
        meeting.title = payload.title
    if payload.date is not None:
        meeting.date = payload.date
    if payload.participant_names is not None:
        meeting.participants = [get_or_create_participant(db, n) for n in payload.participant_names]
    meeting.updated_at = datetime.datetime.utcnow()
    db.commit()
    db.refresh(meeting)
    return meeting


def delete_meeting(db: Session, meeting: models.Meeting) -> None:
    db.delete(meeting)
    db.commit()


def create_action_item(db: Session, meeting_id: str, payload: schemas.ActionItemCreate) -> models.ActionItem:
    item = models.ActionItem(meeting_id=meeting_id, **payload.model_dump())
    db.add(item)
    db.commit()
    db.refresh(item)
    return item


def update_action_item(db: Session, item: models.ActionItem, payload: schemas.ActionItemUpdate) -> models.ActionItem:
    data = payload.model_dump(exclude_unset=True)
    for k, v in data.items():
        setattr(item, k, v)
    db.commit()
    db.refresh(item)
    return item


def delete_action_item(db: Session, item: models.ActionItem) -> None:
    db.delete(item)
    db.commit()


def search_transcripts(db: Session, q: str, limit: int = 50) -> List[schemas.SearchHit]:
    if not q:
        return []
    rows = (
        db.query(models.TranscriptSegment, models.Meeting)
        .join(models.Meeting, models.Meeting.id == models.TranscriptSegment.meeting_id)
        .filter(models.TranscriptSegment.text.ilike(f"%{q}%"))
        .limit(limit)
        .all()
    )
    return [
        schemas.SearchHit(
            meeting_id=meeting.id,
            meeting_title=meeting.title,
            speaker_name=seg.speaker_name,
            start_time=seg.start_time,
            text=seg.text,
        )
        for seg, meeting in rows
    ]
