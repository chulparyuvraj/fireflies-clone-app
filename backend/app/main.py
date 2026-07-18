import datetime
from typing import List, Optional

from fastapi import Depends, FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from . import crud, models, schemas
from .database import Base, SessionLocal, engine, get_db

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Fireflies Clone API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # relax for local dev / assignment purposes
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/health")
def health():
    return {"status": "ok"}


# ---------------------------------------------------------------- Meetings

@app.get("/api/meetings", response_model=List[schemas.MeetingListOut])
def api_list_meetings(
    q: Optional[str] = None,
    participant: Optional[str] = None,
    date_from: Optional[datetime.datetime] = None,
    date_to: Optional[datetime.datetime] = None,
    sort: str = Query("recent", pattern="^(recent|oldest|title)$"),
    db: Session = Depends(get_db),
):
    return crud.list_meetings(db, q=q, participant=participant, date_from=date_from, date_to=date_to, sort=sort)


@app.post("/api/meetings", response_model=schemas.MeetingDetailOut, status_code=201)
def api_create_meeting(payload: schemas.MeetingCreate, db: Session = Depends(get_db)):
    return crud.create_meeting(db, payload)


@app.get("/api/meetings/{meeting_id}", response_model=schemas.MeetingDetailOut)
def api_get_meeting(meeting_id: str, db: Session = Depends(get_db)):
    meeting = crud.get_meeting(db, meeting_id)
    if not meeting:
        raise HTTPException(404, "Meeting not found")
    return meeting


@app.put("/api/meetings/{meeting_id}", response_model=schemas.MeetingDetailOut)
def api_update_meeting(meeting_id: str, payload: schemas.MeetingUpdate, db: Session = Depends(get_db)):
    meeting = crud.get_meeting(db, meeting_id)
    if not meeting:
        raise HTTPException(404, "Meeting not found")
    return crud.update_meeting(db, meeting, payload)


@app.delete("/api/meetings/{meeting_id}", status_code=204)
def api_delete_meeting(meeting_id: str, db: Session = Depends(get_db)):
    meeting = crud.get_meeting(db, meeting_id)
    if not meeting:
        raise HTTPException(404, "Meeting not found")
    crud.delete_meeting(db, meeting)
    return None


# ------------------------------------------------------------ Action items

@app.post("/api/meetings/{meeting_id}/action-items", response_model=schemas.ActionItemOut, status_code=201)
def api_create_action_item(meeting_id: str, payload: schemas.ActionItemCreate, db: Session = Depends(get_db)):
    meeting = crud.get_meeting(db, meeting_id)
    if not meeting:
        raise HTTPException(404, "Meeting not found")
    return crud.create_action_item(db, meeting_id, payload)


@app.put("/api/action-items/{item_id}", response_model=schemas.ActionItemOut)
def api_update_action_item(item_id: str, payload: schemas.ActionItemUpdate, db: Session = Depends(get_db)):
    item = db.query(models.ActionItem).filter(models.ActionItem.id == item_id).first()
    if not item:
        raise HTTPException(404, "Action item not found")
    return crud.update_action_item(db, item, payload)


@app.delete("/api/action-items/{item_id}", status_code=204)
def api_delete_action_item(item_id: str, db: Session = Depends(get_db)):
    item = db.query(models.ActionItem).filter(models.ActionItem.id == item_id).first()
    if not item:
        raise HTTPException(404, "Action item not found")
    crud.delete_action_item(db, item)
    return None


# ----------------------------------------------------------------- Search

@app.get("/api/search", response_model=List[schemas.SearchHit])
def api_global_search(q: str, db: Session = Depends(get_db)):
    return crud.search_transcripts(db, q)
