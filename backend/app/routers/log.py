from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select

from app.db import get_session
from app.models import LogEntry, LogEntryCreate

router = APIRouter(prefix="/api/log", tags=["log"])


@router.get("", response_model=list[LogEntry])
def list_entries(date: str, session: Session = Depends(get_session)) -> list[LogEntry]:
    return list(session.exec(select(LogEntry).where(LogEntry.date == date)).all())


@router.post("", response_model=LogEntry, status_code=201)
def create_entry(entry: LogEntryCreate, session: Session = Depends(get_session)) -> LogEntry:
    db_entry = LogEntry.model_validate(entry)
    session.add(db_entry)
    session.commit()
    session.refresh(db_entry)
    return db_entry


@router.delete("/{entry_id}", status_code=204)
def delete_entry(entry_id: str, session: Session = Depends(get_session)) -> None:
    db_entry = session.get(LogEntry, entry_id)
    if db_entry is None:
        raise HTTPException(status_code=404, detail="Log entry not found")
    session.delete(db_entry)
    session.commit()
